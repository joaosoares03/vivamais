// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, it, expect, vi } from "vitest";
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock("@/services/api", () => ({
  requisicaoApi: api,
  ErroApi: class extends Error {
    status = 503;
    detail = "Serviço indisponível";
  },
}));
import { POST } from "./route";
afterEach(() => {
  vi.unstubAllEnvs();
  api.mockReset();
});
function pedido(body: string, origin = "https://portal.example.org") {
  vi.stubEnv("APP_ORIGIN", "https://portal.example.org");
  return new NextRequest(
    "https://portal.example.org/api/grupo/ativar-profissional",
    {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body,
    },
  );
}
it("bloqueia CSRF antes de transmitir senha", async () => {
  expect((await POST(pedido("{}", "https://externo.invalid"))).status).toBe(
    403,
  );
  expect(api).not.toHaveBeenCalled();
});
it("limita stream e valida o segredo", async () => {
  expect((await POST(pedido("x".repeat(2049)))).status).toBe(413);
  expect(
    (
      await POST(
        pedido(
          JSON.stringify({ convite: "invalido", senha: "teste-longo-123" }),
        ),
      )
    ).status,
  ).toBe(400);
  expect(api).not.toHaveBeenCalled();
});
it("encaminha convite válido sem devolver sessão ou senha", async () => {
  api.mockResolvedValue({ email: "ficticio@grupo.vivamais.invalid" });
  const resposta = await POST(
    pedido(
      JSON.stringify({ convite: "a".repeat(43), senha: "teste-longo-123" }),
    ),
  );
  expect(resposta.status).toBe(200);
  expect(resposta.headers.get("Cache-Control")).toBe("no-store");
  expect(await resposta.json()).toEqual({
    email: "ficticio@grupo.vivamais.invalid",
  });
});
