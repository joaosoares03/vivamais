import { cadastrarComCodigo, entrarNaTela } from "./apoio-acesso-paciente";
import { test, expect } from "@playwright/test";
const api = process.env.API_BASE_URL || "http://127.0.0.1:8080",
  aplicativo = "http://127.0.0.1:8081";
test("rotas em português: revisão, resultado persistido e fila sem duplicação", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const senha = process.env.E2E_PASSWORD;
  test.skip(!senha, "Defina credencial sintética no ambiente seguro.");
  const respostaProfissional = await request.post(`${api}/api/v1/auth/login`, {
    data: { email: "profissional.a@demo.vivamais.invalid", password: senha },
  });
  expect(respostaProfissional.status()).toBe(200);
  const profissional = await respostaProfissional.json(),
    cabecalhos = { Authorization: `Bearer ${profissional.accessToken}` },
    email = `rotas-${Date.now()}@demo.invalid`;
  const criado = await cadastrarComCodigo(request, cabecalhos, {
    displayName: "Pessoa Sintetica Rotas",
    modality: "APP",
    email,
  });
  const paciente = await entrarNaTela(
    page,
    criado.cpf,
    criado.dataNascimento,
    criado.activationToken,
  );
  await page.getByTestId("module-blood-pressure").click();
  await page
    .getByRole("button", { name: "Digitar os valores", exact: true })
    .click();
  await page.getByLabel("Sistólica", { exact: true }).fill("11");
  await page.getByLabel("Diastólica", { exact: true }).fill("7");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByText("Identificamos que você digitou 11 por 7.", {
      exact: false,
    }),
  ).toBeVisible();
  let registros = await (
    await request.get(`${api}/api/v1/patients/${criado.patient.id}/readings`, {
      headers: cabecalhos,
    })
  ).json();
  expect(registros.total).toBe(0);
  await page
    .getByRole("button", { name: "Sim, está correto", exact: true })
    .click();
  await expect(
    page.getByText("Pressão registrada com sucesso!", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("110 / 70", { exact: false })).toBeVisible();
  const envios: string[] = [];
  await page.route("**/api/v1/patients/*/readings", async (rota) => {
    if (rota.request().method() === "POST") {
      envios.push(rota.request().postData() || "");
      await rota.abort("internetdisconnected");
    } else await rota.continue();
  });
  await page
    .getByRole("button", { name: "Registrar novamente", exact: true })
    .click();
  await page.getByLabel("Sistólica", { exact: true }).fill("118");
  await page.getByLabel("Diastólica", { exact: true }).fill("76");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page
    .getByRole("button", { name: "Sim, está correto", exact: true })
    .click();
  await expect(
    page.getByText("Registro protegido, aguardando sincronização", {
      exact: true,
    }),
  ).toBeVisible();
  await page.unroute("**/api/v1/patients/*/readings");
  await page
    .getByRole("button", { name: "Atualizar registro", exact: true })
    .click();
  await expect(
    page.getByText("Pressão registrada com sucesso!", { exact: true }),
  ).toBeVisible({ timeout: 25000 });
  expect(envios.length).toBeGreaterThan(0);
  expect(
    (
      await request.post(
        `${api}/api/v1/patients/${criado.patient.id}/readings`,
        {
          headers: { Authorization: `Bearer ${paciente.accessToken}` },
          data: JSON.parse(envios[0]!),
        },
      )
    ).status(),
  ).toBe(200);
  registros = await (
    await request.get(`${api}/api/v1/patients/${criado.patient.id}/readings`, {
      headers: cabecalhos,
    })
  ).json();
  expect(registros.total).toBe(2);
  const idRegistro = registros.items[0].id,
    respostaOutraConta = await request.post(`${api}/api/v1/auth/login`, {
      data: { email: "profissional.b@demo.vivamais.invalid", password: senha },
    }),
    outraConta = await respostaOutraConta.json();
  expect(
    (
      await request.get(
        `${api}/api/v1/pacientes/${criado.patient.id}/registros-pressao/${idRegistro}`,
        { headers: { Authorization: `Bearer ${outraConta.accessToken}` } },
      )
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.put(
        `${api}/api/v1/patients/${criado.patient.id}/activity-profile`,
        {
          headers: cabecalhos,
          data: {
            mobility: "Perfil sintético de mobilidade",
            balance: "Perfil sintético de equilíbrio",
            restrictions: "Restrições sintéticas para teste",
            professionalGuidance: "Orientação sintética registrada pela equipe",
          },
        },
      )
    ).status(),
  ).toBe(200);
  await page
    .getByRole("button", { name: "Ver meu histórico", exact: true })
    .click();
  await page.getByRole("button", { name: "Semana", exact: true }).click();
  await expect(page.getByText("118 / 76 mmHg", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await page.getByTestId("module-activity").click();
  await page
    .getByRole("button", { name: "Ver minhas informações", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Continuar", exact: true }),
  ).toBeDisabled();
  await page.getByRole("radio", { name: "Estou bem", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByText("118 / 76 mmHg", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuar", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("radio", { name: "Sim, já verifiquei", exact: true })
    .click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByText("Perfil sintético de mobilidade", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ver materiais da atividade", exact: true })
    .click();
  await expect(
    page.getByText("Roteiro de atividade bloqueado", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Roteiro educativo aprovado pela equipe", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ver materiais aprovados", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Registrar atividade já realizada",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Estou bem", exact: true }).click();
  await page
    .getByLabel("Atividade realizada", { exact: true })
    .fill("Movimento sintético de teste");
  await page.getByLabel("Duração em minutos", { exact: true }).fill("10");
  await page
    .getByRole("button", { name: "Registrar atividade realizada", exact: true })
    .click();
  await expect(
    page.getByText("Movimento sintético de teste", { exact: true }),
  ).toBeVisible();
  const atividades = await (
    await request.get(
      `${api}/api/v1/patients/${criado.patient.id}/activities`,
      { headers: cabecalhos },
    )
  ).json();
  expect(atividades.total).toBe(1);
  expect(atividades.items[0].type).toBe("Movimento sintético de teste");
  for (const token of [
    profissional.accessToken,
    paciente.accessToken,
    outraConta.accessToken,
  ])
    await request.post(`${api}/api/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
});
