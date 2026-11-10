import { MarcaViva } from "@/components/Icones";
import { FormularioAcesso } from "@/components/FormularioAcesso";
import { RodapePublico } from "@/components/RodapePublico";
import { enderecoAplicativo } from "@/services/enderecos";
import { portalEmProducao } from "@/services/modoProducao";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, requisicaoApi, SESSION_COOKIE } from "@/services/api";
import type { UsuarioSessao } from "@viva/contracts";

const erros: Record<string, string> = {
  dados: "Confira seu e-mail e preencha a senha para continuar.",
  credenciais:
    "Não foi possível entrar com estas credenciais. Confira o e-mail e a senha.",
  perfil:
    "Esta plataforma é destinada à equipe profissional. Pacientes devem usar o aplicativo Viva+.",
  limite: "Muitas tentativas de acesso. Aguarde um pouco e tente novamente.",
  conexao:
    "Não foi possível conectar ao serviço. Verifique a conexão e tente novamente.",
};

export default async function PaginaAcesso({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const busca = await searchParams;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    let usuario: UsuarioSessao | null = null;
    try {
      usuario = await requisicaoApi<UsuarioSessao>("/auth/me", { token });
    } catch (falha) {
      if (!(falha instanceof ErroApi)) throw falha;
    }
    if (usuario && usuario.role !== "PATIENT") redirect("/painel");
  }
  const aplicativo = enderecoAplicativo();
  const erro = typeof busca.erro === "string" ? erros[busca.erro] : undefined;
  const mensagemSessao =
    busca.sessao === "expirada"
      ? "Sua sessão expirou. Entre novamente para continuar."
      : busca.sessao === "necessaria"
        ? "Entre para acessar a plataforma."
        : busca.perfil === "paciente"
          ? erros.perfil
          : undefined;
  return (
    <>
      <main id="conteudo" className="acesso-viva">
        <section className="apresentacao-acesso" aria-label="Sobre o Viva+">
          <MarcaViva grande />
          <p className="subtitulo-marca">Plataforma Profissional</p>
          <p className="chamada-acesso">
            Acompanhamento do cuidado
            <br />
            para uma vida mais saudável.
          </p>
          <img
            className="ilustracao-profissionais"
            src="/images/individuais/02_personagens/profissionais_de_saude.png"
            alt="Ilustração de dois profissionais de saúde"
            width={414}
            height={296}
          />
        </section>
        <section className="formulario-acesso" aria-labelledby="titulo-acesso">
          <h1 id="titulo-acesso">Acesso do Profissional</h1>
          {erro && (
            <p role="alert" className="aviso-acesso">
              {erro}
            </p>
          )}
          {mensagemSessao && (
            <p role="status" className="aviso-acesso">
              {mensagemSessao}
            </p>
          )}
          {busca.saida === "confirmada" && (
            <p role="status" className="aviso-acesso">
              Sessão encerrada com segurança.
            </p>
          )}
          {busca.saida === "local" && (
            <p role="status" className="aviso-acesso">
              Sessão removida do navegador. A revogação remota aguarda
              confirmação do serviço.
            </p>
          )}
          <FormularioAcesso
            exigirCodigo={portalEmProducao()}
          />
          {aplicativo && (
            <div className="acesso-paciente">
              <strong>Você é paciente?</strong>
              <p>
                Abra o aplicativo para ativar sua conta e acessar seus
                registros.
              </p>
              <a href={aplicativo} className="button button-secondary">
                Abrir aplicativo do paciente
              </a>
            </div>
          )}
          <p className="form-hint">
            O cadastro de pacientes é feito após o acesso profissional em
            Cadastrar paciente.
          </p>
          <a className="recuperar-senha" href="/suporte">
            Esqueci minha senha
          </a>
          {!portalEmProducao() && (
            <p className="nota-demonstracao">
              Ambiente de desenvolvimento · Use somente dados fictícios.
            </p>
          )}
        </section>
      </main>
      <RodapePublico />
    </>
  );
}
