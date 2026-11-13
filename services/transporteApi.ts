/** Pure transport helpers: no React Native globals, suitable for security tests. */
export class ErroApi extends Error {
  /** Compatibilidade técnica com o código HTTP usado pelo transporte e pela fila. */
  get status() {
    return this.estadoResposta;
  }
  constructor(
    mensagem: string,
    public readonly estadoResposta: number,
  ) {
    super(mensagem);
  }
}

export type OpcoesRequisicao = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  formulario?: FormData;
  limiteTempoMs?: number;
};

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
    (servidor.startsWith("fc") && servidor.includes(":")) ||
    (servidor.startsWith("fd") && servidor.includes(":")) ||
    servidor.startsWith("fe80:")
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

export function resolverEnderecoApi(
  valorOriginal: string,
  desenvolvimento: boolean,
): string {
  let url: URL;
  try {
    url = new URL(valorOriginal);
  } catch {
    throw new Error("O endereço da API é inválido.");
  }
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !["https:", "http:"].includes(url.protocol)
  ) {
    throw new Error(
      "O endereço da API não pode conter credenciais, consulta ou fragmento.",
    );
  }
  if (!desenvolvimento && url.protocol !== "https:")
    throw new Error("A API deve usar HTTPS fora de desenvolvimento.");
  if (!desenvolvimento && enderecoLocal(url.hostname)) {
    throw new Error(
      "A distribuição deve usar uma API pública, fora da rede local.",
    );
  }
  return url.toString().replace(/\/$/, "");
}

/** O navegador usa a origem efetiva do aplicativo, inclusive após troca de domínio. */
export function resolverEnderecoExecucao(opcoes: {
  mesmaOrigem: boolean;
  navegador: boolean;
  origemNavegador?: string;
  enderecoConfigurado?: string;
  desenvolvimento: boolean;
}): string {
  if (opcoes.mesmaOrigem && opcoes.navegador) {
    const origem = opcoes.origemNavegador;
    if (!origem || new URL(origem).origin !== origem)
      throw new Error("A origem do aplicativo web é inválida.");
    return resolverEnderecoApi(origem, opcoes.desenvolvimento);
  }
  if (opcoes.mesmaOrigem && !opcoes.enderecoConfigurado)
    throw new Error(
      "O aplicativo nativo exige sua própria API HTTPS configurada.",
    );
  return resolverEnderecoApi(
    opcoes.enderecoConfigurado ?? "http://127.0.0.1:8080",
    opcoes.desenvolvimento,
  );
}

export function sessaoExpirada(expiresAt: string, agora = Date.now()): boolean {
  const instante = Date.parse(expiresAt);
  return !Number.isFinite(instante) || instante <= agora;
}

export function criarTransporte(
  baseUrl: string,
  buscarRecurso: (
    entrada: string,
    opcoes?: RequestInit,
  ) => Promise<Response> = fetch,
  limiteTempoMs = 15000,
) {
  return async function requisicao<T>(
    caminho: string,
    opcoes: OpcoesRequisicao & { token?: string } = {},
  ): Promise<T> {
    // Relative API paths only. Prevent accidental forwarding of a bearer token to another origin.
    const analisado = new URL(caminho, baseUrl);
    if (
      !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(analisado.pathname) ||
      analisado.origin !== new URL(baseUrl).origin ||
      !caminho.startsWith("/") ||
      caminho.startsWith("//") ||
      analisado.hash
    )
      throw new ErroApi("Caminho de API inválido.", 0);
    if (opcoes.formulario !== undefined && opcoes.body !== undefined)
      throw new ErroApi(
        "Informe JSON ou formulário, sem misturar os dois formatos.",
        0,
      );
    const controlador = new AbortController();
    const temporizador = setTimeout(
      () => controlador.abort(),
      opcoes.limiteTempoMs ?? limiteTempoMs,
    );
    try {
      const resposta = await buscarRecurso(`${baseUrl}/api/v1${caminho}`, {
        method: opcoes.method ?? "GET",
        headers: {
          Accept: "application/json",
          ...(opcoes.body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
          ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}),
        },
        ...(opcoes.formulario !== undefined
          ? { body: opcoes.formulario }
          : opcoes.body !== undefined
            ? { body: JSON.stringify(opcoes.body) }
            : {}),
        signal: controlador.signal,
        redirect: "error",
        credentials:
          analisado.pathname.startsWith("/auth/paciente/") ||
          analisado.pathname.startsWith("/auth/testadores/")
            ? "include"
            : "omit",
        cache: "no-store",
      });
      if (!resposta.ok) {
        // Do not surface arbitrary provider text, account existence or clinical payloads in errors.
        const mensagem =
          resposta.status === 401
            ? analisado.pathname.startsWith("/auth/paciente/")
              ? "Não foi possível verificar seu acesso. Confira os dados e o código atual ou procure sua equipe."
              : "Acesso não autorizado. Confira suas credenciais ou entre novamente."
            : resposta.status === 403
              ? "Sua conta não tem permissão para esta ação."
              : resposta.status === 429
                ? "Muitas tentativas. Aguarde um pouco antes de tentar novamente."
                : "O serviço não conseguiu concluir a solicitação. Tente novamente.";
        throw new ErroApi(mensagem, resposta.status);
      }
      if (resposta.status === 204) return undefined as T;
      return (await resposta.json()) as T;
    } catch (erro) {
      if (erro instanceof ErroApi) throw erro;
      throw new ErroApi(
        controlador.signal.aborted
          ? "A conexão demorou demais. Tente novamente."
          : "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.",
        0,
      );
    } finally {
      clearTimeout(temporizador);
    }
  };
}
