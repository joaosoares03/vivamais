"use client";
import { CampoData } from "./CampoData";
import { hojeBrasil } from "@viva/contracts";
import { useState } from "react";
import {
  formatarCpf,
  mascararCelularBrasileiro,
  type DadosPessoaisPaciente,
} from "@viva/contracts";

export function CamposDadosPessoais({
  dados,
  cadastro = false,
  obrigatoriosAcesso = false,
}: {
  dados?: DadosPessoaisPaciente;
  cadastro?: boolean;
  obrigatoriosAcesso?: boolean;
}) {
  const [cpf, definirCpf] = useState(dados?.cpf ? formatarCpf(dados.cpf) : "");
  const [telefone, definirTelefone] = useState(
    dados?.telefone ? mascararCelularBrasileiro(dados.telefone) : "",
  );
  return (
    <div className="campos-demograficos">
      <label className="campo-inteiro">
        Nome completo *
        <input
          name="displayName"
          aria-label="Nome completo"
          required
          maxLength={160}
          defaultValue={dados?.nomeCompleto}
          placeholder="Digite o nome completo"
          autoComplete="name"
        />
      </label>
      <label>
        CPF {obrigatoriosAcesso ? "*" : ""}
        <input
          name="cpf"
          required={obrigatoriosAcesso}
          aria-label="CPF"
          maxLength={14}
          value={cpf}
          onChange={(evento) => definirCpf(formatarCpf(evento.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
        />
      </label>
      <label>
        Data de nascimento {obrigatoriosAcesso ? "*" : ""}
        <CampoData
          name="dataNascimento"
          rotulo="Data de nascimento"
          required={obrigatoriosAcesso}
          min="1900-01-01"
          max={hojeBrasil()}
          defaultValue={dados?.dataNascimento ?? ""}
        />
      </label>
      <label>
        Sexo
        <select name="sexo" aria-label="Sexo" defaultValue={dados?.sexo ?? ""}>
          <option value="">Não registrado</option>
          <option value="FEMININO">Feminino</option>
          <option value="MASCULINO">Masculino</option>
          <option value="INTERSEXO">Intersexo</option>
          <option value="NAO_INFORMADO">Prefere não informar</option>
        </select>
      </label>
      <label>
        Celular com DDD {cadastro ? "*" : ""}
        <input
          name="telefone"
          aria-label="Telefone com DDD"
          required={cadastro}
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          maxLength={19}
          value={telefone}
          onChange={(evento) =>
            definirTelefone(mascararCelularBrasileiro(evento.target.value))
          }
          placeholder="(00) 00000-0000"
        />
      </label>
      {!cadastro && (
        <label className="campo-inteiro">
          E-mail de contato
          <input
            name="emailContato"
            type="email"
            maxLength={254}
            defaultValue={dados?.emailContato ?? ""}
          />
          <small>
            Contato opcional. O paciente acessa com CPF, nascimento e aparelho
            autorizado.
          </small>
        </label>
      )}
      <label className="campo-inteiro">
        Endereço
        <input
          name="endereco"
          aria-label="Endereço"
          maxLength={500}
          defaultValue={dados?.endereco ?? ""}
          autoComplete="street-address"
          placeholder="Informe somente se necessário ao acompanhamento"
        />
      </label>
      <p className="form-hint campo-inteiro">
        {obrigatoriosAcesso
          ? "CPF, nascimento e celular são necessários para ativar o aplicativo. "
          : "Celular é obrigatório em novos cadastros. "}
        A validação do CPF confere apenas o formato e os dígitos. Não consulta a
        Receita Federal nem confirma a identidade. Use somente dados fictícios
        nesta demonstração.
      </p>
    </div>
  );
}
