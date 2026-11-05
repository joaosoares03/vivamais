import { Text } from "../components/TextoAcessivel";
import { dataCivilBrasil, hojeBrasil } from "@viva/contracts";
import { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  View,
  Image,
  Linking,
  useWindowDimensions,
} from "react-native";
import { usePreferencias } from "../contexts/ContextoPreferencias";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useResumoPaciente } from "../hooks/useResumoPaciente";
import {
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
  Tela,
} from "../components/ElementosInterface";
import { BarraNavegacao } from "../components/BarraNavegacao";
import { IconeModulo } from "../components/IconeModulo";
import { IconeNavegacao } from "../components/IconeNavegacao";
import { IlustracaoViva, ilustracoes } from "../components/IlustracoesViva";
import { usePainelPaciente } from "../hooks/usePainelPaciente";
import { enderecoPortal } from "../services/enderecosAcesso";
import {
  filaRegistros,
  queueStorageDescription as descricaoFila,
} from "../services/sincronizacao/filaRegistros";
const acoes = [
  {
    chave: "blood-pressure",
    nome: "Minha Pressão",
    rota: "/pressao",
    icone: "pressao",
    cor: "#c83d49",
  },
  {
    chave: "medications",
    nome: "Meus Medicamentos",
    rota: "/medicamentos",
    icone: "medicamentos",
    cor: "#178344",
  },
  {
    chave: "food",
    nome: "Minha Alimentação",
    rota: "/alimentacao",
    icone: "alimentacao",
    cor: "#b45a0e",
  },
  {
    chave: "activity",
    nome: "Atividade Física",
    rota: "/atividade-fisica",
    icone: "atividade",
    cor: "#0878c1",
  },
] as const;
export default function Inicio() {
  const { width: largura, fontScale: escalaFonte } = useWindowDimensions();
  const { textoAmpliado } = usePreferencias();
  const umaColuna =
    (Math.min(largura, 470) - 52) / 2 <
    145 * (textoAmpliado ? 1.2 : 1) * escalaFonte + 20;
  const {
    sessao: sessao,
    restaurando: restaurando,
    sair: sair,
  } = useAutenticacao();
  const resumo = useResumoPaciente();
  const painel = usePainelPaciente();
  const [pendentes, definirPendentes] = useState(0),
    [erro, definirErro] = useState(""),
    [saindo, definirSaindo] = useState(false);
  useEffect(() => {
    if (sessao)
      filaRegistros
        .read(sessao.usuario.id)
        .then((itens) => definirPendentes(itens.length))
        .catch(() => undefined);
  }, [sessao]);
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  return (
    <Tela
      compacta
      rodape={
        sessao.usuario.papel === "PATIENT" ? <BarraNavegacao /> : undefined
      }
    >
      <View style={e.cabecalho}>
        <MarcaViva variante="verde" largura={88} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Meu Perfil"
          onPress={() => router.push("/perfil")}
          style={e.perfil}
        >
          <IconeNavegacao nome="perfil" cor="#004782" />
        </Pressable>
      </View>
      <View style={e.saudacao}>
        <Text style={e.titulo} accessibilityRole="header">
          Olá, {sessao.usuario.nomeExibicao.split(" ")[0]}!
        </Text>
        <Text style={e.texto}>
          Que bom ter você por aqui!{"\n"}Vamos cuidar da sua saúde hoje?
        </Text>
      </View>
      {sessao.usuario.papel !== "PATIENT" ? (
        <View style={{ gap: 16 }}>
          <Image
            source={ilustracoes.profissionais}
            style={{ width: "100%", height: 180, resizeMode: "contain" }}
            accessibilityLabel="Ilustração da equipe profissional"
          />
          <Text style={e.texto}>
            Sua conta é da equipe profissional. No portal você pode cadastrar
            pacientes, gerar ativações e consultar os registros.
          </Text>
          {enderecoPortal() && (
            <Botao
              rotulo="Abrir portal profissional"
              onPress={() => {
                void Linking.openURL(enderecoPortal()!).catch(() =>
                  definirErro("Não foi possível abrir o portal."),
                );
              }}
            />
          )}
          <Botao
            secundario
            rotulo="Configurações"
            onPress={() => router.push("/configuracoes")}
          />
        </View>
      ) : (
        <>
          {resumo.isPending && <Carregando rotulo="Carregando seus dados…" />}
          {resumo.isError && (
            <MensagemErro mensagem="Não foi possível atualizar. Verifique sua conexão e tente novamente." />
          )}
          <View style={e.grade}>
            {acoes.map((acao) => (
              <Pressable
                key={acao.chave}
                accessibilityRole="button"
                accessibilityLabel={`${acao.nome}. Abrir módulo.`}
                testID={`module-${acao.chave}`}
                onPress={() => router.push(acao.rota)}
                style={({ pressed }) => [
                  e.cartao,
                  umaColuna && {
                    flexBasis: "100%",
                    flexDirection: "row",
                    minHeight: 112,
                    padding: 12,
                    gap: 16,
                  },
                  { backgroundColor: acao.cor },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <IconeModulo nome={acao.icone} />
                <Text
                  style={[
                    e.nomeCartao,
                    umaColuna && {
                      flex: 1,
                      minWidth: 0,
                      maxWidth: "100%",
                      textAlign: "left",
                    },
                  ]}
                >
                  {acao.nome}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            testID="history-button"
            accessibilityRole="button"
            accessibilityLabel="Meu Histórico"
            onPress={() => router.push("/historico")}
            style={e.historico}
          >
            <IlustracaoViva nome="grafico" tamanho={32} />
            <Text style={[e.rotuloHistorico, { flex: 1, minWidth: 0 }]}>
              Meu Histórico
            </Text>
            <Text style={e.seta}>›</Text>
          </Pressable>
          <View
            style={{ flexDirection: umaColuna ? "column" : "row", gap: 10 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Meus Lembretes"
              onPress={() => router.push("/lembretes")}
              style={[e.atalho, { backgroundColor: "#fff8e3" }]}
            >
              <IlustracaoViva nome="lembrete" tamanho={28} />
              <Text style={e.rotuloAtalho}>Lembretes</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Configurações"
              onPress={() => router.push("/configuracoes")}
              style={e.atalho}
            >
              <Text style={e.rotuloAtalho}>⚙ Configurações</Text>
            </Pressable>
          </View>
          <View style={e.resumo} accessibilityLabel="Meu acompanhamento">
            <Text style={e.rotuloHistorico}>Meu acompanhamento</Text>
            {painel.isPending && (
              <Text style={e.nota}>Consultando seus registros…</Text>
            )}
            {painel.isError && (
              <MensagemErro mensagem="Não foi possível consultar seu resumo. Tente novamente nos módulos." />
            )}
            {painel.data && (
              <>
                <Text style={e.texto}>
                  {painel.data.pressao
                    ? `Última pressão: ${painel.data.pressao.systolic} / ${painel.data.pressao.diastolic} mmHg`
                    : "Você ainda não registrou sua pressão."}
                </Text>
                {painel.data.pressao && (
                  <Text style={e.nota}>
                    {new Date(painel.data.pressao.measuredAt).toLocaleString(
                      "pt-BR",
                      { timeZone: "America/Sao_Paulo" },
                    )}
                  </Text>
                )}
                <Text style={e.nota}>
                  Medicamentos hoje: {painel.data.respostas} de{" "}
                  {painel.data.horarios} horários com resposta.
                </Text>
                {painel.data.proximoHorario && (
                  <Text style={e.texto}>
                    Próximo horário do plano:{" "}
                    {painel.data.proximoHorario.dataProgramada !== hojeBrasil()
                      ? `${dataCivilBrasil(painel.data.proximoHorario.dataProgramada)} · `
                      : ""}
                    {new Date(
                      painel.data.proximoHorario.scheduledAt,
                    ).toLocaleTimeString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {painel.data.proximoHorario.name}
                  </Text>
                )}
                <Text style={e.nota}>
                  {painel.data.refeicoes} refeições e {painel.data.atividades}{" "}
                  atividades registradas no histórico.
                </Text>
              </>
            )}
          </View>
          <Botao
            secundario
            rotulo="Minhas consultas e orientações"
            onPress={() => router.push("/consultas")}
          />
          {pendentes > 0 && (
            <Text style={e.nota}>
              {pendentes} registros pendentes. {descricaoFila}
            </Text>
          )}
          {resumo.data && (
            <Text style={e.nota}>
              ✓ Conectado à sua equipe ·{" "}
              {resumo.data.modality === "APP"
                ? "Aplicativo Viva+"
                : "Pulseira + diário"}
            </Text>
          )}
        </>
      )}
      {erro && <MensagemErro mensagem={erro} />}
      <Text style={e.nota}>
        Seus registros ajudam sua equipe a acompanhar você.
      </Text>
      <Botao
        secundario
        rotulo="Sair da minha conta"
        testID="logout-button"
        ocupado={saindo}
        onPress={() => {
          definirSaindo(true);
          sair()
            .catch(() =>
              definirErro(
                "Não foi possível encerrar a sessão. Verifique a conexão.",
              ),
            )
            .finally(() => definirSaindo(false));
        }}
      />
    </Tela>
  );
}
const e = StyleSheet.create({
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  perfil: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#edf6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  pessoa: { color: "#004782", fontSize: 28 },
  saudacao: { gap: 8, marginBottom: 8 },
  titulo: { fontSize: 26, fontWeight: "800", color: "#061a38" },
  texto: { fontSize: 18, lineHeight: 25, color: "#00396c" },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cartao: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 140,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  nomeCartao: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    maxWidth: 155,
  },
  historico: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dce8f5",
    backgroundColor: "#fff",
  },
  grafico: { fontSize: 31, color: "#0075cc" },
  rotuloHistorico: { fontSize: 19, fontWeight: "700", color: "#003b74" },
  seta: { marginLeft: "auto", fontSize: 30, color: "#004b86" },
  nota: { fontSize: 16, lineHeight: 23, color: "#415c73" },
  atalho: {
    flex: 1,
    minHeight: 64,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dce8f5",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rotuloAtalho: {
    maxWidth: "100%",
    color: "#003b74",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  resumo: {
    padding: 16,
    gap: 8,
    borderRadius: 14,
    backgroundColor: "#edf7ff",
    borderWidth: 1,
    borderColor: "#dce8f5",
  },
});
