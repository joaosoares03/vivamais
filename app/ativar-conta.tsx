import { Text } from "../components/TextoAcessivel";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { router, Redirect } from "expo-router";
import { acessoDemonstracao, acessoTestadores } from "../services/ambiente";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  Tela,
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
} from "../components/ElementosInterface";
import { estilos as e } from "../components/estilos";
export default function AtivarConta() {
  const { sessao, restaurando, desafioPendente, ativarConta } =
    useAutenticacao();
  const [codigo, definirCodigo] = useState(""),
    [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState(""),
    [focado, definirFocado] = useState(false);
  async function ativar() {
    if (ocupado) return;
    if (!/^(\d{4}|\d{6})$/.test(codigo)) {
      definirErro("Digite todos os números do código.");
      return;
    }
    definirOcupado(true);
    definirErro("");
    try {
      await ativarConta(codigo);
      definirCodigo("");
    } catch (falha) {
      definirCodigo("");
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível ativar. Tente novamente.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  if(acessoDemonstracao||acessoTestadores)return <Redirect href="/acesso"/>;
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (sessao)
    return (
      <Tela>
        <MarcaViva />
        <Text style={e.title} accessibilityRole="header">
          Acesso ativado!
        </Text>
        <Text style={e.body} accessibilityRole="alert">
          Seu aparelho está autorizado. Você já pode usar o Viva+.
        </Text>
        <Botao
          rotulo="Ir para o início"
          onPress={() => router.replace("/inicio")}
        />
      </Tela>
    );
  return (
    <Tela>
      <MarcaViva />
      <Text style={e.title} accessibilityRole="header">
        Ativar minha conta
      </Text>
      <Text style={e.body}>
        Informe o código recebido da sua equipe para ativar seu acesso ao
        Viva+.
      </Text>
      {!desafioPendente ? (
        <View style={e.card}>
          <Text style={e.body}>
            Primeiro, informe seu CPF e sua data de nascimento na tela de
            acesso.
          </Text>
          <Botao
            rotulo="Ir para o acesso"
            onPress={() => router.replace("/acesso")}
          />
        </View>
      ) : (
        <View style={e.card}>
          <Text style={e.label}>Código de ativação</Text>
          <View
            style={{
              alignSelf: "center",
              width: 272,
              height: 76,
              position: "relative",
            }}
          >
            <View
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                position: "absolute",
                inset: 0,
                flexDirection: "row",
                gap: 8,
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((indice) => (
                <View
                  key={indice}
                  style={{
                    flex: 1,
                    borderWidth: 2,
                    borderColor: focado ? "#0067b1" : "#526b78",
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: "#123747",
                    }}
                  >
                    {codigo[indice] || "·"}
                  </Text>
                </View>
              ))}
            </View>
            <TextInput
              testID="codigo-ativacao-input"
              accessibilityLabel="Código de ativação"
              accessibilityHint="Digite os números recebidos da equipe."
              value={codigo}
              onChangeText={(v) =>
                definirCodigo(v.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              autoCorrect={false}
              editable={!ocupado}
              onFocus={() => definirFocado(true)}
              onBlur={() => definirFocado(false)}
              style={{
                width: "100%",
                height: 76,
                fontSize: 32,
                color: "transparent",
                backgroundColor: "transparent",
              }}
              caretHidden
              onSubmitEditing={() => {
                void ativar();
              }}
            />
          </View>
          {erro && <MensagemErro mensagem={erro} />}
          <Botao
            rotulo="ATIVAR CONTA"
            ocupado={ocupado}
            onPress={() => {
              void ativar();
            }}
          />
          <Text style={e.small}>
            O código vale por 10 minutos e só pode ser usado uma vez. Muitas
            tentativas bloqueiam a verificação por até 15 minutos.
          </Text>
        </View>
      )}
      <View style={e.notice}>
        <Text style={e.body}>
          Código inválido, expirado ou não recebido? Procure o profissional
          responsável. Após confirmar sua identidade, ele pode emitir outro
          código. O anterior deixa de valer.
        </Text>
      </View>
      <Botao
        secundario
        rotulo="Voltar ao acesso"
        onPress={() => router.replace("/acesso")}
      />
    </Tela>
  );
}
