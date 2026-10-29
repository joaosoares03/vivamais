"use client";
import { useClientePronto } from "../hooks/useClientePronto";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { consultarDominio } from "../services/dominio";
import { apresentacaoAnaliseAlimentarWeb } from "../services/apresentacaoAnaliseAlimentar";
type Refeicao = {
  id: string;
  fileId: string;
  occurredAt: string;
  notes: string;
  analysisStatus: string;
  assessment?: {
    status: string;
    trafficLight?: string;
    explanation: string;
    limitations: string;
    identifiedFoods: string[];
    criteriaVersion?: string;
    modelVersion?: string;
  } | null;
};
export function RefeicoesPaciente({
  patientId: idPaciente,
}: {
  patientId: string;
}) {
  const pronto = useClientePronto();
  const [refeicoes, definirRefeicoes] = useState<Refeicao[]>([]),
    [pagina, definirPagina] = useState(0),
    [total, definirTotal] = useState(0),
    [erro, definirErro] = useState(""),
    [aviso, definirAviso] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  const carregar = useCallback(async () => {
    try {
      const resposta = await consultarDominio<{
        items: Refeicao[];
        total: number;
      }>(`/patients/${idPaciente}/meals?page=${pagina}&size=10`);
      definirRefeicoes(resposta.items);
      definirTotal(resposta.total);
    } catch (e) {
      definirErro(
        e instanceof Error ? e.message : "Não foi possível carregar fotos.",
      );
    }
  }, [idPaciente, pagina]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    definirOcupado(true);
    definirErro("");
    const formulario = event.currentTarget;
    const valores = new FormData(formulario),
      file = valores.get("file") as File;
    if (!file || file.size > 2097152) {
      definirErro("Use PNG ou JPEG com até 2 MB.");
      definirOcupado(false);
      return;
    }
    try {
      const upload = new FormData();
      upload.set("file", file);
      upload.set("purpose", "MEAL");
      const resposta = await fetch(`/api/domain/patients/${idPaciente}/files`, {
        method: "POST",
        body: upload,
      });
      const object = await resposta.json();
      if (!resposta.ok) throw new Error(object.detail || "Foto não enviada.");
      await consultarDominio(`/patients/${idPaciente}/meals`, "POST", {
        fileId: object.id,
        occurredAt: new Date(String(valores.get("occurredAt"))).toISOString(),
        notes: valores.get("notes"),
      });
      formulario.reset();
      definirAviso("Refeição e foto privadas salvas.");
      await carregar();
    } catch (e) {
      definirErro(
        e instanceof Error ? e.message : "Não foi possível salvar a refeição.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <section className="panel padded spaced">
      <h2>Alimentação e fotos privadas</h2>
      <p>
        Envie uma foto da refeição. A imagem não mede nutrientes. Análise por IA
        permanece indisponível até configurar um serviço e aprovar seus
        critérios.
      </p>
      {erro && <p role="alert">{erro}</p>}
      {aviso && <p role="status">{aviso}</p>}
      <details className="adicionar-foto">
        <summary className="button button-secondary">
          Adicionar foto de refeição
        </summary>
        <form method="post" className="care-form" onSubmit={salvar}>
          <label>
            Foto da refeição (PNG/JPEG, até 2 MB)
            <input
              name="file"
              type="file"
              accept="image/png,image/jpeg"
              required
            />
          </label>
          <label>
            Data e hora da refeição
            <input
              type="datetime-local"
              name="occurredAt"
              required
              defaultValue={new Date(
                Date.now() - new Date().getTimezoneOffset() * 60000,
              )
                .toISOString()
                .slice(0, 16)}
            />
          </label>
          <label>
            Observações
            <textarea name="notes" maxLength={2000} />
          </label>
          <button
            className="button button-primary"
            disabled={!pronto || ocupado}
          >
            {ocupado ? "Enviando foto…" : "Salvar refeição e foto"}
          </button>
        </form>
      </details>
      <div className="care-grid">
        {refeicoes.map((meal) => {
          const apresentacao = apresentacaoAnaliseAlimentarWeb(meal.assessment);
          return (
          <article key={meal.id} className={`care-record ${apresentacao.classe}`}>
            <img
              src={`/api/photos/${meal.fileId}`}
              width={300}
              height={220}
              className="foto-refeicao-privada"
              alt="Foto privada da refeição"
            />
            <p>
              {new Date(meal.occurredAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </p>
            <p>{meal.notes}</p>
            <p>
              <strong>
                <span aria-hidden="true">{apresentacao.icone} </span>
                {apresentacao.rotulo}
              </strong>
            </p>
            <p>{apresentacao.explicacaoHas}</p>
            {meal.assessment ? (
              <>
                <p>{meal.assessment.explanation}</p>
                <p>{meal.assessment.limitations}</p>
                {(meal.assessment.criteriaVersion || meal.assessment.modelVersion) && (
                  <p className="muted">
                    Critérios {meal.assessment.criteriaVersion || "não informado"} · modelo {meal.assessment.modelVersion || "não informado"}
                  </p>
                )}
              </>
            ) : (
              <p>
                A foto permanece privada e disponível para conversar com a equipe.
              </p>
            )}
            <button
              className="button button-secondary"
              onClick={() => {
                consultarDominio<{
                  message?: string;
                  providerCalled?: boolean;
                }>(`/meals/${meal.id}/analyze`, "POST", {})
                  .then((resposta) => {
                    definirAviso(
                      resposta.message ||
                        "Resposta educativa recebida; consulte as limitações.",
                    );
                    void carregar();
                  })
                  .catch((e) => definirErro(e.message));
              }}
            >
              Consultar análise educativa
            </button>
          </article>
          );
        })}
      </div>
      {!refeicoes.length && <p>Nenhuma foto registrada.</p>}
      <div className="care-tabs">
        <button
          disabled={!pagina}
          onClick={() =>
            definirPagina((pacienteConsultado) => pacienteConsultado - 1)
          }
        >
          Fotos anteriores
        </button>
        <span>
          Página {pagina + 1} · {total} fotos
        </span>
        <button
          disabled={(pagina + 1) * 10 >= total}
          onClick={() =>
            definirPagina((pacienteConsultado) => pacienteConsultado + 1)
          }
        >
          Próximas fotos
        </button>
      </div>
    </section>
  );
}
