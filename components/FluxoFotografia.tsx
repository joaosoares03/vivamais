import { Text } from "./TextoAcessivel";
import { useEffect, useRef, useState } from "react";
import { Image, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ImagemPrivada } from "./ImagemPrivada";
import { selecionarFotografia } from "../services/fotografia/prepararFotografia";
import {
  mensagemFalhaFotografia,
  type FotografiaPreparada,
} from "../services/fotografia/tipos";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useEstadoAnaliseAlimentar } from "../hooks/useEstadoAnaliseAlimentar";
import {
  apresentacaoAnaliseAlimentar,
  type AnaliseEducativa,
} from "../services/alimentacao/apresentacao";
import { Botao, MensagemErro } from "./ElementosInterface";
import { estilos as s } from "./estilos";
export type ResultadoOcr = {
  id: string;
  status: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  confidence?: number | null;
  modelVersion?: string;
  criteriaVersion?: string;
  reviewRequired?: boolean;
  reviewReason?: string;
  message: string;
};
type Refeicao = {
  id: string;
  fileId: string;
  occurredAt: string;
  notes: string;
  assessment?: AnaliseEducativa | null;
};
export function FluxoFotografia({
  idPaciente: idPaciente,
  finalidade: purpose,
  aoReconhecer: aoReconhecer,
}: {
  idPaciente: string;
  finalidade: "MEAL" | "PRESSURE_DISPLAY";
  aoReconhecer?: (valor: ResultadoOcr) => void;
}) {
  const { sessao: sessao, requisicao: requisicao } = useAutenticacao();
  const estadoAnalise = useEstadoAnaliseAlimentar();
  const [analisando, definirAnalisando] = useState<string | null>(null);
  const [mostrarDetalhes, definirMostrarDetalhes] = useState(false);
  const [imagemSelecionada, definirImagemSelecionada] =
      useState<FotografiaPreparada | null>(null),
    [ocupado, definirOcupado] = useState(false),
    [mensagem, definirMensagem] = useState(""),
    [erro, definirErro] = useState(""),
    [observacoes, definirObservacoes] = useState(""),
    [refeicoes, definirRefeicoes] = useState<Refeicao[]>([]),
    [pagina, definirPagina] = useState(0),
    [total, definirTotal] = useState(0);
  const fotografiaAtual = useRef<FotografiaPreparada | null>(null);
  const arquivoEnviado = useRef<string | null>(null);
  const emCurso = useRef(false);
  function substituirImagem(imagem: FotografiaPreparada | null) {
    fotografiaAtual.current?.liberar();
    fotografiaAtual.current = imagem;
    arquivoEnviado.current = null;
    definirImagemSelecionada(imagem);
  }
  useEffect(() => () => fotografiaAtual.current?.liberar(), []);
  async function carregar() {
    if (purpose === "MEAL" && idPaciente) {
      try {
        const resultado = await requisicao<{
          items: Refeicao[];
          total: number;
        }>(`/patients/${idPaciente}/meals?page=${pagina}&size=10`);
        definirRefeicoes(resultado.items);
        definirTotal(resultado.total);
      } catch (e) {
        definirErro(
          e instanceof Error ? e.message : "Não foi possível carregar fotos.",
        );
      }
    }
  }
  useEffect(() => {
    void carregar();
  }, [idPaciente, pagina, purpose]);
  async function escolherImagem(camera: boolean) {
    if (emCurso.current) return;
    definirErro("");
    definirMensagem("");
    emCurso.current = true;
    definirOcupado(true);
    try {
      const selecionada = await selecionarFotografia(camera);
      if (selecionada) substituirImagem(selecionada);
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível abrir a câmera ou galeria.",
      );
    } finally {
      emCurso.current = false;
      definirOcupado(false);
    }
  }
  async function enviar() {
    if (!imagemSelecionada || !sessao || !idPaciente || emCurso.current) return;
    emCurso.current = true;
    definirOcupado(true);
    definirErro("");
    definirMensagem("");
    try {
      if (!arquivoEnviado.current) {
        definirMensagem("Enviando foto privada… Aguarde a confirmação.");
        const formulario = new FormData();
        formulario.append("purpose", purpose);
        if (imagemSelecionada.arquivo)
          formulario.append("file", imagemSelecionada.arquivo);
        else
          formulario.append("file", {
            uri: imagemSelecionada.uri,
            name: "foto.jpg",
            type: "image/jpeg",
          } as unknown as Blob);
        const file = await requisicao<{ id: string }>(
          `/patients/${idPaciente}/files`,
          { method: "POST", formulario, limiteTempoMs: 60000 },
        );
        arquivoEnviado.current = file.id;
      }
      const idArquivo = arquivoEnviado.current;
      if (purpose === "PRESSURE_DISPLAY") {
        const resultado = await requisicao<ResultadoOcr>(
          `/files/${idArquivo}/ocr`,
          {
            method: "POST",
            body: {},
          },
        );
        definirMensagem(resultado.message);
        if (resultado.status === "RECOGNIZED" && aoReconhecer)
          aoReconhecer(resultado);
      } else {
        await requisicao(`/patients/${idPaciente}/meals`, {
          method: "POST",
          body: {
            fileId: idArquivo,
            occurredAt: new Date().toISOString(),
            notes: observacoes,
          },
        });
        definirMensagem(
          "Refeição salva com sucesso. Sua foto permanece privada.",
        );
        definirObservacoes("");
        await carregar();
      }
      substituirImagem(null);
    } catch (e) {
      definirMensagem("");
      definirErro(mensagemFalhaFotografia(e));
    } finally {
      emCurso.current = false;
      definirOcupado(false);
    }
  }
  return (
    <View style={s.section}>
      <View style={[s.section, { gap: 16 }]}>
        <Text
          style={[s.body, { textAlign: "center" }]}
          accessibilityRole="header"
        >
          {purpose === "MEAL"
            ? "Registrar minha refeição"
            : "Ler foto do visor"}
        </Text>
        {imagemSelecionada && (
          <Image
            source={{ uri: imagemSelecionada.uri }}
            style={{
              width: "100%",
              height: 300,
              resizeMode: "contain",
              borderRadius: 16,
            }}
            accessibilityLabel="Foto selecionada para envio"
          />
        )}
        {!imagemSelecionada && (
          <Text style={[s.small, { textAlign: "center" }]}>
            Escolha uma foto para começar.
          </Text>
        )}
        <Botao
          rotulo="Tirar foto"
          desabilitado={ocupado}
          onPress={() => {
            void escolherImagem(true);
          }}
        />
        <Botao
          secundario
          rotulo="Escolher da galeria"
          desabilitado={ocupado}
          onPress={() => {
            void escolherImagem(false);
          }}
        />
        {purpose === "MEAL" && (
          <>
            <Text style={s.label}>Observação sobre a refeição</Text>
            <TextInput
              style={s.field}
              accessibilityLabel="Observação sobre a refeição"
              value={observacoes}
              onChangeText={definirObservacoes}
              maxLength={2000}
              multiline
            />
          </>
        )}
        {imagemSelecionada && (
          <Botao
            rotulo={
              purpose === "MEAL" ? "Salvar refeição" : "Enviar foto para OCR"
            }
            ocupado={ocupado}
            desabilitado={!imagemSelecionada}
            onPress={() => {
              void enviar();
            }}
          />
        )}
        {imagemSelecionada && (
          <Botao
            secundario
            rotulo="Remover foto"
            desabilitado={ocupado}
            onPress={() => substituirImagem(null)}
          />
        )}
        {ocupado && (
          <Text accessibilityLiveRegion="polite" style={s.small}>
            Preparando ou salvando sua foto…
          </Text>
        )}
        <Text style={s.small}>
          Preparamos sua foto automaticamente. Ela fica privada e precisa de
          internet.{" "}
          {purpose === "PRESSURE_DISPLAY"
            ? "O celular não mede pressão. Confira os valores reconhecidos antes de salvar."
            : "A foto não mede nutrientes. A avaliação depende de serviço e critérios aprovados."}
        </Text>
        <Botao
          secundario
          rotulo={
            mostrarDetalhes ? "Ocultar detalhes das fotos" : "Ajuda com a foto"
          }
          onPress={() => definirMostrarDetalhes(!mostrarDetalhes)}
        />
        {mostrarDetalhes && (
          <Text style={s.small}>
            Aceitamos fotos originais de até 10 MB e reduzimos o tamanho antes
            do envio. JPEG e PNG; HEIC quando o aparelho ou navegador conseguir
            abrir a imagem. Se uma foto não abrir, tire outra pela câmera. Não é
            necessário comprimir manualmente.
          </Text>
        )}
        {mensagem && (
          <Text accessibilityLiveRegion="polite" style={s.body}>
            {mensagem}
          </Text>
        )}
        {erro && <MensagemErro mensagem={erro} />}
      </View>
      {purpose === "MEAL" && (
        <>
          <Text style={s.title} accessibilityRole="header">
            Minhas refeições
          </Text>
          <Text style={s.small}>
            {estadoAnalise.data?.message ||
              "Consultando disponibilidade da análise educativa…"}
          </Text>
          <Text style={s.body}>
            A foto não permite medir sódio, gordura ou nutrientes. Leve os
            registros à sua equipe para conversar sobre alimentação.
          </Text>
          {refeicoes.map((meal) => {
            const apresentacao = apresentacaoAnaliseAlimentar(meal.assessment);
            return (
              <View
                style={[s.card, { backgroundColor: apresentacao.corDeFundo }]}
                key={meal.id}
              >
                <ImagemPrivada idArquivo={meal.fileId} />
                <Text style={s.body}>
                  {new Date(meal.occurredAt).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}
                </Text>
                <Text style={s.body}>{meal.notes}</Text>
                <Text style={s.label}>
                  {apresentacao.icone} {apresentacao.titulo}
                </Text>
                <Text style={s.small}>{apresentacao.descricaoHas}</Text>
                {meal.assessment ? (
                  <>
                    <Text style={s.body}>{meal.assessment.explanation}</Text>
                    <Text style={s.small}>{meal.assessment.limitations}</Text>
                    {(meal.assessment.criteriaVersion ||
                      meal.assessment.modelVersion) && (
                      <Text style={s.small}>
                        Critérios{" "}
                        {meal.assessment.criteriaVersion || "não informado"} ·
                        modelo {meal.assessment.modelVersion || "não informado"}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={s.body}>
                    A foto permanece disponível para conversar com a equipe.
                  </Text>
                )}
                <Botao
                  secundario
                  rotulo="Ver resultado da refeição"
                  onPress={() =>
                    router.push({
                      pathname: "/alimentacao/resultado",
                      params: { id: meal.id },
                    })
                  }
                />
                <Botao
                  secundario
                  rotulo="Consultar análise educativa"
                  desabilitado={
                    !estadoAnalise.data?.enabled || analisando !== null
                  }
                  ocupado={analisando === meal.id}
                  onPress={() => {
                    if (analisando) return;
                    definirAnalisando(meal.id);
                    definirMensagem(
                      "Em processamento. Aguarde a resposta da análise educativa.",
                    );
                    requisicao<{ message?: string }>(
                      `/meals/${meal.id}/analyze`,
                      {
                        method: "POST",
                        body: {},
                      },
                    )
                      .then((resposta) => {
                        definirMensagem(
                          resposta.message ||
                            "Avaliação educativa recebida. Confira as limitações.",
                        );
                        void carregar();
                      })
                      .catch(() =>
                        definirErro("Análise automatizada indisponível."),
                      )
                      .finally(() => definirAnalisando(null));
                  }}
                />
              </View>
            );
          })}
          {!refeicoes.length && (
            <Text style={s.body}>Nenhuma refeição registrada.</Text>
          )}
          {pagina > 0 && (
            <Botao
              secundario
              rotulo="Fotos anteriores"
              onPress={() =>
                definirPagina((pacienteConsultado) => pacienteConsultado - 1)
              }
            />
          )}{" "}
          {(pagina + 1) * 10 < total && (
            <Botao
              secundario
              rotulo="Próximas fotos"
              onPress={() =>
                definirPagina((pacienteConsultado) => pacienteConsultado + 1)
              }
            />
          )}
          <Botao
            secundario
            rotulo="Atualizar refeições"
            onPress={() => {
              void carregar();
            }}
          />
        </>
      )}
    </View>
  );
}
