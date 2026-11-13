import { afterEach, expect, it, vi } from "vitest";
import { criarTransporte } from "../../services/transporteApi";

function formulario() {
  const dados = new FormData();
  dados.append("purpose", "MEAL");
  dados.append(
    "file",
    new Blob(["foto sintética"], { type: "image/jpeg" }),
    "foto.jpg",
  );
  return dados;
}
afterEach(() => vi.useRealTimers());

it("recusa um corpo ambíguo antes de enviar dados", async () => {
  const buscar = vi.fn<typeof fetch>();
  await expect(
    criarTransporte("https://api.teste.invalid", buscar)(
      "/patients/paciente/files",
      {
        method: "POST",
        formulario: formulario(),
        body: { purpose: "MEAL" },
      },
    ),
  ).rejects.toThrow("sem misturar");
  expect(buscar).not.toHaveBeenCalled();
});

it("envia multipart sem serializar a foto nem fixar o boundary", async () => {
  const buscar = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ id: "arquivo-sintetico" }));
  const dados = formulario();
  await expect(
    criarTransporte("https://api.teste.invalid", buscar)(
      "/patients/paciente/files",
      {
        method: "POST",
        token: "token-sintetico-atual",
        formulario: dados,
        limiteTempoMs: 60000,
      },
    ),
  ).resolves.toEqual({ id: "arquivo-sintetico" });
  const [url, opcoes] = buscar.mock.calls[0]!;
  expect(url).toBe("https://api.teste.invalid/api/v1/patients/paciente/files");
  expect(opcoes?.body).toBe(dados);
  expect(opcoes?.headers).toEqual({
    Accept: "application/json",
    Authorization: "Bearer token-sintetico-atual",
  });
  expect(opcoes?.credentials).toBe("omit");
  expect(opcoes?.redirect).toBe("error");
  expect(opcoes?.cache).toBe("no-store");
});

it("recusa encaminhar arquivo e token a outra origem", async () => {
  const buscar = vi.fn<typeof fetch>();
  await expect(
    criarTransporte("https://api.teste.invalid", buscar)(
      "https://outra.teste.invalid/files",
      {
        method: "POST",
        token: "token-sintetico",
        formulario: formulario(),
      },
    ),
  ).rejects.toThrow("Caminho de API inválido");
  expect(buscar).not.toHaveBeenCalled();
});

it("mantém 401 reconhecível pelo contexto sem expor a resposta interna", async () => {
  const buscar = vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      Response.json({ detail: "dado interno sintético" }, { status: 401 }),
    );
  await expect(
    criarTransporte("https://api.teste.invalid", buscar)(
      "/patients/paciente/files",
      {
        method: "POST",
        formulario: formulario(),
      },
    ),
  ).rejects.toMatchObject({
    status: 401,
    message:
      "Acesso não autorizado. Confira suas credenciais ou entre novamente.",
  });
});

it("permite o prazo de 60 segundos do upload e aborta ao final", async () => {
  vi.useFakeTimers();
  let sinal: AbortSignal | null = null;
  const buscar = vi.fn<typeof fetch>().mockImplementation(
    (_url, opcoes) =>
      new Promise((_resolve, reject) => {
        sinal = opcoes?.signal ?? null;
        sinal?.addEventListener("abort", () =>
          reject(new Error("abortado no teste")),
        );
      }),
  );
  const envio = criarTransporte("https://api.teste.invalid", buscar)(
    "/patients/paciente/files",
    {
      method: "POST",
      formulario: formulario(),
      limiteTempoMs: 60000,
    },
  );
  const conclusao = expect(envio).rejects.toMatchObject({
    status: 0,
    message: "A conexão demorou demais. Tente novamente.",
  });
  await vi.advanceTimersByTimeAsync(59999);
  expect((sinal as AbortSignal | null)?.aborted).toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  await conclusao;
  expect((sinal as AbortSignal | null)?.aborted).toBe(true);
});
