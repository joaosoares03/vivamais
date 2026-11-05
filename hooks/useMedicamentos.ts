import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as Crypto from "expo-crypto";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AgendaMedicamentos, EventoMedicamento } from "@viva/contracts";
import { useAutenticacao } from "./useAutenticacao";
import { useResumoPaciente } from "./useResumoPaciente";
import { filaRegistros } from "../services/sincronizacao/filaRegistros";
import type { OperacaoPendente } from "../services/sincronizacao/regrasSincronizacao";
import { criarEnfileiradorDoses } from "../services/medicamentos/regrasDoses";
const enfileirarDose = criarEnfileiradorDoses({
  ler: filaRegistros.read,
  adicionar: filaRegistros.enqueue,
  gerarId: Crypto.randomUUID,
  agora: () => new Date(),
});
export function useMedicamentos(inicio: string, fim: string) {
  const { sessao, requisicao } = useAutenticacao(),
    paciente = useResumoPaciente(),
    consultas = useQueryClient();
  const titular = sessao?.usuario.id ?? "";
  const [fila, definirFila] = useState<{
      titular: string;
      itens: OperacaoPendente[];
    }>({ titular: "", itens: [] }),
    [mensagem, definirMensagem] = useState(""),
    [erro, definirErro] = useState(""),
    [enviando, definirEnviando] = useState(false);
  const trava = useRef<symbol | null>(null),
    titularAtual = useRef(titular);
  titularAtual.current = titular;
  const pendentes = fila.titular === titular ? fila.itens : [];
  const agenda = useQuery({
    queryKey: ["medicamentos", titular, paciente.data?.id, inicio, fim],
    enabled: !!paciente.data?.id,
    queryFn: () =>
      requisicao<AgendaMedicamentos>(
        `/patients/${paciente.data!.id}/medication-agenda?from=${inicio}&to=${fim}`,
      ),
  });
  const atualizarFila = useCallback(async () => {
    if (!titular) return;
    const itens = await filaRegistros.read(titular);
    if (titularAtual.current === titular) definirFila({ titular, itens });
  }, [titular]);
  const sincronizar = useCallback(
    async (repetir = false) => {
      if (!titular) return;
      if (repetir) await filaRegistros.retry(titular);
      await filaRegistros.sync(titular, (caminho, corpo) =>
        requisicao(caminho, { method: "POST", body: corpo }),
      );
      await atualizarFila();
      await consultas.invalidateQueries({
        queryKey: ["medicamentos", titular],
      });
      await consultas.invalidateQueries({
        queryKey: ["painel-paciente", titular],
      });
    },
    [titular, requisicao, atualizarFila, consultas],
  );
  useEffect(() => {
    definirMensagem("");
    definirErro("");
    definirEnviando(false);
    trava.current = null;
    void atualizarFila().catch(() => {
      if (titularAtual.current === titular)
        definirErro("Não foi possível abrir a fila protegida.");
    });
    const inscricao = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void sincronizar().catch(() => undefined);
    });
    const temporizador = setInterval(() => {
      void sincronizar().catch(() => undefined);
    }, 30000);
    return () => {
      inscricao.remove();
      clearInterval(temporizador);
    };
  }, [atualizarFila, sincronizar, titular]);
  async function registrar(
    evento: EventoMedicamento,
    situacao: "TAKEN" | "NOT_TAKEN",
  ) {
    if (trava.current || !titular || !paciente.data?.id) return;
    const operacao = Symbol();
    trava.current = operacao;
    definirEnviando(true);
    definirErro("");
    definirMensagem("");
    try {
      const id = await enfileirarDose(
        titular,
        paciente.data.id,
        evento,
        situacao,
      );
      await atualizarFila();
      await sincronizar();
      const pendente = (await filaRegistros.read(titular)).find(
        (item) => item.id === id,
      );
      if (titularAtual.current === titular)
        definirMensagem(
          pendente
            ? "Resposta protegida neste aparelho e aguardando envio. Ela ainda não entrou no progresso salvo."
            : "Resposta registrada. Seu histórico e progresso foram atualizados.",
        );
    } catch (falha) {
      if (titularAtual.current === titular)
        definirErro(
          falha instanceof Error
            ? falha.message
            : "Não foi possível registrar sua resposta.",
        );
    } finally {
      if (trava.current === operacao) {
        trava.current = null;
        definirEnviando(false);
      }
    }
  }
  return {
    agenda,
    paciente,
    pendentes,
    mensagem,
    erro,
    enviando,
    registrar,
    sincronizar,
  };
}
