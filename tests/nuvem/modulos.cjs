const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const assert = require("node:assert/strict");
const raiz = path.resolve(__dirname, "../.."),
  privado = path.join(raiz, ".local/nuvem");
const senha =
  process.env.VIVA_NUVEM_SENHA ||
  JSON.parse(fs.readFileSync(path.join(privado, "credenciais.json"), "utf8"))
    .senhaInicial;
const dados = JSON.parse(
  fs.readFileSync(path.join(privado, "validacao-api.json"), "utf8"),
);
const origem = "https://viva-api-paciente-homologacao.up.railway.app";
let etapa = "login";
async function api(
  rota,
  token,
  corpo,
  metodo = corpo ? "POST" : "GET",
  esperado = 200,
) {
  etapa = metodo + " " + rota.split("?")[0];
  const r = await fetch(origem + "/api/v1" + rota, {
    method: metodo,
    signal: AbortSignal.timeout(30000),
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(corpo && !(corpo instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body:
      corpo instanceof FormData
        ? corpo
        : corpo
          ? JSON.stringify(corpo)
          : undefined,
  });
  assert.equal(r.status, esperado);
  return esperado === 204 ? null : r.json();
}
(async () => {
  const profissional = (
    await api("/auth/login", null, {
      email: "profissional.a@demo.vivamais.invalid",
      password: senha,
    })
  ).accessToken;
  const convite = await api(
    `/patients/${dados.paciente}/test-invites`,
    profissional,
    { senhaProfissional: senha, validadeDias: 1 },
  );
  const sessao = await api("/auth/testadores/convite", null, {
    convite: convite.convite,
    tipo: "NATIVO",
  });
  const paciente = sessao.sessao.accessToken;
  const atividade = {
    id: crypto.randomUUID(),
    type: "Registro sintetico sem exercicio real",
    durationMinutes: 1,
    occurredAt: new Date().toISOString(),
    notes: "Somente ensaio tecnico",
    feeling: "WELL",
  };
  await api(`/patients/${dados.paciente}/activities`, paciente, atividade);
  assert.ok(
    (
      await api(`/patients/${dados.paciente}/activities`, profissional)
    ).items.some((x) => x.id === atividade.id),
  );
  await api(
    `/patients/${dados.outroPaciente}/activities`,
    paciente,
    null,
    "GET",
    403,
  );
  const perfil = await api(
    `/pacientes/${dados.paciente}/dados-pessoais`,
    paciente,
  );
  assert.equal(perfil.idPaciente, dados.paciente);
  await api(
    `/pacientes/${dados.outroPaciente}/dados-pessoais`,
    paciente,
    null,
    "GET",
    403,
  );
  const consultas = await api("/pacientes/me/consultas", paciente);
  assert.ok(consultas.total >= 1);
  assert.ok(!Object.hasOwn(consultas.items[0], "notes"));
  const todos = await api("/patients", profissional);
  const diario = todos.find((x) => x.modality === "BRACELET_DIARY");
  assert.ok(diario);
  const entrada = {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    medicationReport: "Relato ficticio de ensaio",
    notes: "Registro sintetico, sem uso clinico",
  };
  await api(`/patients/${diario.id}/diary`, profissional, entrada);
  assert.ok(
    (await api(`/patients/${diario.id}/diary`, profissional)).items.some(
      (x) => x.id === entrada.id,
    ),
  );
  const planos = await api(
    `/patients/${dados.paciente}/medications`,
    profissional,
  );
  const plano = planos.find((x) => x.id === dados.plano);
  assert.ok(plano);
  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const amanha = new Date(hoje + "T12:00:00Z");
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  const futuro = amanha.toISOString().slice(0, 10);
  await api(
    `/medications/${plano.id}`,
    profissional,
    {
      name: plano.name,
      instruction: "Exemplo sintetico sem uso clinico",
      dosagem: "Exemplo futuro de teste",
      startsOn: futuro,
      timeZone: "America/Sao_Paulo",
      schedules: ["09:00"],
      version: plano.version,
    },
    "PUT",
  );
  const antigo = (
    await api(
      `/patients/${dados.paciente}/medication-agenda?from=${hoje}&to=${hoje}`,
      profissional,
    )
  ).dias[0];
  assert.equal(antigo.resumo.tomadas, 1);
  assert.equal(antigo.resumo.naoTomadas, 1);
  assert.equal(antigo.eventos.length, 2);
  const novo = (
    await api(
      `/patients/${dados.paciente}/medication-agenda?from=${futuro}&to=${futuro}`,
      profissional,
    )
  ).dias[0];
  assert.equal(novo.eventos.length, 1);
  assert.equal(novo.eventos[0].dosagem, "Exemplo futuro de teste");
  assert.ok(
    (await api(`/medications/${plano.id}/history`, profissional)).length >= 1,
  );
  const analise = await api(`/meals/${dados.refeicao}/analyze`, paciente, {});
  assert.equal(analise.status, "UNAVAILABLE");
  assert.equal(analise.providerCalled, false);
  const imagem = new FormData();
  imagem.set("purpose", "PRESSURE_DISPLAY");
  imagem.set(
    "file",
    new Blob(
      [fs.readFileSync(path.join(raiz, "assets/images/visor-exemplo.png"))],
      { type: "image/png" },
    ),
    "visor-sintetico.png",
  );
  const arquivo = await api(
    `/patients/${dados.paciente}/files`,
    paciente,
    imagem,
  );
  const ocr = await api(`/files/${arquivo.id}/ocr`, paciente, {});
  assert.equal(ocr.confirmationRequired, true);
  assert.ok(["RECOGNIZED", "UNREADABLE", "UNAVAILABLE"].includes(ocr.status));
  await api(
    `/patients/${dados.paciente}/test-invites/${convite.id}/revoke`,
    profissional,
    {},
    "POST",
    204,
  );
  await api("/auth/logout", profissional, {}, "POST", 204);
  const resultado = {
    quando: new Date().toISOString(),
    aprovado: true,
    atividadePersistida: true,
    atividadeIsolada: true,
    perfilIsolado: true,
    consultaPacienteSemNotasInternas: true,
    diarioPersistido: true,
    edicaoPreservaDosesAnteriores: true,
    agendaFuturaAtualizada: true,
    iaExternaDesligada: true,
    ocr: {
      status: ocr.status,
      confirmacaoObrigatoria: true,
      provedorDisponivel: ocr.status !== "UNAVAILABLE",
    },
  };
  fs.writeFileSync(
    path.join(raiz, "docs/evidencias/nuvem-2026-11-04/modulos-api.json"),
    JSON.stringify(resultado, null, 2),
  );
  console.log(JSON.stringify(resultado));
})().catch(() => {
  console.error(
    "Verificacao adicional interrompida em " +
      etapa +
      "; nenhum segredo exibido.",
  );
  process.exitCode = 1;
});
