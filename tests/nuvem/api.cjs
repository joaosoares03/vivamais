const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const assert = require("node:assert/strict");
const raiz = path.resolve(__dirname, "../..");
const privado = path.join(raiz, ".local/nuvem");
const senhaInicial =
  process.env.VIVA_NUVEM_SENHA ||
  JSON.parse(fs.readFileSync(path.join(privado, "credenciais.json"), "utf8"))
    .senhaInicial;
fs.mkdirSync(privado, { recursive: true });
const origem = "https://viva-api-paciente-homologacao.up.railway.app";
const verificacoes = [];
let etapa = "saude";
function conferir(condicao, nome) {
  assert.ok(condicao, nome);
  verificacoes.push(nome);
}
async function chamada(
  caminho,
  { metodo = "GET", token, corpo, headers = {}, esperado = 200 } = {},
) {
  etapa = metodo + " " + caminho.split("?")[0];
  const resposta = await fetch(origem + caminho, {
    method: metodo,
    redirect: "error",
    signal: AbortSignal.timeout(30000),
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(corpo && !(corpo instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    body:
      corpo instanceof FormData
        ? corpo
        : corpo
          ? JSON.stringify(corpo)
          : undefined,
  });
  assert.equal(resposta.status, esperado, etapa + " status");
  const tipo = resposta.headers.get("content-type") || "";
  const dados = tipo.includes("json")
    ? await resposta.json()
    : await resposta.arrayBuffer();
  return { resposta, dados };
}
async function api(caminho, opcoes) {
  return chamada("/api/v1" + caminho, opcoes);
}
async function login(unidade) {
  return (
    await api("/auth/login", {
      metodo: "POST",
      corpo: {
        email: `profissional.${unidade}@demo.vivamais.invalid`,
        password: senhaInicial,
      },
    })
  ).dados.accessToken;
}
function pngSintetico() {
  const crc = (b) => {
    let c = 0xffffffff;
    for (const v of b) {
      c ^= v;
      for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  };
  const bloco = (tipo, b) => {
    const t = Buffer.from(tipo),
      n = Buffer.alloc(4),
      c = Buffer.alloc(4);
    n.writeUInt32BE(b.length);
    c.writeUInt32BE(crc(Buffer.concat([t, b])));
    return Buffer.concat([n, t, b, c]);
  };
  const h = Buffer.alloc(13);
  h.writeUInt32BE(24);
  h.writeUInt32BE(24, 4);
  h[8] = 8;
  h[9] = 2;
  const pixels = Buffer.alloc(24 * (1 + 24 * 3));
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 24; x++) {
      const n = y * 73 + 1 + x * 3;
      pixels[n] = 20;
      pixels[n + 1] = 120;
      pixels[n + 2] = 190;
    }
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    bloco("IHDR", h),
    bloco("IDAT", zlib.deflateSync(pixels)),
    bloco("IEND", Buffer.alloc(0)),
  ]);
}
(async () => {
  conferir(
    (await chamada("/actuator/health/readiness")).dados.status === "UP",
    "readiness com PostgreSQL",
  );
  await api("/patients", { esperado: 401 });
  verificacoes.push("consulta anonima negada");
  const profissional = await login("a"),
    outroProfissional = await login("b");
  conferir(
    !!profissional && !!outroProfissional,
    "login profissional das duas unidades",
  );
  await api("/dashboard", { token: profissional });
  verificacoes.push("painel autenticado");
  const cpfSintetico = () => {
    const n = Array.from({ length: 9 }, () => crypto.randomInt(10));
    for (const m of [9, 10]) {
      const r = 11 - (n.reduce((s, v, i) => s + v * (m + 1 - i), 0) % 11);
      n.push(r >= 10 ? 0 : r);
    }
    return n.join("");
  };
  const criar = async () =>
    (
      await api("/patients", {
        metodo: "POST",
        token: profissional,
        corpo: {
          displayName: "Ensaio Nuvem DEMO " + crypto.randomUUID().slice(0, 8),
          modality: "APP",
          cpf: cpfSintetico(),
          dataNascimento: "1950-01-01",
          telefone: "+5511990000002",
        },
      })
    ).dados.patient.id;
  const paciente = await criar(),
    outroPaciente = await criar();
  conferir(!!paciente && !!outroPaciente, "cadastro sintetico persistido");
  await api("/patients/" + paciente, {
    token: outroProfissional,
    esperado: 403,
  });
  verificacoes.push("isolamento entre unidades");
  const emitir = async (id) =>
    (
      await api(`/patients/${id}/test-invites`, {
        metodo: "POST",
        token: profissional,
        corpo: { senhaProfissional: senhaInicial, validadeDias: 1 },
      })
    ).dados;
  const convite = await emitir(paciente),
    conviteOutro = await emitir(outroPaciente);
  const entrar = async (segredo) =>
    await api("/auth/testadores/convite", {
      metodo: "POST",
      headers: { Origin: origem },
      corpo: { convite: segredo, tipo: "WEB" },
    });
  const entrada = await entrar(convite.convite),
    outro = await entrar(conviteOutro.convite);
  const token = entrada.dados.sessao.accessToken,
    tokenOutro = outro.dados.sessao.accessToken;
  const cookie = entrada.resposta.headers.get("set-cookie");
  conferir(
    cookie?.includes("Secure") &&
      cookie.includes("HttpOnly") &&
      cookie.includes("SameSite=Strict"),
    "cookie WEB protegido",
  );
  conferir(!entrada.dados.credencialRenovacao, "renovacao ausente do JSON WEB");
  await api("/auth/testadores/convite", {
    metodo: "POST",
    headers: { Origin: origem },
    corpo: { convite: convite.convite, tipo: "WEB" },
    esperado: 401,
  });
  verificacoes.push("convite sem reutilizacao");
  await api(`/patients/${paciente}/readings`, {
    token: tokenOutro,
    esperado: 403,
  });
  verificacoes.push("isolamento entre pacientes");
  const leitura = {
    id: crypto.randomUUID(),
    systolic: 118,
    diastolic: 76,
    pulse: 71,
    measuredAt: new Date(Date.now() - 60000).toISOString(),
    source: "MANUAL",
  };
  for (let i = 0; i < 2; i++)
    await api(`/patients/${paciente}/readings`, {
      metodo: "POST",
      token,
      corpo: leitura,
    });
  conferir(
    (await api(`/patients/${paciente}/readings`, { token: profissional })).dados
      .total === 1,
    "pressao idempotente compartilhada com profissional",
  );
  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const plano = (
    await api(`/patients/${paciente}/medications`, {
      metodo: "POST",
      token: profissional,
      corpo: {
        name: "Plano ficticio para ensaio tecnico",
        instruction: "Exemplo sintetico sem uso clinico",
        dosagem: "Exemplo de teste",
        startsOn: hoje,
        timeZone: "America/Sao_Paulo",
        schedules: ["08:00", "20:00"],
      },
    })
  ).dados;
  const eventos = (
    await api(`/patients/${paciente}/medication-events?date=${hoje}`, { token })
  ).dados;
  conferir(eventos.length === 2, "agenda com dois horarios");
  const relato = {
    id: crypto.randomUUID(),
    planId: plano.id,
    scheduledAt: eventos[0].scheduledAt,
    status: "TAKEN",
    reportedAt: new Date().toISOString(),
  };
  for (let i = 0; i < 2; i++)
    await api(`/patients/${paciente}/medication-reports`, {
      metodo: "POST",
      token,
      corpo: relato,
    });
  const repetido = await api(`/patients/${paciente}/medication-reports`, {
    metodo: "POST",
    token,
    corpo: { ...relato, id: crypto.randomUUID() },
  });
  conferir(
    repetido.dados.id === relato.id,
    "repeticao de dose retorna registro original",
  );
  await api(`/patients/${paciente}/medication-reports`, {
    metodo: "POST",
    token,
    corpo: { ...relato, id: crypto.randomUUID(), status: "NOT_TAKEN" },
    esperado: 409,
  });
  await api(`/patients/${paciente}/medication-reports`, {
    metodo: "POST",
    token,
    corpo: {
      ...relato,
      id: crypto.randomUUID(),
      scheduledAt: eventos[1].scheduledAt,
      status: "NOT_TAKEN",
    },
  });
  const agenda = (
    await api(
      `/patients/${paciente}/medication-agenda?from=${hoje}&to=${hoje}`,
      { token: profissional },
    )
  ).dados;
  conferir(
    agenda.dias[0].resumo.tomadas === 1 &&
      agenda.dias[0].resumo.naoTomadas === 1,
    "autorrelatos persistidos sem duplicidade",
  );
  const dadosFoto = new FormData();
  dadosFoto.set("purpose", "MEAL");
  dadosFoto.set(
    "file",
    new Blob([pngSintetico()], { type: "image/png" }),
    "imagem-sintetica.png",
  );
  const arquivo = (
    await api(`/patients/${paciente}/files`, {
      metodo: "POST",
      token,
      corpo: dadosFoto,
    })
  ).dados;
  conferir(!!arquivo.id, "upload real ao Storage privado");
  const refeicao = (
    await api(`/patients/${paciente}/meals`, {
      metodo: "POST",
      token,
      corpo: {
        fileId: arquivo.id,
        occurredAt: new Date().toISOString(),
        notes: "Imagem sintetica do ensaio de nuvem",
      },
    })
  ).dados;
  conferir(
    (
      await api(`/patients/${paciente}/meals`, { token: profissional })
    ).dados.items.some((x) => x.id === refeicao.id),
    "refeicao visivel ao profissional vinculado",
  );
  await api(`/files/${arquivo.id}/link`, {
    metodo: "POST",
    token: tokenOutro,
    esperado: 403,
  });
  verificacoes.push("foto negada a outro paciente");
  const link = (
    await api(`/files/${arquivo.id}/link`, { metodo: "POST", token })
  ).dados;
  const imagem = await chamada(link.path);
  conferir(
    Buffer.from(imagem.dados)
      .subarray(0, 8)
      .equals(Buffer.from("89504e470d0a1a0a", "hex")),
    "download autorizado da foto",
  );
  const consulta = (
    await api(`/patients/${paciente}/consultations`, {
      metodo: "POST",
      token: profissional,
      corpo: {
        id: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
        notes: "Anotacao ficticia de ensaio tecnico",
        goals: "Verificar persistencia",
        carePlan: "Sem uso clinico",
      },
    })
  ).dados;
  conferir(!!consulta.id, "consulta sintetica persistida");
  await api(`/patients/${paciente}/export`, { token: profissional });
  verificacoes.push("exportacao autorizada");
  const renovada = await api("/auth/testadores/renovar", {
    metodo: "POST",
    headers: { Origin: origem, Cookie: cookie.split(";")[0] },
    corpo: { tipo: "WEB" },
  });
  conferir(!!renovada.dados.sessao.accessToken, "renovacao WEB por cookie");
  await api("/auth/me", { token, esperado: 401 });
  verificacoes.push("sessao anterior revogada apos rotacao");
  await api(`/patients/${paciente}/test-invites/${convite.id}/revoke`, {
    metodo: "POST",
    token: profissional,
    corpo: {},
    esperado: 204,
  });
  await api("/auth/me", {
    token: renovada.dados.sessao.accessToken,
    esperado: 401,
  });
  verificacoes.push("revogacao do convite encerra acesso");
  const final = {
    quando: new Date().toISOString(),
    origem,
    paciente,
    outroPaciente,
    arquivo: arquivo.id,
    refeicao: refeicao.id,
    leitura: leitura.id,
    plano: plano.id,
    consulta: consulta.id,
    verificacoes,
    aprovado: true,
  };
  fs.writeFileSync(
    path.join(privado, "validacao-api.json"),
    JSON.stringify(final, null, 2),
  );
  for (const t of [profissional, outroProfissional, tokenOutro])
    await api("/auth/logout", { metodo: "POST", token: t, esperado: 204 });
  console.log(
    JSON.stringify({
      aprovado: true,
      verificacoes: verificacoes.length,
      relatorio: ".local/nuvem/validacao-api.json",
    }),
  );
})().catch((erro) => {
  fs.writeFileSync(
    path.join(privado, "validacao-api-falha.json"),
    JSON.stringify(
      {
        quando: new Date().toISOString(),
        etapa,
        motivo: String(erro.message).slice(0, 300),
        verificacoes,
        aprovado: false,
      },
      null,
      2,
    ),
  );
  console.error(
    "Validacao remota interrompida em: " +
      etapa +
      ". Detalhes privados salvos sem tokens.",
  );
  process.exitCode = 1;
});
