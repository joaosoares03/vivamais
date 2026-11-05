"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { consultarDominio } from "../services/dominio";
type Integrante = {
  id: string;
  idUsuario: string;
  nome: string;
  papel: "PATIENT" | "PROFESSIONAL";
  idPaciente: string;
  email: string;
  expiraEm: string;
  utilizadoEm: string | null;
  desativadoEm: string | null;
};
type Convite = {
  id: string;
  papel: Integrante["papel"];
  convite: string;
  expiraEm: string;
};
export function GrupoTestes() {
  const [integrantes, definirIntegrantes] = useState<Integrante[]>([]);
  const [convite, definirConvite] = useState<Convite | null>(null);
  const [erro, definirErro] = useState("");
  const [ocupado, definirOcupado] = useState(false);
  const [senha, definirSenha] = useState("");
  const [validade, definirValidade] = useState(7);
  const atualizar = useCallback(
    async () =>
      definirIntegrantes(await consultarDominio<Integrante[]>("/grupo-testes")),
    [],
  );
  useEffect(() => {
    void atualizar().catch(() =>
      definirErro("Não foi possível consultar o grupo."),
    );
  }, [atualizar]);
  async function executar(acao: () => Promise<Convite | void>) {
    if (ocupado) return;
    definirOcupado(true);
    definirErro("");
    definirConvite(null);
    try {
      const novo = await acao();
      if (novo) definirConvite(novo);
      await atualizar();
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Não foi possível concluir.",
      );
    } finally {
      definirOcupado(false);
      definirSenha("");
    }
  }
  function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    void executar(() =>
      consultarDominio<Convite>("/grupo-testes", "POST", {
        nome: dados.get("nome"),
        papel: dados.get("papel"),
        validadeDias: validade,
        senhaProfissional: senha,
        idProfissional: dados.get("idProfissional") || null,
      }),
    );
  }
  const endereco = convite
    ? convite.papel === "PATIENT"
      ? `${process.env.NEXT_PUBLIC_APLICATIVO_URL}/convite#${convite.convite}`
      : `${window.location.origin}/convite-profissional#${convite.convite}`
    : null;
  return (
    <section className="panel padded spaced">
      <h1>Grupo de testes</h1>
      <p>
        Somente dados fictícios. Cada integrante recebe uma conta e um paciente
        de exemplo. Profissionais veem apenas seus vínculos. Use apelidos, sem
        dados pessoais.
      </p>
      {erro && <p role="alert">{erro}</p>}
      <form className="care-form" onSubmit={criar}>
        <label>
          Apelido fictício
          <input name="nome" required maxLength={90} disabled={ocupado} />
        </label>
        <label>
          Perfil
          <select name="papel" disabled={ocupado}>
            <option value="PATIENT">Paciente</option>
            <option value="PROFESSIONAL">Profissional</option>
          </select>
        </label>
        <label>
          Profissional do paciente (opcional)
          <select name="idProfissional" disabled={ocupado}>
            <option value="">Somente o responsável administra</option>
            {integrantes
              .filter(
                (i) =>
                  i.papel === "PROFESSIONAL" &&
                  !i.desativadoEm &&
                  new Date(i.expiraEm).getTime() > Date.now(),
              )
              .map((i) => (
                <option key={i.id} value={i.idUsuario}>
                  {i.nome}
                </option>
              ))}
          </select>
        </label>
        <label>
          Validade
          <select
            value={validade}
            onChange={(e) => definirValidade(Number(e.target.value))}
            disabled={ocupado}
          >
            <option value={1}>1 dia</option>
            <option value={3}>3 dias</option>
            <option value={7}>7 dias</option>
          </select>
        </label>
        <label>
          Sua senha de administrador
          <input
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => definirSenha(e.target.value)}
            required
            maxLength={72}
            disabled={ocupado}
          />
        </label>
        <button className="button button-primary" disabled={ocupado}>
          {ocupado ? "Preparando…" : "Adicionar integrante e gerar convite"}
        </button>
      </form>
      <p>
        Para reemitir, preencha sua senha acima e use o botão do integrante. A
        reemissão encerra o acesso anterior e, para profissionais, exige definir
        uma nova senha. Desativar revoga o acesso imediatamente.
      </p>
      {endereco && (
        <div className="panel padded" role="status">
          <h2>Convite individual</h2>
          <p>
            Copie e entregue por um canal privado. O link é mostrado somente
            agora e vale até{" "}
            {new Date(convite!.expiraEm).toLocaleString("pt-BR")}.
          </p>
          <textarea
            readOnly
            aria-label="Link privado do convite"
            value={endereco}
          />
          <button
            className="button button-secondary"
            onClick={() => {
              void navigator.clipboard
                .writeText(endereco)
                .catch(() => definirErro("Selecione e copie o link acima."));
            }}
          >
            Copiar convite
          </button>
          <button
            className="button button-secondary"
            onClick={() => definirConvite(null)}
          >
            Ocultar convite
          </button>
        </div>
      )}
      <div className="care-grid">
        {integrantes.map((i) => (
          <article key={i.id} className="panel padded">
            <h2>{i.nome}</h2>
            <p>
              {i.papel === "PATIENT" ? "Paciente" : "Profissional"} ·{" "}
              {i.desativadoEm
                ? "Desativado"
                : new Date(i.expiraEm).getTime() <= Date.now()
                  ? "Expirado"
                  : i.utilizadoEm
                    ? "Convite utilizado"
                    : "Aguardando entrada"}
            </p>
            <p>Validade: {new Date(i.expiraEm).toLocaleString("pt-BR")}</p>
            <a href={`/pacientes/${i.idPaciente}`}>Abrir paciente fictício</a>
            <button
              className="button button-secondary"
              disabled={ocupado || !senha}
              onClick={() =>
                void executar(() =>
                  consultarDominio<Convite>(
                    `/grupo-testes/${i.id}/convite`,
                    "POST",
                    { senhaProfissional: senha, validadeDias: validade },
                  ),
                )
              }
            >
              Reemitir convite
            </button>
            <button
              className="button button-secondary"
              disabled={ocupado || !!i.desativadoEm}
              onClick={() =>
                void executar(() =>
                  consultarDominio<void>(
                    `/grupo-testes/${i.id}/desativar`,
                    "POST",
                    {},
                  ),
                )
              }
            >
              Desativar e revogar acesso
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
