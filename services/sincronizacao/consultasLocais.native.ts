import { abrirBancoProtegido } from "./armazenamentoFila.native";
import {
  criarConsultasLocais,
  type ConsultaLocal,
} from "./regrasConsultaLocal";

async function bancoConsultas() {
  const banco = await abrirBancoProtegido();
  await banco.execAsync(
    "CREATE TABLE IF NOT EXISTS consulta_local(titular TEXT NOT NULL,caminho TEXT NOT NULL,conteudo TEXT NOT NULL,expira_em INTEGER NOT NULL,PRIMARY KEY(titular,caminho))",
  );
  await banco.runAsync(
    "DELETE FROM consulta_local WHERE expira_em<=?",
    Date.now(),
  );
  return banco;
}
export const consultasLocais = criarConsultasLocais({
  async ler(titular, caminho) {
    const linha = await (
      await bancoConsultas()
    ).getFirstAsync<{ conteudo: string }>(
      "SELECT conteudo FROM consulta_local WHERE titular=? AND caminho=?",
      titular,
      caminho,
    );
    if (!linha) return null;
    try {
      return JSON.parse(linha.conteudo) as ConsultaLocal;
    } catch {
      return null;
    }
  },
  async salvar(consulta) {
    const banco = await bancoConsultas();
    await banco.runAsync(
      "DELETE FROM consulta_local WHERE rowid IN (SELECT rowid FROM consulta_local ORDER BY expira_em DESC LIMIT -1 OFFSET 99)",
    );
    await banco.runAsync(
      "INSERT INTO consulta_local(titular,caminho,conteudo,expira_em) VALUES(?,?,?,?) ON CONFLICT(titular,caminho) DO UPDATE SET conteudo=excluded.conteudo,expira_em=excluded.expira_em",
      consulta.titular,
      consulta.caminho,
      JSON.stringify(consulta),
      consulta.expiraEm,
    );
  },
  async excluir(titular) {
    await (
      await bancoConsultas()
    ).runAsync("DELETE FROM consulta_local WHERE titular=?", titular);
  },
});
