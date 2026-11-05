import { Text } from "../components/TextoAcessivel";
import { router, Redirect } from "expo-router";
import { acessoDemonstracao, acessoTestadores } from "../services/ambiente";
import { View } from "react-native";
import { Tela, MarcaViva, Botao } from "../components/ElementosInterface";
import { estilos as e } from "../components/estilos";

export default function Cadastro() {
  if(acessoDemonstracao||acessoTestadores)return <Redirect href="/acesso"/>;
  return (
    <Tela>
      <MarcaViva grande />
      <Text style={e.title} accessibilityRole="header">
        Seu cadastro no Viva+
      </Text>
      <View style={e.card}>
        <Text style={e.label}>1. Cadastro pela sua equipe</Text>
        <Text style={e.body}>
          O profissional responsável cadastra seu nome, CPF, nascimento e
          telefone no portal e vincula seu acompanhamento. Dados adicionais
          podem ser informados depois.
        </Text>
      </View>
      <View style={e.card}>
        <Text style={e.label}>2. Ativação individual</Text>
        <Text style={e.body}>
          Você recebe um código de 4 números, válido por 10 minutos. Na tela de
          acesso, informe CPF e nascimento. Depois digite o código para
          autorizar seu aparelho. Você não precisa criar senha.
        </Text>
        <Botao
          rotulo="Já tenho código: ativar conta"
          onPress={() => router.push("/acesso")}
        />
      </View>
      <View style={e.notice}>
        <Text style={e.label}>Ainda não recebeu seu código?</Text>
        <Text style={e.body}>
          Solicite o cadastro ou a recuperação de acesso ao profissional
          responsável pelo seu acompanhamento. A criação de contas de pacientes
          é feita pela equipe autorizada.
        </Text>
      </View>
      <Botao
        secundario
        rotulo="Já ativei: entrar"
        onPress={() => router.dismissTo("/acesso")}
      />
      <Botao
        secundario
        rotulo="Voltar às boas-vindas"
        onPress={() => router.dismissTo("/")}
      />
    </Tela>
  );
}
