import Link from "next/link";
import type {
  ResumoPainel,
  EstadoModulo,
  Paciente,
  components,
} from "@viva/contracts";
import { buscarSessao, requisicaoAutenticada } from "@/services/api";
import { Icone, type NomeIcone } from "@/components/Icones";
import { ModalidadePaciente } from "@/components/ListaPacientes";
import { Modulos } from "@/components/Modulos";

const formatarDataHora = (valor: string) =>
  new Date(valor).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });

export default async function PaginaPainel() {
  const [{ user: usuario }, resumo, pacientes, modulos] = await Promise.all([
    buscarSessao(),
    requisicaoAutenticada<ResumoPainel>("/dashboard"),
    requisicaoAutenticada<Paciente[]>("/patients"),
    requisicaoAutenticada<EstadoModulo[]>("/system/modules"),
  ]);
  // Mostra os pacientes com a última medição real de cada um, sem números simulados.
  const registros = await Promise.all(
    pacientes.slice(0, 6).map(async (paciente) => {
      const resposta = await requisicaoAutenticada<{
        items: components["schemas"]["RegistroPressao"][];
      }>(`/patients/${paciente.id}/readings?size=1`);
      return { paciente, ultima: resposta.items[0] };
    }),
  );
  const indicadores: {
    numero?: number;
    rotulo: string;
    icone: NomeIcone;
    cor: string;
    href: string;
  }[] = [
    {
      numero: resumo.patientCount,
      rotulo: "Pacientes acompanhados",
      icone: "people",
      cor: "indicador-azul",
      href: "/pacientes",
    },
    {
      numero: resumo.appCount,
      rotulo: "Usam o aplicativo",
      icone: "phone",
      cor: "indicador-verde",
      href: "/pacientes?modalidade=APP",
    },
    {
      numero: resumo.diaryCount,
      rotulo: "Usam pulseira e diário",
      icone: "book",
      cor: "indicador-laranja",
      href: "/pacientes?modalidade=BRACELET_DIARY",
    },
    {
      numero: resumo.consultasSemana,
      rotulo: "Consultas nesta semana",
      icone: "calendar",
      cor: "indicador-roxo",
      href: "/consultas",
    },
  ];
  const primeiroNome = usuario.displayName.split(" ")[0];
  return (
    <>
      <div className="cabecalho-painel">
        <div>
          <span className="secao-painel">Visão geral</span>
          <h1>Olá, {primeiroNome}</h1>
          <small>{resumo.organizationName}</small>
        </div>
        <Link className="button button-primary" href="/pacientes/novo">
          <Icone name="plus" size={18} /> Cadastrar paciente
        </Link>
      </div>
      <section
        className="indicadores-painel"
        aria-label="Indicadores da unidade"
      >
        {indicadores.map((indicador) => (
          <Link
            className="indicador-painel"
            key={indicador.rotulo}
            href={indicador.href}
          >
            <span className={indicador.cor} aria-hidden="true">
              <Icone name={indicador.icone} size={24} />
            </span>
            <div>
              <strong>{indicador.numero ?? "—"}</strong>
              <p>{indicador.rotulo}</p>
            </div>
          </Link>
        ))}
      </section>
      <div className="grade-painel">
        <section className="pacientes-painel" aria-labelledby="titulo-recentes">
          <div className="titulo-tabela">
            <h2 id="titulo-recentes">Pacientes e últimas medições</h2>
            <Link href="/pacientes">
              Ver todos <Icone name="arrow" size={16} />
            </Link>
          </div>
          {registros.length ? (
            <div className="tabela-responsiva">
              <table className="care-table tabela-cartoes">
                <thead>
                  <tr>
                    <th scope="col">Paciente</th>
                    <th scope="col">Modalidade</th>
                    <th scope="col">Última pressão</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map(({ paciente, ultima }) => (
                    <tr key={paciente.id}>
                      <td data-rotulo="Paciente">
                        <Link href={`/pacientes/${paciente.id}`}>
                          {paciente.displayName}
                        </Link>
                      </td>
                      <td data-rotulo="Modalidade">
                        <ModalidadePaciente value={paciente.modality} />
                      </td>
                      <td data-rotulo="Última pressão">
                        {ultima ? (
                          <span className="celula-medicao">
                            <strong>
                              {ultima.systolic}/{ultima.diastolic} mmHg
                            </strong>
                            {ultima.measuredAt && (
                              <small>
                                {formatarDataHora(ultima.measuredAt)}
                              </small>
                            )}
                          </span>
                        ) : (
                          <span className="muted">Sem medição registrada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Icone name="people" size={40} />
              <h3>Nenhum paciente ainda</h3>
              <p>Cadastre o primeiro paciente para começar o acompanhamento.</p>
            </div>
          )}
        </section>
        <section className="atalhos-coluna" aria-labelledby="titulo-atalhos">
          <h2 id="titulo-atalhos">Ações rápidas</h2>
          <div className="atalhos-painel">
            <Link className="atalho" href="/pacientes/novo">
              <Icone name="plus" size={22} />
              <span>
                Cadastrar paciente
                <small>Dados pessoais e modalidade</small>
              </span>
            </Link>
            <Link className="atalho" href="/pacientes">
              <Icone name="search" size={22} />
              <span>
                Encontrar paciente
                <small>Busca, filtros e ficha</small>
              </span>
            </Link>
            <Link className="atalho" href="/consultas">
              <Icone name="calendar" size={22} />
              <span>
                Registrar consulta
                <small>Escolha o paciente</small>
              </span>
            </Link>
            <Link className="atalho" href="/relatorios">
              <Icone name="chart" size={22} />
              <span>
                Relatórios
                <small>Resumo e exportação</small>
              </span>
            </Link>
          </div>
        </section>
      </div>
      <details className="estado-modulos">
        <summary>Disponibilidade dos recursos</summary>
        <Modulos modules={modulos} compact />
      </details>
    </>
  );
}
