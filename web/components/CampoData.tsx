"use client";
import { useState } from "react";
import {
  dataCivilBrasil,
  formatarNascimento,
  interpretarDataCivil,
} from "@viva/contracts";

/** Campo brasileiro visível; o formulário envia uma data civil ISO, sem hora. */
export function CampoData({
  name,
  rotulo,
  defaultValue = "",
  required = false,
  min,
  max,
}: {
  name: string;
  rotulo: string;
  defaultValue?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  const [texto, definirTexto] = useState(dataCivilBrasil(defaultValue));
  const iso = interpretarDataCivil(texto);
  return (
    <>
      <input
        aria-label={rotulo}
        value={texto}
        required={required}
        placeholder="DD/MM/AAAA"
        inputMode="numeric"
        maxLength={10}
        autoComplete="off"
        onChange={(evento) => {
          const valor = formatarNascimento(evento.target.value);
          const data = interpretarDataCivil(valor);
          evento.target.setCustomValidity(
            valor && (!data || (min && data < min) || (max && data > max))
              ? "Informe uma data válida no formato DD/MM/AAAA."
              : "",
          );
          definirTexto(valor);
        }}
      />
      <input name={name} type="hidden" value={iso ?? ""} />
    </>
  );
}
