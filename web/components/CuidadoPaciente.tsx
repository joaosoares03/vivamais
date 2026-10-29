"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Paciente } from "@viva/contracts";
import { useSearchParams } from "next/navigation";
import { usePreferenciasPortal } from "./PreferenciasPortal";
import { VisaoGeralPaciente } from "./VisaoGeralPaciente";
import { RefeicoesPaciente } from "./RefeicoesPaciente";
import { useClientePronto } from "../hooks/useClientePronto";
import { GraficoPressao } from "./GraficoPressao";
import { TabelaCuidado } from "./TabelaCuidado";
import { AtivacaoPaciente } from "./AtivacaoPaciente";
import {
  buscarAutorrelatosPeriodo,
  periodoPressao,
} from "../services/periodosCuidados";
import {
  descricaoGrupoAtividadeAprovado,
  grupoAtividadeAprovadoDoPerfil,
  opcoesGrupoAtividadeAprovado,
} from "../services/grupoAtividadeAprovado";

type LinhaDados = Record<string, unknown>;
type Pagina = {
  items: LinhaDados[];
  total: number;
  page: number;
  size: number;
};
type Campo = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  max?: number;
};
type Aba =
  | "overview"
  | "meals"
  | "readings"
  | "medications"
  | "diary"
  | "activities"
  | "consultations"
  | "device";
const rotulos: Record<Aba, string> = {
  overview: "Visão geral",
  readings: "Pressão arterial",
  medications: "Medicamentos",
  meals: "Alimentação",
  diary: "Diário impresso",
  activities: "Atividade física",
  consultations: "Consultas",
  device: "Pulseira",
};
const horarioLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
const formatarData = (v: unknown) =>
  typeof v === "string"
    ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : "—";
const campos: Record<Aba, Campo[]> = {
  overview: [],
  meals: [],
  readings: [
    {
      key: "systolic",
      label: "Pressão sistólica (mmHg)",
      type: "number",
      required: true,
      max: 400,
    },
    {
      key: "diastolic",
      label: "Pressão diastólica (mmHg)",
      type: "number",
      required: true,
      max: 400,
    },
    { key: "pulse", label: "Pulso (opcional)", type: "number", max: 300 },
    {
      key: "measuredAt",
      label: "Data e hora da medição (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
  ],
  medications: [
    { key: "name", label: "Nome do medicamento", required: true, max: 160 },
    {
      key: "instruction",
      label: "Dose e instrução profissional",
      type: "textarea",
      required: true,
      max: 1000,
    },
    {
      key: "startsOn",
      label: "Início da vigência",
      type: "date",
      required: true,
    },
    { key: "endsOn", label: "Fim da vigência (opcional)", type: "date" },
    {
      key: "schedules",
      label: "Horários separados por vírgula, ex.: 08:00, 20:00",
      required: true,
      max: 80,
    },
  ],
  diary: [
    {
      key: "occurredAt",
      label: "Data e hora informadas no diário (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
    {
      key: "systolic",
      label: "Sistólica transcrita (opcional)",
      type: "number",
      max: 400,
    },
    {
      key: "diastolic",
      label: "Diastólica transcrita (opcional)",
      type: "number",
      max: 400,
    },
    { key: "pulse", label: "Pulso (opcional)", type: "number", max: 300 },
    {
      key: "medicationReport",
      label: "Relato sobre medicamentos",
      type: "textarea",
      max: 2000,
    },
    {
      key: "notes",
      label: "Observações da transcrição",
      type: "textarea",
      max: 2000,
    },
  ],
  activities: [
    { key: "type", label: "Atividade informada", required: true, max: 160 },
    {
      key: "durationMinutes",
      label: "Duração em minutos",
      type: "number",
      required: true,
      max: 1440,
    },
    {
      key: "occurredAt",
      label: "Data e hora da atividade (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
    { key: "notes", label: "Observações", type: "textarea", max: 2000 },
  ],
  consultations: [
    {
      key: "occurredAt",
      label: "Data e hora da consulta (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
    {
      key: "notes",
      label: "Anotações da consulta",
      type: "textarea",
      required: true,
      max: 4000,
    },
    {
      key: "goals",
      label: "Objetivos acordados",
      type: "textarea",
      required: true,
      max: 2000,
    },
    {
      key: "carePlan",
      label: "Plano de cuidado profissional",
      type: "textarea",
      required: true,
      max: 4000,
    },
  ],
  device: [
    {
      key: "label",
      label: "Identificação da pulseira",
      required: true,
      max: 160,
    },
    { key: "serialNumber", label: "Número de série (opcional)", max: 160 },
  ],
};
import { consultarDominio } from "../services/dominio";
function ListaRegistros({
  rows: linhas,
  tab,
  onEdit: aoEditar,
  eventos,
  periodoMedicamentos,
}: {
  rows: LinhaDados[];
  tab: Aba;
  onEdit: (row: LinhaDados) => void;
  eventos: LinhaDados[];
  periodoMedicamentos: string;
}) {
  if (!linhas.length) return <p>Nenhum registro encontrado neste período.</p>;
  if (tab === "readings")
    return (
      <>
        <GraficoPressao registros={linhas} />
        <div className="tabela-responsiva">
          <table className="care-table">
            <caption>
              Histórico da pressão — horários exibidos em Brasília
            </caption>
            <thead>
              <tr>
                <th scope="col">Medição</th>
                <th scope="col">Pressão</th>
                <th scope="col">Pulso</th>
                <th scope="col">Origem</th>
                <th scope="col">Registro / envio</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((resposta) => (
                <tr key={String(resposta.id)}>
                  <td>{formatarData(resposta.measuredAt)}</td>
                  <td>
                    {String(resposta.systolic)} / {String(resposta.diastolic)}{" "}
                    mmHg
                  </td>
                  <td>{String(resposta.pulse ?? "—")}</td>
                  <td>
                    {resposta.source === "PRINTED_DIARY"
                      ? "Diário transcrito"
                      : resposta.source === "OCR_CONFIRMED"
                        ? "Foto confirmada"
                        : resposta.source === "MANUAL"
                          ? "Digitação do paciente"
                          : "Registro profissional"}
                    <small>
                      Registrado por{" "}
                      {String(resposta.authorName || "Nome indisponível")}
                    </small>
                  </td>
                  <td>
                    {formatarData(resposta.createdAt)} /{" "}
                    {formatarData(resposta.syncedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  if (
    tab === "medications" ||
    tab === "activities" ||
    tab === "diary" ||
    tab === "consultations"
  )
    return (
      <TabelaCuidado
        registros={linhas}
        tipo={tab}
        eventos={eventos}
        periodoMedicamentos={periodoMedicamentos}
        aoEditar={aoEditar}
      />
    );
  const show: Record<string, string> = {
    name: "Medicamento",
    instruction: "Instrução",
    startsOn: "Vigência inicial",
    endsOn: "Vigência final",
    schedules: "Horários",
    version: "Versão",
    type: "Atividade",
    durationMinutes: "Minutos",
    notes: "Observações",
    medicationReport: "Medicamentos conforme relato",
    systolic: "Sistólica",
    diastolic: "Diastólica",
    goals: "Objetivos",
    carePlan: "Plano de cuidado",
    label: "Dispositivo",
    serialNumber: "Número de série",
    message: "Estado de integração",
  };
  return (
    <div>
      {linhas.map((resposta, i) => (
        <article className="care-record" key={String(resposta.id ?? i)}>
          <p>
            <strong>
              {formatarData(resposta.occurredAt ?? resposta.createdAt)}
            </strong>
          </p>
          <dl>
            {Object.entries(show)
              .filter(
                ([k]) =>
                  resposta[k] !== undefined &&
                  resposta[k] !== null &&
                  resposta[k] !== "",
              )
              .map(([k, label]) => (
                <div key={k}>
                  <dt>{label}</dt>
                  <dd>
                    {Array.isArray(resposta[k])
                      ? (resposta[k] as unknown[]).join(", ")
                      : String(resposta[k])}
                  </dd>
                </div>
              ))}
          </dl>
          {resposta.authorId !== undefined && (
            <p>
              Autoria: {String(resposta.authorName ?? "Nome indisponível")}.
              Registro: {formatarData(resposta.createdAt)}.
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
export function CuidadoPaciente({ patient: paciente }: { patient: Paciente }) {
  const {
    preferencias: { tamanhoPagina },
  } = usePreferenciasPortal();
  const pronto = useClientePronto();
  const [formularioAberto, definirFormularioAberto] = useState(false);
  const parametros = useSearchParams();
  const abaSolicitada = parametros.get("aba");
  const [tab, definirAba] = useState<Aba>(
      abaSolicitada && Object.hasOwn(rotulos, abaSolicitada)
        ? (abaSolicitada as Aba)
        : "overview",
    ),
    [dados, definirDados] = useState<LinhaDados[]>([]),
    [total, definirTotal] = useState(0),
    [pagina, definirPagina] = useState(0);
  const [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState(""),
    [aviso, definirAviso] = useState(""),
    [editando, definirEditando] = useState<LinhaDados | null>(null),
    [historico, definirHistorico] = useState<LinhaDados[]>([]);
  const [eventos, definirEventos] = useState<LinhaDados[]>([]),
    [diasAutorrelatos, definirDiasAutorrelatos] = useState<1 | 7>(1),
    [diaAutorrelatos, definirDia] = useState(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    );
  const [inicio, definirInicio] = useState(""),
    [fim, definirFim] = useState(""),
    [resumo, definirResumo] = useState<LinhaDados | null>(null),
    [perfil, definirPerfil] = useState<LinhaDados | null>(null);
  const base = `/patients/${paciente.id}`;
  const geracaoConsulta = useRef(0);
  const carregar = useCallback(async () => {
    const geracaoAtual = ++geracaoConsulta.current;
    if (tab === "overview" || tab === "meals") return;
    definirOcupado(true);
    definirErro("");
    try {
      let caminho = `${base}/${tab}`;
      if (!["medications", "device"].includes(tab))
        caminho += `?page=${pagina}&size=${tamanhoPagina}${tab === "readings" && inicio ? `&from=${encodeURIComponent(new Date(inicio).toISOString())}` : ""}${tab === "readings" && fim ? `&to=${encodeURIComponent(new Date(fim).toISOString())}` : ""}`;
      const resposta = await consultarDominio<
        Pagina | LinhaDados[] | LinhaDados | null
      >(caminho);
      let linhasConsulta: LinhaDados[], totalConsulta: number;
      if (tab === "device") {
        linhasConsulta = resposta ? [resposta as LinhaDados] : [];
        totalConsulta = linhasConsulta.length;
      } else if (Array.isArray(resposta)) {
        linhasConsulta = resposta;
        totalConsulta = resposta.length;
      } else {
        const paginaConsulta = resposta as Pagina;
        linhasConsulta = paginaConsulta.items;
        totalConsulta = paginaConsulta.total;
      }
      const eventosConsulta =
        tab === "medications"
          ? await buscarAutorrelatosPeriodo(
              paciente.id,
              diaAutorrelatos,
              diasAutorrelatos,
            )
          : [];
      const perfilConsulta =
        tab === "activities"
          ? await consultarDominio<LinhaDados | null>(
              `${base}/activity-profile`,
            )
          : null;
      if (geracaoAtual !== geracaoConsulta.current) return;
      definirDados(linhasConsulta);
      definirTotal(totalConsulta);
      definirEventos(eventosConsulta);
      definirPerfil(perfilConsulta);
    } catch (e) {
      if (geracaoAtual !== geracaoConsulta.current) return;
      definirErro(
        e instanceof Error ? e.message : "Não foi possível carregar.",
      );
      definirDados([]);
      definirEventos([]);
    } finally {
      if (geracaoAtual === geracaoConsulta.current) definirOcupado(false);
    }
  }, [
    base,
    tamanhoPagina,
    paciente.id,
    tab,
    pagina,
    diaAutorrelatos,
    diasAutorrelatos,
    inicio,
    fim,
  ]);
  useEffect(() => {
    void carregar();
    return () => {
      ++geracaoConsulta.current;
    };
  }, [carregar]);
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    definirOcupado(true);
    definirErro("");
    definirAviso("");
    const formulario = event.currentTarget;
    const valores = Object.fromEntries(new FormData(formulario));
    const corpo: LinhaDados = { ...valores };
    try {
      for (const f of campos[tab]) {
        if (f.type === "number")
          corpo[f.key] = valores[f.key] === "" ? null : Number(valores[f.key]);
        if (f.type === "datetime-local")
          corpo[f.key] = new Date(String(valores[f.key])).toISOString();
      }
      if (!["medications", "device"].includes(tab))
        corpo.id = crypto.randomUUID();
      if (tab === "readings") corpo.source = "PROFESSIONAL";
      if (tab === "medications") {
        corpo.schedules = String(valores.schedules)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
        corpo.endsOn = valores.endsOn || null;
        corpo.timeZone = "America/Sao_Paulo";
        if (editando) corpo.version = editando.version;
      }
      await consultarDominio(
        tab === "medications" && editando
          ? `/medications/${editando.id}`
          : `${base}/${tab}`,
        tab === "medications" && editando ? "PUT" : "POST",
        corpo,
      );
      definirAviso("Registro salvo no banco de dados.");
      definirEditando(null);
      definirFormularioAberto(false);
      formulario.reset();
      await carregar();
    } catch (e) {
      definirErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      definirOcupado(false);
    }
  }
  async function edit(row: LinhaDados) {
    definirEditando(row);
    definirHistorico([]);
    try {
      definirHistorico(
        await consultarDominio<LinhaDados[]>(`/medications/${row.id}/history`),
      );
    } catch (e) {
      definirErro(e instanceof Error ? e.message : "Histórico indisponível.");
    }
  }
  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await consultarDominio(
        `${base}/activity-profile`,
        "PUT",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      definirAviso("Perfil funcional salvo.");
      await carregar();
    } catch (e) {
      definirErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }
  async function configurar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    try {
      const resposta = await consultarDominio<LinhaDados>(
        `${base}/device/configurations`,
        "POST",
        {
          schedules: String(f.get("schedules"))
            .split(",")
            .map((s) => s.trim()),
          adapter: f.get("adapter"),
        },
      );
      definirAviso(String(resposta.message));
      definirHistorico(
        await consultarDominio<LinhaDados[]>(`${base}/device/configurations`),
      );
    } catch (e) {
      definirErro(
        e instanceof Error ? e.message : "Não foi possível configurar.",
      );
    }
  }
  const grupoAtividadeAprovado = grupoAtividadeAprovadoDoPerfil(
      perfil?.approvedCatalogGroup,
    ),
    descricaoGrupoAprovado = descricaoGrupoAtividadeAprovado(
      grupoAtividadeAprovado,
    );
  return (
    <section>
      <fieldset disabled={!pronto} className="area-clinica-paciente">
        <div
          className="care-tabs"
          role="tablist"
          aria-label="Módulos do paciente"
        >
          {(Object.keys(rotulos) as Aba[])
            .filter(
              (k) => paciente.modality === "BRACELET_DIARY" || k !== "device",
            )
            .map((k) => (
              <button
                key={k}
                role="tab"
                disabled={!pronto}
                aria-selected={tab === k}
                onClick={() => {
                  if (k === tab) return;
                  ++geracaoConsulta.current;
                  definirDados([]);
                  definirTotal(0);
                  definirEventos([]);
                  definirPerfil(null);
                  definirOcupado(!["overview", "meals"].includes(k));
                  definirAba(k);
                  definirFormularioAberto(false);
                  definirPagina(0);
                  definirEditando(null);
                  definirHistorico([]);
                  definirAviso("");
                  definirResumo(null);
                }}
              >
                {rotulos[k]}
              </button>
            ))}
        </div>
        {tab === "overview" ? (
          <VisaoGeralPaciente idPaciente={paciente.id} />
        ) : tab === "meals" ? (
          <RefeicoesPaciente patientId={paciente.id} />
        ) : (
          <section className="panel padded" role="tabpanel">
            <div className="titulo-tabela">
              <h2>
                {tab === "readings" ? "Histórico da pressão" : rotulos[tab]}
              </h2>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  if (formularioAberto || editando) {
                    definirFormularioAberto(false);
                    definirEditando(null);
                  } else definirFormularioAberto(true);
                }}
              >
                {formularioAberto || editando
                  ? "Voltar aos registros"
                  : {
                      readings: "Registrar pressão manualmente",
                      medications: "Adicionar medicamento",
                      activities: "Registrar atividade",
                      diary: "Registrar diário",
                      consultations: "Nova consulta",
                      device: "Cadastrar pulseira",
                    }[tab]}
              </button>
            </div>
            {erro && <p role="alert">{erro}</p>}
            {aviso && <p role="status">{aviso}</p>}
            {ocupado && <p role="status">Carregando informações…</p>}
            {tab === "readings" && (
              <>
                <div
                  className="care-actions"
                  aria-label="Períodos rápidos da pressão"
                >
                  {([7, 30] as const).map((dias) => (
                    <button
                      type="button"
                      key={dias}
                      className="button button-secondary"
                      onClick={() => {
                        const periodo = periodoPressao(dias);
                        definirInicio(periodo.inicio);
                        definirFim(periodo.fim);
                        definirPagina(0);
                      }}
                    >
                      Últimos {dias} dias
                    </button>
                  ))}
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      definirInicio("");
                      definirFim("");
                      definirPagina(0);
                    }}
                  >
                    Todos os registros
                  </button>
                </div>
                <div className="care-grid">
                  <label>
                    De
                    <input
                      aria-label="Medições a partir de"
                      type="datetime-local"
                      value={inicio}
                      onChange={(e) => {
                        definirInicio(e.target.value);
                        definirPagina(0);
                      }}
                    />
                  </label>
                  <label>
                    Até
                    <input
                      aria-label="Medições até"
                      type="datetime-local"
                      value={fim}
                      onChange={(e) => {
                        definirFim(e.target.value);
                        definirPagina(0);
                      }}
                    />
                  </label>
                </div>
                <p className="form-hint">
                  Filtro no fuso do navegador. O gráfico mostra os registros da
                  página atual (até {tamanhoPagina}); use a paginação para os
                  demais.
                </p>
              </>
            )}
            {!formularioAberto && !editando && (
              <ListaRegistros
                rows={dados}
                eventos={eventos}
                tab={tab}
                periodoMedicamentos={
                  diasAutorrelatos === 7 ? "período de sete dias" : "dia"
                }
                onEdit={(row) => {
                  void edit(row);
                }}
              />
            )}
            {!["medications", "device"].includes(tab) && (
              <div className="care-tabs">
                <button
                  disabled={pagina === 0 || ocupado}
                  onClick={() =>
                    definirPagina(
                      (pacienteConsultado) => pacienteConsultado - 1,
                    )
                  }
                >
                  Anterior
                </button>
                <span>
                  Página {pagina + 1} · {total} registros
                </span>
                <button
                  disabled={(pagina + 1) * tamanhoPagina >= total || ocupado}
                  onClick={() =>
                    definirPagina(
                      (pacienteConsultado) => pacienteConsultado + 1,
                    )
                  }
                >
                  Próxima
                </button>
              </div>
            )}
            {tab === "medications" && (
              <section>
                <h3>Respostas informadas pelo paciente</h3>
                <p>
                  Confirmações são autorrelatos. Sem confirmação não significa
                  medicamento não tomado.
                </p>
                <div className="care-form care-grid">
                  <label>
                    Dia dos horários
                    <input
                      type="date"
                      value={diaAutorrelatos}
                      onChange={(e) => definirDia(e.target.value)}
                    />
                  </label>
                  <label>
                    Período dos autorrelatos
                    <select
                      value={diasAutorrelatos}
                      onChange={(evento) =>
                        definirDiasAutorrelatos(
                          Number(evento.target.value) as 1 | 7,
                        )
                      }
                    >
                      <option value={1}>Somente o dia selecionado</option>
                      <option value={7}>Sete dias até o dia selecionado</option>
                    </select>
                  </label>
                </div>
                {!ocupado && !erro && (
                  <p role="status" aria-label="Resumo dos autorrelatos">
                    {
                      eventos.filter((evento) => evento.status === "TAKEN")
                        .length
                    }{" "}
                    Tomei ·{" "}
                    {
                      eventos.filter((evento) => evento.status === "NOT_TAKEN")
                        .length
                    }{" "}
                    Não tomei ·{" "}
                    {eventos.filter((evento) => !evento.reportedAt).length} Sem
                    confirmação · {eventos.length} horários no período.
                  </p>
                )}
                {eventos.map((ev, i) => (
                  <p key={i}>
                    {String(ev.name)} — {formatarData(ev.scheduledAt)} —{" "}
                    <strong>
                      {ev.status === "TAKEN"
                        ? "Tomei (autorrelato)"
                        : ev.status === "NOT_TAKEN"
                          ? "Não tomei (autorrelato)"
                          : "Sem confirmação"}
                    </strong>
                    {ev.reportedAt
                      ? ` · Resposta: ${formatarData(ev.reportedAt)}`
                      : ""}
                  </p>
                ))}
              </section>
            )}
            {tab === "activities" && (
              <details>
                <p>
                  <strong>Grupo atualmente vinculado ao perfil:</strong>{" "}
                  {descricaoGrupoAprovado}.
                </p>
                <p>
                  {grupoAtividadeAprovado === "NAO_DEFINIDO"
                    ? "O roteiro do paciente permanece bloqueado até a avaliação presencial e a escolha explícita de um grupo."
                    : "Sem sinal de alerta ou restrição impeditiva, o aplicativo mostra somente os cinco materiais educativos deste grupo. O autorrelato continua separado."}
                </p>
                <summary>Perfil funcional, restrições e grupo aprovado</summary>
                <form
                  method="post"
                  key={JSON.stringify(perfil)}
                  onSubmit={salvarPerfil}
                  className="care-form"
                >
                  {[
                    ["mobility", "Mobilidade"],
                    ["balance", "Equilíbrio"],
                    ["restrictions", "Restrições"],
                    ["professionalGuidance", "Orientações profissionais"],
                  ].map(([chave, label]) => (
                    <label key={chave}>
                      {label}
                      <textarea
                        name={chave}
                        defaultValue={String(perfil?.[chave] ?? "")}
                        required={["mobility", "balance"].includes(chave)}
                        maxLength={
                          ["mobility", "balance"].includes(chave) ? 300 : 2000
                        }
                      />
                    </label>
                  ))}
                  <label>
                    Grupo do catálogo aprovado para este paciente
                    <select
                      name="approvedCatalogGroup"
                      defaultValue={grupoAtividadeAprovado}
                      aria-describedby="descricao-grupo-catalogo"
                    >
                      {opcoesGrupoAtividadeAprovado.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </option>
                      ))}
                    </select>
                    <small id="descricao-grupo-catalogo">
                      {descricaoGrupoAprovado}
                    </small>
                  </label>
                  <button className="button button-primary">
                    Salvar perfil funcional
                  </button>
                </form>
              </details>
            )}
            <div hidden={!formularioAberto && !editando}>
              <h3>
                {editando ? "Atualizar plano de medicamentos" : "Novo registro"}
              </h3>
              <form
                method="post"
                key={`${tab}-${editando?.id ?? "new"}`}
                className="care-form formulario-registro"
                data-modulo={tab}
                onSubmit={salvar}
              >
                {campos[tab].map((f) => (
                  <label key={f.key}>
                    {f.label}
                    {f.type === "textarea" ? (
                      <textarea
                        name={f.key}
                        required={f.required}
                        maxLength={f.max}
                        defaultValue={String(editando?.[f.key] ?? "")}
                      />
                    ) : (
                      <input
                        name={f.key}
                        type={f.type || "text"}
                        required={f.required}
                        maxLength={f.type === "number" ? undefined : f.max}
                        min={f.type === "number" ? 1 : undefined}
                        max={f.type === "number" ? f.max : undefined}
                        defaultValue={
                          editando?.[f.key] !== undefined
                            ? Array.isArray(editando[f.key])
                              ? (editando[f.key] as unknown[]).join(", ")
                              : String(editando[f.key] ?? "")
                            : f.type === "datetime-local"
                              ? horarioLocal()
                              : f.key === "startsOn"
                                ? horarioLocal().slice(0, 10)
                                : ""
                        }
                      />
                    )}
                  </label>
                ))}
                {tab === "activities" && (
                  <label>
                    Estado informado pelo paciente
                    <select name="feeling" required defaultValue="">
                      <option value="" disabled>
                        Selecione o relato
                      </option>
                      <option value="WELL">Estou bem</option>
                      <option value="TIRED">Estou cansado</option>
                      <option value="UNWELL">Estou me sentindo mal</option>
                    </select>
                  </label>
                )}
                <button
                  className="button button-primary"
                  disabled={!pronto || ocupado}
                >
                  {editando ? "Salvar nova versão" : "Salvar registro"}
                </button>
                {editando && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => definirEditando(null)}
                  >
                    Cancelar edição
                  </button>
                )}
              </form>
            </div>
            {tab === "device" && (
              <>
                <h3>Programar lembretes</h3>
                <p>
                  A pulseira lembra medicamentos e não mede pressão. O simulador
                  não comunica com dispositivo físico.
                </p>
                <form method="post" className="care-form" onSubmit={configurar}>
                  <label>
                    Horários
                    <input
                      name="schedules"
                      required
                      placeholder="08:00, 20:00"
                    />
                  </label>
                  <label>
                    Integração
                    <select name="adapter">
                      <option value="SIMULATED">
                        SIMULADO — teste de desenvolvimento
                      </option>
                      <option value="HARDWARE">
                        Hardware real — indisponível
                      </option>
                    </select>
                  </label>
                  <button className="button button-primary">
                    Registrar configuração
                  </button>
                </form>
              </>
            )}
            {historico.length > 0 && (
              <section>
                <h3>Histórico de alterações</h3>
                {historico.map((h, i) => (
                  <article className="care-record" key={i}>
                    {h.snapshot ? (
                      <p>
                        Versão {String(h.version)} —{" "}
                        {String((h.snapshot as LinhaDados).name)}:{" "}
                        {String((h.snapshot as LinhaDados).instruction)} ·{" "}
                        {formatarData(h.changedAt)}
                      </p>
                    ) : (
                      <p>
                        {String(h.message)} · {formatarData(h.createdAt)}
                      </p>
                    )}
                  </article>
                ))}
              </section>
            )}
            {tab === "consultations" && (
              <>
                <button
                  className="button button-secondary"
                  onClick={() => {
                    consultarDominio<LinhaDados>(`${base}/summary`)
                      .then(definirResumo)
                      .catch((e) => definirErro(e.message));
                  }}
                >
                  Reunir resumo para consulta
                </button>
                {resumo && (
                  <section>
                    <h3>Resumo dos registros disponíveis</h3>
                    {[
                      ["readings", "Medições"],
                      ["medications", "Planos de medicamentos"],
                      ["activities", "Atividades"],
                      ["diary", "Entradas de diário"],
                      ["consultations", "Consultas"],
                    ].map(([k, label]) => (
                      <p key={k}>
                        {label}:{" "}
                        {Array.isArray(resumo[k])
                          ? (resumo[k] as unknown[]).length
                          : 0}{" "}
                        registros recentes. Consulte os detalhes nas abas
                        correspondentes.
                      </p>
                    ))}
                    <p>O resumo apoia a consulta e não produz diagnóstico.</p>
                    <p>
                      Gerado em {formatarData(resumo.generatedAt)}. Até 20
                      registros recentes por categoria.
                    </p>
                    <button
                      className="button button-secondary"
                      onClick={async () => {
                        try {
                          const dados = await consultarDominio<LinhaDados>(
                            `${base}/export`,
                          );
                          const url = URL.createObjectURL(
                            new Blob([JSON.stringify(dados, null, 2)], {
                              type: "application/json",
                            }),
                          );
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `viva-resumo-${paciente.id}.json`;
                          a.click();
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                        } catch {
                          definirErro("Não foi possível exportar o resumo.");
                        }
                      }}
                    >
                      Exportar resumo autorizado (JSON)
                    </button>
                    {(
                      [
                        "readings",
                        "medications",
                        "medicationEvents",
                        "activities",
                        "diary",
                        "consultations",
                        "meals",
                      ] as const
                    ).map((chave) => (
                      <details key={chave}>
                        <summary>
                          {
                            {
                              readings: "Medições",
                              medications: "Planos de medicamentos",
                              medicationEvents: "Autorrelatos do dia",
                              activities: "Atividades",
                              diary: "Diário",
                              consultations: "Consultas",
                              meals: "Refeições",
                            }[chave]
                          }
                        </summary>
                        {(Array.isArray(resumo[chave])
                          ? (resumo[chave] as LinhaDados[])
                          : []
                        ).map((row, index) => (
                          <article className="care-record" key={index}>
                            {Object.entries({
                              name: "Nome",
                              instruction: "Instrução profissional",
                              measuredAt: "Medição",
                              systolic: "Sistólica (mmHg)",
                              diastolic: "Diastólica (mmHg)",
                              scheduledAt: "Horário previsto",
                              reportedAt: "Horário da resposta",
                              status: "Autorrelato",
                              type: "Atividade",
                              durationMinutes: "Minutos",
                              occurredAt: "Ocorrência",
                              createdAt: "Registro",
                              notes: "Anotações",
                              medicationReport: "Relato transcrito",
                              goals: "Objetivos",
                              carePlan: "Plano profissional",
                              analysisStatus: "Análise educativa",
                            })
                              .filter(([field]) => row[field] != null)
                              .map(([field, label]) => (
                                <p key={field}>
                                  <strong>{label}:</strong>{" "}
                                  {field === "status"
                                    ? row[field] === "TAKEN"
                                      ? "Tomei"
                                      : row[field] === "NOT_TAKEN"
                                        ? "Não tomei"
                                        : "Sem confirmação"
                                    : field.endsWith("At")
                                      ? formatarData(row[field])
                                      : String(row[field])}
                                </p>
                              ))}
                          </article>
                        ))}
                      </details>
                    ))}
                    {resumo.functionalProfile != null && (
                      <details>
                        <summary>Perfil funcional e orientações</summary>
                        {Object.entries(resumo.functionalProfile as LinhaDados)
                          .filter(([chave]) =>
                            [
                              "mobility",
                              "balance",
                              "restrictions",
                              "professionalGuidance",
                            ].includes(chave),
                          )
                          .map(([chave, valor]) => (
                            <p key={chave}>
                              {
                                (
                                  {
                                    mobility: "Mobilidade",
                                    balance: "Equilíbrio",
                                    restrictions: "Restrições",
                                    professionalGuidance: "Orientações",
                                  } as Record<string, string>
                                )[chave]
                              }
                              : {String(valor)}
                            </p>
                          ))}
                      </details>
                    )}
                  </section>
                )}
              </>
            )}
          </section>
        )}
        {paciente.modality === "APP" && (
          <div className="panel padded spaced">
            <AtivacaoPaciente idPaciente={paciente.id} />
          </div>
        )}
      </fieldset>
    </section>
  );
}
