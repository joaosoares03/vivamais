import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import {
  formatarNascimento,
  instanteDeDataHoraBrasil,
  interpretarDataCivil,
  partesInstanteBrasil,
  dataCivilBrasil,
} from "@viva/contracts";
import { Text } from "./TextoAcessivel";
import { estilos as e } from "./estilos";

export function CampoData({
  rotulo,
  valor,
  aoAlterar,
  desabilitado = false,
  testID,
}: {
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  desabilitado?: boolean;
  testID?: string;
}) {
  return (
    <View style={e.section}>
      <Text style={e.label}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        accessibilityHint="Digite dia, mês e ano."
        testID={testID}
        value={valor}
        onChangeText={(texto) => aoAlterar(formatarNascimento(texto))}
        style={e.field}
        inputMode="numeric"
        keyboardType="number-pad"
        maxLength={10}
        autoCorrect={false}
        autoComplete="off"
        placeholder="DD/MM/AAAA"
        placeholderTextColor="#526b78"
        editable={!desabilitado}
      />
    </View>
  );
}
export function CampoDataHora({
  rotulo,
  valor,
  aoAlterar,
}: {
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
}) {
  const inicial = partesInstanteBrasil(valor);
  const [data, definirData] = useState(dataCivilBrasil(inicial.data));
  const [hora, definirHora] = useState(inicial.hora);
  useEffect(() => {
    if (!valor) return;
    const partes = partesInstanteBrasil(valor);
    definirData(dataCivilBrasil(partes.data));
    definirHora(partes.hora);
  }, [valor]);
  function atualizar(novaData: string, novaHora: string) {
    const civil = interpretarDataCivil(novaData);
    aoAlterar(civil ? (instanteDeDataHoraBrasil(civil, novaHora) ?? "") : "");
  }
  return (
    <View style={e.section}>
      <CampoData
        rotulo={`Data ${rotulo}`}
        valor={data}
        aoAlterar={(texto) => {
          definirData(texto);
          atualizar(texto, hora);
        }}
      />
      <Text style={e.label}>Hora {rotulo}</Text>
      <TextInput
        accessibilityLabel={`Hora ${rotulo}`}
        value={hora}
        style={e.field}
        inputMode="numeric"
        keyboardType="number-pad"
        maxLength={5}
        placeholder="HH:MM"
        placeholderTextColor="#526b78"
        onChangeText={(texto) => {
          const numeros = texto.replace(/\D/g, "").slice(0, 4);
          const nova =
            numeros.length > 2
              ? `${numeros.slice(0, 2)}:${numeros.slice(2)}`
              : numeros;
          definirHora(nova);
          atualizar(data, nova);
        }}
      />
    </View>
  );
}
export function CampoDataCivil({
  rotulo,
  valor,
  aoAlterar,
}: {
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
}) {
  const [texto, definirTexto] = useState(dataCivilBrasil(valor));
  useEffect(() => {
    if (valor) definirTexto(dataCivilBrasil(valor));
  }, [valor]);
  return (
    <CampoData
      rotulo={rotulo}
      valor={texto}
      aoAlterar={(nova) => {
        definirTexto(nova);
        aoAlterar(interpretarDataCivil(nova) ?? "");
      }}
    />
  );
}
