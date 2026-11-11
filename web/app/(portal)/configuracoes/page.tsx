import Link from "next/link";
import { FormularioPreferencias } from "@/components/PreferenciasPortal";
import { AprovacaoCatalogoExercicios } from "@/components/AprovacaoCatalogoExercicios";
import { buscarSessao, requisicaoAutenticada } from "@/services/api";
export default async function Configuracoes() {
  const [{ user: usuario }, unidade] = await Promise.all([
    buscarSessao(),
    requisicaoAutenticada<{ name: string }>("/organization"),
  ]);
  return (
    <div className="configuracoes-pagina">
      <div className="page-heading">
        <h1>Configurações</h1>
        <p>Consulte sua conta e ajuste a visualização do portal.</p>
      </div>
      <div className="configuracoes-grade">
        <section
          className="panel padded configuracoes-conta"
          aria-labelledby="titulo-conta"
        >
          <h2 id="titulo-conta">Conta e unidade</h2>
          <dl className="dados-conta">
            <div>
              <dt>Profissional</dt>
              <dd>{usuario.displayName}</dd>
            </div>
            <div>
              <dt>Unidade vinculada</dt>
              <dd>{unidade.name}</dd>
            </div>
            <div>
              <dt>Perfil de acesso</dt>
              <dd>
                {usuario.role === "ADMIN"
                  ? "Administração"
                  : "Profissional autorizado"}
              </dd>
            </div>
          </dl>
          <p>
            Gerencie vínculos na ficha do paciente. Recuperação de acesso exige
            confirmar sua senha.
          </p>
          <Link className="button button-primary" href="/pacientes">
            Gerenciar pacientes e vínculos
          </Link>
        </section>
        <FormularioPreferencias />
        <AprovacaoCatalogoExercicios administrador={usuario.role === "ADMIN"} />
        <section
          className="panel padded configuracoes-privacidade"
          aria-labelledby="titulo-privacidade"
        >
          <h2 id="titulo-privacidade">Privacidade e suporte</h2>
          <p>
            Documentos e canais institucionais ainda aguardam revisão. Esta
            demonstração utiliza somente dados fictícios.
          </p>
          <nav
            className="links-configuracoes"
            aria-label="Privacidade e suporte"
          >
            <Link href="/privacidade">
              Política de privacidade para revisão
            </Link>
            <Link href="/suporte">Suporte</Link>
            <Link href="/exclusao-de-conta">Solicitação de exclusão</Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
