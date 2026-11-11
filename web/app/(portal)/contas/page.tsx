import { buscarSessao } from "@/services/api";
import { ContasEquipe } from "@/components/ContasEquipe";
export default async function PaginaContas() {
  const { user } = await buscarSessao();
  if (user.role !== "ADMIN")
    return (
      <section className="panel padded">
        <h1>Acesso restrito</h1>
        <p>Somente a administração gerencia as contas da equipe.</p>
      </section>
    );
  return <ContasEquipe />;
}
