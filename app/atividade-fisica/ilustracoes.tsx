import { Image, View } from "react-native";
import { router } from "expo-router";
import { Tela, Botao } from "../../components/ElementosInterface";
import { Text } from "../../components/TextoAcessivel";
import { estilos as e } from "../../components/estilos";
import {
  atividadesDoGrupo,
  gruposCatalogoAtividade,
  obterMidiasAtividade,
  VERSAO_CATALOGO_ATIVIDADES,
} from "../../services/atividades/atividades";

export default function IlustracoesAtividades() {
  return (
    <Tela>
      <Text style={e.title} accessibilityRole="header">
        Catálogo de materiais aprovados
      </Text>
      <Text style={e.body}>
        Catálogo versão {VERSAO_CATALOGO_ATIVIDADES}. As mídias foram
        aprovadas pela gestão, mas não substituem a avaliação da equipe nem
        definem qual atividade é adequada para você.
      </Text>
      {gruposCatalogoAtividade.map((grupo) => (
        <View style={e.card} key={grupo.id}>
          <Text style={e.label}>{grupo.titulo}</Text>
          <Text style={e.body}>{grupo.descricao}</Text>
          {atividadesDoGrupo(grupo.id).map((atividade) => (
            <View style={e.card} key={atividade.id}>
              <Image
                source={obterMidiasAtividade(atividade.id).capa}
                style={{ width: "100%", height: 160, resizeMode: "contain" }}
                accessibilityLabel={`Capa do material ${atividade.nome}`}
              />
              <Text style={e.label}>{atividade.nome}</Text>
              <Botao
                secundario
                rotulo="Ver imagens, animação e vídeo"
                onPress={() =>
                  router.push({
                    pathname: "/atividade-fisica/passo-a-passo",
                    params: { atividade: atividade.id },
                  })
                }
              />
              <Botao
                secundario
                rotulo="Registrar somente se já realizei esta atividade"
                onPress={() =>
                  router.push({
                    pathname: "/atividade-fisica/registro",
                    params: { atividade: atividade.nome },
                  })
                }
              />
            </View>
          ))}
        </View>
      ))}
      <Botao
        rotulo="Registrar atividade que já realizei"
        onPress={() => router.push("/atividade-fisica/registro")}
      />
      <Botao
        secundario
        rotulo="Voltar à atividade física"
        onPress={() => router.dismissTo("/atividade-fisica")}
      />
    </Tela>
  );
}
