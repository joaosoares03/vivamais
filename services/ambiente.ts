import Constants from "expo-constants";
export const acessoTestadores =
  Constants.expoConfig?.extra?.acessoTestadores === true &&
  ["development", "test", "preview"].includes(
    Constants.expoConfig?.extra?.appEnvironment ?? "",
  );
export const acessoDemonstracao =
  Constants.expoConfig?.extra?.acessoDemonstracao === true &&
  ["development", "test"].includes(
    Constants.expoConfig?.extra?.appEnvironment ?? "",
  );

// O modo é definido no build, nunca pela presença de uma conta ou por dados clínicos.
export const ambienteDesenvolvimento =
  Constants.expoConfig?.extra?.appEnvironment === "development";

export const ambienteDemonstracao = ["development", "test", "preview"].includes(
  Constants.expoConfig?.extra?.appEnvironment ?? "development",
);
