import { pathToFileURL } from "node:url";

function origemPublica(valor) {
  const url = new URL(valor);
  if (
    url.protocol !== "https:" ||
    url.origin !== valor ||
    url.hostname.includes("*") ||
    /^(localhost|.*\.local|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.|\[)/i.test(
      url.hostname,
    )
  )
    throw new Error(
      "Informe somente a origem HTTPS pública real, sem caminho, credenciais ou fragmento.",
    );
  return url.origin;
}
/** Verificação anônima: não cria contas/registros e não imprime corpos de erro ou segredos. */
export async function verificarImplantacao(api, portal) {
  api = origemPublica(api);
  portal = origemPublica(portal);
  async function buscar(origem, caminho) {
    return fetch(origem + caminho, {
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  }
  const saude = await buscar(api, "/actuator/health/readiness");
  if (!saude.ok || (await saude.json()).status !== "UP")
    throw new Error("API/banco ainda não estão prontos.");
  for (const caminho of ["/", "/convite", "/medicamentos"]) {
    const resposta = await buscar(api, caminho);
    if (
      !resposta.ok ||
      !resposta.headers.get("content-type")?.includes("text/html") ||
      !(await resposta.text()).includes("/_expo/static/js/web/")
    )
      throw new Error(
        "A exportação real do paciente ou a reabertura de rotas não está disponível.",
      );
    const politica = resposta.headers.get("content-security-policy") ?? "";
    if (
      !politica.includes("connect-src 'self'") ||
      !politica.includes("script-src 'self';") ||
      politica.includes("unsafe-eval")
    )
      throw new Error("Confira a política de segurança do aplicativo web.");
  }
  const protegido = await buscar(api, "/api/v1/patients");
  if (
    protegido.status !== 401 ||
    protegido.headers.get("access-control-allow-origin") === "*"
  )
    throw new Error("A API precisa negar consulta anônima e CORS aberto.");
  for (const caminho of ["/", "/privacidade", "/suporte"]) {
    const resposta = await buscar(portal, caminho);
    if (
      !resposta.ok ||
      !resposta.headers.get("content-type")?.includes("text/html") ||
      !resposta.headers.get("content-security-policy")?.includes("nonce-")
    )
      throw new Error(
        "Confira as páginas HTTPS e a CSP do portal profissional.",
      );
  }
  return {
    saude: "UP",
    paginasPaciente: 3,
    paginasPortal: 3,
    apiAnonima: "negada",
    autenticacaoTestada: false,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const resultado = await verificarImplantacao(
      process.argv[2],
      process.argv[3],
    );
    console.log(JSON.stringify(resultado));
    console.log(
      "Checagem pública aprovada. Login por convite, renovação, persistência, objetos privados e reinício ainda exigem ensaio autenticado real.",
    );
  } catch {
    console.error(
      "Implantação ainda não validada. Confira os endereços, serviços e logs privados; nenhum segredo foi exibido.",
    );
    process.exitCode = 1;
  }
}
