import { CampoData, CampoDataCivil, CampoDataHora } from "./CampoData";
import {
  dataCivilBrasil,
  dataCivilValida,
  interpretarDataCivil,
  instanteDeDataHoraBrasil,
} from "@viva/contracts";
import { Text } from "./TextoAcessivel";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Pressable, TextInput, View, Platform } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import * as Crypto from "expo-crypto";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { Botao, MensagemErro, Carregando, Tela } from "./ElementosInterface";
import { estilos as s } from "./estilos";
import {
  interpretarPressao,
  type OperacaoPendente,
} from "../services/sincronizacao/regrasSincronizacao";
import {
  filaRegistros,
  queueStorageDescription,
} from "../services/sincronizacao/filaRegistros";
import { agendarLembretes } from "../services/lembretes/lembretes";
import type { PlanoLembretes } from "../services/lembretes/calculoLembretes";
import { FluxoFotografia, type ResultadoOcr } from "./FluxoFotografia";
import { GraficoPressao } from "./GraficoPressao";
import { IlustracaoViva } from "./IlustracoesViva";
import {
  memorizarPaciente,
  recuperarPaciente,
} from "../services/pacientes/identificacaoPaciente";
type LinhaDados = Record<string, unknown>;
type Pagina = {
  items: LinhaDados[];
  total: number;
  page: number;
  size: number;
};
const formatarData = (valor: unknown) =>
  new Date(String(valor)).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
const titulos: Record<string, string> = {
  "blood-pressure": "Minha Pressão",
  medications: "Meus Medicamentos",
  activity: "Atividade Física",
  food: "Minha Alimentação",
};
export function TelaCuidado({
  modulo: modulo,
  somenteHistorico: somenteHistorico = false,
  children,
}: {
  modulo: string;
  somenteHistorico?: boolean;
  children?: ReactNode;
}) {
  const parametros = useLocalSearchParams<{
    documento?: string;
    sistolica?: string;
    diastolica?: string;
    pulso?: string;
    atividade?: string;
  }>();
  const { sessao, restaurando, requisicao } = useAutenticacao();
  const [paciente, definirPaciente] = useState(""),
    [linhas, definirLinhas] = useState<LinhaDados[]>([]),
    [planos, definirPlanos] = useState<PlanoLembretes[]>([]),
    [perfil, definirPerfil] = useState<LinhaDados | null>(null),
    [pagina, definirPagina] = useState(0),
    [total, definirTotal] = useState(0);
  const [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState(""),
    [aviso, definirAviso] = useState(""),
    [pendentes, definirPendentes] = useState<OperacaoPendente[]>([]),
    [a, setA] = useState(parametros.sistolica ?? ""),
    [b, setB] = useState(parametros.diastolica ?? ""),
    [pulso, definirPulso] = useState(parametros.pulso ?? ""),
    [confirmado, definirConfirmado] = useState(false),
    [dataHora, definirDataHora] = useState(new Date().toISOString()),
    [atividade, definirAtividade] = useState(
      (parametros.atividade ?? "").slice(0, 160),
    ),
    [duracao, definirDuracao] = useState(""),
    [estadoInformado, definirEstadoInformado] = useState(""),
    [observacoes, definirObservacoes] = useState("");
  const idTitular = sessao?.usuario.id ?? "";
  const [documentoOcr, definirDocumentoOcr] = useState<string | null>(
    parametros.documento ?? null,
  );
  const [filtroInicial, definirFiltroInicial] = useState(""),
    [filtroFinal, definirFiltroFinal] = useState(""),
    [periodo, definirPeriodo] = useState(""),
    [diaAutorrelatos, definirDia] = useState(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    );
  const [exibirFila, definirExibirFila] = useState(false),
    [medicaoExpandida, definirMedicaoExpandida] = useState<string | null>(null),
    [exibirPeriodo, definirExibirPeriodo] = useState(false),
    [periodoRapido, definirPeriodoRapido] = useState("Todos"),
    [exibirPlanos, definirExibirPlanos] = useState(false);
  const [atividadeConcluida, definirAtividadeConcluida] = useState<{
    id: string;
    nome: string;
    minutos: number;
    data: string;
  } | null>(null);
  const rota =
    modulo === "blood-pressure"
      ? "readings"
      : modulo === "activity"
        ? "activities"
        : modulo === "food"
          ? "meals"
          : "medication-events";
  const atualizarFila = useCallback(async () => {
    if (idTitular) definirPendentes(await filaRegistros.read(idTitular));
  }, [idTitular]);
  const sincronizar = useCallback(
    async (force = false) => {
      if (!idTitular) return;
      try {
        if (force) await filaRegistros.retry(idTitular);
        await filaRegistros.sync(idTitular, (caminho, corpo) =>
          requisicao(caminho, { method: "POST", body: corpo }),
        );
        await atualizarFila();
      } catch (e) {
        definirErro(e instanceof Error ? e.message : "Fila indisponível.");
      }
    },
    [idTitular, requisicao, atualizarFila],
  );
  const carregar = useCallback(async () => {
    if (!sessao) return;
    definirOcupado(true);
    definirErro("");
    try {
      const pacienteConsultado = await requisicao<{ id: string }>(
        "/patients/me",
      );
      definirPaciente(pacienteConsultado.id);
      await memorizarPaciente(idTitular, pacienteConsultado.id);
      const diaAtual = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      if (modulo === "medications" && !dataCivilValida(diaAutorrelatos))
        throw new Error("Confira a data dos autorrelatos: dia, mês e ano.");
      const dados = await requisicao<Pagina | LinhaDados[]>(
        `/patients/${pacienteConsultado.id}/${rota}?${modulo === "medications" ? `date=${diaAutorrelatos || diaAtual}` : `page=${pagina}&size=20${modulo === "blood-pressure" ? periodo : ""}`}`,
      );
      definirLinhas(Array.isArray(dados) ? dados : dados.items);
      definirTotal(Array.isArray(dados) ? dados.length : dados.total);
      if (modulo === "medications") {
        const planosMedicamentos = await requisicao<PlanoLembretes[]>(
          `/patients/${pacienteConsultado.id}/medications`,
        );
        definirPlanos(planosMedicamentos);
        if (Platform.OS !== "web")
          definirAviso(
            await agendarLembretes(idTitular, planosMedicamentos, false),
          );
      }
      if (modulo === "activity")
        definirPerfil(
          await requisicao<LinhaDados | null>(
            `/patients/${pacienteConsultado.id}/activity-profile`,
          ),
        );
    } catch (e) {
      const saved = await recuperarPaciente(idTitular).catch(() => null);
      if (saved) definirPaciente(saved);
      definirErro(
        e instanceof Error ? e.message : "Não foi possível atualizar.",
      );
    } finally {
      definirOcupado(false);
    }
  }, [
    requisicao,
    sessao,
    idTitular,
    rota,
    modulo,
    pagina,
    periodo,
    diaAutorrelatos,
  ]);
  useEffect(() => {
    void carregar();
    void atualizarFila();
    const timer = setInterval(() => {
      void sincronizar();
    }, 15000);
    return () => clearInterval(timer);
  }, [carregar, atualizarFila, sincronizar]);
  async function enfileirar(caminho: string, corpo: LinhaDados) {
    if (!sessao || !paciente) return;
    definirOcupado(true);
    definirErro("");
    try {
      await filaRegistros.enqueue({
        id: String(corpo.id),
        owner: idTitular,
        path: caminho,
        body: corpo,
      });
      await sincronizar(true);
      const restantes = await filaRegistros.read(idTitular);
      definirPendentes(restantes);
      definirAviso(
        restantes.some((x) => x.id === corpo.id)
          ? "Registro guardado. Será enviado quando houver conexão."
          : "Registro salvo.",
      );
      if (!restantes.some((x) => x.id === corpo.id)) await carregar();
    } catch (e) {
      definirErro(
        e instanceof Error
          ? e.message
          : "Não foi possível proteger o registro.",
      );
      return false;
    } finally {
      definirOcupado(false);
    }
    return true;
  }
  async function salvarPressao() {
    try {
      const pressao = interpretarPressao(a, b);
      if (!confirmado) {
        definirErro(
          `Confira ${pressao.systolic} / ${pressao.diastolic} mmHg e confirme antes de salvar.`,
        );
        return;
      }
      const instanteEvento = new Date(dataHora);
      if (!Number.isFinite(instanteEvento.getTime()))
        throw new Error("Confira o dia, o mês, o ano e a hora da medição.");
      const aceito = await enfileirar(`/patients/${paciente}/readings`, {
        id: Crypto.randomUUID(),
        systolic: pressao.systolic,
        diastolic: pressao.diastolic,
        pulse: pulso ? Number(pulso) : null,
        measuredAt: instanteEvento.toISOString(),
        source: documentoOcr ? "OCR_CONFIRMED" : "MANUAL",
        ocrDocumentId: documentoOcr,
        ocrConfirmed: documentoOcr ? true : undefined,
      });
      if (!aceito) return;
      setA("");
      setB("");
      definirPulso("");
      definirConfirmado(false);
      definirDocumentoOcr(null);
    } catch (e) {
      definirErro(e instanceof Error ? e.message : "Confira os números.");
    }
  }
  async function salvarAtividade() {
    if (ocupado) return;
    if (!estadoInformado) {
      definirErro("Informe como você se sente antes de registrar.");
      return;
    }
    if (
      !atividade.trim() ||
      !Number.isInteger(Number(duracao)) ||
      Number(duracao) < 1 ||
      Number(duracao) > 1440 ||
      atividade.trim().length > 160
    ) {
      definirErro(
        "Informe a atividade (até 160 caracteres) e a duração de 1 a 1440 minutos.",
      );
      return;
    }
    try {
      const instanteAtividade = new Date(dataHora);
      if (
        !Number.isFinite(instanteAtividade.getTime()) ||
        instanteAtividade.getTime() > Date.now() + 300000 ||
        instanteAtividade.getTime() < Date.parse("1900-01-01T00:00:00Z")
      ) {
        definirErro("Confira a data e hora da atividade já realizada.");
        return;
      }
      const idAtividade = Crypto.randomUUID();
      const aceito = await enfileirar(`/patients/${paciente}/activities`, {
        id: idAtividade,
        type: atividade.trim(),
        durationMinutes: Number(duracao),
        occurredAt: new Date(dataHora).toISOString(),
        notes: observacoes,
        feeling: estadoInformado,
      });
      if (!aceito) return;
      definirEstadoInformado("");
      definirAtividadeConcluida({
        id: idAtividade,
        nome: atividade.trim(),
        minutos: Number(duracao),
        data: dataHora,
      });
      definirAtividade("");
      definirDuracao("");
      definirObservacoes("");
    } catch {
      definirErro("Confira a data e hora.");
    }
  }
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  if (sessao.usuario.papel !== "PATIENT") return <Redirect href="/inicio" />;
  const atividadePendente = pendentes.find(
    (item) => item.id === atividadeConcluida?.id,
  );
  if (atividadeConcluida && modulo === "activity" && !somenteHistorico)
    return (
      <Tela>
        <Text style={s.title} accessibilityRole="header">
          Registro da atividade
        </Text>
        <View style={{ alignItems: "center" }}>
          <IlustracaoViva
            nome={atividadePendente ? "horario" : "confirmado"}
            tamanho={80}
          />
        </View>
        <Text style={[s.title, { textAlign: "center" }]}>
          {atividadePendente
            ? "Atividade aguardando envio"
            : "Sua atividade foi registrada"}
        </Text>
        <Text style={s.body} accessibilityLiveRegion="polite">
          {atividadePendente
            ? "Registro guardado. Será enviado quando houver conexão."
            : "Registro salvo."}
        </Text>
        <View style={s.card}>
          <Text style={s.label}>{atividadeConcluida.nome}</Text>
          <Text style={s.body}>{atividadeConcluida.minutos} minutos</Text>
          <Text style={s.small}>{formatarData(atividadeConcluida.data)}</Text>
        </View>
        {erro && <MensagemErro mensagem={erro} />}
        {atividadePendente && (
          <>
            <Text style={s.small}>
              {atividadePendente.message ||
                "A equipe ainda não recebeu este registro."}
            </Text>
            <Botao
              rotulo="Reenviar atividade"
              ocupado={ocupado}
              onPress={() => {
                definirOcupado(true);
                void sincronizar(true).finally(() => definirOcupado(false));
              }}
            />
            <Botao
              secundario
              rotulo="Revisar fila de registros"
              onPress={() => {
                definirExibirFila(true);
                definirAtividadeConcluida(null);
              }}
            />
          </>
        )}
        <Botao
          rotulo="Ver minha semana de atividades"
          onPress={() => router.push("/atividade-fisica/historico")}
        />
        <Botao
          secundario
          rotulo="Registrar outra atividade"
          onPress={() => definirAtividadeConcluida(null)}
        />
        <Botao
          secundario
          rotulo="Voltar ao início"
          onPress={() => router.dismissTo("/inicio")}
        />
      </Tela>
    );
  return (
    <Tela>
      <Text style={[s.title, { fontSize: 23 }]} accessibilityRole="header">
        {somenteHistorico
          ? modulo === "blood-pressure"
            ? "Meu Histórico de Pressão"
            : "Meu Histórico"
          : (titulos[modulo] ?? "Histórico")}
      </Text>
      {children}
      {erro && <MensagemErro mensagem={erro} />}{" "}
      {aviso && (
        <Text accessibilityLiveRegion="polite" style={s.body}>
          {aviso}
        </Text>
      )}
      {ocupado && <Carregando />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Detalhes da sincronização"
        onPress={() => definirExibirFila(!exibirFila)}
      >
        <Text style={s.small}>
          {pendentes.length} registros pendentes de sincronização　⌄
        </Text>
      </Pressable>
      {(exibirFila || pendentes.length > 0) && (
        <View style={s.notice}>
          <Text style={s.label}>
            {pendentes.length} registros pendentes de sincronização
          </Text>
          <Text style={s.small}>{queueStorageDescription}</Text>
          {pendentes.map((item) => (
            <Text key={item.id} style={s.small}>
              {item.state === "ERROR" ? "Falha / nova tentativa" : "Pendente"} ·{" "}
              {item.message ?? "Aguardando envio"}
            </Text>
          ))}
          <Botao
            secundario
            rotulo="Sincronizar agora"
            onPress={() => {
              void sincronizar(true).then(carregar);
            }}
          />
        </View>
      )}
      {!somenteHistorico && modulo === "blood-pressure" && (
        <View style={s.card}>
          <Text style={s.title} accessibilityRole="header">
            Registrar pressão
          </Text>
          <Text style={s.body}>
            Leia os números no aparelho. O celular não mede pressão pela câmera.
            Sem diagnóstico automático.
          </Text>
          {[
            ["Sistólica", a, setA],
            ["Diastólica", b, setB],
            ["Pulso (opcional)", pulso, definirPulso],
          ].map(([label, valor, set]) => (
            <View key={String(label)}>
              <Text style={s.label}>{String(label)}</Text>
              <TextInput
                style={s.field}
                accessibilityLabel={String(label)}
                keyboardType="numeric"
                value={String(valor)}
                onChangeText={(v) => {
                  (set as (v: string) => void)(v);
                  definirConfirmado(false);
                }}
              />
            </View>
          ))}
          <CampoDataHora
            rotulo="da medição"
            valor={dataHora}
            aoAlterar={definirDataHora}
          />
          {a && b && (
            <Text style={s.body}>
              {(() => {
                try {
                  const pacienteConsultado = interpretarPressao(a, b);
                  return `Confira: ${pacienteConsultado.systolic} / ${pacienteConsultado.diastolic} mmHg${pacienteConsultado.converted ? " (conversão de valores abreviados)" : ""}.`;
                } catch {
                  return "Confira os valores informados.";
                }
              })()}
            </Text>
          )}
          <Botao
            secundario
            rotulo={
              confirmado ? "Valores confirmados" : "Confirmar estes valores"
            }
            onPress={() => {
              try {
                interpretarPressao(a, b);
                definirConfirmado(true);
                definirErro("");
              } catch (e) {
                definirErro(
                  e instanceof Error ? e.message : "Confira os valores.",
                );
              }
            }}
          />
          <Botao
            rotulo="Salvar pressão"
            ocupado={ocupado}
            onPress={() => {
              void salvarPressao();
            }}
          />
        </View>
      )}
      {modulo === "blood-pressure" && (
        <View style={s.section}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["Semana", "Mês", "Todos"].map((rotulo) => (
              <Pressable
                key={rotulo}
                accessibilityRole="button"
                accessibilityState={{ selected: periodoRapido === rotulo }}
                onPress={() => {
                  definirPeriodoRapido(rotulo);
                  definirPagina(0);
                  definirPeriodo(
                    rotulo === "Todos"
                      ? ""
                      : `&from=${encodeURIComponent(new Date(Date.now() - (rotulo === "Semana" ? 7 : 30) * 86400000).toISOString())}`,
                  );
                }}
                style={{
                  flex: 1,
                  minHeight: 46,
                  backgroundColor:
                    periodoRapido === rotulo ? "#0077d4" : "#e9f2fc",
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: periodoRapido === rotulo ? "#fff" : "#00376b",
                    fontSize: 16,
                  }}
                >
                  {rotulo}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escolher outro período"
            onPress={() => definirExibirPeriodo(!exibirPeriodo)}
          >
            <Text style={[s.small, { color: "#0077d4", textAlign: "right" }]}>
              Outro período　⌄
            </Text>
          </Pressable>
          {exibirPeriodo && (
            <View style={s.card}>
              <Text style={s.title}>Filtrar medições por período</Text>
              <CampoData
                rotulo="Início do período"
                valor={filtroInicial}
                aoAlterar={definirFiltroInicial}
              />
              <CampoData
                rotulo="Fim do período"
                valor={filtroFinal}
                aoAlterar={definirFiltroFinal}
              />
              <Botao
                secundario
                rotulo="Aplicar período"
                onPress={() => {
                  try {
                    const inicial = filtroInicial
                      ? interpretarDataCivil(filtroInicial)
                      : null;
                    const final = filtroFinal
                      ? interpretarDataCivil(filtroFinal)
                      : null;
                    if ((filtroInicial && !inicial) || (filtroFinal && !final))
                      throw new Error();
                    const start = filtroInicial
                        ? instanteDeDataHoraBrasil(inicial!, "00:00")
                        : null,
                      end = filtroFinal
                        ? new Date(
                            Date.parse(
                              instanteDeDataHoraBrasil(final!, "23:59")!,
                            ) + 59999,
                          ).toISOString()
                        : null;
                    if (start && end && start > end) throw new Error();
                    definirPeriodo(
                      `${start ? `&from=${encodeURIComponent(start)}` : ""}${end ? `&to=${encodeURIComponent(end)}` : ""}`,
                    );
                    definirPagina(0);
                  } catch {
                    definirErro("Informe um período válido.");
                  }
                }}
              />
            </View>
          )}
          <GraficoPressao
            registros={linhas.map((resposta) => ({
              sistolica: Number(resposta.systolic),
              diastolica: Number(resposta.diastolic),
              dataMedicao: String(resposta.measuredAt),
            }))}
          />
        </View>
      )}
      {modulo === "medications" && (
        <>
          <Text style={s.body}>
            Aqui estão os horários dos seus medicamentos para o dia selecionado.
          </Text>

          {exibirPlanos && (
            <>
              <View style={s.card}>
                <Text style={s.body}>
                  Plano definido pelo profissional. Respostas são autorrelatos.
                  Sem confirmação não significa que a dose não foi tomada. Não
                  tome dose extra por orientação deste aplicativo.
                </Text>
                <Botao
                  secundario
                  rotulo="Autorizar e agendar lembretes locais"
                  onPress={() => {
                    agendarLembretes(idTitular, planos, true)
                      .then(definirAviso)
                      .catch(() =>
                        definirErro(
                          "Não foi possível agendar notificações neste build.",
                        ),
                      );
                  }}
                />
              </View>
              <Text style={s.title}>Planos da equipe</Text>
              {planos.map((plano) => (
                <View style={s.card} key={plano.id}>
                  <Text style={s.label}>{plano.name}</Text>
                  <Text style={s.body}>{plano.instruction}</Text>
                  <Text style={s.body}>
                    Horários: {plano.schedules.join(", ")}
                  </Text>
                  <Text style={s.small}>
                    Vigência: {dataCivilBrasil(plano.startsOn)} a{" "}
                    {plano.endsOn
                      ? dataCivilBrasil(plano.endsOn)
                      : "sem data final"}{" "}
                    · versão {plano.version}
                  </Text>
                </View>
              ))}
              <CampoDataCivil
                rotulo="Dia dos autorrelatos"
                valor={diaAutorrelatos}
                aoAlterar={definirDia}
              />
            </>
          )}
          {linhas.length === 0 && (
            <Text style={s.body}>Nenhum horário programado para hoje.</Text>
          )}
          {linhas.map((ev, i) => (
            <View
              style={[s.card, { flexDirection: "row", padding: 14, gap: 12 }]}
              key={i}
            >
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={[s.title, { fontSize: 20, lineHeight: 27 }]}>
                  {String(ev.name)}
                </Text>
                <Text style={[s.body, { fontSize: 16, lineHeight: 23 }]}>
                  {String(ev.instruction)}
                </Text>
                <Text style={[s.label, { fontSize: 14 }]}>
                  {ev.status === "TAKEN"
                    ? "Tomei (autorrelato)"
                    : ev.status === "NOT_TAKEN"
                      ? "Não tomei (autorrelato)"
                      : "Sem confirmação"}
                </Text>
                {Boolean(ev.reportedAt) && (
                  <Text style={s.small}>
                    Resposta: {formatarData(ev.reportedAt)}
                  </Text>
                )}
              </View>
              <View style={{ width: 120, gap: 8 }}>
                <Text
                  style={[s.label, { color: "#0077d4", textAlign: "center" }]}
                >
                  {new Date(String(ev.scheduledAt)).toLocaleTimeString(
                    "pt-BR",
                    {
                      timeZone: "America/Sao_Paulo",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </Text>
                {ev.status === "NO_CONFIRMATION" && (
                  <>
                    <Botao
                      rotulo="Tomei"
                      compacto
                      onPress={() => {
                        void enfileirar(
                          `/patients/${paciente}/medication-reports`,
                          {
                            id: Crypto.randomUUID(),
                            planId: ev.planId,
                            scheduledAt: ev.scheduledAt,
                            status: "TAKEN",
                            reportedAt: new Date().toISOString(),
                          },
                        );
                      }}
                    />
                    <Botao
                      secundario
                      rotulo="Não tomei"
                      compacto
                      onPress={() => {
                        void enfileirar(
                          `/patients/${paciente}/medication-reports`,
                          {
                            id: Crypto.randomUUID(),
                            planId: ev.planId,
                            scheduledAt: ev.scheduledAt,
                            status: "NOT_TAKEN",
                            reportedAt: new Date().toISOString(),
                          },
                        );
                      }}
                    />
                  </>
                )}
              </View>
            </View>
          ))}
          <Botao
            secundario
            rotulo={
              exibirPlanos
                ? "Ocultar planos e lembretes"
                : "Ver todos os medicamentos"
            }
            onPress={() => definirExibirPlanos(!exibirPlanos)}
          />
        </>
      )}
      {!somenteHistorico && modulo === "activity" && (
        <>
          <View style={s.notice}>
            <Text style={s.title}>Recomendação personalizada indisponível</Text>
            <Text style={s.body}>
              Critérios clínicos ainda aguardam aprovação. Esta tela registra a
              atividade que você informar; não autoriza exercício.
            </Text>
            {perfil && (
              <Text style={s.body}>
                Orientações da equipe: {String(perfil.professionalGuidance)}
                {"\n"}Restrições: {String(perfil.restrictions)}
              </Text>
            )}
          </View>
          <View style={s.card}>
            <Text style={s.label}>Como você se sente?</Text>
            {[
              ["WELL", "Estou bem"],
              ["TIRED", "Estou cansado"],
              ["UNWELL", "Estou me sentindo mal"],
            ].map(([valor = "", label = ""]) => (
              <Botao
                key={valor}
                secundario
                rotulo={`${estadoInformado === valor ? "✓ " : ""}${label}`}
                onPress={() => definirEstadoInformado(valor)}
              />
            ))}
            {estadoInformado === "UNWELL" && (
              <Text style={s.body}>
                Não há sugestão de exercício. Siga as orientações da sua equipe
                e procure atendimento conforme a situação.
              </Text>
            )}
            <Text style={s.label}>Atividade realizada voluntariamente</Text>
            <TextInput
              accessibilityLabel="Atividade realizada"
              maxLength={160}
              style={s.field}
              value={atividade}
              onChangeText={definirAtividade}
            />
            <Text style={s.label}>Duração em minutos</Text>
            <TextInput
              accessibilityLabel="Duração em minutos"
              style={s.field}
              keyboardType="numeric"
              value={duracao}
              onChangeText={definirDuracao}
            />
            <CampoDataHora
              rotulo="da atividade"
              valor={dataHora}
              aoAlterar={definirDataHora}
            />
            <Text style={s.label}>Observações</Text>
            <TextInput
              style={s.field}
              value={observacoes}
              maxLength={2000}
              onChangeText={definirObservacoes}
              multiline
            />
            <Botao
              rotulo="Registrar atividade realizada"
              ocupado={ocupado}
              onPress={() => {
                void salvarAtividade();
              }}
            />
          </View>
        </>
      )}
      {modulo !== "medications" && modulo !== "food" && (
        <View style={s.section}>
          <Text style={s.title} accessibilityRole="header">
            {modulo === "blood-pressure"
              ? "Seus últimos registros"
              : "Histórico"}
          </Text>
          {linhas.length === 0 && !ocupado && (
            <Text style={s.body}>Nenhum registro disponível.</Text>
          )}
          {linhas.map((resposta, i) => (
            <View
              style={[
                s.card,
                modulo === "blood-pressure" && {
                  padding: 12,
                  borderRadius: 10,
                  gap: 6,
                },
              ]}
              key={String(resposta.id ?? i)}
            >
              {modulo === "blood-pressure" ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Detalhes da medição ${formatarData(resposta.measuredAt)}`}
                    onPress={() =>
                      definirMedicaoExpandida(
                        medicaoExpandida === String(resposta.id)
                          ? null
                          : String(resposta.id),
                      )
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Text style={s.small}>
                      {new Date(String(resposta.measuredAt)).toLocaleString(
                        "pt-BR",
                        {
                          timeZone: "America/Sao_Paulo",
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </Text>
                    <Text style={[s.title, { fontSize: 20, lineHeight: 28 }]}>
                      {String(resposta.systolic)} / {String(resposta.diastolic)}{" "}
                      mmHg
                    </Text>
                  </Pressable>
                  {medicaoExpandida === String(resposta.id) && (
                    <>
                      <Text style={s.body}>
                        Medição: {formatarData(resposta.measuredAt)}
                      </Text>
                      <Text style={s.small}>
                        Origem:{" "}
                        {resposta.source === "PRINTED_DIARY"
                          ? "Diário transcrito"
                          : resposta.source === "OCR_CONFIRMED"
                            ? "Foto confirmada"
                            : resposta.source === "PROFESSIONAL"
                              ? "Profissional"
                              : "Digitação manual"}
                        . Enviado: {formatarData(resposta.syncedAt)}
                      </Text>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Text style={s.title}>
                    {String(resposta.type ?? "Registro")}
                  </Text>
                  <Text style={s.body}>
                    {resposta.durationMinutes
                      ? `${resposta.durationMinutes} minutos · `
                      : ""}
                    {formatarData(resposta.occurredAt ?? resposta.createdAt)}
                  </Text>
                  <Text style={s.body}>{String(resposta.notes ?? "")}</Text>
                </>
              )}
            </View>
          ))}
          {pagina > 0 && (
            <Botao
              secundario
              rotulo="Página anterior"
              onPress={() =>
                definirPagina((pacienteConsultado) => pacienteConsultado - 1)
              }
            />
          )}{" "}
          {(pagina + 1) * 20 < total && (
            <Botao
              secundario
              rotulo="Próxima página"
              onPress={() =>
                definirPagina((pacienteConsultado) => pacienteConsultado + 1)
              }
            />
          )}
        </View>
      )}
      {!somenteHistorico && paciente && modulo === "blood-pressure" && (
        <FluxoFotografia
          idPaciente={paciente}
          finalidade="PRESSURE_DISPLAY"
          aoReconhecer={(resposta: ResultadoOcr) => {
            setA(String(resposta.systolic));
            setB(String(resposta.diastolic));
            definirPulso(resposta.pulse ? String(resposta.pulse) : "");
            definirDocumentoOcr(resposta.id);
            definirConfirmado(false);
            definirAviso(
              "OCR concluído. Confira os números no formulário e confirme antes de salvar.",
            );
          }}
        />
      )}
      {paciente && modulo === "food" && (
        <FluxoFotografia idPaciente={paciente} finalidade="MEAL" />
      )}
      <Botao
        secundario
        rotulo="Atualizar histórico"
        onPress={() => {
          void carregar();
        }}
      />
      <Botao
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}
