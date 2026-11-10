import { ErroApi } from "../transporteApi";

/** Uma falha de rede ou limite de tentativas não comprova bloqueio de cookies. */
export function erroAoConfirmarDispositivo(erro: unknown): ErroApi {
  if (erro instanceof ErroApi && erro.estadoResposta !== 401) return erro;
  if (erro instanceof ErroApi)
    return new ErroApi(
      "Não foi possível confirmar o acesso protegido neste navegador. Confira se os cookies estão permitidos e solicite um novo código à equipe.",
      401,
    );
  return new ErroApi(
    "Não foi possível confirmar o acesso agora. Verifique sua conexão e tente novamente.",
    0,
  );
}
