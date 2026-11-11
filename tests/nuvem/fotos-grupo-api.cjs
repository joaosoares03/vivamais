const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  assert = require("node:assert/strict");
const raiz = path.resolve(__dirname, "../..");
const origem = "https://viva-api-paciente-homologacao.up.railway.app";
// Sem criação de recursos, mensagens externas, dados pessoais ou acesso ao convite do proprietário.
module.exports = async function validarFotosGrupo() {
  const senha = JSON.parse(
    fs.readFileSync(path.join(raiz, ".local/nuvem/credenciais.json"), "utf8"),
  ).senhaInicial;
  const verificacoes = [],
    integrantes = [];
  let etapa = "início",
    admin;
  function conferir(valor, nome) {
    assert.ok(valor, nome);
    verificacoes.push(nome);
  }
  async function api(rota, token, corpo, esperado = 200) {
    const resposta = await fetch(origem + "/api/v1" + rota, {
      method: corpo === undefined ? "GET" : "POST",
      headers: {
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(corpo && !(corpo instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body:
        corpo instanceof FormData
          ? corpo
          : corpo === undefined
            ? undefined
            : JSON.stringify(corpo),
      redirect: "error",
      signal: AbortSignal.timeout(60000),
    });
    assert.equal(
      resposta.status,
      esperado,
      etapa + ": HTTP " + resposta.status,
    );
    return esperado === 204 ? null : resposta.json();
  }
  try {
    etapa = "login administrador";
    admin = (
      await api("/auth/login", null, {
        email: "admin.a@demo.vivamais.invalid",
        password: senha,
      })
    ).accessToken;
    etapa = "criação profissional individual";
    const profissional = await api("/grupo-testes", admin, {
      nome: "Profissional do ensaio remoto",
      papel: "PROFESSIONAL",
      validadeDias: 1,
      senhaProfissional: senha,
    });
    integrantes.push(profissional.id);
    const senhaIndividual = crypto.randomBytes(24).toString("base64url");
    const ativacao = await api("/auth/grupo/ativar-profissional", null, {
      convite: profissional.convite,
      senha: senhaIndividual,
    });
    await api(
      "/auth/grupo/ativar-profissional",
      null,
      { convite: profissional.convite, senha: senhaIndividual },
      401,
    );
    conferir(true, "Convite profissional de uso único");
    const sessao = await api("/auth/login", null, {
      email: ativacao.email,
      password: senhaIndividual,
    });
    conferir(
      sessao.user.role === "PROFESSIONAL",
      "Senha individual sem papel administrativo",
    );
    const tokenProfissional = sessao.accessToken;
    await api("/grupo-testes", tokenProfissional, undefined, 403);
    const pacientesProfissional = await api("/patients", tokenProfissional);
    conferir(
      pacientesProfissional.length === 1,
      "Profissional recebe paciente fictício exclusivo",
    );
    etapa = "paciente por convite";
    const paciente = await api("/grupo-testes", admin, {
      nome: "Paciente do ensaio remoto",
      papel: "PATIENT",
      validadeDias: 1,
      senhaProfissional: senha,
      idProfissional: sessao.user.id,
    });
    integrantes.push(paciente.id);
    const acesso = await api("/auth/testadores/convite", null, {
      convite: paciente.convite,
      tipo: "NATIVO",
    });
    const tokenPaciente = acesso.sessao.accessToken;
    await api(
      "/auth/testadores/convite",
      null,
      { convite: paciente.convite, tipo: "NATIVO" },
      401,
    );
    const ficha = await api("/patients/me", tokenPaciente);
    const idPaciente = ficha.id;
    await api(
      `/patients/${pacientesProfissional[0].id}/meals`,
      tokenPaciente,
      undefined,
      403,
    );
    conferir(true, "Paciente não acessa o paciente exclusivo do profissional");
    const outro = await api("/grupo-testes", admin, {
      nome: "Paciente isolado do ensaio",
      papel: "PATIENT",
      validadeDias: 1,
      senhaProfissional: senha,
    });
    integrantes.push(outro.id);
    const listado = await api("/grupo-testes", admin);
    const idOutro = listado.find((i) => i.id === outro.id).idPaciente;
    await api(`/patients/${idOutro}/meals`, tokenProfissional, undefined, 403);
    conferir(true, "Profissional sem vínculo não consulta a refeição");
    conferir(
      !JSON.stringify(listado).includes(profissional.convite) &&
        !JSON.stringify(listado).includes(paciente.convite),
      "Listagem não revela convites",
    );
    etapa = "upload original acima de 2 MiB";
    const original = fs.readFileSync(
      path.join(raiz, ".local/fotos-validacao/ruido.png"),
    );
    conferir(original.length > 2097152, "Fixture PNG original acima de 2 MiB");
    const formulario = new FormData();
    formulario.set("purpose", "MEAL");
    formulario.set(
      "file",
      new Blob([original], { type: "application/octet-stream" }),
      "conteudo-sem-extensao.bin",
    );
    const arquivo = await api(
      `/patients/${idPaciente}/files`,
      tokenPaciente,
      formulario,
    );
    conferir(
      arquivo.byteSize <= 2097152 && arquivo.mimeType === "image/png",
      "API valida conteúdo e reduz o original para PNG limitado",
    );
    etapa = "persistência e idempotência da refeição";
    const entrada = {
      fileId: arquivo.id,
      occurredAt: new Date().toISOString(),
      notes: "Fotografia sintética acima de 2 MiB, ensaio de homologação.",
    };
    const refeicao = await api(
      `/patients/${idPaciente}/meals`,
      tokenPaciente,
      entrada,
    );
    const repetida = await api(
      `/patients/${idPaciente}/meals`,
      tokenPaciente,
      entrada,
    );
    conferir(
      refeicao.id === repetida.id,
      "Reenvio do registro não duplica a refeição",
    );
    const historico = await api(`/patients/${idPaciente}/meals`, tokenPaciente);
    conferir(
      historico.items.some((i) => i.fileId === arquivo.id),
      "Histórico recupera a refeição persistida",
    );
    const listaProfissional = await api(
      `/patients/${idPaciente}/meals`,
      tokenProfissional,
    );
    conferir(
      listaProfissional.items.some((i) => i.fileId === arquivo.id),
      "Profissional vinculado consulta a mesma refeição",
    );
    etapa = "recuperação privada do Storage";
    const link = await api(`/files/${arquivo.id}/link`, tokenPaciente, {});
    const resposta = await fetch(origem + link.path, {
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
    assert.equal(resposta.status, 200);
    const recuperada = Buffer.from(await resposta.arrayBuffer());
    conferir(
      recuperada
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
        recuperada.length === arquivo.byteSize,
      "Objeto cifrado no Storage é recuperado como PNG autorizado",
    );
    const invalido = new FormData();
    invalido.set("purpose", "MEAL");
    invalido.set(
      "file",
      new Blob(["<svg><script>teste</script></svg>"], { type: "image/png" }),
      "foto.png",
    );
    await api(`/patients/${idPaciente}/files`, tokenPaciente, invalido, 415);
    conferir(true, "Servidor recusa SVG disfarçado de PNG");
    etapa = "IA não habilitada";
    const estado = await api("/food/status", tokenPaciente);
    conferir(
      estado.enabled === false && estado.status === "DISABLED",
      "Estado real informa IA não habilitada",
    );
    const analise = await api(
      `/meals/${refeicao.id}/analyze`,
      tokenPaciente,
      {},
    );
    conferir(
      analise.providerCalled === false && analise.status === "UNAVAILABLE",
      "Solicitação de análise não chama fornecedor ou inventa resultado",
    );
    etapa = "revogação do paciente e foto";
    const linkRecente = await api(
      `/files/${arquivo.id}/link`,
      tokenPaciente,
      {},
    );
    await api(`/grupo-testes/${paciente.id}/desativar`, admin, {}, 204);
    await api("/patients/me", tokenPaciente, undefined, 401);
    await api(
      "/auth/testadores/renovar",
      null,
      { tipo: "NATIVO", credencialRenovacao: acesso.credencialRenovacao },
      401,
    );
    assert.equal((await fetch(origem + linkRecente.path)).status, 403);
    conferir(
      true,
      "Desativação invalida sessão, renovação e link privado existente",
    );
    etapa = "reemissão profissional";
    const novo = await api(`/grupo-testes/${profissional.id}/convite`, admin, {
      senhaProfissional: senha,
      validadeDias: 1,
    });
    await api("/auth/me", tokenProfissional, undefined, 401);
    await api(
      "/auth/login",
      null,
      { email: ativacao.email, password: senhaIndividual },
      401,
    );
    const novaSenha = crypto.randomBytes(24).toString("base64url");
    await api("/auth/grupo/ativar-profissional", null, {
      convite: novo.convite,
      senha: novaSenha,
    });
    const novaSessao = await api("/auth/login", null, {
      email: ativacao.email,
      password: novaSenha,
    });
    conferir(
      novaSessao.user.role === "PROFESSIONAL",
      "Reemissão exige nova senha e encerra acesso anterior",
    );
    const relatorio = {
      quando: new Date().toISOString(),
      origem,
      aprovado: true,
      verificacoes,
      originalBytes: original.length,
      armazenadoBytes: recuperada.length,
      aparelhoFisico: false,
    };
    fs.mkdirSync(path.join(raiz, "docs/evidencias/fotos-grupo"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(raiz, "docs/evidencias/fotos-grupo/api.json"),
      JSON.stringify(relatorio, null, 2),
    );
    return relatorio;
  } catch (falha) {
    throw new Error(
      "Falha no ensaio remoto em: " +
        etapa +
        ". " +
        String(falha.message).slice(0, 170),
    );
  } finally {
    if (admin)
      for (const id of integrantes)
        try {
          await api(`/grupo-testes/${id}/desativar`, admin, {}, 204);
        } catch {
          /* Não expor tokens ou repetir criação de contas. */
        }
  }
};
if (require.main === module)
  module
    .exports()
    .then((r) => console.log(JSON.stringify(r)))
    .catch((f) => {
      console.error(f.message);
      process.exitCode = 1;
    });
