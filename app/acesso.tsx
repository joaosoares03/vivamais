import { Text } from "../components/TextoAcessivel";
import { useState } from "react";
import { Redirect, router } from "expo-router";
import { TextInput, View } from "react-native";
import {
  validarCpf,
  formatarCpf,
  interpretarNascimento,
} from "@viva/contracts";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
  Tela,
} from "../components/ElementosInterface";
import { estilos as e } from "../components/estilos";
import { CampoData } from "../components/CampoData";
import { acessoDemonstracao, acessoTestadores } from "../services/ambiente";
export default function Acesso() {
  const { sessao, restaurando, aviso, entrar } = useAutenticacao();
  const [cpf, definirCpf] = useState(""),
    [nascimento, definirNascimento] = useState("");
  const [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState<string | null>(null);
  async function realizarAcesso() {
    if (ocupado) return;
    if (cpf.replace(/\D/g, "").length !== 11 || !validarCpf(cpf)) {
      definirErro("Confira o CPF. Digite os 11 números.");
      return;
    }
    const data = interpretarNascimento(nascimento);
    if (!data) {
      definirErro("Confira sua data de nascimento: dia, mês e ano.");
      return;
    }
    definirOcupado(true);
    definirErro(null);
    try {
      const autorizado = await entrar(cpf, data);
      definirCpf("");
      definirNascimento("");
      router.replace(autorizado ? "/inicio" : "/ativar-conta");
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  if (restaurando)
    return (
      <Tela>
        <MarcaViva grande />
        <Carregando rotulo="Verificando seu acesso…" />
      </Tela>
    );
  if (sessao) return <Redirect href="/inicio" />;
  if (acessoTestadores) return <Redirect href="/convite" />;
  return (
    <Tela>
      <View style={{ alignItems: "center", marginTop: 12 }}>
        <MarcaViva grande largura={120} />
      </View>
      <Text accessibilityRole="header" style={e.title}>
        Entrar no Viva+
      </Text>
      <Text style={e.body}>Informe seu CPF e sua data de nascimento.</Text>
      {!!aviso && (
        <Text accessibilityRole="alert" style={e.body}>
          {aviso}
        </Text>
      )}
      <View style={e.card}>
        <View style={e.section}>
          <Text style={e.label}>CPF</Text>
          <TextInput
            testID="cpf-input"
            accessibilityLabel="CPF"
            value={cpf}
            onChangeText={(v) => definirCpf(formatarCpf(v))}
            style={[e.field, { fontSize: 22, minHeight: 58 }]}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={14}
            autoComplete="off"
            autoCorrect={false}
            editable={!ocupado}
            placeholder="000.000.000-00"
            placeholderTextColor="#526b78"
          />
        </View>
        <CampoData
          rotulo="Data de nascimento"
          testID="nascimento-input"
          valor={nascimento}
          aoAlterar={definirNascimento}
          desabilitado={ocupado}
        />
        {erro && <MensagemErro mensagem={erro} />}
        <Botao
          rotulo="ENTRAR"
          testID="login-button"
          ocupado={ocupado}
          onPress={() => {
            void realizarAcesso();
          }}
        />
      </View>
      {!acessoDemonstracao && (
        <View style={e.notice}>
          <Text style={e.body}>
            Primeiro acesso ou aparelho novo? Depois de tocar em ENTRAR, informe
            o código de 4 números recebido da sua equipe. Você não precisa criar
            senha.
          </Text>
        </View>
      )}
      {!acessoDemonstracao && (
        <Botao
          secundario
          rotulo="Como faço meu cadastro?"
          onPress={() => router.push("/cadastro")}
        />
      )}
      {!acessoDemonstracao && (
        <Text style={e.small}>
          Não compartilhe seu código de ativação. A equipe confirma sua
          identidade antes de emitir um novo código.
        </Text>
      )}
    </Tela>
  );
}
