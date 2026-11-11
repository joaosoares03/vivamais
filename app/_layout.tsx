import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProvedorAutenticacao } from "../contexts/ContextoAutenticacao";
import { ProvedorAtividade } from "../contexts/ContextoAtividade";
import { ProvedorPreferencias } from "../contexts/ContextoPreferencias";

export default function LayoutPrincipal() {
  const [clienteConsultas] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
            // A requisição trata a falta de rede e consulta o cache protegido;
            // pausar aqui impediria esse fluxo e o aviso de dados desatualizados.
            networkMode: "always",
          },
        },
      }),
  );
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={clienteConsultas}>
        <ProvedorAutenticacao>
          <ProvedorAtividade>
            <ProvedorPreferencias>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#f3f7f8" },
                }}
              />
            </ProvedorPreferencias>
          </ProvedorAtividade>
        </ProvedorAutenticacao>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
