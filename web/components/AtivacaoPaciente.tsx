"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type {
  EstadoAtivacaoPaciente,
  SolicitacaoSmsPaciente,
} from "@viva/contracts";
import { consultarDominio } from "../services/dominio";
import { ConvitesTestadores } from "./ConvitesTestadores";

const rotulos: Record<EstadoAtivacaoPaciente["estado"], string> = {
  TESTE_POR_CONVITE: "Acesso privado por convite",
  DEMONSTRACAO_HABILITADA: "Acesso demonstrativo habilitado",
  AGUARDANDO_EMISSAO: "Acesso ainda não ativado",
  AGUARDANDO_ATIVACAO: "Aguardando ativação",
  EXPIRADO: "Código expirado",
  ATIVADO: "Acesso ativado",
  UTILIZADO_OU_SUBSTITUIDO: "Código utilizado ou substituído",
};
const mensagensEnvio: Record<string, string> = {
  NAO_CONFIGURADO:
    "SMS indisponível: provedor não configurado. Nenhuma mensagem foi enviada.",
  PREPARADO: "Solicitação em processamento. Envio ainda não confirmado.",
  TESTE_LOCAL:
    "Teste local registrado. Nenhum SMS real foi enviado. A equipe deve consultar a caixa de desenvolvimento privada.",
  ACEITO_PROVEDOR:
    "Solicitação aceita pelo provedor. A entrega do SMS ainda não foi confirmada.",
  ENTREGUE:
    "O provedor confirmou a entrega do SMS. Isso não comprova a identidade ou titularidade do CPF.",
  FALHA:
    "O SMS não foi enviado. Confira o cadastro e tente novamente após o prazo de reenvio.",
  NAO_ENTREGUE:
    "O provedor informou que o SMS não foi entregue. Confira o celular com o paciente.",
  INDETERMINADO:
    "Não foi possível confirmar o envio. O código dessa tentativa foi invalidado; aguarde antes de solicitar outro.",
};
function FormularioAtivacao({ idPaciente }: { idPaciente: string }) {
  const [estado, definirEstado] = useState<EstadoAtivacaoPaciente | null>(null);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  const [aguardandoReenvio, definirAguardandoReenvio] = useState(false);
  const base = "/patients/" + idPaciente;
  const atualizar = useCallback(async () => {
    try {
      definirEstado(
        await consultarDominio<EstadoAtivacaoPaciente>(base + "/access-status"),
      );
    } catch {
      definirErro(
        "Não foi possível conferir o acesso do paciente. Tente novamente.",
      );
    }
  }, [base]);
  useEffect(() => {
    void atualizar();
  }, [atualizar]);
  useEffect(() => {
    if (estado?.estado !== "AGUARDANDO_ATIVACAO") return;
    const consulta = setInterval(() => {
      if (document.visibilityState === "visible") void atualizar();
    }, 5000);
    return () => clearInterval(consulta);
  }, [estado?.estado, atualizar]);
  useEffect(() => {
    if (!aguardandoReenvio) return;
    const prazo = setTimeout(() => definirAguardandoReenvio(false), 60_000);
    return () => clearTimeout(prazo);
  }, [aguardandoReenvio]);
  async function emitir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado || aguardandoReenvio) return;
    const formulario = evento.currentTarget,
      dados = new FormData(formulario);
    definirOcupado(true);
    definirErro("");
    try {
      await consultarDominio<SolicitacaoSmsPaciente>(
        base + "/access-reset",
        "POST",
        {
          senhaProfissional: dados.get("senhaProfissional"),
          identidadeConferida: dados.get("identidadeConferida") === "on",
        },
      );
      definirAguardandoReenvio(true);
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível solicitar o SMS.",
      );
    } finally {
      formulario.reset();
      await atualizar();
      definirOcupado(false);
    }
  }
  if (!estado)
    return (
      <section>
        <p role={erro ? "alert" : "status"}>
          {erro || "Conferindo acesso do paciente…"}
        </p>
        {erro && (
          <button
            className="button button-secondary"
            onClick={() => void atualizar()}
          >
            Tentar novamente
          </button>
        )}
      </section>
    );
  if (estado.estado === "DEMONSTRACAO_HABILITADA")
    return (
      <section className="ativacao-paciente" aria-label="Acesso demonstrativo">
        <h2>Acesso demonstrativo habilitado</h2>
        <p>
          O paciente já pode acessar o Viva+ utilizando o CPF e a data de
          nascimento cadastrados.
        </p>
      </section>
    );
  if (estado.estado === "TESTE_POR_CONVITE")
    return <ConvitesTestadores key={idPaciente} idPaciente={idPaciente} />;
  return (
    <section className="ativacao-paciente" aria-label="Ativação do paciente">
      <h2>Ativar ou recuperar acesso</h2>
      {estado?.provedorSms === "LOCAL" && (
        <p>Modo de desenvolvimento: SMS de teste local, sem mensagens reais.</p>
      )}
      <p>
        Confira presencialmente a identidade, o CPF, o nascimento e o celular
        com o paciente. A validação de formato e o recebimento de SMS não
        confirmam, isoladamente, a identidade.
      </p>
      {estado && (
        <p role="status">
          Estado do acesso: <strong>{rotulos[estado.estado]}</strong>
        </p>
      )}
      {estado?.envioSms && (
        <div className="notice" role="status">
          <p>
            {mensagensEnvio[estado.envioSms.estado] ??
              "Estado de envio indisponível."}
          </p>
          {estado.envioSms.destinoMascarado && (
            <p>Celular de destino: {estado.envioSms.destinoMascarado}</p>
          )}
          {estado.envioSms.estado === "TESTE_LOCAL" && (
            <p>
              Referência do teste local: <code>{estado.envioSms.idEnvio}</code>
            </p>
          )}
        </div>
      )}
      {estado?.smsDisponivel === false && (
        <p role="status">
          Ativação por SMS indisponível até a configuração autorizada do
          serviço.
        </p>
      )}
      {estado?.expiraEm && (
        <p>
          O código expira em{" "}
          {new Date(estado.expiraEm).toLocaleTimeString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })}
          .
        </p>
      )}
      <p>
        São quatro números, de uso único e válidos por dez minutos. Aguarde pelo
        menos um minuto entre solicitações. Um novo código aceito invalida o
        anterior e revoga aparelhos anteriores.
      </p>
      <form className="grupo-ativacao" onSubmit={emitir}>
        <label className="confirmacao-identidade">
          <input
            type="checkbox"
            name="identidadeConferida"
            required
            disabled={ocupado}
          />{" "}
          Conferi pessoalmente a identidade e o celular cadastrado.
        </label>
        <label>
          Sua senha profissional
          <input
            type="password"
            name="senhaProfissional"
            required
            maxLength={72}
            autoComplete="current-password"
            disabled={ocupado}
          />
        </label>
        <button
          className="button button-primary"
          disabled={
            ocupado ||
            !estado ||
            estado.smsDisponivel === false ||
            aguardandoReenvio
          }
        >
          {ocupado
            ? "Solicitando…"
            : aguardandoReenvio
              ? "Aguarde um minuto para reenviar"
              : "Solicitar código por SMS"}
        </button>
      </form>
      {erro && <p role="alert">{erro}</p>}
      <button
        className="button button-secondary"
        type="button"
        disabled={ocupado}
        onClick={() => {
          definirErro("");
          void atualizar();
        }}
      >
        Atualizar estado do acesso
      </button>
    </section>
  );
}
export function AtivacaoPaciente({ idPaciente }: { idPaciente: string }) {
  return <FormularioAtivacao key={idPaciente} idPaciente={idPaciente} />;
}
