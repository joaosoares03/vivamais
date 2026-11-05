import {
  criarConsultasLocais,
  type ConsultaLocal,
} from "./regrasConsultaLocal";
// Navegador: somente memória. Persistência clínica exige o banco SQLCipher do build nativo.
const consultas = new Map<string, ConsultaLocal>();
export const consultasLocais = criarConsultasLocais({
  async ler(titular, caminho) {
    return consultas.get(`${titular}:${caminho}`) ?? null;
  },
  async salvar(consulta) {
    for (const [chave, salva] of consultas)
      if (salva.expiraEm <= Date.now()) consultas.delete(chave);
    if (consultas.size >= 100) consultas.delete(consultas.keys().next().value!);
    consultas.set(`${consulta.titular}:${consulta.caminho}`, consulta);
  },
  async excluir(titular) {
    for (const [chave, consulta] of consultas)
      if (consulta.titular === titular) consultas.delete(chave);
  },
});
