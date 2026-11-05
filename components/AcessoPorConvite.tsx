import { useEffect, useState } from "react";
import { Linking, Platform, TextInput, View } from "react-native";
import { Redirect, router } from "expo-router";
import { extrairConviteTeste } from "@viva/contracts";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { Text } from "./TextoAcessivel";
import {
  Tela,
  MarcaViva,
  Botao,
  Carregando,
  MensagemErro,
} from "./ElementosInterface";
import { estilos as e } from "./estilos";

export function AcessoPorConvite() {
  const { sessao, restaurando, aviso, entrarComConvite } = useAutenticacao();
  const [convite, definirConvite] = useState(""),
    [erro, definirErro] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  useEffect(() => {
    function receber(endereco: string | null) {
      const valor = endereco ? extrairConviteTeste(endereco) : null;
      if (valor) definirConvite(valor);
      // O fragmento não segue para a API nem permanece no histórico do navegador.
      if (Platform.OS === "web" && valor)
        globalThis.history?.replaceState(
          null,
          "",
          globalThis.location.pathname,
        );
    }
    void Linking.getInitialURL().then(receber);
    const inscricao = Linking.addEventListener("url", ({ url }) =>
      receber(url),
    );
    return () => inscricao.remove();
  }, []);
  if (restaurando)
    return (
      <Tela>
        <MarcaViva />
        <Carregando rotulo="Verificando seu acesso…" />
      </Tela>
    );
  if (sessao) return <Redirect href="/inicio" />;
  return (
    <Tela>
      <MarcaViva grande />
      <Text style={e.title} accessibilityRole="header">
        Entrar nos testes do Viva+
      </Text>
      <Text style={e.body}>
        Use o convite privado recebido do responsável pelo grupo. Cada
        participante tem uma conta fictícia própria.
      </Text>
      {!!aviso && (
        <Text style={e.body} accessibilityRole="alert">
          {aviso}
        </Text>
      )}
      <View style={e.card}>
        <Text style={e.label}>Seu convite</Text>
        <TextInput
          accessibilityLabel="Convite privado"
          testID="convite-input"
          style={e.field}
          value={convite}
          onChangeText={definirConvite}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          secureTextEntry
          editable={!ocupado}
          placeholder="Cole o convite recebido"
        />
        {!!erro && <MensagemErro mensagem={erro} />}
        <Botao
          rotulo="ENTRAR"
          ocupado={ocupado}
          onPress={() => {
            if (ocupado) return;
            definirOcupado(true);
            definirErro("");
            void entrarComConvite(convite)
              .then(() => {
                definirConvite("");
                router.replace("/inicio");
              })
              .catch((falha) =>
                definirErro(
                  falha instanceof Error
                    ? falha.message
                    : "Não foi possível usar o convite.",
                ),
              )
              .finally(() => definirOcupado(false));
          }}
        />
      </View>
      <Text style={e.small}>
        O convite é individual, tem validade limitada e só pode ser utilizado
        uma vez. Se expirou ou você saiu da conta, peça outro ao responsável.
        Use somente dados fictícios.
      </Text>
    </Tela>
  );
}
