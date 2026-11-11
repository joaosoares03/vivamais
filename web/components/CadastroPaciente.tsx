"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  validarCpf,
  normalizarCelularBrasileiro,
  type Paciente,
  type EstadoAtivacaoPaciente,
} from "@viva/contracts";
import { useClientePronto } from "../hooks/useClientePronto";
import { CamposDadosPessoais } from "./CamposDadosPessoais";
import { AtivacaoPaciente } from "./AtivacaoPaciente";

export function CadastroPaciente() {
  const pronto = useClientePronto();
  const [modality, definirModalidadePaciente] = useState("APP");
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  const [resultado, definirResultado] = useState<{
    patient: Paciente;
    activationToken?: string;
    expiresAt?: string;
    acesso?: EstadoAtivacaoPaciente;
  } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    definirOcupado(true);
    definirErro("");
    const formulario = new FormData(event.currentTarget);
    const telefone = normalizarCelularBrasileiro(
      String(formulario.get("telefone") ?? ""),
    );
    if (!telefone) {
      definirErro(
        "Informe um celular válido com DDD e nove números, começando por 9.",
      );
      definirOcupado(false);
      return;
    }
    if (!validarCpf(String(formulario.get("cpf") ?? ""))) {
      definirErro("Confira o CPF informado.");
      definirOcupado(false);
      return;
    }
    try {
      const resposta = await fetch("/api/domain/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formulario.get("displayName"),
          modality,
          email: formulario.get("email") || null,
          cpf: formulario.get("cpf"),
          dataNascimento: formulario.get("dataNascimento") || null,
          telefone,
          sexo: formulario.get("sexo"),
          endereco: formulario.get("endereco"),
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.detail || "Não foi possível cadastrar.");
      definirResultado(dados);
    } catch (e) {
      definirErro(
        e instanceof Error ? e.message : "Não foi possível cadastrar.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  if (resultado)
    return (
      <section className="panel padded">
        <h1>Paciente cadastrado com sucesso!</h1>
        <p role="status">
          {resultado.patient.displayName} foi salvo e está disponível para a sua
          conta.
        </p>
        {resultado.acesso?.estado === "DEMONSTRACAO_HABILITADA" && (
          <p>O paciente já pode acessar o Viva+ utilizando o CPF e a data de nascimento cadastrados.</p>
        )}
        {resultado.patient.modality === "APP" && resultado.acesso?.estado !== "DEMONSTRACAO_HABILITADA" && (
          <AtivacaoPaciente idPaciente={resultado.patient.id} />
        )}
        <Link
          className="button button-primary"
          href={`/pacientes/${resultado.patient.id}`}
        >
          Abrir ficha do paciente
        </Link>
        <button className="button button-secondary" onClick={() => definirResultado(null)}>Cadastrar outro paciente</button>
        <Link className="button button-secondary" href="/pacientes">Voltar para pacientes</Link>
      </section>
    );
  return (
    <section className="panel padded">
      <h1>Cadastrar novo paciente</h1>
      <p className="form-hint">
        Preencha os dados do paciente e escolha a modalidade de acompanhamento.
      </p>
      <form method="post" onSubmit={submit}>
        <div className="cadastro-paciente">
          <div className="dados-pessoais">
            <h2>Dados pessoais</h2>
            <CamposDadosPessoais
              cadastro
              obrigatoriosAcesso={modality === "APP"}
            />
            <label>
              E-mail de contato (opcional)
              <input
                name="email"
                type="email"
                maxLength={254}
                placeholder="nome@exemplo.org"
              />
            </label>
          </div>
          <div className="cartao-modalidade">
            <h2>Modalidade de acompanhamento</h2>
            <label className="opcao-modalidade">
              <input
                type="radio"
                name="modality"
                value="APP"
                checked={modality === "APP"}
                onChange={() => definirModalidadePaciente("APP")}
              />
              <span>
                <strong>▣ Aplicativo Viva+</strong>
                <small>
                  Paciente utilizará o aplicativo para registrar pressão,
                  alimentação, medicamentos e atividades físicas.
                </small>
              </span>
            </label>
            <label className="opcao-modalidade">
              <input
                type="radio"
                name="modality"
                value="BRACELET_DIARY"
                checked={modality === "BRACELET_DIARY"}
                onChange={() => definirModalidadePaciente("BRACELET_DIARY")}
              />
              <span>
                <strong>▤ Pulseira Pulso em Dia</strong>
                <small>
                  Horários de lembretes e registros em diário impresso,
                  transcritos pela equipe. Não exige smartphone. Hardware real
                  ainda indisponível.
                </small>
              </span>
            </label>
          </div>
        </div>
        {erro && <p role="alert">{erro}</p>}
        <div className="cadastro-acoes">
          <button
            className="button button-primary"
            disabled={!pronto || ocupado}
          >
            {ocupado ? "Salvando…" : "Salvar paciente"}
          </button>
        </div>
      </form>
    </section>
  );
}
