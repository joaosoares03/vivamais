import { Text } from "./TextoAcessivel";
import { router, usePathname } from "expo-router";
import { Pressable, View, useWindowDimensions } from "react-native";
import { IconeNavegacao } from "./IconeNavegacao";
import { usePreferencias } from "../contexts/ContextoPreferencias";
export function BarraNavegacao() {
  const caminho = usePathname();
  const { width: largura, fontScale: escalaFonte } = useWindowDimensions();
  const { textoAmpliado } = usePreferencias();
  const duasLinhas =
    (Math.min(largura, 470) - 40) / 4 <
    70 * (textoAmpliado ? 1.2 : 1) * escalaFonte;
  return (
    <View
      testID="barra-navegacao"
      accessibilityLabel="Navegação principal"
      style={{
        flexDirection: "row",
        flexWrap: duasLinhas ? "wrap" : "nowrap",
        justifyContent: "space-around",
        borderTopWidth: 1,
        borderColor: "#dceaf6",
        backgroundColor: "#fff",
        paddingVertical: 8,
      }}
    >
      {[
        { rota: "/inicio", icone: "inicio" as const, rotulo: "Início" },
        {
          rota: "/lembretes",
          icone: "lembretes" as const,
          rotulo: "Lembretes",
        },
        {
          rota: "/mensagens",
          icone: "mensagens" as const,
          rotulo: "Mensagens",
        },
        { rota: "/perfil", icone: "perfil" as const, rotulo: "Perfil" },
      ].map((item) => (
        <Pressable
          key={item.rota}
          accessibilityRole="button"
          accessibilityLabel={item.rotulo}
          accessibilityState={{ selected: caminho === item.rota }}
          onPress={() => router.navigate(item.rota)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: duasLinhas ? undefined : 1,
            width: duasLinhas ? "50%" : undefined,
            minWidth: 0,
            flexDirection: duasLinhas ? "row" : "column",
            minHeight: 56,
            paddingHorizontal: 2,
            gap: 4,
          }}
        >
          <IconeNavegacao
            nome={item.icone}
            cor={caminho === item.rota ? "#006cba" : "#607b95"}
          />
          <Text
            style={{
              fontSize: 14,
              flexShrink: 1,
              maxWidth: duasLinhas ? "75%" : "100%",
              color: "#003366",
              textAlign: "center",
              fontWeight: caminho === item.rota ? "700" : "500",
            }}
          >
            {item.rotulo}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
