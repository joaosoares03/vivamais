import { router } from "expo-router";
import { View } from "react-native";
import {
  descreverDiasSemana,
  itensDeHoje,
  planoEstaAtivo,
  type PlanoExercicios,
} from "@viva/contracts";
import { Botao } from "./ElementosInterface";
import { Text } from "./TextoAcessivel";
import { estilos as e } from "./estilos";

/** Cartão do plano definido pela equipe. Não aparece sem plano ativo e aprovado. */
export function PlanoDaEquipe({
  plano,
}: {
  plano: PlanoExercicios | null | undefined;
}) {
  if (!planoEstaAtivo(plano)) return null;
  const hoje = itensDeHoje(plano);
  return (
    <View
      style={e.accentCard}
      accessibilityLabel="Plano de exercícios da sua equipe"
    >
      <Text style={e.title} accessibilityRole="header">
        Seu plano da equipe
      </Text>
      <Text style={e.muted}>Definido por {plano.autorNome}.</Text>
      {hoje.length ? (
        <>
          <Text style={e.label}>Para hoje</Text>
          {hoje.map((item) => (
            <View style={e.card} key={item.idExercicio}>
              <Text style={e.label}>
                {item.registradoHoje ? "✓ " : ""}
                {item.nome} · {item.duracaoMinutos} minutos
              </Text>
              {item.observacao ? (
                <Text style={e.body}>{item.observacao}</Text>
              ) : null}
              {item.registradoHoje ? (
                <Text style={e.body}>Você já registrou hoje.</Text>
              ) : null}
              <Botao
                secundario
                rotulo="Ver como fazer"
                onPress={() =>
                  router.push({
                    pathname: "/atividade-fisica/passo-a-passo",
                    params: { atividade: item.idExercicio },
                  })
                }
              />
              <Botao
                secundario={item.registradoHoje}
                rotulo={
                  item.registradoHoje
                    ? "Registrar de novo"
                    : "Registrar que fiz"
                }
                onPress={() =>
                  router.push({
                    pathname: "/atividade-fisica/registro",
                    params: {
                      atividade: item.nome,
                      exercicio: item.idExercicio,
                      duracao: String(item.duracaoMinutos),
                    },
                  })
                }
              />
            </View>
          ))}
        </>
      ) : (
        <Text style={e.body}>Hoje não há exercício previsto no seu plano.</Text>
      )}
      <Text style={e.label}>Sua semana</Text>
      {plano.itens.map((item) => (
        <Text style={e.body} key={item.idExercicio}>
          {item.nome}: {descreverDiasSemana(item.diasSemana)}
        </Text>
      ))}
      {plano.orientacao ? (
        <Text style={e.body}>Orientação da equipe: {plano.orientacao}</Text>
      ) : null}
      <View style={e.notice}>
        <Text style={e.body}>
          Antes de começar, confira como você está hoje. Se sentir dor, falta de
          ar, tontura ou mal-estar, pare e avise a sua equipe.
        </Text>
      </View>
      <Botao
        rotulo="Conferir como estou hoje"
        onPress={() => router.push("/atividade-fisica/como-esta-hoje")}
      />
    </View>
  );
}
