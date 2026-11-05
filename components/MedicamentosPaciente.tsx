import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { IconeHorario } from "./IconeHorario";
import { useQuery } from "@tanstack/react-query";
import {
  dataCivilBrasil,
  dataCivilValida,
  deslocarDataCivil,
  hojeBrasil,
} from "@viva/contracts";
import { Text } from "./TextoAcessivel";
import {
  Tela,
  MarcaViva,
  Botao,
  Carregando,
  MensagemErro,
} from "./ElementosInterface";
import { BarraNavegacao } from "./BarraNavegacao";
import { CampoDataCivil } from "./CampoData";
import { estilos as e } from "./estilos";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useMedicamentos } from "../hooks/useMedicamentos";
import { relatoPendente } from "../services/medicamentos/regrasDoses";
import {
  agendarLembretes,
  lerPreferenciasLembretes,
  salvarPreferenciasLembretes,
} from "../services/lembretes/lembretes";
import type { PlanoLembretes } from "../services/lembretes/calculoLembretes";

export function MedicamentosPaciente({
  abrirLembretes = false,
}: {
  abrirLembretes?: boolean;
}) {
  const { sessao, restaurando, requisicao } = useAutenticacao();
  const hoje = hojeBrasil();
  const [periodo, definirPeriodo] = useState({ inicio: hoje, fim: hoje }),
    [filtro, definirFiltro] = useState("Hoje");
  const [calendario, definirCalendario] = useState(false),
    [personalizado, definirPersonalizado] = useState(false);
  const [diaEscolhido, definirDia] = useState(hoje),
    [inicioCampo, definirInicio] = useState(hoje),
    [fimCampo, definirFim] = useState(hoje);
  const [erroPeriodo, definirErroPeriodo] = useState(""),
    [exibirLembretes, definirExibirLembretes] = useState(abrirLembretes);
  const [preferencias, definirPreferencias] = useState({
      habilitados: false,
      antecipar: true,
    }),
    [avisoLembretes, definirAvisoLembretes] = useState(""),
    [ajustando, definirAjustando] = useState(false);
  const medicamentos = useMedicamentos(periodo.inicio, periodo.fim);
  const titular = sessao?.usuario.id ?? "";
  const [titularPreferencias, definirTitularPreferencias] = useState("");
  const planos = useQuery({
    queryKey: ["planos-lembretes", titular, medicamentos.paciente.data?.id],
    enabled: !!medicamentos.paciente.data?.id,
    queryFn: () =>
      requisicao<PlanoLembretes[]>(
        `/patients/${medicamentos.paciente.data!.id}/medications`,
      ),
  });
  useEffect(() => {
    let ativo = true;
    definirPreferencias({ habilitados: false, antecipar: true });
    definirAvisoLembretes("");
    if (titular)
      void lerPreferenciasLembretes(titular)
        .then((valor) => {
          if (ativo) {
            definirPreferencias(valor);
            definirTitularPreferencias(titular);
          }
        })
        .catch(() => {
          if (ativo)
            definirAvisoLembretes(
              "Não foi possível abrir as preferências deste aparelho.",
            );
        });
    return () => {
      ativo = false;
    };
  }, [titular]);
  useEffect(() => {
    if (titular && planos.data && Platform.OS !== "web")
      void agendarLembretes(titular, planos.data, false).catch(() => undefined);
  }, [titular, planos.data]);
  async function ajustarLembretes(valor: typeof preferencias) {
    if (ajustando || !titular || titularPreferencias !== titular) return;
    if (valor.habilitados && (!planos.data || planos.isError)) {
      definirAvisoLembretes(
        "Atualize os horários cadastrados antes de ativar os lembretes.",
      );
      return;
    }
    definirAjustando(true);
    try {
      await salvarPreferenciasLembretes(titular, valor);
      definirPreferencias(valor);
      definirAvisoLembretes(
        await agendarLembretes(titular, planos.data ?? [], valor.habilitados),
      );
    } catch {
      definirAvisoLembretes(
        "Não foi possível configurar os lembretes. Seus registros continuam disponíveis.",
      );
    } finally {
      definirAjustando(false);
    }
  }
  function escolherPeriodo(inicio: string, fim: string, rotulo: string) {
    if (
      !dataCivilValida(inicio) ||
      !dataCivilValida(fim) ||
      fim < inicio ||
      fim > deslocarDataCivil(inicio, 30)
    ) {
      definirErroPeriodo("Escolha datas válidas e um período de até31 dias.");
      return;
    }
    definirErroPeriodo("");
    definirPeriodo({ inicio, fim });
    definirFiltro(rotulo);
  }
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  const dias = medicamentos.agenda.data?.dias ?? [];
  const proximo = dias
    .flatMap((dia) => dia.eventos)
    .filter(
      (evento) =>
        evento.status === "NO_CONFIRMATION" &&
        Date.parse(evento.scheduledAt) >= Date.now(),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
  return (
    <Tela rodape={<BarraNavegacao />}>
      <MarcaViva />
      <Text accessibilityRole="header" style={e.title}>
        {abrirLembretes ? "Meus Lembretes" : "Meus Medicamentos"}
      </Text>
      <Text style={e.body}>
        Consulte seu plano e registre como foi cada horário.
      </Text>
      <View style={s.filtros}>
        {["Hoje", "Ontem", "7 dias", "Período"].map((rotulo) => (
          <View key={rotulo} style={s.filtro}>
            <Botao
              rotulo={rotulo}
              secundario={filtro !== rotulo}
              onPress={() => {
                if (rotulo === "Período") {
                  definirPersonalizado(!personalizado);
                  return;
                }
                definirPersonalizado(false);
                escolherPeriodo(
                  rotulo === "Ontem"
                    ? deslocarDataCivil(hoje, -1)
                    : rotulo === "7 dias"
                      ? deslocarDataCivil(hoje, -6)
                      : hoje,
                  rotulo === "Ontem" ? deslocarDataCivil(hoje, -1) : hoje,
                  rotulo,
                );
              }}
            />
          </View>
        ))}
      </View>
      {personalizado && (
        <View style={e.card}>
          <CampoDataCivil
            rotulo="Início do histórico de medicamentos"
            valor={inicioCampo}
            aoAlterar={definirInicio}
          />
          <CampoDataCivil
            rotulo="Fim do histórico de medicamentos"
            valor={fimCampo}
            aoAlterar={definirFim}
          />
          <Botao
            rotulo="Consultar período"
            onPress={() => escolherPeriodo(inicioCampo, fimCampo, "Período")}
          />
        </View>
      )}
      <Botao
        secundario
        rotulo={calendario ? "Fechar calendário" : "Escolher dia no calendário"}
        onPress={() => definirCalendario(!calendario)}
      />
      {calendario && (
        <View style={e.card}>
          <Text style={e.label}>Calendário de medicamentos</Text>
          <Text style={e.small}>
            Deslize para consultar outra data ou informe o dia abaixo.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={s.semana}
          >
            {Array.from({ length: 14 }, (_, i) =>
              deslocarDataCivil(hoje, i - 7),
            ).map((data) => (
              <View key={data} style={s.diaCalendario}>
                <Botao
                  secundario={periodo.inicio !== data || periodo.fim !== data}
                  rotulo={dataCivilBrasil(data).slice(0, 5)}
                  onPress={() => {
                    definirDia(data);
                    escolherPeriodo(data, data, "Calendário");
                  }}
                />
              </View>
            ))}
          </ScrollView>
          <CampoDataCivil
            rotulo="Dia do calendário de medicamentos"
            valor={diaEscolhido}
            aoAlterar={definirDia}
          />
          <Botao
            rotulo="Ver programação desse dia"
            onPress={() =>
              escolherPeriodo(diaEscolhido, diaEscolhido, "Calendário")
            }
          />
        </View>
      )}
      {!!erroPeriodo && <MensagemErro mensagem={erroPeriodo} />}
      {(medicamentos.agenda.isLoading || medicamentos.paciente.isPending) && (
        <Carregando rotulo="Consultando seus horários…" />
      )}
      {(medicamentos.agenda.error ||
        medicamentos.paciente.error ||
        medicamentos.erro) && (
        <MensagemErro
          mensagem={
            medicamentos.erro ||
            medicamentos.agenda.error?.message ||
            medicamentos.paciente.error?.message ||
            "Não foi possível consultar os medicamentos."
          }
        />
      )}
      {!!medicamentos.mensagem && (
        <View style={e.notice} accessibilityLiveRegion="polite">
          <Text style={e.body}>{medicamentos.mensagem}</Text>
        </View>
      )}
      {proximo && (
        <View style={e.notice}>
          <Text style={e.label}>Próximo horário programado</Text>
          <Text style={e.body}>
            {proximo.horarioLocal.slice(0, 5)} · {proximo.name}
          </Text>
        </View>
      )}
      {dias.map((dia) => (
        <View key={dia.data} style={s.grupo}>
          <View style={e.card}>
            <Text accessibilityRole="header" style={[e.title, s.subtitulo]}>
              {dia.data === hoje
                ? "Seus medicamentos de hoje"
                : dataCivilBrasil(dia.data)}
            </Text>
            <Text style={s.quantidade}>
              {dia.resumo.tomadas} de {dia.resumo.previstas}
            </Text>
            <Text style={e.body}>doses registradas como tomadas</Text>
            <View
              style={s.fundoProgresso}
              accessibilityRole="progressbar"
              accessibilityLabel={`Progresso de ${dataCivilBrasil(dia.data)}`}
              accessibilityValue={{
                min: 0,
                max: Math.max(1, dia.resumo.previstas),
                now: dia.resumo.tomadas,
                text: `${dia.resumo.tomadas} de ${dia.resumo.previstas} doses registradas como tomadas`,
              }}
            >
              <View
                style={[
                  s.progresso,
                  {
                    width: `${dia.resumo.previstas ? Math.round((100 * dia.resumo.tomadas) / dia.resumo.previstas) : 0}%`,
                  },
                ]}
              />
            </View>
            <Text style={e.body}>
              {dia.resumo.pendentes} sem registro · {dia.resumo.naoTomadas}{" "}
              informadas como não tomadas
            </Text>
            {dia.resumo.previstas === 0 && (
              <Text style={e.body}>
                Nenhum horário programado para este dia.
              </Text>
            )}
          </View>
          {dia.eventos.map((evento) => {
            const pendente = relatoPendente(medicamentos.pendentes, evento);
            const resposta =
              evento.status === "TAKEN"
                ? "Registrado como tomado"
                : evento.status === "NOT_TAKEN"
                  ? "Registrado como não tomado"
                  : "Pendente de registro";
            return (
              <View
                key={`${evento.planId}|${evento.scheduledAt}`}
                style={[e.card, s.dose]}
                testID="cartao-dose"
              >
                <View style={s.horario}>
                  <IconeHorario />
                  <Text style={s.hora}>{evento.horarioLocal.slice(0, 5)}</Text>
                </View>
                <Text accessibilityRole="header" style={[e.title, s.subtitulo]}>
                  {evento.name}
                </Text>
                <Text style={e.body}>
                  {evento.dosagem
                    ? `Dosagem cadastrada: ${evento.dosagem}`
                    : "Dosagem não informada pela equipe."}
                </Text>
                <Text style={e.body}>
                  {evento.frequencia}{" "}
                  {evento.frequencia === 1
                    ? "horário por dia"
                    : "horários por dia"}
                </Text>
                <Text style={e.body}>{evento.instruction}</Text>
                <Text style={[e.label, s.situacao]}>{resposta}</Text>
                {!!evento.reportedAt && (
                  <Text style={e.small}>
                    Autorrelato registrado em{" "}
                    {new Date(evento.reportedAt).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </Text>
                )}
                {!!pendente && (
                  <View style={e.notice}>
                    <Text style={e.body}>
                      {pendente.state === "ERROR"
                        ? pendente.message ||
                          "Confira sua resposta antes de tentar enviar novamente."
                        : "Resposta aguardando envio protegido."}
                    </Text>
                  </View>
                )}
                {evento.status === "NO_CONFIRMATION" &&
                  !pendente &&
                  dia.data <= hoje && (
                    <View style={s.acoes}>
                      <Botao
                        rotulo="Tomei este medicamento"
                        ocupado={medicamentos.enviando}
                        onPress={() =>
                          void medicamentos.registrar(evento, "TAKEN")
                        }
                      />
                      <Botao
                        secundario
                        rotulo="Não tomei neste horário"
                        desabilitado={medicamentos.enviando}
                        onPress={() =>
                          void medicamentos.registrar(evento, "NOT_TAKEN")
                        }
                      />
                    </View>
                  )}
                {dia.data > hoje && (
                  <Text style={e.small}>
                    Programação futura. Consulte as instruções cadastradas pela
                    equipe.
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
      {medicamentos.pendentes.length > 0 && (
        <View style={e.card}>
          <Text style={e.body}>
            {medicamentos.pendentes.length} registro(s) na fila protegida deste
            aparelho.
          </Text>
          <Botao
            secundario
            rotulo="Tentar sincronizar registros"
            onPress={() =>
              void medicamentos.sincronizar(true).catch(() => undefined)
            }
          />
        </View>
      )}
      <Botao
        secundario
        rotulo={
          exibirLembretes
            ? "Fechar preferências de lembretes"
            : "Configurar lembretes"
        }
        onPress={() => definirExibirLembretes(!exibirLembretes)}
      />
      {exibirLembretes && (
        <View style={e.card}>
          <Text style={[e.title, s.subtitulo]}>Lembretes neste aparelho</Text>
          <Text style={e.body}>
            Os lembretes seguem os horários cadastrados e não confirmam que o
            medicamento foi tomado.
          </Text>
          {Platform.OS === "web" ? (
            <Text style={e.body}>
              As notificações locais estão disponíveis no aplicativo
              Android/iOS. Este navegador permite consultar seus horários.
            </Text>
          ) : (
            <>
              <Botao
                rotulo={
                  preferencias.habilitados
                    ? "Desativar lembretes"
                    : "Ativar lembretes"
                }
                ocupado={ajustando}
                desabilitado={titularPreferencias !== titular}
                onPress={() =>
                  void ajustarLembretes({
                    ...preferencias,
                    habilitados: !preferencias.habilitados,
                  })
                }
              />
              <Botao
                secundario
                rotulo={
                  preferencias.antecipar
                    ? "Aviso cinco minutos antes: ligado"
                    : "Aviso cinco minutos antes: desligado"
                }
                desabilitado={ajustando || titularPreferencias !== titular}
                onPress={() =>
                  void ajustarLembretes({
                    ...preferencias,
                    antecipar: !preferencias.antecipar,
                  })
                }
              />
            </>
          )}
          {!!avisoLembretes && (
            <Text accessibilityLiveRegion="polite" style={e.body}>
              {avisoLembretes}
            </Text>
          )}
        </View>
      )}
      <Text style={e.small}>
        As respostas são autorrelatos. Ausência de registro não significa dose
        não tomada. Siga o plano da sua equipe; o aplicativo não orienta doses
        extras.
      </Text>
      <Botao
        secundario
        rotulo="Ver histórico de medicamentos"
        onPress={() => router.push("/historico/medicamentos")}
      />
      <Botao
        secundario
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}
const s = StyleSheet.create({
  subtitulo: { fontSize: 22, lineHeight: 30 },
  filtros: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filtro: { flexBasis: "45%", flexGrow: 1, minWidth: 0 },
  grupo: { gap: 12 },
  dose: { borderLeftWidth: 5, borderLeftColor: "#087e69" },
  horario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  hora: { fontSize: 28, lineHeight: 36, fontWeight: "800", color: "#006c58" },
  situacao: { color: "#005f4c" },
  acoes: { gap: 10, marginTop: 8 },
  quantidade: {
    fontSize: 36,
    lineHeight: 46,
    fontWeight: "800",
    color: "#006c58",
  },
  fundoProgresso: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "#dceae5",
    overflow: "hidden",
    marginVertical: 10,
  },
  progresso: { height: 14, backgroundColor: "#087e69" },
  semana: { gap: 8, paddingVertical: 8 },
  diaCalendario: { minWidth: 78 },
});
