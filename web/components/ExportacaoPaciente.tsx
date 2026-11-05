"use client";
import { useState, type FormEvent } from "react";
import { CampoData } from "./CampoData";
import { consultarDominio } from "../services/dominio";
import { reunirExportacaoPaciente } from "../services/exportacaoPaciente";

export function ExportacaoPaciente({ idPaciente }: { idPaciente: string }) {
  const [ocupado, definirOcupado] = useState(false),
    [mensagem, definirMensagem] = useState(""),
    [erro, definirErro] = useState("");
  async function exportar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado) return;
    const formulario = new FormData(evento.currentTarget);
    const inicio = String(formulario.get("inicio") ?? ""),
      fim = String(formulario.get("fim") ?? "");
    if (inicio && fim && inicio > fim) {
      definirErro("A data inicial deve ser anterior ou igual à final.");
      return;
    }
    definirOcupado(true);
    definirErro("");
    definirMensagem("Preparando a exportação…");
    try {
      const dados = await reunirExportacaoPaciente(
        consultarDominio,
        idPaciente,
        inicio,
        fim,
        definirMensagem,
      );
      const endereco = URL.createObjectURL(
        new Blob([JSON.stringify(dados, null, 2)], {
          type: "application/json",
        }),
      );
      const link = document.createElement("a");
      link.href = endereco;
      link.download = `viva-historico-${idPaciente}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(endereco), 1000);
      definirMensagem(
        `Arquivo gerado com ${dados.quantidade} registros. Guarde-o em local protegido.`,
      );
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Não foi possível exportar.",
      );
      definirMensagem("");
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <details className="exportacao-paciente">
      <summary>Exportar histórico do paciente</summary>
      <p>
        Inclui todas as páginas do período escolhido, com autoria e histórico
        dos planos de medicamentos. As fotografias e as credenciais ficam fora
        do arquivo.
      </p>
      <form className="care-form care-grid" onSubmit={exportar}>
        <label>
          Data inicial (opcional)
          <CampoData name="inicio" rotulo="Data inicial da exportação" />
        </label>
        <label>
          Data final (opcional)
          <CampoData name="fim" rotulo="Data final da exportação" />
        </label>
        <button className="button button-secondary" disabled={ocupado}>
          {ocupado
            ? "Exportando histórico…"
            : "Baixar histórico completo (JSON)"}
        </button>
      </form>
      <p role="status" aria-live="polite">
        {mensagem}
      </p>
      {erro && (
        <p role="alert" className="notice notice-error">
          {erro}
        </p>
      )}
    </details>
  );
}
