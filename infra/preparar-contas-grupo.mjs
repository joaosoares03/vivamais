import { randomInt, randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const raiz = fileURLToPath(new URL("../", import.meta.url));
const argumentos = process.argv.slice(2);
const ler = (chave, padrao) => {
  const i = argumentos.indexOf(chave);
  return i < 0 ? padrao : argumentos[i + 1];
};
const quantidade = Number(ler("--participantes", "1")),
  email = ler("--email", ""),
  base = ler("--api", "");
if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 25)
  throw new Error("Use de 1 a 25 participantes por lote.");
const endereco = new URL(base);
if (
  endereco.protocol !== "https:" ||
  endereco.username ||
  endereco.password ||
  endereco.search ||
  endereco.hash ||
  endereco.pathname !== "/"
)
  throw new Error(
    "Use a origem HTTPS autorizada da homologação, sem credenciais ou parâmetros.",
  );
if (
  !argumentos.includes("--confirmar-somente-sinteticos") ||
  !process.env.VIVA_GRUPO_SENHA_PROFISSIONAL ||
  !email
)
  throw new Error(
    "Confirme dados somente sintéticos e informe o profissional e a senha por variável privada de processo.",
  );
const lote = randomUUID(),
  saida = path.join(raiz, ".local", "grupo", `convites-${lote}.json`);
await mkdir(path.dirname(saida), { recursive: true });
const entrega = {
  lote,
  ambiente: "HOMOLOGACAO_SINTETICA",
  estado: "EM_PREPARACAO",
  participantes: [],
};
await writeFile(saida, JSON.stringify(entrega, null, 2), {
  flag: "wx",
  mode: 0o600,
});
let token;
async function requisicao(caminho, corpo, metodo = corpo ? "POST" : "GET") {
  const retorno = await fetch(`${endereco.origin}/api/v1${caminho}`, {
    method: metodo,
    redirect: "error",
    signal: AbortSignal.timeout(20000),
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(corpo && !(corpo instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...(corpo
      ? { body: corpo instanceof FormData ? corpo : JSON.stringify(corpo) }
      : {}),
  });
  if (!retorno.ok)
    throw new Error(
      `A preparação parou em uma etapa com HTTP ${retorno.status}. Consulte o arquivo privado do lote; não repita sem conferir as contas criadas.`,
    );
  return retorno.status === 204 ? undefined : retorno.json();
}
function cpfFicticio() {
  const digitos = Array.from({ length: 9 }, () => randomInt(10));
  for (const tamanho of [9, 10]) {
    const soma = digitos.reduce((s, n, i) => s + n * (tamanho + 1 - i), 0);
    const resto = 11 - (soma % 11);
    digitos.push(resto >= 10 ? 0 : resto);
  }
  return digitos.join("");
}
try {
  token = (
    await requisicao("/auth/login", {
      email,
      password: process.env.VIVA_GRUPO_SENHA_PROFISSIONAL,
    })
  ).accessToken;
  const hoje = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()),
    agora = new Date().toISOString();
  for (let i = 1; i <= quantidade; i++) {
    const criado = await requisicao("/patients", {
      displayName: `Participante ${i} — FICTÍCIO · ${lote.slice(0, 8)}`,
      modality: "APP",
      cpf: cpfFicticio(),
      dataNascimento: "1950-01-01",
      telefone: "+5511900000000",
    });
    const participante = {
      numero: i,
      idPaciente: criado.patient.id,
      estado: "CADASTRADO",
    };
    entrega.participantes.push(participante);
    await writeFile(saida, JSON.stringify(entrega, null, 2), { mode: 0o600 });
    if (criado.acesso?.estado !== "TESTE_POR_CONVITE")
      throw new Error(
        "A API não está no modo de convites. Preparação interrompida.",
      );
    const rota = `/patients/${participante.idPaciente}`;
    await requisicao(rota + "/medications", {
      name: "Medicamento fictício de teste",
      dosagem: "Exemplo sem uso clínico",
      instruction:
        "Registro exclusivamente sintético. Não utilizar como orientação de tratamento.",
      startsOn: hoje,
      timeZone: "America/Sao_Paulo",
      schedules: ["08:00", "20:00"],
    });
    await requisicao(rota + "/readings", {
      id: randomUUID(),
      systolic: 118,
      diastolic: 76,
      pulse: 72,
      measuredAt: agora,
      source: "PROFESSIONAL",
    });
    await requisicao(rota + "/consultations", {
      id: randomUUID(),
      occurredAt: agora,
      notes: "Ensaio acadêmico sintético",
      goals: "Testar navegação e registro",
      carePlan: "Utilizar somente dados fictícios neste ensaio.",
    });
    await requisicao(rota + "/activities", {
      id: randomUUID(),
      type: "Atividade fictícia do ensaio",
      durationMinutes: 10,
      occurredAt: agora,
      notes: "Autorrelato sintético, sem recomendação clínica.",
      feeling: "WELL",
    });
    const imagem = new FormData();
    imagem.set("purpose", "MEAL");
    imagem.set(
      "file",
      new Blob(
        [
          await readFile(
            path.join(
              raiz,
              "assets/images/individuais/04_objetos/refeicao_saudavel.png",
            ),
          ),
        ],
        { type: "image/png" },
      ),
      "ilustracao-sintetica.png",
    );
    const arquivo = await requisicao(rota + "/files", imagem);
    await requisicao(rota + "/meals", {
      fileId: arquivo.id,
      occurredAt: agora,
      notes:
        "Ilustração sintética do projeto para ensaio de alimentação; sem análise clínica.",
    });
    const diario = await requisicao("/patients", {
      displayName: `Diário ${i} — FICTÍCIO · ${lote.slice(0, 8)}`,
      modality: "BRACELET_DIARY",
      telefone: "+5511900000000",
    });
    participante.idDiario = diario.patient.id;
    await requisicao(`/patients/${participante.idDiario}/diary`, {
      id: randomUUID(),
      occurredAt: agora,
      notes: "Transcrição fictícia de teste",
      medicationReport: "Relato sintético sem uso clínico",
      systolic: 118,
      diastolic: 76,
    });
    const convite = await requisicao(rota + "/test-invites", {
      senhaProfissional: process.env.VIVA_GRUPO_SENHA_PROFISSIONAL,
      validadeDias: 7,
    });
    Object.assign(participante, {
      estado: "PRONTO",
      convite: convite.convite,
      expiraEm: convite.expiraEm,
      link: `vivamais-teste://convite#${convite.convite}`,
    });
    await writeFile(saida, JSON.stringify(entrega, null, 2), { mode: 0o600 });
  }
  entrega.estado = "PRONTO";
  await writeFile(saida, JSON.stringify(entrega, null, 2), { mode: 0o600 });
  console.log(
    `Contas e convites salvos em arquivo privado: ${saida}. Entregue somente o convite individual correspondente; não publique o lote.`,
  );
} catch {
  entrega.estado = "INCOMPLETO_REVISAR";
  await writeFile(saida, JSON.stringify(entrega, null, 2), { mode: 0o600 });
  console.error(
    "Preparação incompleta. Revise o arquivo privado do lote e os pacientes no portal antes de repetir. Nenhum segredo foi exibido.",
  );
  process.exitCode = 1;
} finally {
  if (token)
    await requisicao("/auth/logout", undefined, "POST").catch(() => undefined);
  delete process.env.VIVA_GRUPO_SENHA_PROFISSIONAL;
}
