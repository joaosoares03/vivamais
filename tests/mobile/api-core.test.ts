import { describe, expect, it, vi } from "vitest";
import {
  ErroApi,
  criarTransporte,
  sessaoExpirada,
  resolverEnderecoApi,
  resolverEnderecoExecucao,
} from "../../services/transporteApi";
import { interpretarSessaoProtegida } from "../../services/autenticacao/contratoSessao";

describe("API boundary", () => {
  it("mantém convites e renovação na mesma origem HTTPS e exige API explícita no nativo", () => {
    const opcoes = {
      mesmaOrigem: true,
      navegador: true,
      desenvolvimento: false,
    };
    expect(
      resolverEnderecoExecucao({
        ...opcoes,
        origemNavegador: "https://paciente.example.org",
      }),
    ).toBe("https://paciente.example.org");
    for (const origem of [
      "http://paciente.example.org",
      "https://localhost",
      "https://paciente.example.org/caminho",
      "https://paciente.example.org?url=https://outro.example.org",
    ])
      expect(() =>
        resolverEnderecoExecucao({ ...opcoes, origemNavegador: origem }),
      ).toThrow();
    expect(() =>
      resolverEnderecoExecucao({ ...opcoes, navegador: false }),
    ).toThrow("nativo exige");
    expect(
      resolverEnderecoExecucao({
        ...opcoes,
        navegador: false,
        enderecoConfigurado: "https://api.example.org",
      }),
    ).toBe("https://api.example.org");
  });
  it("requires HTTPS and non-localhost outside development", () => {
    expect(resolverEnderecoApi("http://10.0.2.2:8080/", true)).toBe(
      "http://10.0.2.2:8080",
    );
    expect(resolverEnderecoApi("https://api.example.org", false)).toBe(
      "https://api.example.org",
    );
    expect(() => resolverEnderecoApi("http://api.example.org", false)).toThrow(
      "HTTPS",
    );
    expect(() => resolverEnderecoApi("https://localhost", false)).toThrow(
      "pública",
    );
    expect(() => resolverEnderecoApi("https://10.0.2.2:8080", false)).toThrow(
      "pública",
    );
    expect(() => resolverEnderecoApi("https://192.168.1.20", false)).toThrow(
      "pública",
    );
    expect(() => resolverEnderecoApi("https://[::1]", false)).toThrow(
      "pública",
    );
    expect(() =>
      resolverEnderecoApi("https://user:secret@api.example.org", false),
    ).toThrow("credenciais");
    expect(() =>
      resolverEnderecoApi("https://api.example.org?token=secret", false),
    ).toThrow();
  });

  it("scopes bearer tokens to configured API paths and requests redirect rejection", async () => {
    const buscarRecurso = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "patient" }), { status: 200 }),
      );
    const requisicao = criarTransporte(
      "https://api.example.org",
      buscarRecurso,
    );
    await expect(
      requisicao("/patients/me", { token: "opaque" }),
    ).resolves.toEqual({ id: "patient" });
    expect(buscarRecurso).toHaveBeenCalledWith(
      "https://api.example.org/api/v1/patients/me",
      expect.objectContaining({
        headers: { Accept: "application/json", Authorization: "Bearer opaque" },
        redirect: "error",
        credentials: "omit",
        cache: "no-store",
      }),
    );
    await expect(
      requisicao("https://another.example.org", { token: "opaque" }),
    ).rejects.toThrow("Caminho");
    await expect(
      requisicao("//another.example.org", { token: "opaque" }),
    ).rejects.toThrow("Caminho");
    expect(buscarRecurso).toHaveBeenCalledTimes(1);
  });

  it("sends login and logout to real endpoints and handles 204", async () => {
    const buscarRecurso = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: "opaque" }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const requisicao = criarTransporte(
      "https://api.example.org",
      buscarRecurso,
    );
    await requisicao("/auth/login", {
      method: "POST",
      body: { email: "test@example.org", password: "not-logged" },
    });
    await expect(
      requisicao("/auth/logout", { method: "POST", token: "opaque" }),
    ).resolves.toBeUndefined();
    expect(buscarRecurso.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ email: "test@example.org", password: "not-logged" }),
    );
    expect(buscarRecurso.mock.calls[1]?.[1]?.method).toBe("POST");
  });

  it("does not expose account existence or arbitrary provider text", async () => {
    const buscarRecurso = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ detail: "Patient secret and email exists" }),
          { status: 401 },
        ),
      );
    await expect(
      criarTransporte("https://api.example.org", buscarRecurso)("/auth/login"),
    ).rejects.toEqual(expect.objectContaining({ status: 401 }));
    try {
      await criarTransporte(
        "https://api.example.org",
        buscarRecurso,
      )("/auth/login");
    } catch (erro) {
      expect((erro as ErroApi).message).not.toContain("secret");
    }
  });

  it("aborts slow connections and makes failure retryable", async () => {
    const buscarRecurso = vi.fn<typeof fetch>().mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          );
        }),
    );
    await expect(
      criarTransporte("https://api.example.org", buscarRecurso, 5)("/auth/me"),
    ).rejects.toThrow("demorou demais");
  });
});

describe("session lifetime", () => {
  it("treats invalid or past expiration as expired", () => {
    expect(sessaoExpirada("invalid")).toBe(true);
    expect(
      sessaoExpirada(
        "2026-10-16T12:00:00Z",
        Date.parse("2026-10-16T12:00:00Z"),
      ),
    ).toBe(true);
    expect(
      sessaoExpirada(
        "2026-10-16T12:00:01Z",
        Date.parse("2026-10-16T12:00:00Z"),
      ),
    ).toBe(false);
  });
  it("restores only token and validity, rejecting malformed and expired data", () => {
    const expiresAt = new Date(Date.now() + 60000).toISOString();
    expect(
      interpretarSessaoProtegida(
        JSON.stringify({
          accessToken: "opaque",
          expiresAt,
          password: "must-be-ignored",
          user: {},
        }),
      ),
    ).toEqual({ accessToken: "opaque", expiresAt });
    expect(interpretarSessaoProtegida("broken")).toBeNull();
    expect(
      interpretarSessaoProtegida(
        JSON.stringify({ accessToken: "", expiresAt }),
      ),
    ).toBeNull();
    expect(
      interpretarSessaoProtegida(
        JSON.stringify({ accessToken: "opaque", expiresAt: "2020-01-01" }),
      ),
    ).toBeNull();
  });
});
