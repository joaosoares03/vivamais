import Constants from "expo-constants";
import { Platform } from "react-native";
import { criarTransporte, resolverEnderecoExecucao } from "./transporteApi";

const desenvolvimento =
  Constants.expoConfig?.extra?.appEnvironment === "development";
export const enderecoApi = resolverEnderecoExecucao({
  mesmaOrigem: Constants.expoConfig?.extra?.webMesmaOrigem === true,
  navegador: Platform.OS === "web",
  origemNavegador:
    typeof window === "undefined" ? undefined : window.location.origin,
  enderecoConfigurado: process.env.EXPO_PUBLIC_API_BASE_URL,
  desenvolvimento,
});
export const api = criarTransporte(enderecoApi);
