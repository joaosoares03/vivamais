import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { randomInt } from "node:crypto";
import { lerSmsLocal } from "../../infra/caixa-sms-local.cjs";
const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";
export function gerarCelularSintetico() {
  return "+55119" + String(randomInt(100000000)).padStart(8, "0");
}
export async function solicitarSmsPeloPortal(page: Page) {
  // Na ficha o acesso fica em aba própria; logo após o cadastro, aparece direto.
  const aba = page.getByRole("tab", { name: "Acesso ao aplicativo" });
  const aviso = page.getByText(
    "Modo de desenvolvimento: SMS de teste local, sem mensagens reais.",
    { exact: true },
  );
  await aba.or(aviso).first().waitFor();
  if (await aba.isVisible()) await aba.click();
  await expect(
    page.getByText(
      "Modo de desenvolvimento: SMS de teste local, sem mensagens reais.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByLabel("Conferi pessoalmente a identidade e o celular cadastrado.")
    .check();
  await page
    .getByLabel("Sua senha profissional", { exact: true })
    .fill(process.env.E2E_PASSWORD!);
  const retorno = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      new URL(r.url()).pathname.endsWith("/access-reset"),
  );
  await page
    .getByRole("button", { name: "Solicitar código por SMS", exact: true })
    .click();
  const resposta = await retorno;
  expect(resposta.status()).toBe(200);
  const dados = await resposta.json();
  expect(dados.estadoEnvio).toBe("TESTE_LOCAL");
  expect(dados.activationToken).toBeUndefined();
  await expect(
    page.getByLabel("Código de ativação", { exact: true }),
  ).toHaveCount(0);
  return lerSmsLocal(dados.idEnvio).codigo;
}
export function gerarCpfSintetico() {
  let numeros: number[];
  do {
    numeros = Array.from({ length: 9 }, () => randomInt(10));
  } while (new Set(numeros).size === 1);
  for (let posicao = 9; posicao < 11; posicao++)
    numeros.push(
      ((numeros.reduce(
        (soma, digito, indice) => soma + digito * (posicao + 1 - indice),
        0,
      ) *
        10) %
        11) %
        10,
    );
  return numeros.join("");
}
export async function emitirCodigoApi(
  request: APIRequestContext,
  cabecalhos: Record<string, string>,
  id: string,
) {
  const estado = await request.get(
    api + "/api/v1/patients/" + id + "/access-status",
    { headers: cabecalhos },
  );
  expect(estado.status()).toBe(200);
  expect((await estado.json()).provedorSms).toBe("LOCAL");
  const resposta = await request.post(
    api + "/api/v1/patients/" + id + "/access-reset",
    {
      headers: cabecalhos,
      data: {
        senhaProfissional: process.env.E2E_PASSWORD,
        identidadeConferida: true,
      },
    },
  );
  expect(resposta.status()).toBe(200);
  const dados = await resposta.json();
  expect(dados.estadoEnvio).toBe("TESTE_LOCAL");
  expect(dados.activationToken).toBeUndefined();
  return lerSmsLocal(dados.idEnvio).codigo;
}
export async function cadastrarComCodigo(
  request: APIRequestContext,
  cabecalhos: Record<string, string>,
  dados: Record<string, unknown>,
) {
  const cpf = String(dados.cpf || gerarCpfSintetico()),
    dataNascimento = String(dados.dataNascimento || "1950-01-01");
  const resposta = await request.post(api + "/api/v1/patients", {
    headers: cabecalhos,
    data: {
      ...dados,
      cpf,
      dataNascimento,
      telefone: dados.telefone || gerarCelularSintetico(),
    },
  });
  expect(resposta.status()).toBe(200);
  const cadastro = await resposta.json();
  const activationToken = await emitirCodigoApi(
    request,
    cabecalhos,
    cadastro.patient.id,
  );
  return { ...cadastro, cpf, dataNascimento, activationToken };
}
export async function ativarPorApi(
  request: APIRequestContext,
  cpf: string,
  nascimento: string,
  codigo: string,
) {
  const inicio = await request.post(api + "/api/v1/auth/paciente/iniciar", {
    data: { cpf, dataNascimento: nascimento, tipo: "NATIVO" },
  });
  expect(inicio.status()).toBe(200);
  const desafio = (await inicio.json()).desafio;
  const resposta = await request.post(api + "/api/v1/auth/paciente/verificar", {
    data: { desafio, codigo, tipo: "NATIVO" },
  });
  expect(resposta.status()).toBe(200);
  return (await resposta.json()).sessao;
}
export async function entrarNaTela(
  pagina: Page,
  cpf: string,
  nascimento: string,
  codigo?: string,
) {
  const respostaAcesso = pagina.waitForResponse(
    (resposta) =>
      new URL(resposta.url()).pathname ===
        "/api/v1/auth/paciente/" + (codigo ? "renovar" : "iniciar") &&
      resposta.request().method() === "POST" &&
      resposta.status() === 200,
  );
  await pagina.goto("http://127.0.0.1:8081/acesso");
  await pagina.getByLabel("CPF", { exact: true }).fill(cpf);
  const partes = nascimento.split("-");
  await pagina
    .getByLabel("Data de nascimento", { exact: true })
    .fill(partes[2] + "/" + partes[1] + "/" + partes[0]);
  await pagina.getByRole("button", { name: "ENTRAR", exact: true }).click();
  if (codigo) {
    await pagina.getByLabel("Código de ativação", { exact: true }).fill(codigo);
    await pagina
      .getByRole("button", { name: "ATIVAR CONTA", exact: true })
      .click();
    await pagina
      .getByRole("button", { name: "Ir para o início", exact: true })
      .click();
  }
  await expect(pagina).toHaveURL("http://127.0.0.1:8081/inicio");
  return (await (await respostaAcesso).json()).sessao;
}
