import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RetificacaoRegistro } from "./RetificacaoRegistro";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("retificação de anotações", () => {
  it("envia motivo e versão, mantém original e confirma somente depois da API", async () => {
    const consulta = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(Response.json({ versao: 1 }));
    vi.stubGlobal("fetch", consulta);
    const salvo = vi.fn();
    render(
      <RetificacaoRegistro
        idPaciente="paciente"
        tipo="consultations"
        registro={{
          id: "registro",
          notes: "Original",
          goals: "Objetivo",
          carePlan: "Orientação",
        }}
        aoSalvar={salvo}
        aoFechar={() => undefined}
      />,
    );
    const anotacao = await screen.findByLabelText("Anotações da consulta");
    expect(anotacao).toHaveValue("Original");
    fireEvent.change(anotacao, { target: { value: "Correção textual" } });
    fireEvent.change(screen.getByLabelText("Motivo da retificação"), {
      target: { value: "Correção de digitação" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar retificação" }),
    );
    await waitFor(() => expect(salvo).toHaveBeenCalledOnce());
    const corpo = JSON.parse(String(consulta.mock.calls[1]?.[1]?.body));
    expect(corpo).toEqual({
      versaoAtual: 0,
      motivo: "Correção de digitação",
      conteudo: {
        notes: "Correção textual",
        goals: "Objetivo",
        carePlan: "Orientação",
      },
    });
  });
  it("carrega a última versão e conserva o texto digitado quando há conflito", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          Response.json([
            {
              id: "r",
              versao: 3,
              motivo: "Correção anterior",
              conteudo: { notes: "Versão três", medicationReport: "Relato" },
              autor: "Profissional de teste",
              criadoEm: "2026-11-03T15:00:00Z",
            },
          ]),
        )
        .mockResolvedValueOnce(
          Response.json(
            { detail: "Atualize as versões antes de retificar." },
            { status: 409 },
          ),
        ),
    );
    const salvo = vi.fn();
    render(
      <RetificacaoRegistro
        idPaciente="paciente"
        tipo="diary"
        registro={{ id: "registro", notes: "Original" }}
        aoSalvar={salvo}
        aoFechar={() => undefined}
      />,
    );
    const anotacao = await screen.findByLabelText("Observações da transcrição");
    expect(anotacao).toHaveValue("Versão três");
    fireEvent.change(anotacao, { target: { value: "Meu texto em revisão" } });
    fireEvent.change(screen.getByLabelText("Motivo da retificação"), {
      target: { value: "Complemento textual do relato" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar retificação" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Atualize as versões",
    );
    expect(anotacao).toHaveValue("Meu texto em revisão");
    expect(salvo).not.toHaveBeenCalled();
  });
});
