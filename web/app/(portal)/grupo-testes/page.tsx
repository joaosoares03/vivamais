import { buscarSessao } from "@/services/api";
import { GrupoTestes } from "@/components/GrupoTestes";
export default async function PaginaGrupoTestes() {
  const { user } = await buscarSessao();
  if (user.role !== "ADMIN")
    return (
      <section className="panel padded">
        <h1>Acesso restrito</h1>
        <p>O responsável pela homologação gerencia os convites.</p>
      </section>
    );
  return <GrupoTestes />;
}
