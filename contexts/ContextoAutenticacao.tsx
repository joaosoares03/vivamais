import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import type {
  RespostaAutenticacao,
  UsuarioSessao,
  RespostaAcessoPaciente,
} from "@viva/contracts";
import { api } from "../services/api";
import { acessoDemonstracao, acessoTestadores } from "../services/ambiente";
import {
  protegerAcessoTestador,
  renovarAcessoTestador,
  excluirRenovacaoTestador,
} from "../services/autenticacao/acessoTestadores";
import { extrairConviteTeste, type RespostaTestador } from "@viva/contracts";
import { consultasLocais } from "../services/sincronizacao/consultasLocais";
import { ErroApi, sessaoExpirada } from "../services/transporteApi";
import {
  excluirSessaoProtegida,
  lerSessaoProtegida,
  salvarSessaoProtegida,
} from "../services/autenticacao/armazenamentoSessao";
import {
  lerCredencialDispositivo,
  protegerDispositivo,
  excluirDispositivoProtegido,
  renovarAcessoPaciente,
  tipoDispositivo,
} from "../services/autenticacao/dispositivoPaciente";
import { cancelarLembretes } from "../services/lembretes/lembretes";
import {
  converterRespostaAutenticacao,
  type SessaoAplicativo,
} from "../services/autenticacao/tiposAutenticacao";

export interface ValorContextoAutenticacao {
  sessao: SessaoAplicativo | null;
  restaurando: boolean;
  aviso: string | null;
  desafioPendente: boolean;
  consultaOfflineEm: number | null;
  entrar: (cpf: string, nascimento: string) => Promise<boolean>;
  entrarComConvite: (convite: string) => Promise<void>;
  ativarConta: (codigo: string) => Promise<void>;
  sair: () => Promise<void>;
  esquecerDispositivo: () => Promise<void>;
  requisicao: <T>(
    caminho: string,
    opcoes?: { method?: "GET" | "POST" | "PUT"; body?: unknown },
  ) => Promise<T>;
}
export const ContextoAutenticacao =
  createContext<ValorContextoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [sessao, definirSessao] = useState<SessaoAplicativo | null>(null);
  const [restaurando, definirRestaurando] = useState(true);
  const [aviso, definirAviso] = useState<string | null>(null);
  const [desafio, definirDesafio] = useState<{
    valor: string;
    expiraEm: string;
  } | null>(null);
  const renovacao = useRef<Promise<RespostaAutenticacao> | null>(null);
  const geracao = useRef(0);
  const titularAtual = useRef<string | null>(null);
  const [consultaOfflineEm, definirConsultaOfflineEm] = useState<number | null>(
    null,
  );
  useEffect(() => {
    titularAtual.current = sessao?.usuario.id ?? null;
  }, [sessao]);
  const clienteConsultas = useQueryClient();
  const limparSessao = useCallback(
    async (mensagem?: string) => {
      geracao.current++;
      const titular = titularAtual.current;
      if (titular)
        await consultasLocais.excluir(titular).catch(() => undefined);
      definirConsultaOfflineEm(null);
      definirSessao(null);
      definirDesafio(null);
      clienteConsultas.clear();
      definirAviso(mensagem ?? null);
      await excluirSessaoProtegida();
      if (acessoTestadores) await excluirRenovacaoTestador();
    },
    [clienteConsultas],
  );
  const guardarResposta = useCallback(
    async (resposta: RespostaAcessoPaciente): Promise<RespostaAutenticacao> => {
      if (
        !resposta.sessao ||
        resposta.sessao.user.role !== "PATIENT" ||
        sessaoExpirada(resposta.sessao.expiresAt)
      )
        throw new ErroApi(
          "Não foi possível abrir o acesso. Procure sua equipe.",
          401,
        );
      try {
        await protegerDispositivo(resposta);
        await salvarSessaoProtegida(resposta.sessao);
      } catch {
        await api("/auth/paciente/esquecer", {
          method: "POST",
          token: resposta.sessao.accessToken,
          body: { tipo: tipoDispositivo },
        }).catch(() => undefined);
        await excluirDispositivoProtegido().catch(() => undefined);
        throw new ErroApi(
          "Não foi possível proteger o acesso neste aparelho. Tente novamente.",
          0,
        );
      }
      return resposta.sessao;
    },
    [],
  );
  const renovar = useCallback((): Promise<RespostaAutenticacao> => {
    if (acessoDemonstracao)
      return Promise.reject(
        new ErroApi(
          "Entre com CPF e nascimento para continuar a demonstração.",
          401,
        ),
      );
    if (!renovacao.current) {
      const inicio = geracao.current;
      renovacao.current = (
        acessoTestadores
          ? renovarAcessoTestador(() => inicio === geracao.current)
          : renovarAcessoPaciente()
      )
        .then(async (resposta) => {
          if (inicio !== geracao.current) {
            if (resposta.sessao)
              await api("/auth/logout", {
                token: resposta.sessao.accessToken,
                method: "POST",
              }).catch(() => undefined);
            throw new ErroApi("Entre novamente para continuar.", 401);
          }
          return guardarResposta(resposta);
        })
        .finally(() => {
          renovacao.current = null;
        });
    }
    return renovacao.current;
  }, [guardarResposta]);
  useEffect(() => {
    let ativo = true;
    const inicio = geracao.current;
    async function restaurar() {
      try {
        const armazenada = await lerSessaoProtegida();
        let resposta: RespostaAutenticacao;
        if (armazenada) {
          try {
            const usuario = await api<UsuarioSessao>("/auth/me", {
              token: armazenada.accessToken,
            });
            if (usuario.role !== "PATIENT")
              throw new ErroApi("Use o portal profissional.", 401);
            resposta = { ...armazenada, user: usuario };
          } catch (erro) {
            if (
              erro instanceof ErroApi &&
              erro.estadoResposta === 0 &&
              armazenada.user?.role === "PATIENT" &&
              !sessaoExpirada(armazenada.expiresAt)
            ) {
              resposta = { ...armazenada, user: armazenada.user };
              if (ativo)
                definirAviso(
                  "Sem conexão. Os novos registros aguardam envio nesta sessão.",
                );
            } else resposta = await renovar();
          }
        } else resposta = await renovar();
        if (ativo && inicio === geracao.current)
          definirSessao(converterRespostaAutenticacao(resposta));
      } catch {
        await excluirSessaoProtegida().catch(() => undefined);
      } finally {
        if (ativo) definirRestaurando(false);
      }
    }
    void restaurar();
    return () => {
      ativo = false;
    };
  }, [renovar]);
  useEffect(() => {
    if (!sessao) return;
    const verificar = async () => {
      if (Date.parse(sessao.expiraEm) - Date.now() > 60000) return;
      const inicio = geracao.current;
      try {
        const resposta = await renovar();
        if (inicio === geracao.current) {
          definirSessao(converterRespostaAutenticacao(resposta));
          definirAviso(null);
        }
      } catch (erro) {
        if (inicio !== geracao.current) return;
        if (
          sessaoExpirada(sessao.expiraEm) ||
          !(erro instanceof ErroApi && erro.estadoResposta === 0)
        )
          await limparSessao("Entre novamente para continuar.");
      }
    };
    const temporizador = setInterval(() => {
      void verificar();
    }, 30000);
    const inscricao = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void verificar();
    });
    void verificar();
    return () => {
      clearInterval(temporizador);
      inscricao.remove();
    };
  }, [sessao, renovar, limparSessao]);
  const entrar = useCallback(
    async (cpf: string, nascimento: string) => {
      if (acessoTestadores)
        throw new ErroApi(
          "Use o convite privado recebido para os testes.",
          403,
        );
      const inicio = ++geracao.current;
      definirDesafio(null);
      const resposta = await api<RespostaAcessoPaciente>(
        acessoDemonstracao
          ? "/auth/paciente/demonstracao"
          : "/auth/paciente/iniciar",
        {
          method: "POST",
          body: {
            cpf,
            dataNascimento: nascimento,
            tipo: tipoDispositivo,
            credencialDispositivo: await lerCredencialDispositivo(),
          },
        },
      );
      if (inicio !== geracao.current)
        throw new ErroApi("Tente entrar novamente.", 401);
      if (
        resposta.estado === "VERIFICACAO_NECESSARIA" &&
        resposta.desafio &&
        resposta.desafioExpiraEm
      ) {
        definirDesafio({
          valor: resposta.desafio,
          expiraEm: resposta.desafioExpiraEm,
        });
        return false;
      }
      const nova = await guardarResposta(resposta);
      clienteConsultas.clear();
      definirAviso(null);
      definirSessao(converterRespostaAutenticacao(nova));
      return true;
    },
    [clienteConsultas, guardarResposta],
  );
  const entrarComConvite = useCallback(
    async (valor: string) => {
      if (!acessoTestadores)
        throw new ErroApi("Esta versão não utiliza convites de testes.", 403);
      const convite = extrairConviteTeste(valor);
      if (!convite)
        throw new ErroApi(
          "Confira o convite recebido do responsável pelos testes.",
          400,
        );
      const inicio = ++geracao.current;
      definirDesafio(null);
      const resposta = await api<RespostaTestador>("/auth/testadores/convite", {
        method: "POST",
        body: { convite, tipo: tipoDispositivo },
      });
      if (inicio !== geracao.current) {
        await api("/auth/logout", {
          method: "POST",
          token: resposta.sessao.accessToken,
        }).catch(() => undefined);
        throw new ErroApi("Tente entrar novamente.", 401);
      }
      try {
        const acesso = await protegerAcessoTestador(resposta);
        const nova = await guardarResposta(acesso);
        if (inicio !== geracao.current) {
          await excluirRenovacaoTestador();
          return;
        }
        clienteConsultas.clear();
        definirAviso(null);
        definirSessao(converterRespostaAutenticacao(nova));
      } catch (erro) {
        await api("/auth/logout", {
          method: "POST",
          token: resposta.sessao.accessToken,
        }).catch(() => undefined);
        await excluirRenovacaoTestador();
        throw erro;
      }
    },
    [clienteConsultas, guardarResposta],
  );
  const ativarConta = useCallback(
    async (codigo: string) => {
      if (acessoDemonstracao || acessoTestadores)
        throw new ErroApi("Volte à tela de acesso para entrar.", 403);
      if (!desafio || sessaoExpirada(desafio.expiraEm)) {
        definirDesafio(null);
        throw new ErroApi(
          "Volte ao acesso e informe CPF e nascimento novamente.",
          401,
        );
      }
      const inicio = geracao.current;
      let resposta = await api<RespostaAcessoPaciente>(
        "/auth/paciente/verificar",
        {
          method: "POST",
          body: { desafio: desafio.valor, codigo, tipo: tipoDispositivo },
        },
      );
      // Confirma que o navegador aceitou o cookie HttpOnly; não simula persistência quando está bloqueado.
      if (tipoDispositivo === "WEB") {
        try {
          resposta = await renovarAcessoPaciente();
        } catch {
          if (resposta.sessao)
            await api("/auth/logout", {
              method: "POST",
              token: resposta.sessao.accessToken,
            }).catch(() => undefined);
          throw new ErroApi(
            "Permita os cookies deste aplicativo para proteger seu aparelho. Depois solicite um novo código à equipe.",
            401,
          );
        }
      }
      const nova = await guardarResposta(resposta);
      if (inicio !== geracao.current) return;
      clienteConsultas.clear();
      definirDesafio(null);
      definirAviso("Acesso ativado. Seu aparelho está autorizado.");
      definirSessao(converterRespostaAutenticacao(nova));
    },
    [desafio, clienteConsultas, guardarResposta],
  );
  const sair = useCallback(async () => {
    if (!sessao) return;
    let token = sessao.tokenAcesso;
    if (renovacao.current) token = (await renovacao.current).accessToken;
    try {
      await api("/auth/logout", { token, method: "POST" });
    } catch (erro) {
      if (!(erro instanceof ErroApi && erro.estadoResposta === 401)) throw erro;
      try {
        const atual = await renovar();
        await api("/auth/logout", { token: atual.accessToken, method: "POST" });
      } catch (falha) {
        if (!(falha instanceof ErroApi && falha.estadoResposta === 401))
          throw falha;
      }
    }
    await cancelarLembretes(sessao.usuario.id).catch(() => undefined);
    await limparSessao(
      acessoTestadores
        ? "Sessão encerrada. Solicite um novo convite para voltar a testar."
        : acessoDemonstracao
          ? "Sessão encerrada. Entre com CPF e nascimento para continuar."
          : "Sessão encerrada. Seu aparelho continua autorizado.",
    );
  }, [sessao, limparSessao, renovar]);
  const esquecerDispositivo = useCallback(async () => {
    if (!sessao) return;
    await api("/auth/paciente/esquecer", {
      token: sessao.tokenAcesso,
      method: "POST",
      body: { tipo: tipoDispositivo },
    });
    await excluirDispositivoProtegido();
    await cancelarLembretes(sessao.usuario.id).catch(() => undefined);
    await limparSessao(
      "Aparelho desautorizado. Para entrar, peça um novo código à sua equipe.",
    );
  }, [sessao, limparSessao]);
  const requisicao = useCallback(
    async <T,>(
      caminho: string,
      opcoes: { method?: "GET" | "POST" | "PUT"; body?: unknown } = {},
    ): Promise<T> => {
      if (!sessao) throw new ErroApi("Entre novamente para continuar.", 401);
      const geracaoRequisicao = geracao.current;
      let token = sessao.tokenAcesso;
      if (sessaoExpirada(sessao.expiraEm)) {
        try {
          const nova = await renovar();
          token = nova.accessToken;
          definirSessao(converterRespostaAutenticacao(nova));
        } catch {
          await limparSessao("Entre novamente para continuar.");
          throw new ErroApi("Entre novamente para continuar.", 401);
        }
      }
      try {
        const resposta = await api<T>(caminho, { ...opcoes, token });
        if (geracaoRequisicao !== geracao.current)
          throw new ErroApi("O acesso mudou. Entre novamente.", 401);
        if (!opcoes.method || opcoes.method === "GET")
          await consultasLocais
            .guardar(sessao.usuario.id, caminho, resposta, sessao.expiraEm)
            .catch(() => undefined);
        if (geracaoRequisicao !== geracao.current) {
          await consultasLocais
            .excluir(sessao.usuario.id)
            .catch(() => undefined);
          throw new ErroApi("O acesso mudou. Entre novamente.", 401);
        }
        definirConsultaOfflineEm(null);
        return resposta;
      } catch (erro) {
        if (geracaoRequisicao !== geracao.current) throw erro;
        if (
          erro instanceof ErroApi &&
          erro.estadoResposta === 0 &&
          (!opcoes.method || opcoes.method === "GET")
        ) {
          const salva = await consultasLocais
            .recuperar<T>(sessao.usuario.id, caminho, sessao.expiraEm)
            .catch(() => null);
          if (salva && geracaoRequisicao === geracao.current) {
            definirConsultaOfflineEm(salva.salvoEm);
            return salva.dados;
          }
        }
        if (erro instanceof ErroApi && erro.estadoResposta === 401)
          await limparSessao("Entre novamente para continuar.");
        throw erro;
      }
    },
    [sessao, renovar, limparSessao],
  );
  return (
    <ContextoAutenticacao.Provider
      value={{
        sessao,
        restaurando,
        aviso,
        desafioPendente: !!desafio,
        consultaOfflineEm,
        entrar,
        entrarComConvite,
        ativarConta,
        sair,
        esquecerDispositivo,
        requisicao,
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
}
