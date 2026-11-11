export type ConsultaLocal = {
  titular: string;
  caminho: string;
  dados: unknown;
  salvoEm: number;
  expiraEm: number;
};
export interface ArmazenamentoConsultas {
  ler(titular: string, caminho: string): Promise<ConsultaLocal | null>;
  salvar(consulta: ConsultaLocal): Promise<void>;
  excluir(titular: string): Promise<void>;
}
export function consultaPodeSerGuardada(caminho: string): boolean {
  return (
    caminho === "/patients/me" ||
    caminho === "/pacientes/me/consultas" ||
    /^\/patients\/[0-9a-f-]{36}\/(readings|medications|medication-events|medication-agenda|activity-profile|activities)(\?[^#]*)?$/i.test(
      caminho,
    ) ||
    /^\/pacientes\/me\/consultas\?page=\d+&size=\d+$/.test(caminho)
  );
}
export function criarConsultasLocais(
  armazenamento: ArmazenamentoConsultas,
  agora = Date.now,
) {
  return {
    async guardar(
      titular: string,
      caminho: string,
      dados: unknown,
      sessaoExpiraEm: string,
    ) {
      if (!consultaPodeSerGuardada(caminho)) return;
      const salvoEm = agora(),
        expiraEm = Math.min(salvoEm + 15 * 60000, Date.parse(sessaoExpiraEm));
      if (!Number.isFinite(expiraEm) || expiraEm <= salvoEm) return;
      await armazenamento.salvar({
        titular,
        caminho,
        dados,
        salvoEm,
        expiraEm,
      });
    },
    async recuperar<T>(
      titular: string,
      caminho: string,
      sessaoExpiraEm: string,
    ): Promise<{ dados: T; salvoEm: number } | null> {
      const validade = Date.parse(sessaoExpiraEm);
      if (
        !consultaPodeSerGuardada(caminho) ||
        !Number.isFinite(validade) ||
        validade <= agora()
      )
        return null;
      const consulta = await armazenamento.ler(titular, caminho);
      if (
        !consulta ||
        consulta.titular !== titular ||
        consulta.caminho !== caminho ||
        consulta.expiraEm <= agora() ||
        !Number.isFinite(consulta.expiraEm) ||
        consulta.salvoEm > agora()
      )
        return null;
      return { dados: consulta.dados as T, salvoEm: consulta.salvoEm };
    },
    excluir: (titular: string) => armazenamento.excluir(titular),
  };
}
