import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  interpretarAcessoProtegido,
  type AcessoProtegidoLido,
  type OrigemAcessoPaciente,
  type SessaoProtegida,
} from "./contratoSessao";

const chave = "viva.session.v1";

// Browser token is memory-only. Never use localStorage, sessionStorage or IndexedDB for authentication.
export async function lerAcessoProtegido(): Promise<AcessoProtegidoLido> {
  if (Platform.OS === "web") return { sessao: null, origemAcesso: null };
  const valor = await SecureStore.getItemAsync(chave);
  const acesso = interpretarAcessoProtegido(valor);
  if (!acesso.sessao && valor)
    await descartarTokenProtegido(acesso.origemAcesso);
  return acesso;
}

export async function lerSessaoProtegida(): Promise<SessaoProtegida | null> {
  return (await lerAcessoProtegido()).sessao;
}

/** Mantém só a preferência de canal no cofre; sem token, não existe sessão. */
export async function descartarTokenProtegido(
  origemAcesso: OrigemAcessoPaciente | null,
): Promise<void> {
  if (Platform.OS === "web") return;
  if (origemAcesso) {
    await SecureStore.setItemAsync(
      chave,
      JSON.stringify({ somenteOrigem: true, origemAcesso }),
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  } else await SecureStore.deleteItemAsync(chave);
}

export async function salvarSessaoProtegida(
  sessao: SessaoProtegida,
): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(
    chave,
    JSON.stringify({
      accessToken: sessao.accessToken,
      expiresAt: sessao.expiresAt,
      ...(sessao.origemAcesso ? { origemAcesso: sessao.origemAcesso } : {}),
      ...(sessao.user ? { user: sessao.user } : {}),
    }),
    {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    },
  );
}

export async function excluirSessaoProtegida(): Promise<void> {
  if (Platform.OS !== "web") await SecureStore.deleteItemAsync(chave);
}
