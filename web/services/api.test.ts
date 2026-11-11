// @vitest-environment node
import { afterEach, beforeEach, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { requisicaoApi } from "./api";
beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(AbortSignal, "timeout").mockImplementation(tempo => {
    const controle = new AbortController(); setTimeout(() => controle.abort(), tempo); return controle.signal;
  });
  vi.stubGlobal("fetch", vi.fn((_url, opcoes) => new Promise((resolver, rejeitar) => {
    const temporizador = setTimeout(() => resolver(Response.json({ preparado: true })), 16000);
    opcoes.signal.addEventListener("abort", () => { clearTimeout(temporizador); rejeitar(new Error("tempo esgotado")); }, { once: true });
  })));
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it("permite concluir o preparo do grupo que leva mais de dez segundos", async () => {
  const resultado = requisicaoApi("/grupo-testes", { method: "POST", body: {} });
  await vi.advanceTimersByTimeAsync(16000);
  await expect(resultado).resolves.toEqual({ preparado: true });
});
it("preserva a resposta rápida de falha para consultas comuns", async () => {
  const verificacao = expect(requisicaoApi("/patients")).rejects.toMatchObject({ estadoResposta: 503 });
  await vi.advanceTimersByTimeAsync(10001); await verificacao;
});
