import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { RespostaTestador, RespostaAcessoPaciente } from "@viva/contracts";
import { api } from "../api";
import { tipoDispositivo } from "./dispositivoPaciente";
const chave = "viva.testador.renovacao.v1",
  marcadorSaida = "viva.testador.saida";
let bloqueado = false;
export async function excluirRenovacaoTestador() {
  bloqueado = true;
  if (Platform.OS !== "web") await SecureStore.deleteItemAsync(chave);
  else
    try {
      globalThis.localStorage?.setItem(marcadorSaida, "1");
    } catch {
      /* Marcador sem credenciais; memória ainda impede renovação nesta página. */
    }
}
export async function protegerAcessoTestador(
  resposta: RespostaTestador,
): Promise<RespostaAcessoPaciente> {
  if (Platform.OS !== "web") {
    if (
      !resposta.credencialRenovacao ||
      !/^[A-Za-z0-9_-]{43}$/.test(resposta.credencialRenovacao)
    )
      throw new Error("Não foi possível proteger o convite neste aparelho.");
    await SecureStore.setItemAsync(chave, resposta.credencialRenovacao, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } else
    try {
      globalThis.localStorage?.removeItem(marcadorSaida);
    } catch {
      /* Nenhum token é armazenado no navegador. */
    }
  bloqueado = false;
  return { estado: "AUTENTICADO", sessao: resposta.sessao };
}
export async function renovarAcessoTestador(
  aindaValido = () => true,
): Promise<RespostaAcessoPaciente> {
  if (Platform.OS === "web") {
    try {
      if (globalThis.localStorage?.getItem(marcadorSaida) === "1")
        bloqueado = true;
    } catch {
      /* Mantém a decisão em memória. */
    }
    if (bloqueado)
      throw new Error("Use um novo convite para entrar após sair.");
  }
  const credencialRenovacao =
    Platform.OS === "web" ? undefined : await SecureStore.getItemAsync(chave);
  const resposta = await api<RespostaTestador>("/auth/testadores/renovar", {
    method: "POST",
    body: { tipo: tipoDispositivo, credencialRenovacao },
  });
  if (!aindaValido()) {
    await api("/auth/logout", {
      method: "POST",
      token: resposta.sessao.accessToken,
    }).catch(() => undefined);
    throw new Error("Entre novamente para continuar.");
  }
  return protegerAcessoTestador(resposta);
}
