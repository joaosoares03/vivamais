"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  dataCivilBrasil,
  dataCivilValida,
  deslocarDataCivil,
  hojeBrasil,
  type AgendaMedicamentos as DadosAgenda,
} from "@viva/contracts";
import { CampoData } from "./CampoData";
import { consultarDominio } from "../services/dominio";
export function AgendaMedicamentos({ idPaciente }: { idPaciente: string }) {
  const hoje = hojeBrasil();
  const [periodo, definirPeriodo] = useState({ inicio: hoje, fim: hoje });
  const [dados, definirDados] = useState<DadosAgenda | null>(null),
    [carregando, definirCarregando] = useState(true),
    [erro, definirErro] = useState("");
  useEffect(() => {
    let ativo = true;
    definirCarregando(true);
    definirErro("");
    void consultarDominio<DadosAgenda>(
      `/patients/${idPaciente}/medication-agenda?from=${periodo.inicio}&to=${periodo.fim}`,
    )
      .then((valor) => {
        if (ativo) definirDados(valor);
      })
      .catch((falha) => {
        if (ativo) {
          definirDados(null);
          definirErro(
            falha instanceof Error
              ? falha.message
              : "Não foi possível consultar a programação.",
          );
        }
      })
      .finally(() => {
        if (ativo) definirCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [idPaciente, periodo]);
  function filtrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget),
      inicio = String(formulario.get("inicio") ?? ""),
      fim = String(formulario.get("fim") ?? "");
    if (
      !dataCivilValida(inicio) ||
      !dataCivilValida(fim) ||
      fim < inicio ||
      fim > deslocarDataCivil(inicio, 30)
    ) {
      definirErro("Escolha um período válido de até31 dias.");
      return;
    }
    definirPeriodo({ inicio, fim });
  }
  return (
    <details className="agenda-medicamentos" open>
      <summary>Programação e histórico de doses</summary>
      <div className="care-tabs">
        {["Hoje", "Ontem", "Últimos sete dias"].map((rotulo) => (
          <button
            type="button"
            key={rotulo}
            onClick={() =>
              definirPeriodo({
                inicio:
                  rotulo === "Hoje"
                    ? hoje
                    : rotulo === "Ontem"
                      ? deslocarDataCivil(hoje, -1)
                      : deslocarDataCivil(hoje, -6),
                fim: rotulo === "Ontem" ? deslocarDataCivil(hoje, -1) : hoje,
              })
            }
          >
            {rotulo}
          </button>
        ))}
      </div>
      <form className="care-form care-grid" onSubmit={filtrar}>
        <label>
          Data inicial
          <CampoData
            key={`inicio-${periodo.inicio}`}
            name="inicio"
            rotulo="Início do histórico de doses"
            defaultValue={periodo.inicio}
          />
        </label>
        <label>
          Data final
          <CampoData
            key={`fim-${periodo.fim}`}
            name="fim"
            rotulo="Fim do histórico de doses"
            defaultValue={periodo.fim}
          />
        </label>
        <button className="button button-secondary" disabled={carregando}>
          Consultar doses
        </button>
      </form>
      {carregando && <p role="status">Consultando horários e autorrelatos…</p>}
      {erro && <p role="alert">{erro}</p>}
      {!carregando &&
        dados?.dias.map((dia) => (
          <section key={dia.data}>
            <h3>{dataCivilBrasil(dia.data)}</h3>
            <p>
              {dia.resumo.tomadas} de{` ${dia.resumo.previstas}`} doses
              registradas como tomadas · {dia.resumo.naoTomadas} não tomadas por
              autorrelato · {dia.resumo.pendentes} sem registro.
            </p>
            {dia.eventos.length === 0 ? (
              <p>Nenhum horário programado para esta data.</p>
            ) : (
              <div className="tabela-responsiva">
                <table className="care-table tabela-cartoes">
                  <caption className="sr-only">
                    Horários de {dataCivilBrasil(dia.data)}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Horário</th>
                      <th scope="col">Medicamento e dosagem</th>
                      <th scope="col">Situação</th>
                      <th scope="col">Autoria e origem</th>
                      <th scope="col">Registrado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dia.eventos.map((dose) => (
                      <tr key={`${dose.planId}|${dose.scheduledAt}`}>
                        <td data-rotulo="Horário">
                          <strong>{dose.horarioLocal.slice(0, 5)}</strong>
                        </td>
                        <td data-rotulo="Medicamento">
                          <strong>{dose.name}</strong>
                          <small>
                            {dose.dosagem || "Dosagem não cadastrada"}
                          </small>
                          <small>{dose.instruction}</small>
                        </td>
                        <td data-rotulo="Situação">
                          {dose.status === "TAKEN" ? (
                            <span className="badge badge-sucesso">
                              Informado como tomado
                            </span>
                          ) : dose.status === "NOT_TAKEN" ? (
                            <span className="badge badge-alerta">
                              Informado como não tomado
                            </span>
                          ) : (
                            <span className="badge badge-neutro">
                              Sem registro
                            </span>
                          )}
                        </td>
                        <td data-rotulo="Autoria">
                          {dose.authorName || "—"}
                          <br />
                          {dose.source === "SELF_REPORT"
                            ? "Autorrelato do paciente"
                            : dose.source === "PROFESSIONAL_TRANSCRIPTION"
                              ? "Transcrição profissional"
                              : "—"}
                        </td>
                        <td data-rotulo="Registrado em">
                          {dose.reportedAt
                            ? new Date(dose.reportedAt).toLocaleString(
                                "pt-BR",
                                { timeZone: "America/Sao_Paulo" },
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      <p className="form-hint">
        Ausência de registro não comprova dose não tomada. Valores são relatos,
        sem confirmação de ingestão.
      </p>
    </details>
  );
}
