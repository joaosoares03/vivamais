import Link from "next/link";
import type { Paciente } from "@viva/contracts";
import { requisicaoAutenticada } from "@/services/api";
import { Icone } from "@/components/Icones";
import { ModalidadePaciente } from "@/components/ListaPacientes";

const TAMANHO = 20;
const modalidades = {
  "": "Todas as modalidades",
  APP: "Aplicativo Viva+",
  BRACELET_DIARY: "Pulseira + diário",
} as const;
const ordens = {
  nome: "Nome (A–Z)",
  recentes: "Cadastro mais recente",
} as const;

type Busca = {
  busca?: string;
  pagina?: string;
  modalidade?: string;
  ordem?: string;
};

export default async function PaginaPacientes({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}) {
  const parametros = await searchParams;
  const busca =
    typeof parametros.busca === "string"
      ? parametros.busca.trim().slice(0, 120)
      : "";
  const pagina = /^\d{1,5}$/.test(parametros.pagina ?? "")
    ? Number(parametros.pagina)
    : 0;
  const modalidade = Object.hasOwn(modalidades, parametros.modalidade ?? "")
    ? (parametros.modalidade as keyof typeof modalidades)
    : "";
  const ordem = parametros.ordem === "recentes" ? "recentes" : "nome";
  const consulta = new URLSearchParams({
    q: busca,
    page: String(pagina),
    size: String(TAMANHO),
    ordem,
  });
  if (modalidade) consulta.set("modalidade", modalidade);
  const resultado = await requisicaoAutenticada<{
    items: Paciente[];
    total: number;
  }>(`/patients/search?${consulta}`);
  const endereco = (numero: number) => {
    const destino = new URLSearchParams({ pagina: String(numero), ordem });
    if (busca) destino.set("busca", busca);
    if (modalidade) destino.set("modalidade", modalidade);
    return `/pacientes?${destino}`;
  };
  const primeiro = resultado.total ? pagina * TAMANHO + 1 : 0;
  const ultimo = Math.min((pagina + 1) * TAMANHO, resultado.total);
  const filtrando = Boolean(busca || modalidade);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Pacientes</span>
          <h1>Lista de pacientes</h1>
          <p>Pessoas que sua conta pode acompanhar nesta unidade.</p>
        </div>
        <Link href="/pacientes/novo" className="button button-primary">
          <Icone name="plus" size={18} /> Cadastrar paciente
        </Link>
      </div>
      <section className="panel padded" aria-labelledby="titulo-resultados">
        <form method="get" className="filtros-lista" role="search">
          <div className="field">
            <label htmlFor="busca">Nome</label>
            <input
              id="busca"
              name="busca"
              type="search"
              maxLength={120}
              defaultValue={busca}
              placeholder="Digite parte do nome"
            />
          </div>
          <div className="field">
            <label htmlFor="modalidade">Modalidade</label>
            <select id="modalidade" name="modalidade" defaultValue={modalidade}>
              {Object.entries(modalidades).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ordem">Ordenar por</label>
            <select id="ordem" name="ordem" defaultValue={ordem}>
              {Object.entries(ordens).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className="filtros-acoes">
            <button className="button button-primary" type="submit">
              <Icone name="search" size={17} /> Filtrar
            </button>
            {filtrando && (
              <Link className="button" href="/pacientes">
                Limpar
              </Link>
            )}
          </div>
        </form>
        <div className="titulo-tabela">
          <h2 id="titulo-resultados">
            {resultado.total === 1
              ? "1 paciente"
              : `${resultado.total} pacientes`}
            {filtrando ? " encontrados" : ""}
          </h2>
          {resultado.total > 0 && (
            <span className="muted">
              Mostrando {primeiro}–{ultimo}
            </span>
          )}
        </div>
        {resultado.items.length ? (
          <div className="tabela-responsiva">
            <table className="care-table tabela-cartoes">
              <caption className="sr-only">
                Pacientes autorizados para sua conta
              </caption>
              <thead>
                <tr>
                  <th scope="col">Paciente</th>
                  <th scope="col">Modalidade</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultado.items.map((paciente) => (
                  <tr key={paciente.id}>
                    <td data-rotulo="Paciente">
                      <span className="celula-paciente">
                        <span className="patient-avatar" aria-hidden="true">
                          {paciente.displayName
                            .trim()
                            .charAt(0)
                            .toLocaleUpperCase("pt-BR")}
                        </span>
                        <Link href={`/pacientes/${paciente.id}`}>
                          {paciente.displayName}
                        </Link>
                      </span>
                    </td>
                    <td data-rotulo="Modalidade">
                      <ModalidadePaciente value={paciente.modality} />
                    </td>
                    <td className="celula-acoes">
                      <Link
                        className="acao-tabela"
                        href={`/pacientes/${paciente.id}`}
                        aria-label={`Abrir ficha de ${paciente.displayName}`}
                      >
                        Abrir ficha <Icone name="arrow" size={15} />
                      </Link>
                      <Link
                        className="acao-tabela"
                        href={`/pacientes/${paciente.id}?aba=consultations`}
                        aria-label={`Consultas de ${paciente.displayName}`}
                      >
                        Consultas
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Icone name="people" size={40} />
            <h3>Nenhum paciente encontrado</h3>
            <p>
              {filtrando
                ? "Tente outro nome ou limpe os filtros."
                : "Cadastre um paciente ou peça à administração um vínculo para sua conta."}
            </p>
            {filtrando ? (
              <Link className="button" href="/pacientes">
                Limpar filtros
              </Link>
            ) : (
              <Link className="button button-primary" href="/pacientes/novo">
                Cadastrar paciente
              </Link>
            )}
          </div>
        )}
        {resultado.total > TAMANHO && (
          <nav aria-label="Paginação de pacientes" className="paginacao">
            <span>
              Página {pagina + 1} de {Math.ceil(resultado.total / TAMANHO)}
            </span>
            <div>
              {pagina > 0 && (
                <Link className="button" href={endereco(pagina - 1)}>
                  Página anterior
                </Link>
              )}
              {(pagina + 1) * TAMANHO < resultado.total && (
                <Link className="button" href={endereco(pagina + 1)}>
                  Próxima página
                </Link>
              )}
            </div>
          </nav>
        )}
      </section>
    </>
  );
}
