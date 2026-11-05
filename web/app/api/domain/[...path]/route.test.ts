// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
const apoio = vi.hoisted(() => ({
  api: vi.fn(),
  token: "sessao-sintetica-unitaria" as string | undefined,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (apoio.token ? { value: apoio.token } : undefined),
  }),
}));
vi.mock("@/services/api", () => ({
  requisicaoApi: apoio.api,
  SESSION_COOKIE: "viva_session",
  enderecoApi: () => "http://127.0.0.1:8080",
  ErroApi: class extends Error {
    constructor(
      public estadoResposta: number,
      public detail: string,
    ) {
      super(detail);
    }
  },
}));
import { GET, POST } from "./route";
const origem = "http://127.0.0.1:3000",
  id = "00000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.stubEnv("APP_ORIGIN", origem);
  apoio.api.mockReset();
  apoio.api.mockResolvedValue([]);
  apoio.token = "sessao-sintetica-unitaria";
});
afterEach(() => vi.unstubAllEnvs());
async function chamar(
  caminho: string,
  metodo: "GET" | "POST" = "GET",
  origemPedido = origem,
) {
  const pedido = new NextRequest(`${origem}/api/domain/${caminho}`, {
    method: metodo,
    headers: { Origin: origemPedido, "Content-Type": "application/json" },
    ...(metodo === "POST" ? { body: "{}" } : {}),
  });
  return (metodo === "GET" ? GET : POST)(pedido, {
    params: Promise.resolve({ path: caminho.split("/") }),
  });
}
it("encaminha agenda e gerenciamento de convites com sessão protegida e sem cache", async () => {
  for (const [caminho, metodo] of [
    [`patients/${id}/medication-agenda`, "GET"],
    [`patients/${id}/test-invites`, "GET"],
    [`patients/${id}/test-invites`, "POST"],
    [`patients/${id}/test-invites/${id}/revoke`, "POST"],
  ] as const) {
    const resposta = await chamar(caminho, metodo);
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("cache-control")).toContain("no-store");
    expect(apoio.api).toHaveBeenLastCalledWith(
      `/${caminho}`,
      expect.objectContaining({ token: apoio.token, method: metodo }),
    );
  }
});
it("convites não ampliam a whitelist para autenticação pública ou recursos arbitrários", async () => {
  for (const caminho of [
    "auth/testadores/convite",
    `patients/${id}/test-invites/${id}/segredos`,
    `patients/${id}/test-invites/${id}/revoke/extra`,
  ])
    expect((await chamar(caminho, "POST")).status).toBe(404);
  expect(apoio.api).not.toHaveBeenCalled();
});
it("bloqueia emissão e revogação por CSRF antes da API", async () => {
  expect(
    (
      await chamar(
        `patients/${id}/test-invites`,
        "POST",
        "https://externo.example.org",
      )
    ).status,
  ).toBe(403);
  expect(apoio.api).not.toHaveBeenCalled();
});
it("não permite consultar convites sem sessão profissional do portal", async () => {
  apoio.token = undefined;
  expect((await chamar(`patients/${id}/test-invites`)).status).toBe(401);
  expect(apoio.api).not.toHaveBeenCalled();
});
