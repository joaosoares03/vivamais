import { DocumentoPublico } from "@/components/DocumentoPublico";
import { emailSuporte } from "@/services/modoProducao";
export default function Suporte() {
  const contato = emailSuporte();
  return (
    <DocumentoPublico title="Ajuda e suporte">
      <h2>Como acessar</h2>
      <p>
        As contas são individuais. O profissional cadastra o paciente e fornece
        um código para ativar a conta no aplicativo. Não há cadastro público de
        profissionais.
      </p>
      <h2>Esqueceu a senha?</h2>
      <p>
        Procure a equipe que forneceu sua conta, pelo contato já conhecido. O
        profissional autorizado pode gerar um código de recuperação para o
        paciente após conferir sua identidade. A recuperação de contas
        profissionais depende da administração. Nunca envie sua senha por
        mensagem.
      </p>
      <h2>Informações não carregam</h2>
      <p>
        Confira sua conexão e tente atualizar a tela. Se o problema continuar,
        informe à equipe a tela e o horário da falha, sem enviar senhas, códigos
        de acesso ou fotos de dados pessoais.
      </p>
      <h2>Canal de atendimento</h2>
      {contato ? (
        <p>
          Escreva para <strong>{contato}</strong>. Não envie senhas, códigos de
          acesso ou fotos de documentos.
        </p>
      ) : (
        <p>
          O canal institucional ainda não foi configurado. Esta página não
          recebe nem envia mensagens. O contato oficial precisa ser definido e
          validado antes da disponibilização pública.
        </p>
      )}
      <div className="notice">
        <p>
          O Viva+ apoia a organização do acompanhamento. Não oferece
          diagnóstico, atendimento de urgência ou monitoramento em tempo real.
        </p>
      </div>
    </DocumentoPublico>
  );
}
