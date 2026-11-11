import type { ExpoConfig } from "expo/config";

const enderecoApi =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
const appEnvironment = process.env.APP_ENV ?? "development";
const acessoDemonstracao = process.env.VIVA_LOGIN_DEMONSTRACAO === "true";
const acessoTestadores = process.env.VIVA_ACESSO_TESTADORES === "true";
const webMesmaOrigem = process.env.VIVA_WEB_MESMA_ORIGEM === "true";
if (
  webMesmaOrigem &&
  (!acessoTestadores ||
    appEnvironment !== "preview" ||
    process.env.EAS_BUILD_PLATFORM)
)
  throw new Error(
    "Web na mesma origem é exclusivo da exportação web de homologação por convite.",
  );
const atualizacoesHabilitadas = process.env.VIVA_ATUALIZACOES === "true";
const idProjetoEas = process.env.EXPO_EAS_PROJECT_ID;
const identificadorPadrao = acessoDemonstracao
  ? "org.vivamais.academicdemo.local"
  : acessoTestadores
    ? "org.vivamais.academicdemo.teste"
    : "org.vivamais.academicdemo";
if (
  acessoTestadores &&
  (acessoDemonstracao ||
    !["development", "test", "preview"].includes(appEnvironment))
)
  throw new Error(
    "Convites exigem um ambiente de testes separado da demonstração local e da produção.",
  );
const identificadorAndroid =
  process.env.VIVA_ANDROID_APPLICATION_ID ?? identificadorPadrao;
const identificadorIos =
  process.env.VIVA_IOS_BUNDLE_IDENTIFIER ?? identificadorPadrao;
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(identificadorAndroid))
  throw new Error("Identificador Android inválido.");
if (
  !/^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*){2,}$/.test(identificadorIos)
)
  throw new Error("Identificador iOS inválido.");
if (
  acessoDemonstracao &&
  (!identificadorAndroid.endsWith(".local") ||
    !identificadorIos.endsWith(".local"))
)
  throw new Error(
    "A demonstração exige identificadores exclusivos terminados em .local.",
  );
if (
  idProjetoEas &&
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    idProjetoEas,
  )
)
  throw new Error(
    "EXPO_EAS_PROJECT_ID deve ser o identificador do projeto criado na sua conta Expo.",
  );
if (
  acessoTestadores &&
  (!identificadorAndroid.endsWith(".teste") ||
    !identificadorIos.endsWith(".teste"))
)
  throw new Error(
    "Os testes do grupo exigem identificadores exclusivos terminados em .teste.",
  );
if (atualizacoesHabilitadas && (!idProjetoEas || acessoDemonstracao))
  throw new Error(
    "Atualizações exigem um projeto EAS vinculado e não podem alterar a demonstração local.",
  );
if (
  acessoDemonstracao &&
  (!["development", "test"].includes(appEnvironment) ||
    ![undefined, "development"].includes(process.env.EAS_BUILD_PROFILE))
)
  throw new Error(
    "Login demonstrativo não é permitido em builds de distribuição.",
  );
if (!["development", "test", "preview", "production"].includes(appEnvironment))
  throw new Error("APP_ENV inválido.");

// Expo evaluates this config in Node without recursively transpiling TypeScript imports.
function enderecoLocal(nomeServidor: string): boolean {
  const servidor = nomeServidor
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
  if (
    servidor === "localhost" ||
    servidor.endsWith(".localhost") ||
    servidor.endsWith(".local") ||
    servidor === "::1" ||
    servidor === "::"
  )
    return true;
  if (
    servidor.includes(":") &&
    (servidor.startsWith("fc") ||
      servidor.startsWith("fd") ||
      servidor.startsWith("fe80:"))
  )
    return true;
  const partesData = servidor.split(".").map(Number);
  if (
    partesData.length !== 4 ||
    partesData.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  )
    return false;
  const [a, b] = partesData;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b !== undefined && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

const apiUrl = new URL(enderecoApi);
if (
  apiUrl.username ||
  apiUrl.password ||
  apiUrl.search ||
  apiUrl.hash ||
  !["https:", "http:"].includes(apiUrl.protocol)
) {
  throw new Error(
    "Defina um endereço de API sem credenciais, consulta ou fragmento.",
  );
}
if (
  !webMesmaOrigem &&
  appEnvironment !== "development" &&
  apiUrl.protocol !== "https:"
) {
  throw new Error(
    "Defina EXPO_PUBLIC_API_BASE_URL com HTTPS para preview/produção.",
  );
}
if (
  !webMesmaOrigem &&
  appEnvironment !== "development" &&
  enderecoLocal(apiUrl.hostname)
) {
  throw new Error(
    "Preview/produção exigem uma API pública, fora da rede local.",
  );
}

const config: ExpoConfig = {
  name: acessoDemonstracao
    ? "Viva+ Demo local"
    : acessoTestadores
      ? "Viva+ Testes"
      : "Viva+",
  slug: "viva-mais",
  scheme: acessoTestadores ? "vivamais-teste" : "vivamais",
  version: "0.2.0",
  runtimeVersion: { policy: "fingerprint" },
  updates: {
    enabled: atualizacoesHabilitadas,
    checkAutomatically: "NEVER",
    fallbackToCacheTimeout: 0,
    ...(idProjetoEas ? { url: `https://u.expo.dev/${idProjetoEas}` } : {}),
  },
  icon: "./assets/images/individuais/01_logos/logo_viva_mais_sem_slogan.png",
  orientation: "default",
  userInterfaceStyle: "light",
  // Provisórios: substituir pelos identificadores da instituição antes do primeiro build de loja.
  ios: {
    bundleIdentifier: identificadorIos,
    buildNumber: "2",
    supportsTablet: true,
    ...(appEnvironment === "development"
      ? {
          infoPlist: {
            NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
          },
        }
      : {}),
  },
  android: {
    package: identificadorAndroid,
    versionCode: 2,
    allowBackup: false,
    blockedPermissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_MEDIA_AUDIO",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      "android.permission.SYSTEM_ALERT_WINDOW",
    ],
  },
  web: {
    bundler: "metro",
    output: "single",
    name: "Viva+ — paciente",
    lang: "pt-BR",
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        image:
          "./assets/images/individuais/01_logos/logo_viva_mais_sem_slogan.png",
        imageWidth: 180,
        backgroundColor: "#f7fbff",
      },
    ],
    "expo-router",
    ["expo-sqlite", { useSQLCipher: true }],
    ["expo-notifications", { defaultChannel: "medication-reminders" }],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Selecione uma foto da refeição ou do visor do aparelho.",
        cameraPermission:
          "Fotografe o visor do aparelho de pressão ou sua refeição.",
        microphonePermission: false,
      },
    ],
    ["expo-secure-store", { configureAndroidBackup: true }],
    [
      "expo-build-properties",
      { android: { usesCleartextTraffic: appEnvironment === "development" } },
    ],
  ],
  experiments: { typedRoutes: false },
  extra: {
    appEnvironment,
    acessoDemonstracao,
    acessoTestadores,
    webMesmaOrigem,
    ...(idProjetoEas ? { eas: { projectId: idProjetoEas } } : {}),
  },
};

export default config;
