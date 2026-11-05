import { Text } from "../components/TextoAcessivel";
import { Redirect } from "expo-router";
import { Image, View } from "react-native";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  MarcaViva,
  Botao,
  Carregando,
  Tela,
} from "../components/ElementosInterface";
import { router } from "expo-router";
import { estilos as s } from "../components/estilos";
import { acessoDemonstracao, acessoTestadores } from "../services/ambiente";

export default function BoasVindas() {
  const { sessao: sessao, restaurando: restaurando } = useAutenticacao();
  if (restaurando)
    return (
      <Tela>
        <MarcaViva />
        <Carregando rotulo="Verificando sua sessão…" />
      </Tela>
    );
  if (sessao) return <Redirect href="/inicio" />;
  return (
    <Tela compacta>
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <MarcaViva variante="verde" grande largura={145} />
        <Text
          style={[
            s.body,
            { textAlign: "center", color: "#005d4b", marginTop: 8 },
          ]}
        >
          Sua saúde{"\n"}no seu dia a dia
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Image
          source={require("../assets/images/individuais/02_personagens/idoso_perfil.png")}
          accessibilityLabel="Ilustração de um idoso"
          style={{ width: "48%", height: 170, resizeMode: "contain" }}
        />
        <Image
          source={require("../assets/images/individuais/02_personagens/idosa_perfil.png")}
          accessibilityLabel="Ilustração de uma idosa"
          style={{
            width: "48%",
            height: 170,
            resizeMode: "contain",
            marginBottom: 0,
          }}
        />
      </View>
      <View style={[s.card, { padding: 20, borderRadius: 24, gap: 10 }]}>
        <Text
          style={[
            s.title,
            { textAlign: "center", fontSize: 24, lineHeight: 30 },
          ]}
          accessibilityRole="header"
        >
          Vamos cuidar{"\n"}da sua saúde juntos!
        </Text>
        <Text
          style={[
            s.body,
            { textAlign: "center", fontSize: 18, lineHeight: 25 },
          ]}
        >
          Registre sua pressão, seus medicamentos, sua alimentação e pratique
          atividades físicas com a orientação da sua equipe.
        </Text>
        <Botao
          rotulo="Começar"
          onPress={() => router.push("/acesso")}
          testID="start-button"
        />
      </View>
      {!acessoDemonstracao && !acessoTestadores && <Botao
        secundario
        rotulo="Cadastrar ou ativar minha conta"
        onPress={() => router.push("/cadastro")}
      />}
      <Text style={s.small}>
        O Viva+ ajuda a organizar seus registros para o acompanhamento pela sua
        equipe. Não oferece diagnóstico ou atendimento de emergência.
      </Text>
    </Tela>
  );
}
