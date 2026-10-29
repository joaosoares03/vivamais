import { Text } from "./TextoAcessivel";
import { useEffect, useState } from "react";
import { Image, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ImagemPrivada } from "./ImagemPrivada";
import * as ImagePicker from "expo-image-picker";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { enderecoApi } from "../services/api";
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
  const [imagemSelecionada, definirImagemSelecionada] =
      useState<ImagePicker.ImagePickerAsset | null>(null),
    [ocupado, definirOcupado] = useState(false),
    [mensagem, definirMensagem] = useState(""),
    [erro, definirErro] = useState(""),
    [observacoes, definirObservacoes] = useState(""),
    [refeicoes, definirRefeicoes] = useState<Refeicao[]>([]),
    [pagina, definirPagina] = useState(0),
    [total, definirTotal] = useState(0);
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
    definirErro("");
    try {
      if (camera) {
        const pacienteConsultado =
          await ImagePicker.requestCameraPermissionsAsync();
        if (!pacienteConsultado.granted) {
          definirErro(
            "A câmera não foi autorizada. Você pode selecionar uma foto ou digitar os valores.",
          );
          return;
        }
      }
      const resultado = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          });
      if (!resultado.canceled) {
        const selecionado = resultado.assets[0];
        if (selecionado && (selecionado.fileSize ?? 0) <= 2097152)
          definirImagemSelecionada(selecionado);
        else definirErro("Use uma imagem com até 2 MB.");
      }
    } catch {
      definirErro("Não foi possível abrir a câmera ou galeria neste ambiente.");
    }
  }
  async function enviar() {
    if (!imagemSelecionada || !sessao || !idPaciente) return;
    definirOcupado(true);
    definirErro("");
    definirMensagem("");
    try {
      const formulario = new FormData();
      formulario.append("purpose", purpose);
      if (imagemSelecionada.file)
        formulario.append("file", imagemSelecionada.file);
      else
        formulario.append("file", {
          uri: imagemSelecionada.uri,
          name: imagemSelecionada.fileName || "foto.jpg",
          type: imagemSelecionada.mimeType || "image/jpeg",
        } as unknown as Blob);
      const resposta = await fetch(
        `${enderecoApi}/api/v1/patients/${idPaciente}/files`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${sessao.tokenAcesso}` },
          body: formulario,
          signal: AbortSignal.timeout(20000),
          redirect: "error",
        },
      );
      if (!resposta.ok)
        throw new Error(
          resposta.status === 413
            ? "Use foto com até 2 MB."
            : resposta.status === 415
              ? "Use uma foto PNG ou JPEG válida."
              : "Não foi possível enviar a foto privada.",
        );
      const file = await resposta.json();
      if (purpose === "PRESSURE_DISPLAY") {
        const resultado = await requisicao<ResultadoOcr>(
          `/files/${file.id}/ocr`,
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
            fileId: file.id,
            occurredAt: new Date().toISOString(),
            notes: observacoes,
          },
        });
        definirMensagem(
          "Foto privada e refeição salvas. Análise automatizada indisponível até configuração e revisão clínica.",
        );
        definirObservacoes("");
        await carregar();
      }
      definirImagemSelecionada(null);
    } catch (e) {
      definirErro(
        e instanceof Error
          ? e.message
          : "Falha no envio. Mantenha conexão e tente novamente.",
      );
    } finally {
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
          {purpose === "MEAL" ? "Foto da refeição" : "Ler foto do visor"}
        </Text>
        <Image
          source={
            imagemSelecionada
              ? { uri: imagemSelecionada.uri }
              : purpose === "MEAL"
                ? require("../assets/images/refeicao-exemplo.png")
                : require("../assets/images/visor-exemplo.png")
          }
          style={{
            width: "100%",
            height: 300,
            resizeMode: "contain",
            borderRadius: 16,
          }}
          accessibilityLabel={
            imagemSelecionada
              ? "Foto selecionada para envio"
              : "Exemplo ilustrativo; nenhuma foto enviada"
          }
        />
        {!imagemSelecionada && (
          <Text style={[s.small, { textAlign: "center" }]}>
            Imagem de exemplo · escolha sua foto abaixo
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
          rotulo="Escolher foto da galeria"
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
              purpose === "MEAL"
                ? "Enviar refeição e foto"
                : "Enviar foto para OCR"
            }
            ocupado={ocupado}
            desabilitado={!imagemSelecionada}
            onPress={() => {
              void enviar();
            }}
          />
        )}
        <Text style={s.small}>
          PNG ou JPEG, até 2 MB. Fotos exigem conexão e ficam privadas.{" "}
          {purpose === "PRESSURE_DISPLAY"
            ? "O celular não mede pressão. Confira os valores reconhecidos antes de salvar."
            : "A foto não mede nutrientes. A avaliação depende de serviço e critérios aprovados."}
        </Text>
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
          <Text style={s.body}>
            A foto não permite medir sódio, gordura ou nutrientes. Leve os
            registros à sua equipe para conversar sobre alimentação.
          </Text>
          {refeicoes.map((meal) => {
            const apresentacao = apresentacaoAnaliseAlimentar(meal.assessment);
            return (
            <View style={[s.card, { backgroundColor: apresentacao.corDeFundo }]} key={meal.id}>
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
                  {(meal.assessment.criteriaVersion || meal.assessment.modelVersion) && (
                    <Text style={s.small}>
                      Critérios {meal.assessment.criteriaVersion || "não informado"} · modelo {meal.assessment.modelVersion || "não informado"}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={s.body}>A foto permanece disponível para conversar com a equipe.</Text>
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
                onPress={() => {
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
                    );
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
