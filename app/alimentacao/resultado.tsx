import { Text } from "../../components/TextoAcessivel";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useResultadoRefeicao } from "../../hooks/useResultadoRefeicao";
import { ImagemPrivada } from "../../components/ImagemPrivada";
import { apresentacaoAnaliseAlimentar } from "../../services/alimentacao/apresentacao";
import {
  Tela,
  Botao,
  Carregando,
  MensagemErro,
} from "../../components/ElementosInterface";
import { estilos as e } from "../../components/estilos";
export default function ResultadoAlimentacao() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    resultado = useResultadoRefeicao(id || ""),
    { requisicao } = useAutenticacao();
  const [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState(""),
    [mensagem, definirMensagem] = useState("");
  async function consultarAnalise() {
    if (!id) return;
    definirOcupado(true);
    definirErro("");
    try {
      const resposta = await requisicao<{ message?: string }>(
        `/meals/${id}/analyze`,
        { method: "POST", body: {} },
      );
      definirMensagem(
        resposta.message ||
          "Avaliação educativa recebida. Confira as limitações.",
      );
      await resultado.refetch();
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Análise educativa indisponível.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  const refeicao = resultado.data,
    avaliacao = refeicao?.avaliacao,
    apresentacao = apresentacaoAnaliseAlimentar(avaliacao);
  return (
    <Tela>
      <Text style={[e.title, { fontSize: 23 }]} accessibilityRole="header">
        Minha Alimentação
      </Text>
      {!id ? (
        <MensagemErro mensagem="Escolha uma refeição no histórico para consultar o resultado." />
      ) : resultado.isPending ? (
        <Carregando />
      ) : resultado.isError ? (
        <MensagemErro mensagem="Não foi possível consultar a refeição autorizada." />
      ) : (
        refeicao && (
          <>
            <View
              style={[
                e.card,
                {
                  backgroundColor: apresentacao.corDeFundo,
                },
              ]}
            >
              <Text style={[e.label, { textAlign: "center" }]}>
                {apresentacao.icone} {apresentacao.titulo}
              </Text>
              <ImagemPrivada idArquivo={refeicao.idArquivo} />
              <Text style={e.small}>
                {new Date(refeicao.dataOcorrencia).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </Text>
              <Text style={e.small}>{apresentacao.descricaoHas}</Text>
              {avaliacao ? (
                <>
                  <Text style={e.label}>Alimentos identificados</Text>
                  {avaliacao.alimentos.map((alimento, indice) => (
                    <Text key={`${alimento}-${indice}`} style={e.body}>
                      • {alimento}
                    </Text>
                  ))}
                  <Text style={e.body}>{avaliacao.explicacao}</Text>
                  <Text style={e.small}>{avaliacao.limitacoes}</Text>
                  {(avaliacao.criteriaVersion || avaliacao.modelVersion) && (
                    <Text style={e.small}>
                      Critérios {avaliacao.criteriaVersion || "não informado"} ·
                      modelo {avaliacao.modelVersion || "não informado"}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={e.body}>
                  A foto foi registrada e permanece privada. A avaliação depende
                  de serviço e critérios aprovados pela equipe. Nenhuma
                  classificação alimentar foi gerada.
                </Text>
              )}
              {Boolean(refeicao.observacoes) && (
                <Text style={e.body}>{refeicao.observacoes}</Text>
              )}
            </View>
            <Botao
              secundario
              rotulo="Consultar análise educativa"
              ocupado={ocupado}
              onPress={() => {
                void consultarAnalise();
              }}
            />
          </>
        )
      )}
      {mensagem && (
        <Text style={e.body} accessibilityLiveRegion="polite">
          {mensagem}
        </Text>
      )}
      {erro && <MensagemErro mensagem={erro} />}
      <Botao
        rotulo="Ver minhas refeições"
        onPress={() => router.dismissTo("/alimentacao")}
      />
      <Text style={e.small}>
        A foto não mede nutrientes. Converse com a equipe sobre seu registro.
      </Text>
    </Tela>
  );
}
