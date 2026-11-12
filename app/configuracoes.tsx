import { Redirect, router } from "expo-router";
import { Switch, View, Linking } from "react-native";
import { Text } from "../components/TextoAcessivel";
import { useState } from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { usePreferencias } from "../contexts/ContextoPreferencias";
import { enderecoPortal } from "../services/enderecosAcesso";
import { acessoDemonstracao } from "../services/ambiente";
import { AtualizacaoAplicativo } from "../components/AtualizacaoAplicativo";
import {
  Tela,
  MarcaViva,
  Botao,
  Carregando,
  MensagemErro,
} from "../components/ElementosInterface";
import { estilos as e } from "../components/estilos";
export default function Configuracoes() {
  const {
      sessao,
      restaurando,
      sair,
      esquecerDispositivo,
      sessaoPorConvite,
      origemAcesso,
    } = useAutenticacao(),
    {
      textoAmpliado,
      definirTextoAmpliado,
      carregando,
      salvando,
      erroPreferencias,
      recarregar,
    } = usePreferencias();
  const [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState("");
  const [confirmarDesautorizacao, definirConfirmarDesautorizacao] =
    useState(false);
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  const portal = enderecoPortal();
  return (
    <Tela>
      <MarcaViva />
      <AtualizacaoAplicativo />
      <Text style={e.title} accessibilityRole="header">
        Configurações
      </Text>
      <View style={e.card}>
        <Text style={e.label}>Acessibilidade</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={[e.body, { flex: 1 }]}>
            Ampliar os textos do aplicativo
          </Text>
          <Switch
            accessibilityLabel="Ampliar os textos do aplicativo"
            value={textoAmpliado}
            disabled={carregando || salvando || !!erroPreferencias}
            onValueChange={(valor) => void definirTextoAmpliado(valor)}
          />
        </View>
        <Text style={e.small}>
          Sua preferência fica salva na sua conta para os próximos acessos. Os
          ajustes de texto do dispositivo também são respeitados.
        </Text>
        {(carregando || salvando) && (
          <Carregando
            rotulo={
              salvando ? "Salvando preferência…" : "Carregando preferência…"
            }
          />
        )}
        {!!erroPreferencias && (
          <>
            <MensagemErro mensagem={erroPreferencias} />
            <Botao
              secundario
              rotulo="Atualizar preferências"
              onPress={recarregar}
            />
          </>
        )}
      </View>
      <View style={e.card}>
        <Text style={e.label}>Minha conta</Text>
        <Text style={e.body}>{sessao.usuario.nomeExibicao}</Text>
        {sessao.usuario.papel !== "PATIENT" && (
          <Text style={e.body}>{sessao.usuario.email}</Text>
        )}
        <Text style={e.small}>
          {sessaoPorConvite
            ? "Ambiente do grupo com dados fictícios. O convite autoriza este aparelho por tempo limitado. Ao sair, solicite um novo convite."
            : acessoDemonstracao
              ? "Demonstração local com dados fictícios. Ao encerrar ou expirar a sessão, entre novamente com CPF e nascimento, sem código SMS."
              : origemAcesso === "PACIENTE"
                ? "Seu acesso está protegido neste aparelho e é renovado enquanto ele estiver autorizado. Ao sair, informe CPF e nascimento no próximo acesso."
                : "Seu acesso está protegido neste aparelho. Para alterar ou recuperar o acesso, procure sua equipe."}
        </Text>
        <Botao
          secundario
          rotulo="Meus dados pessoais"
          onPress={() => router.push("/perfil")}
        />
      </View>
      {portal && sessao.usuario.papel !== "PATIENT" && (
        <Botao
          rotulo="Abrir portal profissional"
          onPress={() => {
            void Linking.openURL(portal).catch(() =>
              definirErro("Não foi possível abrir o portal."),
            );
          }}
        />
      )}
      {erro && <MensagemErro mensagem={erro} />}
      {sessao.usuario.papel === "PATIENT" &&
        !acessoDemonstracao &&
        origemAcesso === "PACIENTE" && (
          <View style={e.card}>
            <Text style={e.label}>Autorização deste aparelho</Text>
            <Text style={e.body}>
              Desautorize se este aparelho for compartilhado ou deixar de ser
              seu. Para voltar a entrar, sua equipe precisará emitir um novo
              código.
            </Text>
            {confirmarDesautorizacao ? (
              <>
                <Botao
                  rotulo="Confirmar desautorização"
                  ocupado={ocupado}
                  onPress={() => {
                    definirOcupado(true);
                    void esquecerDispositivo()
                      .catch(() =>
                        definirErro(
                          "Não foi possível desautorizar. Confira a conexão.",
                        ),
                      )
                      .finally(() => definirOcupado(false));
                  }}
                />
                <Botao
                  secundario
                  rotulo="Cancelar"
                  onPress={() => definirConfirmarDesautorizacao(false)}
                />
              </>
            ) : (
              <Botao
                secundario
                rotulo="Desautorizar este aparelho"
                onPress={() => definirConfirmarDesautorizacao(true)}
              />
            )}
          </View>
        )}
      <Botao
        rotulo="Sair da minha conta"
        ocupado={ocupado}
        onPress={() => {
          definirOcupado(true);
          void sair()
            .catch(() =>
              definirErro(
                "Não foi possível encerrar a sessão. Confira a conexão.",
              ),
            )
            .finally(() => definirOcupado(false));
        }}
      />
      <Botao
        secundario
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}
