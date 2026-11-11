import { useRef, useState } from "react";
import { Platform, View } from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { filaRegistros } from "../services/sincronizacao/filaRegistros";
import { Text } from "./TextoAcessivel";
import { Botao } from "./ElementosInterface";
import { estilos as e } from "./estilos";

export function AtualizacaoAplicativo() {
  const { sessao } = useAutenticacao();
  const titular = sessao?.usuario.id ?? "",
    atual = useRef(titular);
  atual.current = titular;
  const [mensagem, definirMensagem] = useState(""),
    [pronta, definirPronta] = useState(false),
    [ocupado, definirOcupado] = useState(false);
  async function verificar(aplicar = false) {
    if (ocupado || !titular) return;
    definirOcupado(true);
    try {
      if ((await filaRegistros.read(titular)).length)
        throw new Error(
          "Envie os registros pendentes antes de atualizar. Eles continuam protegidos neste aparelho.",
        );
      if (titular !== atual.current) return;
      if (aplicar) {
        await Updates.reloadAsync();
        return;
      }
      const consulta = await Updates.checkForUpdateAsync();
      if (!consulta.isAvailable) {
        definirMensagem(
          "Você já está com a atualização mais recente deste canal.",
        );
        return;
      }
      await Updates.fetchUpdateAsync();
      if (titular !== atual.current) return;
      definirPronta(true);
      definirMensagem(
        "Atualização baixada. Toque em aplicar quando terminar seus registros. O aplicativo será reaberto.",
      );
    } catch (falha) {
      if (titular === atual.current)
        definirMensagem(
          falha instanceof Error &&
            falha.message.startsWith("Envie os registros")
            ? falha.message
            : "Não foi possível verificar a atualização. Confira a conexão e tente novamente.",
        );
    } finally {
      definirOcupado(false);
    }
  }
  const configuracao = Constants.expoConfig;
  return (
    <View style={e.card}>
      <Text style={e.label}>Versão do Viva+</Text>
      <Text style={e.body}>
        {configuracao?.version ?? "Não informada"} · build{" "}
        {Platform.OS === "ios"
          ? (configuracao?.ios?.buildNumber ?? "—")
          : (configuracao?.android?.versionCode ?? "—")}
      </Text>
      {Platform.OS !== "web" && Updates.isEnabled ? (
        <>
          <Botao
            secundario
            rotulo={
              pronta
                ? "Aplicar atualização e reabrir"
                : "Verificar atualizações"
            }
            ocupado={ocupado}
            onPress={() => void verificar(pronta)}
          />
          <Text style={e.small}>
            Mudanças nas funções do aparelho podem exigir uma nova instalação
            pelo link enviado ao grupo.
          </Text>
        </>
      ) : (
        <Text style={e.small}>
          Quando houver uma nova versão, o responsável pelos testes enviará as
          instruções de atualização.
        </Text>
      )}
      {!!mensagem && (
        <Text accessibilityLiveRegion="polite" style={e.body}>
          {mensagem}
        </Text>
      )}
    </View>
  );
}
