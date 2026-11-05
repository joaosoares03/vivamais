import { useState } from "react";
import { Redirect, router } from "expo-router";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  Tela,
  Botao,
  MensagemErro,
  Carregando,
} from "../components/ElementosInterface";
import { BarraNavegacao } from "../components/BarraNavegacao";
import { Text } from "../components/TextoAcessivel";
import { estilos as e } from "../components/estilos";

type Consulta = {
  id: string;
  ocorridaEm: string;
  profissional: string;
  objetivos: string;
  planoCuidado: string;
};
export default function MinhasConsultas() {
  const { sessao, restaurando, requisicao } = useAutenticacao();
  const [pagina, definirPagina] = useState(0);
  const consultas = useQuery({
    queryKey: ["minhas-consultas", sessao?.usuario.id, pagina],
    enabled: !!sessao,
    queryFn: () =>
      requisicao<{ items: Consulta[]; total: number }>(
        `/pacientes/me/consultas?page=${pagina}&size=10`,
      ),
  });
  if (restaurando)
    return (
      <Tela>
        <Carregando rotulo="Verificando sua sessão…" />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  if (sessao.usuario.papel !== "PATIENT") return <Redirect href="/inicio" />;
  return (
    <Tela rodape={<BarraNavegacao />}>
      <Text style={e.title} accessibilityRole="header">
        Minhas consultas
      </Text>
      <Text style={e.body}>
        Veja os objetivos e as orientações registrados pela sua equipe nos
        atendimentos realizados.
      </Text>
      {consultas.isPending && <Carregando />}
      {consultas.isError && (
        <MensagemErro mensagem="Não foi possível consultar os atendimentos. Verifique a conexão e tente novamente." />
      )}
      {consultas.data?.total === 0 && (
        <View style={e.card}>
          <Text style={e.body}>
            Nenhuma consulta registrada pela equipe até agora.
          </Text>
        </View>
      )}
      {consultas.data?.items.map((consulta) => (
        <View key={consulta.id} style={e.card}>
          <Text style={e.label}>
            {new Date(consulta.ocorridaEm).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              dateStyle: "short",
              timeStyle: "short",
            })}
          </Text>
          <Text style={e.small}>Atendimento por {consulta.profissional}</Text>
          <Text style={e.label}>Objetivos combinados</Text>
          <Text style={e.body}>
            {consulta.objetivos || "Nenhum objetivo registrado."}
          </Text>
          <Text style={e.label}>Orientações da equipe</Text>
          <Text style={e.body}>
            {consulta.planoCuidado || "Nenhuma orientação registrada."}
          </Text>
        </View>
      ))}
      {pagina > 0 && (
        <Botao
          secundario
          rotulo="Consultas mais recentes"
          onPress={() => definirPagina(pagina - 1)}
        />
      )}
      {(pagina + 1) * 10 < (consultas.data?.total ?? 0) && (
        <Botao
          secundario
          rotulo="Consultas anteriores"
          onPress={() => definirPagina(pagina + 1)}
        />
      )}
      <Botao
        secundario
        rotulo="Atualizar consultas"
        ocupado={consultas.isFetching}
        onPress={() => {
          void consultas.refetch();
        }}
      />
      <Botao
        secundario
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}
