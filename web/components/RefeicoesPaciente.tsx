"use client";
import {
  horarioBrasilParaCampo,
  interpretarHorarioBrasil,
} from "@viva/contracts";
import { prepararArquivo } from "../../services/fotografia/prepararFotografia.web";
import { mensagemFalhaFotografia, type FotografiaPreparada } from "../../services/fotografia/tipos";
import { useClientePronto } from "../hooks/useClientePronto";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
  const [previa, definirPrevia] = useState<FotografiaPreparada | null>(null);
  const imagemAtual = useRef<FotografiaPreparada | null>(null);
  const arquivoEnviado = useRef<string | null>(null);
  const [estadoAnalise, definirEstadoAnalise] = useState<{
    enabled: boolean;
    message: string;
  } | null>(null);
  const [analisando, definirAnalisando] = useState<string | null>(null);
  useEffect(() => {
    void consultarDominio<{ enabled: boolean; message: string }>("/food/status")
      .then(definirEstadoAnalise)
      .catch(() => definirEstadoAnalise(null));
    return () => imagemAtual.current?.liberar();
  }, []);
  function removerFoto() {
    imagemAtual.current?.liberar();
    imagemAtual.current = null;
    arquivoEnviado.current = null;
    definirPrevia(null);
  }
  async function escolher(arquivo?: File) {
    if (!arquivo) return;
    definirOcupado(true);
    definirErro("");
    definirAviso("Preparando foto…");
    try {
      const pronta = await prepararArquivo(arquivo);
      removerFoto();
      imagemAtual.current = pronta;
      definirPrevia(pronta);
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível preparar a foto.",
      );
    } finally {
      definirOcupado(false);
      definirAviso("");
    }
  }
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
    if (ocupado || !previa?.arquivo) return;
    definirOcupado(true);
    definirErro("");
    const formulario = event.currentTarget;
    const valores = new FormData(formulario);
    try {
      if (!arquivoEnviado.current) {
        const upload = new FormData();
        upload.set("file", previa.arquivo);
        upload.set("purpose", "MEAL");
        const resposta = await fetch(
          `/api/domain/patients/${idPaciente}/files`,
          {
            method: "POST",
            body: upload,
            signal: AbortSignal.timeout(60000),
            redirect: "error",
          },
        );
        const object = await resposta.json();
        if (!resposta.ok) throw new Error(object.detail || "Foto não enviada.");
        arquivoEnviado.current = object.id;
      }
      await consultarDominio(`/patients/${idPaciente}/meals`, "POST", {
        fileId: arquivoEnviado.current,
        occurredAt: interpretarHorarioBrasil(String(valores.get("occurredAt"))),
        notes: valores.get("notes"),
      });
      formulario.reset();
      removerFoto();
      definirAviso("Refeição e foto privadas salvas.");
      await carregar();
    } catch (e) {
      definirErro(mensagemFalhaFotografia(e));
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
      <p role="status">
        {estadoAnalise?.message ||
          "Consultando disponibilidade da análise educativa…"}
      </p>
      {erro && <p role="alert">{erro}</p>}
      {aviso && <p role="status">{aviso}</p>}
      <details className="adicionar-foto">
        <summary className="button button-secondary">
          Adicionar foto de refeição
        </summary>
        <form method="post" className="care-form" onSubmit={salvar}>
          <label>
            Foto da refeição (até 10 MB, redução automática)
            <input
              name="file"
              type="file"
              accept="image/png,image/jpeg,image/heic,image/heif"
              disabled={ocupado}
              onChange={(evento) => void escolher(evento.target.files?.[0])}
            />
          </label>
          {previa && (
            <div>
              <img
                className="foto-previa"
                src={previa.uri}
                alt="Prévia da refeição selecionada"
              />
              <button
                type="button"
                className="button button-secondary"
                disabled={ocupado}
                onClick={removerFoto}
              >
                Remover foto
              </button>
              <p>Foto preparada automaticamente. Confira antes de salvar.</p>
            </div>
          )}
          <label>
            Data e hora da refeição
            <input
              type="datetime-local"
              name="occurredAt"
              required
              defaultValue={horarioBrasilParaCampo()}
            />
          </label>
          <label>
            Observações
            <textarea name="notes" maxLength={2000} />
          </label>
          <button
            className="button button-primary"
            disabled={!pronto || ocupado || !previa}
          >
            {ocupado ? "Enviando foto…" : "Salvar refeição e foto"}
          </button>
        </form>
      </details>
      <div className="care-grid">
        {refeicoes.map((meal) => {
          const apresentacao = apresentacaoAnaliseAlimentarWeb(meal.assessment);
          return (
            <article
              key={meal.id}
              className={`care-record ${apresentacao.classe}`}
            >
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
                  {(meal.assessment.criteriaVersion ||
                    meal.assessment.modelVersion) && (
                    <p className="muted">
                      Critérios{" "}
                      {meal.assessment.criteriaVersion || "não informado"} ·
                      modelo {meal.assessment.modelVersion || "não informado"}
                    </p>
                  )}
                </>
              ) : (
                <p>
                  A foto permanece privada e disponível para conversar com a
                  equipe.
                </p>
              )}
              <button
                className="button button-secondary"
                disabled={!estadoAnalise?.enabled || analisando !== null}
                onClick={() => {
                  if (analisando) return;
                  definirAnalisando(meal.id);
                  definirAviso("Em processamento…");
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
                    .catch((e) => {
                      definirAviso("");
                      definirErro(e.message);
                    })
                    .finally(() => definirAnalisando(null));
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
