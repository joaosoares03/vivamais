import { Text } from "../../components/TextoAcessivel";
import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, TextInput, View } from "react-native";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useSalvarPressao } from "../../hooks/useSalvarPressao";
import { interpretarPressao } from "../../services/sincronizacao/regrasSincronizacao";
import { Tela, Botao, MensagemErro } from "../../components/ElementosInterface";
import { estilos as e } from "../../components/estilos";
export default function DigitarPressao() {
  const { sessao: sessao } = useAutenticacao(),
    parametros = useLocalSearchParams<{
      sistolica?: string;
      diastolica?: string;
      pulso?: string;
      documento?: string;
    }>(),
    { salvarPressao, salvando } = useSalvarPressao();
  const [sistolica, definirSistolica] = useState(parametros.sistolica || ""),
    [diastolica, definirDiastolica] = useState(parametros.diastolica || ""),
    [pulso, definirPulso] = useState(parametros.pulso || ""),
    [dataMedicao, definirDataMedicao] = useState(new Date().toISOString()),
    [valoresConferidos, definirValoresConferidos] = useState<ReturnType<
      typeof interpretarPressao
    > | null>(null),
    [erro, definirErro] = useState(""),
    [detalhes, definirDetalhes] = useState(false);
  if (!sessao) return <Redirect href="/acesso" />;
  async function confirmar() {
    try {
      if (!valoresConferidos) return;
      const resultado = await salvarPressao(
        {
          sistolica: valoresConferidos.systolic,
          diastolica: valoresConferidos.diastolic,
          pulso: pulso ? Number(pulso) : null,
          dataMedicao,
          idDocumentoOcr: parametros.documento,
        },
        true,
      );
      router.replace({
        pathname: "/pressao/resultado",
        params: { id: resultado.id, paciente: resultado.idPaciente },
      });
    } catch (e) {
      definirErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }
  return (
    <Tela>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar à pressão"
        onPress={() => router.dismissTo("/pressao")}
      >
        <Text style={[e.title, { fontSize: 23 }]}>‹　Minha Pressão</Text>
      </Pressable>
      <Text style={e.body}>Digite os valores da sua pressão.</Text>
      {parametros.documento && (
        <View style={[e.card, { backgroundColor: "#fff7e5" }]}>
          <Text style={e.label}>Revisão obrigatória da foto</Text>
          <Text style={e.body}>
            Confira cada número diretamente no aparelho. O OCR apenas transcreve
            uma foto e não mede pressão nem confirma uma medição clínica.
          </Text>
        </View>
      )}
      {[
        {
          rotulo: "Sistólica",
          texto: "Pressão alta",
          valor: sistolica,
          definir: definirSistolica,
        },
        {
          rotulo: "Diastólica",
          texto: "Pressão baixa",
          valor: diastolica,
          definir: definirDiastolica,
        },
      ].map((campo) => (
        <View
          key={campo.rotulo}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginVertical: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[e.label, { fontSize: 18 }]}>{campo.texto}</Text>
            <Text style={e.body}>({campo.rotulo.toLowerCase()})</Text>
          </View>
          <TextInput
            accessibilityLabel={campo.rotulo}
            keyboardType="numeric"
            value={campo.valor}
            onChangeText={(valor) => {
              campo.definir(valor);
              definirValoresConferidos(null);
            }}
            style={[e.field, { width: 108, textAlign: "center", fontSize: 27 }]}
          />
          <Text style={e.small}>mmHg</Text>
        </View>
      ))}
      <Botao
        rotulo="Salvar"
        ocupado={salvando}
        onPress={() => {
          try {
            definirValoresConferidos(interpretarPressao(sistolica, diastolica));
            definirErro("");
          } catch (e) {
            definirErro(e instanceof Error ? e.message : "Confira os números.");
          }
        }}
      />
      {valoresConferidos && (
        <View style={[e.card, { backgroundColor: "#e7faef", marginTop: 2 }]}>
          <Text style={e.body}>
            {valoresConferidos.converted
              ? `Identificamos que você digitou ${sistolica} por ${diastolica}. Ajustamos para ${valoresConferidos.systolic} por ${valoresConferidos.diastolic}.`
              : `Confira: ${valoresConferidos.systolic} / ${valoresConferidos.diastolic} mmHg.`}
            {"\n"}Está correto?
          </Text>
          <Botao
            rotulo="Sim, está correto"
            ocupado={salvando}
            onPress={() => {
              void confirmar();
            }}
          />
          <Botao
            secundario
            rotulo="Corrigir"
            onPress={() => definirValoresConferidos(null)}
          />
        </View>
      )}
      {erro && <MensagemErro mensagem={erro} />}
      <Botao
        secundario
        rotulo={detalhes ? "Ocultar pulso e data" : "Pulso e data da medição"}
        onPress={() => definirDetalhes(!detalhes)}
      />
      {detalhes && (
        <>
          <Text style={e.label}>Pulso (opcional)</Text>
          <TextInput
            accessibilityLabel="Pulso (opcional)"
            style={e.field}
            keyboardType="numeric"
            value={pulso}
            onChangeText={definirPulso}
          />
          <Text style={e.label}>Data e hora da medição (ISO com fuso)</Text>
          <TextInput
            accessibilityLabel="Data e hora da medição"
            style={e.field}
            value={dataMedicao}
            onChangeText={definirDataMedicao}
          />
        </>
      )}
      <Text style={e.small}>
        A câmera não mede pressão. Confira os valores no aparelho. No navegador,
        registros pendentes permanecem somente nesta aba.
      </Text>
    </Tela>
  );
}
