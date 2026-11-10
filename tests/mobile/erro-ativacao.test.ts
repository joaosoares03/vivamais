import { describe, expect, it } from "vitest";
import { ErroApi } from "../../services/transporteApi";
import { erroAoConfirmarDispositivo } from "../../services/autenticacao/erroAtivacao";

describe("falhas ao confirmar o dispositivo após ativação", () => {
  it.each([
    [429, "Muitas tentativas. Aguarde um pouco antes de tentar novamente."],
    [0, "A conexão demorou demais. Tente novamente."],
    [503, "O serviço não conseguiu concluir a solicitação. Tente novamente."],
    [403, "Sua conta não tem permissão para esta ação."],
  ])("preserva HTTP %s sem atribuir a falha a cookies", (status, mensagem) => {
    const original = new ErroApi(mensagem, status);
    const resultado = erroAoConfirmarDispositivo(original);
    expect(resultado.estadoResposta).toBe(status);
    expect(resultado.message).toBe(mensagem);
    expect(resultado.message).not.toContain("cookies");
  });
  it("orienta conferência do acesso protegido quando a credencial é recusada", () => {
    const erro = erroAoConfirmarDispositivo(new ErroApi("Não autorizado", 401));
    expect(erro.estadoResposta).toBe(401);
    expect(erro.message).toContain("acesso protegido");
  });
  it("não revela texto arbitrário de uma exceção desconhecida", () => {
    const erro = erroAoConfirmarDispositivo(
      new Error("conteúdo interno de teste"),
    );
    expect(erro.estadoResposta).toBe(0);
    expect(erro.message).not.toContain("interno");
    expect(erro.message).not.toContain("cookies");
  });
});
