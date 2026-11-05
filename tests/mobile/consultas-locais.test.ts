import { describe, expect, it } from "vitest";
import {
  criarConsultasLocais,
  consultaPodeSerGuardada,
  type ConsultaLocal,
} from "../../services/sincronizacao/regrasConsultaLocal";

describe("consulta protegida sem conexão", () => {
  it("recupera depois de reconstruir o serviço, isola titulares e respeita expiração", async () => {
    const dados = new Map<string, ConsultaLocal>();
    const armazenamento = {
      async ler(titular: string, caminho: string) {
        return dados.get(`${titular}:${caminho}`) ?? null;
      },
      async salvar(consulta: ConsultaLocal) {
        dados.set(`${consulta.titular}:${consulta.caminho}`, consulta);
      },
      async excluir(titular: string) {
        for (const [chave, consulta] of dados)
          if (consulta.titular === titular) dados.delete(chave);
      },
    };
    let agora = Date.parse("2026-11-03T15:00:00Z");
    const validade = new Date(agora + 30 * 60000).toISOString();
    const primeiro = criarConsultasLocais(armazenamento, () => agora);
    await primeiro.guardar("A", "/patients/me", { id: "paciente-A" }, validade);
    const reaberto = criarConsultasLocais(armazenamento, () => agora);
    expect(
      (await reaberto.recuperar("A", "/patients/me", validade))?.dados,
    ).toEqual({ id: "paciente-A" });
    expect(await reaberto.recuperar("B", "/patients/me", validade)).toBeNull();
    expect(
      await reaberto.recuperar("A", "/patients/me", "inválido"),
    ).toBeNull();
    agora += 15 * 60000;
    expect(await reaberto.recuperar("A", "/patients/me", validade)).toBeNull();
    await reaberto.excluir("A");
    expect(dados.size).toBe(0);
  });
  it("não guarda tokens, fotos ou URLs assinadas e limita à validade da sessão", async () => {
    for (const caminho of [
      "/auth/me",
      "/files/foto/content",
      "/patients/00000000-0000-0000-0000-000000000000/meals",
      "/auth/paciente/renovar",
    ])
      expect(consultaPodeSerGuardada(caminho)).toBe(false);
    let salva: ConsultaLocal | null = null;
    const agora = Date.now(),
      validade = new Date(agora + 1000).toISOString();
    const cache = criarConsultasLocais(
      {
        async ler() {
          return salva;
        },
        async salvar(consulta) {
          salva = consulta;
        },
        async excluir() {
          salva = null;
        },
      },
      () => agora,
    );
    await cache.guardar("A", "/patients/me", { id: "A" }, validade);
    expect((salva as ConsultaLocal | null)?.expiraEm).toBe(agora + 1000);
    await cache.guardar("A", "/auth/me", { segredo: "teste" }, validade);
    expect((salva as ConsultaLocal | null)?.caminho).toBe("/patients/me");
  });
});
