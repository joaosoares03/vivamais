import Link from "next/link";
import { DocumentoPublico } from "@/components/DocumentoPublico";
import { emailSuporte } from "@/services/modoProducao";

export default function AccountDeletionPage() {
  const contato = emailSuporte();
  return (
    <DocumentoPublico title="Exclusão de conta e dados">
      {contato ? (
        <>
          <h2>Como pedir a exclusão</h2>
          <p>
            Escreva para <strong>{contato}</strong> com o assunto “Exclusão de
            conta”, usando o e-mail ou celular do seu cadastro. Vamos confirmar
            sua identidade antes de agir e responder com o resultado.
          </p>
        </>
      ) : (
        <div className="notice">
          <p>
            O fluxo institucional de solicitação de exclusão está pendente. Esta
            página não envia nem registra solicitações.
          </p>
        </div>
      )}
      <h2>Como interromper o acesso</h2>
      <p>
        Se deseja interromper seu acesso, fale com a equipe que forneceu sua
        conta pelo contato já conhecido. Encerre também a sessão pelo botão
        “Sair”.
      </p>
      {!contato && (
        <>
          <h2>Antes da publicação</h2>
          <p>
            A instituição deverá disponibilizar um canal acessível para
            solicitar exclusão de conta e dados, definir uma verificação de
            identidade proporcional, informar categorias removidas ou retidas,
            os motivos da retenção e os prazos de resposta.
          </p>
        </>
      )}
      <h2>Retenção de informações</h2>
      <p>
        Contas, dados de acompanhamento e eventos de auditoria têm finalidades
        distintas. Regras de retenção e eventuais obrigações legais precisam de
        avaliação institucional e jurídica. A aplicação não executa apagamento
        clínico automático nesta versão.
      </p>
      <p>
        Consulte também <Link href="/privacidade">privacidade</Link> e{" "}
        <Link href="/suporte">suporte</Link>.
      </p>
    </DocumentoPublico>
  );
}
