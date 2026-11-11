import { useState, type ReactNode } from "react";
import { Redirect, router } from "expo-router";
import { Pressable, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useResumoPaciente } from "../hooks/useResumoPaciente";
import {
  dataLocalHoje,
  deslocarData,
  segundaDaSemana,
  instanteLocal,
} from "../services/atividades/periodos";
import { Tela, Botao, Carregando, MensagemErro } from "./ElementosInterface";
import { Text } from "./TextoAcessivel";
import { IlustracaoViva } from "./IlustracoesViva";
import { BarraNavegacao } from "./BarraNavegacao";
import { estilos as e } from "./estilos";
type Atividade = {
  id: string;
  type: string;
  durationMinutes: number;
  occurredAt: string;
  notes: string;
};
type Semana = {
  totalMinutos: number;
  totalRegistros: number;
  dias: { data: string; minutos: number; registros: number }[];
};
export function HistoricoAtividades({ children }: { children?: ReactNode }) {
  const { sessao, restaurando, requisicao } = useAutenticacao(),
    identificacao = useResumoPaciente();
  const [inicio, definirInicio] = useState(() => segundaDaSemana()),
    [periodo, definirPeriodo] = useState("Semana"),
    [pagina, definirPagina] = useState(0);
  const fim = deslocarData(inicio, 7),
    hoje = dataLocalHoje();
  const dados = useQuery({
    queryKey: [
      "historico-atividades",
      sessao?.usuario.id,
      identificacao.data?.id,
      inicio,
      periodo,
      pagina,
    ],
    enabled: !!identificacao.data?.id,
    queryFn: async () => {
      const id = identificacao.data!.id;
      const mes = hoje.slice(0, 7) + "-01",
        fimMes = new Date(
          Date.UTC(Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)), 1),
        )
          .toISOString()
          .slice(0, 10);
      const filtro =
        periodo === "Todos"
          ? ""
          : `&from=${encodeURIComponent(instanteLocal(periodo === "Semana" ? inicio : mes))}&to=${encodeURIComponent(instanteLocal(periodo === "Semana" ? fim : fimMes))}`;
      const [registros, semana] = await Promise.all([
        requisicao<{ items: Atividade[]; total: number }>(
          `/patients/${id}/activities?page=${pagina}&size=20${filtro}`,
        ),
        requisicao<Semana>(
          `/pacientes/${id}/atividades/semana?inicio=${inicio}`,
        ),
      ]);
      return { registros, semana };
    },
  });
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  const erro = dados.isError || identificacao.isError;
  return (
    <Tela rodape={<BarraNavegacao />}>
      <Text style={e.title} accessibilityRole="header">
        Histórico de atividades
      </Text>
      {children}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {["Semana", "Mês", "Todos"].map((opcao) => (
          <Pressable
            key={opcao}
            accessibilityRole="button"
            accessibilityLabel={opcao}
            accessibilityState={{ selected: periodo === opcao }}
            onPress={() => {
              definirPeriodo(opcao);
              definirPagina(0);
            }}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 24,
              backgroundColor: periodo === opcao ? "#0079d8" : "#e9f4ff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: periodo === opcao ? "white" : "#004477",
              }}
            >
              {opcao}
            </Text>
          </Pressable>
        ))}
      </View>
      {periodo === "Semana" && (
        <>
          <Text style={[e.small, { textAlign: "center" }]}>
            Semana de {inicio.split("-").reverse().join("/")}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Botao
                secundario
                compacto
                rotulo="Semana anterior"
                onPress={() => {
                  definirInicio(deslocarData(inicio, -7));
                  definirPagina(0);
                }}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Botao
                secundario
                compacto
                rotulo="Próxima semana"
                desabilitado={fim > hoje}
                onPress={() => {
                  definirInicio(fim);
                  definirPagina(0);
                }}
              />
            </View>
          </View>
          <View style={e.card}>
            <Text style={e.label}>Suas atividades na semana</Text>
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                justifyContent: "space-between",
              }}
            >
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                (dia, indice) => {
                  const data = deslocarData(inicio, indice),
                    resumo = dados.data?.semana.dias.find(
                      (item) => item.data === data,
                    );
                  return (
                    <View
                      key={dia}
                      style={{ flex: 1, alignItems: "center", gap: 6 }}
                    >
                      <Text style={{ fontSize: 13, color: "#00376b" }}>
                        {dia}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#526b78" }}>
                        {data.slice(8)}
                      </Text>
                      <Text
                        accessibilityLabel={`${dia}: ${resumo?.minutos ?? 0} minutos registrados`}
                        style={{
                          fontSize: 20,
                          color: resumo ? "#098c50" : "#93a4b7",
                        }}
                      >
                        {resumo ? "✓" : "○"}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
            {dados.data && (
              <Text style={e.body}>
                Total da semana: {dados.data.semana.totalMinutos} minutos ·{" "}
                {dados.data.semana.totalRegistros} registros
              </Text>
            )}
            <Text style={e.small}>
              Dias sem registro não informam se houve atividade. Os totais
              refletem os registros que você enviou.
            </Text>
          </View>
        </>
      )}
      {(dados.isPending || identificacao.isPending) && <Carregando />}
      {erro && (
        <>
          <MensagemErro mensagem="Não foi possível consultar o histórico de atividades." />
          <Botao
            secundario
            rotulo="Tentar atualizar atividades"
            onPress={() => {
              void identificacao.refetch();
              void dados.refetch();
            }}
          />
        </>
      )}
      {dados.data && (
        <View style={{ gap: 10 }}>
          <Text style={e.label}>Registros de {periodo.toLowerCase()}</Text>
          {!dados.data.registros.total && (
            <Text style={e.body}>
              Nenhuma atividade registrada neste período.
            </Text>
          )}
          {dados.data.registros.items.map((atividade) => (
            <View key={atividade.id} style={[e.card, { padding: 14, gap: 4 }]}>
              <Text style={e.label}>{atividade.type}</Text>
              <Text style={e.body}>{atividade.durationMinutes} minutos</Text>
              <Text style={e.small}>
                {new Date(atividade.occurredAt).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </Text>
              {!!atividade.notes && (
                <Text style={e.small}>{atividade.notes}</Text>
              )}
            </View>
          ))}
          <Text style={e.small}>
            Página {pagina + 1} · {dados.data.registros.total} registros no
            período
          </Text>
          <View style={{ gap: 8 }}>
            <Botao
              secundario
              compacto
              rotulo="Página anterior de atividades"
              desabilitado={pagina === 0}
              onPress={() => definirPagina(pagina - 1)}
            />
            <Botao
              secundario
              compacto
              rotulo="Próxima página de atividades"
              desabilitado={(pagina + 1) * 20 >= dados.data.registros.total}
              onPress={() => definirPagina(pagina + 1)}
            />
          </View>
        </View>
      )}
      <View style={{ alignItems: "center" }}>
        <IlustracaoViva nome="movimento" tamanho={110} />
      </View>
      <Botao
        rotulo="Registrar atividade realizada"
        onPress={() => router.push("/atividade-fisica/registro")}
      />
      <Botao
        secundario
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}
