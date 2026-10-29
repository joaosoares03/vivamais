import { Text } from "./TextoAcessivel";
import { Redirect, router } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useRoteiroAtividade } from "../hooks/useRoteiroAtividade";
import { useDadosAtividade } from "../hooks/useDadosAtividade";
import {
  atividadesDoGrupo,
  buscarAtividadeAprovada,
  obterMidiasAtividade,
  type AtividadeAprovada,
  type BloqueioSugestaoAtividade,
} from "../services/atividades/atividades";
import { Tela, Botao, Carregando, MensagemErro } from "./ElementosInterface";
import { BarraNavegacao } from "./BarraNavegacao";
import { estilos as e } from "./estilos";
import { IlustracaoViva } from "./IlustracoesViva";
import { VideoGuiadoAtividade } from "./VideoGuiadoAtividade";

type Etapa =
  | "sentimento"
  | "pressao"
  | "informacoes"
  | "atividade"
  | "passos"
  | "video"
  | "alternativa";

const mensagensBloqueio: Record<BloqueioSugestaoAtividade, string> = {
  DADOS_AUSENTES:
    "Não há dados suficientes no perfil funcional para exibir uma sugestão individual.",
  SINAL_DE_ALERTA_OU_CONTRAINDICACAO:
    "Há um sinal informado, uma restrição registrada ou a pressão ainda não foi confirmada. Não exibimos sugestão de atividade.",
  PROTOCOLO_CLINICO_PENDENTE:
    "O protocolo clínico e a classificação individual ainda não foram aprovados. Não há exercício selecionado automaticamente para você.",
  GRUPO_PROFISSIONAL_NAO_LIBERADO:
    "A equipe ainda não liberou um grupo de materiais para você. Não exibimos roteiro de atividade até a avaliação presencial.",
};

function CartaoCatalogo({ atividade }: { atividade: AtividadeAprovada }) {
  const midias = obterMidiasAtividade(atividade.id);
  return (
    <View style={e.card}>
      <Image
        source={midias.capa}
        style={{ width: "100%", height: 180, resizeMode: "contain", borderRadius: 12 }}
        accessibilityLabel={`Capa do material ${atividade.nome}`}
      />
      <Text style={e.label}>{atividade.nome}</Text>
      <Text style={e.small}>
        Catálogo {atividade.versaoCatalogo} · mídias aprovadas pela gestão
      </Text>
      <Botao
        secundario
        rotulo="Ver materiais aprovados"
        onPress={() =>
          router.push({
            pathname: "/atividade-fisica/passo-a-passo",
            params: { atividade: atividade.id },
          })
        }
      />
    </View>
  );
}

export function RoteiroAtividade({
  etapa,
  atividadeId,
}: {
  etapa: Etapa;
  atividadeId?: string;
}) {
  const { sessao, restaurando } = useAutenticacao(),
    roteiro = useRoteiroAtividade(),
    dados = useDadosAtividade(),
    atividade = buscarAtividadeAprovada(atividadeId),
    grupoCatalogoAtivo = roteiro.grupoCatalogoAtivo(
      dados.data?.perfil?.grupoCatalogoAprovado,
    ),
    atividadesRoteiroAtivo = roteiro.atividadesDoGrupoProfissional(
      dados.data?.perfil?.grupoCatalogoAprovado,
    ),
    tituloGrupoCatalogoAtivo =
      roteiro.gruposCatalogo.find((grupo) => grupo.id === grupoCatalogoAtivo)
        ?.titulo ?? "Não liberado",
    midias =
      (etapa === "passos" || etapa === "video") && atividade
        ? obterMidiasAtividade(atividade.id)
        : null,
    bloqueioSugestao = roteiro.avaliarBloqueioSugestao({
      dados: dados.data,
      estadoInformado: roteiro.estadoInformado,
      pressaoVerificada: roteiro.pressaoVerificada,
    });
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  const titulos = {
    sentimento: "Como você está se sentindo hoje?",
    pressao: "Você já verificou sua pressão hoje?",
    informacoes: "Apenas para confirmar:",
    atividade: "Materiais de atividade",
    passos: "Materiais visuais da atividade",
    video: "Vídeo guiado da atividade",
    alternativa: "Precisa de algo mais leve hoje?",
  };
  const selecao = (
    selecionado: boolean,
    rotulo: string,
    aoSelecionar: () => void,
    icone: string,
  ) => (
    <Pressable
      key={rotulo}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionado }}
      accessibilityLabel={rotulo}
      onPress={aoSelecionar}
      style={{
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selecionado ? "#0079d8" : "#d7e6f5",
        backgroundColor: selecionado ? "#e5f3ff" : "#fff",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        minHeight: 70,
      }}
    >
      {etapa === "sentimento" ? (
        <IlustracaoViva
          nome={
            rotulo === "Estou bem"
              ? "bem"
              : rotulo === "Estou um pouco cansado"
                ? "cansado"
                : "mal"
          }
          tamanho={40}
        />
      ) : (
        <Text style={{ fontSize: 30, color: "#008d53" }}>{icone}</Text>
      )}
      <Text style={[e.body, { flex: 1 }]}>{rotulo}</Text>
    </Pressable>
  );
  return (
    <Tela rodape={<BarraNavegacao />}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar à atividade física"
        onPress={() => router.dismissTo("/atividade-fisica")}
      >
        <Text style={e.title}>‹　Atividade Física</Text>
      </Pressable>
      {["sentimento", "pressao", "informacoes"].includes(etapa) && (
        <Text
          style={{
            color: "#006dca",
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: "#e8f5ff",
            borderWidth: 1,
            borderColor: "#b5dcfb",
          }}
        >
          {etapa === "sentimento" ? "1" : etapa === "pressao" ? "2" : "3"} de 3
        </Text>
      )}
      <Text style={[e.title, { fontSize: 23 }]} accessibilityRole="header">
        {titulos[etapa]}
      </Text>
      {etapa === "sentimento" && (
        <>
          {selecao(
            roteiro.estadoInformado === "WELL",
            "Estou bem",
            () => roteiro.definirEstadoInformado("WELL"),
            "☺",
          )}
          {selecao(
            roteiro.estadoInformado === "TIRED",
            "Estou um pouco cansado",
            () => roteiro.definirEstadoInformado("TIRED"),
            "◉",
          )}
          {selecao(
            roteiro.estadoInformado === "UNWELL",
            "Estou com tontura ou me sentindo mal",
            () => roteiro.definirEstadoInformado("UNWELL"),
            "☹",
          )}
          <View style={[e.notice, { backgroundColor: "#ffeded" }]}>
            <Text style={e.body}>
              Esta resposta não autoriza exercício. Procure a orientação da sua
              equipe para avaliar sua situação.
            </Text>
          </View>
          <Botao
            rotulo="Continuar"
            desabilitado={!roteiro.estadoInformado}
            onPress={() => {
              if (roteiro.estadoInformado)
                router.push("/atividade-fisica/verificacao-pressao");
            }}
          />
        </>
      )}
      {etapa === "pressao" && (
        <>
          {selecao(
            roteiro.pressaoVerificada === true,
            "Sim, já verifiquei",
            () => roteiro.definirPressaoVerificada(true),
            "✓",
          )}
          {selecao(
            roteiro.pressaoVerificada === false,
            "Ainda não verifiquei",
            () => roteiro.definirPressaoVerificada(false),
            "○",
          )}
          <View style={e.card}>
            <Text style={e.label}>Sua última medição</Text>
            {dados.isPending ? (
              <Carregando />
            ) : dados.data?.ultimaMedicao ? (
              <>
                <Text style={e.title}>
                  {dados.data.ultimaMedicao.sistolica} /{" "}
                  {dados.data.ultimaMedicao.diastolica} mmHg
                </Text>
                <Text style={e.small}>
                  {new Date(
                    dados.data.ultimaMedicao.dataMedicao || "",
                  ).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </Text>
              </>
            ) : (
              <Text style={e.body}>
                Nenhuma medição disponível nesta consulta.
              </Text>
            )}
            <Botao
              secundario
              rotulo="Registrar pressão"
              onPress={() => router.push("/pressao")}
            />
          </View>
          <Botao
            rotulo="Continuar"
            desabilitado={roteiro.pressaoVerificada === null}
            onPress={() => {
              if (roteiro.pressaoVerificada !== null)
                router.push("/atividade-fisica/suas-informacoes");
            }}
          />
          <View style={e.notice}>
            <Text style={e.body}>
              O aplicativo não usa estes valores para liberar atividade. A
              recomendação individual depende da sua equipe.
            </Text>
          </View>
        </>
      )}
      {etapa === "informacoes" && (
        <>
          {dados.isError && (
            <MensagemErro mensagem="Não foi possível consultar o perfil funcional." />
          )}
          {[
            [
              "Idade",
              dados.data?.idade == null ? null : `${dados.data.idade} anos`,
            ],
            ["Mobilidade", dados.data?.perfil?.mobilidade],
            ["Equilíbrio", dados.data?.perfil?.equilibrio],
            ["Restrições", dados.data?.perfil?.restricoes],
            ["Grupo de materiais aprovado", tituloGrupoCatalogoAtivo],
            ["Orientações da equipe", dados.data?.perfil?.orientacoes],
          ].map(([rotulo, valor]) => (
            <View style={e.notice} key={rotulo}>
              <Text style={e.label}>{rotulo}</Text>
              <Text style={e.body}>
                {valor || "Não registrado pela equipe."}
              </Text>
            </View>
          ))}
          <Botao
            rotulo="Ver materiais da atividade"
            onPress={() => router.push("/atividade-fisica/atividade-hoje")}
          />
          <Botao
            secundario
            rotulo="Consultar meu perfil"
            onPress={() => router.push("/perfil")}
          />
        </>
      )}
      {etapa === "atividade" && (
        <>
          {dados.isPending ? (
            <View style={[e.card, { backgroundColor: "#e8f7ef" }]}>
              <Text style={e.label}>Roteiro em verificação</Text>
              <Text style={e.body}>
                Estamos conferindo os dados do perfil. Enquanto isso, não
                exibimos roteiro de atividade.
              </Text>
            </View>
          ) : bloqueioSugestao ? (
            <View style={[e.card, { backgroundColor: "#e8f7ef" }]}>
              <Text style={e.label}>Roteiro de atividade bloqueado</Text>
              <Text style={e.body}>{mensagensBloqueio[bloqueioSugestao]}</Text>
              {dados.data?.perfil?.orientacoes && (
                <Text style={e.body}>
                  Orientação registrada pela equipe:{" "}
                  {dados.data.perfil.orientacoes}
                </Text>
              )}
            </View>
          ) : (
            <View style={[e.card, { backgroundColor: "#e8f7ef" }]}>
              <Text style={e.label}>
                Roteiro educativo aprovado pela equipe
              </Text>
              <Text style={e.body}>
                Grupo vinculado ao seu perfil: {tituloGrupoCatalogoAtivo}.
                Estes cinco materiais são educativos e não substituem a
                orientação individual da equipe.
              </Text>
              {atividadesRoteiroAtivo.map((item) => (
                <CartaoCatalogo atividade={item} key={item.id} />
              ))}
            </View>
          )}
          <Botao
            rotulo="Consultar catálogo de materiais aprovados"
            onPress={() => router.push("/atividade-fisica/ilustracoes")}
          />
          <Botao
            secundario
            rotulo="Registrar atividade já realizada"
            onPress={() => router.push("/atividade-fisica/registro")}
          />
          <Botao
            secundario
            rotulo="Hoje preciso de algo mais leve"
            onPress={() => router.push("/atividade-fisica/alternativa")}
          />
        </>
      )}
      {etapa === "passos" && !atividade && (
        <>
          <View style={e.notice}>
            <Text style={e.body}>
              {grupoCatalogoAtivo && !bloqueioSugestao
                ? "A equipe liberou este grupo de materiais educativos para o seu perfil. A visualização não registra uma atividade."
                : "Escolha um material aprovado para visualizá-lo. Esta escolha não é uma recomendação individual nem registra uma atividade."}
            </Text>
          </View>
          {roteiro.gruposCatalogo
            .filter(
              (grupo) =>
                !grupoCatalogoAtivo ||
                bloqueioSugestao !== null ||
                grupo.id === grupoCatalogoAtivo,
            )
            .map((grupo) => (
            <View key={grupo.id} style={e.card}>
              <Text style={e.label}>{grupo.titulo}</Text>
              <Text style={e.body}>{grupo.descricao}</Text>
              {atividadesDoGrupo(grupo.id).map((item) => (
                <CartaoCatalogo atividade={item} key={item.id} />
              ))}
            </View>
            ))}
        </>
      )}
      {etapa === "passos" && atividade && midias && (
        <>
          <View style={e.notice}>
            <Text style={e.body}>
              Material do catálogo {atividade.versaoCatalogo}, aprovado pela
              gestão. Ele não define se esta atividade é adequada para você.
            </Text>
          </View>
          <View style={e.card}>
            <Text style={e.label}>{atividade.nome}</Text>
            <Image
              source={midias.passoUm}
              style={{ width: "100%", height: 220, resizeMode: "contain" }}
              accessibilityLabel={`Primeiro quadro visual de ${atividade.nome}`}
            />
            <Image
              source={midias.passoDois}
              style={{ width: "100%", height: 220, resizeMode: "contain" }}
              accessibilityLabel={`Segundo quadro visual de ${atividade.nome}`}
            />
            <Image
              source={midias.demonstracao}
              style={{ width: "100%", height: 220, resizeMode: "contain" }}
              accessibilityLabel={`Demonstração animada de ${atividade.nome}`}
            />
          </View>
          <Botao
            rotulo="Assistir ao vídeo guiado"
            onPress={() =>
              router.push({
                pathname: "/atividade-fisica/video",
                params: { atividade: atividade.id },
              })
            }
          />
          <Botao
            secundario
            rotulo="Registrar somente se já realizei esta atividade"
            onPress={() =>
              router.push({
                pathname: "/atividade-fisica/registro",
                params: { atividade: atividade.nome },
              })
            }
          />
        </>
      )}
      {etapa === "video" && !atividade && (
        <>
          <View style={e.notice}>
            <Text style={e.body}>
              Escolha primeiro um material aprovado para acessar o respectivo
              vídeo. Nenhum vídeo é selecionado para você automaticamente.
            </Text>
          </View>
          <Botao
            rotulo="Ver catálogo de materiais aprovados"
            onPress={() => router.push("/atividade-fisica/ilustracoes")}
          />
        </>
      )}
      {etapa === "video" && atividade && midias && (
        <>
          <Image
            source={midias.capa}
            style={{ width: "100%", height: 180, resizeMode: "contain", borderRadius: 12 }}
            accessibilityLabel={`Capa do vídeo de ${atividade.nome}`}
          />
          <Text style={e.body}>
            Este vídeo é material aprovado do catálogo e não substitui a
            orientação individual da equipe.
          </Text>
          <VideoGuiadoAtividade atividade={atividade} midias={midias} />
          <Botao
            secundario
            rotulo="Voltar aos materiais visuais"
            onPress={() =>
              router.replace({
                pathname: "/atividade-fisica/passo-a-passo",
                params: { atividade: atividade.id },
              })
            }
          />
        </>
      )}
      {etapa === "alternativa" && (
        <>
          <View style={[e.card, { backgroundColor: "#f2e9ff" }]}>
            <Text style={e.label}>Não há alternativa automática</Text>
            <Text style={e.body}>
              Se você se sente mal, está cansado ou tem alguma restrição, não
              selecionamos outro exercício. Procure a orientação da equipe.
            </Text>
          </View>
          <Botao
            rotulo="Registrar atividade já realizada"
            onPress={() => router.push("/atividade-fisica/registro")}
          />
        </>
      )}
      {["atividade", "passos", "video", "alternativa"].includes(etapa) && (
        <Botao
          secundario
          rotulo="Ver meu histórico de atividades"
          onPress={() => router.push("/atividade-fisica/historico")}
        />
      )}
    </Tela>
  );
}
