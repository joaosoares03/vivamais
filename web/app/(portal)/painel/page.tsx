import Link from "next/link";
import type {
  ResumoPainel,
  EstadoModulo,
  Paciente,
  components,
} from "@viva/contracts";
import { buscarSessao, requisicaoAutenticada } from "@/services/api";
import { Icone } from "@/components/Icones";
import { ModalidadePaciente } from "@/components/ListaPacientes";
import { Modulos } from "@/components/Modulos";
export default async function PaginaPainel() {
  const [{ user: usuario }, resumo, pacientes, modulos] = await Promise.all([
    buscarSessao(),
    requisicaoAutenticada<ResumoPainel>("/dashboard"),
    requisicaoAutenticada<Paciente[]>("/patients"),
    requisicaoAutenticada<EstadoModulo[]>("/system/modules"),
  ]);
  const registros = await Promise.all(
    pacientes.slice(0, 6).map(async (paciente) => {
      const resposta = await requisicaoAutenticada<{
        items: components["schemas"]["RegistroPressao"][];
      }>(`/patients/${paciente.id}/readings?size=1`);
      return { paciente, ultimaMedicao: resposta.items[0]?.measuredAt };
    }),
  );
  const indicadores = [
    {
      numero: resumo.patientCount,
      rotulo: "Pacientes cadastrados",
      icone: "people",
      cor: "indicador-azul",
    },
    {
      numero: resumo.appCount,
      rotulo: "Usam o aplicativo",
      icone: "phone",
      cor: "indicador-verde",
    },
    {
      numero: resumo.diaryCount,
      rotulo: "Usam pulseira e diário",
      icone: "book",
      cor: "indicador-laranja",
    },
    {
      numero: resumo.consultasSemana,
      rotulo: "Consultas esta semana",
      icone: "grid",
      cor: "indicador-roxo",
    },
  ] as const;
  return (
    <>
      <div className="cabecalho-painel">
        <div>
          <p className="secao-painel">Visão geral</p>
          <h1>Bem-vindo, {usuario.displayName.split(" ")[0]}!</h1>
          <small>{resumo.organizationName}</small>
        </div>
        <Link className="button button-primary" href="/pacientes/novo">
          ＋ Cadastrar paciente
        </Link>
      </div>
      <section
        className="indicadores-painel"
        aria-label="Pacientes autorizados"
      >
        {indicadores.map((indicador) => (
          <article className="indicador-painel" key={indicador.rotulo}>
            <span className={indicador.cor}>
              <Icone name={indicador.icone} size={32} />
            </span>
            <div>
              <strong>{indicador.numero ?? "Indisponível"}</strong>
              <p>{indicador.rotulo}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="pacientes-painel">
        <div className="titulo-tabela">
          <h2>Pacientes disponíveis</h2>
          <Link href="/pacientes">Ver todos <Icone name="arrow" size={17} /></Link>
        </div>
        <div className="tabela-responsiva">
          <table className="care-table tabela-recentes">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Modalidade</th>
                <th>Última pressão registrada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(({ paciente, ultimaMedicao }) => (
                <tr key={paciente.id}>
                  <td>
                    <Link
                      className="patient-row"
                      href={`/pacientes/${paciente.id}`}
                    >
                      {paciente.displayName}
                    </Link>
                  </td>
                  <td>
                    <ModalidadePaciente value={paciente.modality} />
                  </td>
                  <td>
                    {ultimaMedicao
                      ? new Date(ultimaMedicao).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "Sem medição registrada"}
                  </td>
                  <td>
                    <Link
                      className="acao-tabela"
                      href={`/pacientes/${paciente.id}`}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!registros.length && <p>Nenhum paciente disponível para sua conta.</p>}
      </section>
      <details className="estado-modulos">
        <summary>Disponibilidade e limites dos recursos</summary>
        <Modulos modules={modulos} compact />
      </details>
    </>
  );
}
