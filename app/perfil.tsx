import { Text } from "../components/TextoAcessivel";
import { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import { View } from "react-native";
import type { Paciente } from "@viva/contracts";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
  Tela,
} from "../components/ElementosInterface";
import { estilos as s } from "../components/estilos";
import { ContatoPaciente } from "../components/ContatoPaciente";
import { BarraNavegacao } from "../components/BarraNavegacao";
export default function Perfil() {
  const {
    sessao: sessao,
    restaurando: restaurando,
    requisicao: requisicao,
  } = useAutenticacao();
  const [paciente, definirPaciente] = useState<Paciente | null>(null);
  const [perfil, definirPerfil] = useState<Record<string, string> | null>(null);
  const [erro, definirErro] = useState("");
  useEffect(() => {
    if (sessao?.usuario.papel === "PATIENT")
      requisicao<Paciente>("/patients/me")
        .then(async (pacienteConsultado) => {
          definirPaciente(pacienteConsultado);
          definirPerfil(
            await requisicao(
              `/patients/${pacienteConsultado.id}/activity-profile`,
            ),
          );
        })
        .catch(() =>
          definirErro(
            "Não foi possível atualizar seu perfil. Verifique sua conexão.",
          ),
        );
  }, [sessao, requisicao]);
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  return (
    <Tela rodape={<BarraNavegacao />}>
      <MarcaViva />
      <Text style={s.title} accessibilityRole="header">
        Meu Perfil
      </Text>
      {erro && <MensagemErro mensagem={erro} />}
      <View style={s.card}>
        <Text style={s.title}>{sessao.usuario.nomeExibicao}</Text>
        {sessao.usuario.papel !== "PATIENT" && (
          <Text style={s.body}>{sessao.usuario.email}</Text>
        )}
        <Text style={s.body}>
          Modalidade:{" "}
          {paciente
            ? paciente.modality === "APP"
              ? "Aplicativo Viva+"
              : "Pulseira + diário"
            : "Não consultada"}
        </Text>
      </View>
      {paciente && <ContatoPaciente idPaciente={paciente.id} />}
      <View style={s.card}>
        <Text style={s.title}>Perfil informado pela equipe</Text>
        {perfil ? (
          <>
            <Text style={s.body}>Mobilidade: {perfil.mobility}</Text>
            <Text style={s.body}>Equilíbrio: {perfil.balance}</Text>
            <Text style={s.body}>
              Restrições:{" "}
              {perfil.restrictions || "Nenhuma informação registrada"}
            </Text>
            <Text style={s.body}>
              Orientações profissionais:{" "}
              {perfil.professionalGuidance || "Nenhuma informação registrada"}
            </Text>
          </>
        ) : (
          <Text style={s.body}>
            Nenhum perfil funcional disponível nesta consulta.
          </Text>
        )}
        <Text style={s.small}>
          Peça à sua equipe para corrigir informações. Recomendações automáticas
          personalizadas aguardam aprovação clínica.
        </Text>
      </View>
      <Botao
        rotulo="Minhas consultas e orientações"
        onPress={() => router.push("/consultas")}
      />
      <Botao
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
      <Botao
        secundario
        rotulo="Configurações e acessibilidade"
        onPress={() => router.push("/configuracoes")}
      />
    </Tela>
  );
}
