import {
  normalizarGrupoCatalogoProfissional,
  type components,
  type DadosPessoaisPaciente,
  type GrupoCatalogoProfissional,
} from "@viva/contracts";
import type { VideoSource } from "expo-video";
import type { ImageSourcePropType } from "react-native";
import type { RequisicaoPaciente } from "../pacientes/pacientes";
import { calcularIdade } from "./idade";

/*
 * O catálogo deve continuar importável por Node/Vitest. As mídias são
 * resolvidas somente no fluxo de renderização Expo, em require() estáticos que
 * o Metro inclui no bundle nativo.
 */
/* eslint-disable @typescript-eslint/no-require-imports */

export const VERSAO_CATALOGO_ATIVIDADES = "2026-10-21";

export type GrupoCatalogoAtividade =
  | "RISCO_QUEDA_MOBILIDADE_REDUZIDA"
  | "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA";

export function grupoCatalogoAtividadeAprovado(
  grupoProfissional: unknown,
): GrupoCatalogoAtividade | null {
  switch (normalizarGrupoCatalogoProfissional(grupoProfissional)) {
    case "COM_RISCO_QUEDA_SENTADO":
      return "RISCO_QUEDA_MOBILIDADE_REDUZIDA";
    case "SEM_RISCO_QUEDA_EM_PE":
      return "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA";
    default:
      return null;
  }
}

export type MidiasAtividade = {
  capa: ImageSourcePropType;
  passoUm: ImageSourcePropType;
  passoDois: ImageSourcePropType;
  demonstracao: ImageSourcePropType;
  videoGuiado: VideoSource;
};

export type AtividadeAprovada = {
  id: string;
  nome: string;
  grupo: GrupoCatalogoAtividade;
  versaoCatalogo: typeof VERSAO_CATALOGO_ATIVIDADES;
  aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO";
};

export const gruposCatalogoAtividade: ReadonlyArray<{
  id: GrupoCatalogoAtividade;
  titulo: string;
  descricao: string;
}> = [
  {
    id: "RISCO_QUEDA_MOBILIDADE_REDUZIDA",
    titulo: "Com risco de queda / mobilidade reduzida",
    descricao: "Materiais aprovados para atividades sentadas.",
  },
  {
    id: "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA",
    titulo: "Sem risco de queda / mobilidade preservada",
    descricao: "Materiais aprovados para atividades em pé ou de mobilidade.",
  },
];

export const catalogoAtividadesAprovadas: ReadonlyArray<AtividadeAprovada> = [
  {
    id: "ex01-caminhada-plano",
    nome: "Caminhada no plano",
    grupo: "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex02-marcha-sentada",
    nome: "Marcha sentada",
    grupo: "RISCO_QUEDA_MOBILIDADE_REDUZIDA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex03-bomba-panturrilha",
    nome: "Bomba de panturrilha",
    grupo: "RISCO_QUEDA_MOBILIDADE_REDUZIDA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex04-extensao-joelho",
    nome: "Extensão de joelho",
    grupo: "RISCO_QUEDA_MOBILIDADE_REDUZIDA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex05-giro-ombros",
    nome: "Giro de ombros",
    grupo: "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex06-abertura-peito",
    nome: "Abertura de peito",
    grupo: "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex07-alongamento-pescoco",
    nome: "Alongamento de pescoço",
    grupo: "RISCO_QUEDA_MOBILIDADE_REDUZIDA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex08-alongamento-panturrilha",
    nome: "Alongamento de panturrilha",
    grupo: "RISCO_QUEDA_MOBILIDADE_REDUZIDA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex09-passo-lateral",
    nome: "Passo lateral",
    grupo: "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
  {
    id: "ex10-elevacao-calcanhar-pe",
    nome: "Elevação de calcanhar em pé",
    grupo: "SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA",
    versaoCatalogo: VERSAO_CATALOGO_ATIVIDADES,
    aprovacao: "MIDIAS_APROVADAS_PELA_GESTAO",
  },
];

export function obterMidiasAtividade(id: string): MidiasAtividade {
  switch (id) {
    case "ex01-caminhada-plano":
      return {
        capa: require("../../assets/images/exercicios/ex01-caminhada-plano/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex01-caminhada-plano/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex01-caminhada-plano/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex01-caminhada-plano/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex01-caminhada-plano/guiado.mp4"),
      };
    case "ex02-marcha-sentada":
      return {
        capa: require("../../assets/images/exercicios/ex02-marcha-sentada/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex02-marcha-sentada/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex02-marcha-sentada/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex02-marcha-sentada/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex02-marcha-sentada/guiado.mp4"),
      };
    case "ex03-bomba-panturrilha":
      return {
        capa: require("../../assets/images/exercicios/ex03-bomba-panturrilha/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex03-bomba-panturrilha/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex03-bomba-panturrilha/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex03-bomba-panturrilha/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex03-bomba-panturrilha/guiado.mp4"),
      };
    case "ex04-extensao-joelho":
      return {
        capa: require("../../assets/images/exercicios/ex04-extensao-joelho/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex04-extensao-joelho/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex04-extensao-joelho/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex04-extensao-joelho/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex04-extensao-joelho/guiado.mp4"),
      };
    case "ex05-giro-ombros":
      return {
        capa: require("../../assets/images/exercicios/ex05-giro-ombros/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex05-giro-ombros/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex05-giro-ombros/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex05-giro-ombros/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex05-giro-ombros/guiado.mp4"),
      };
    case "ex06-abertura-peito":
      return {
        capa: require("../../assets/images/exercicios/ex06-abertura-peito/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex06-abertura-peito/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex06-abertura-peito/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex06-abertura-peito/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex06-abertura-peito/guiado.mp4"),
      };
    case "ex07-alongamento-pescoco":
      return {
        capa: require("../../assets/images/exercicios/ex07-alongamento-pescoco/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex07-alongamento-pescoco/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex07-alongamento-pescoco/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex07-alongamento-pescoco/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex07-alongamento-pescoco/guiado.mp4"),
      };
    case "ex08-alongamento-panturrilha":
      return {
        capa: require("../../assets/images/exercicios/ex08-alongamento-panturrilha/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex08-alongamento-panturrilha/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex08-alongamento-panturrilha/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex08-alongamento-panturrilha/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex08-alongamento-panturrilha/guiado.mp4"),
      };
    case "ex09-passo-lateral":
      return {
        capa: require("../../assets/images/exercicios/ex09-passo-lateral/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex09-passo-lateral/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex09-passo-lateral/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex09-passo-lateral/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex09-passo-lateral/guiado.mp4"),
      };
    case "ex10-elevacao-calcanhar-pe":
      return {
        capa: require("../../assets/images/exercicios/ex10-elevacao-calcanhar-pe/capa.webp"),
        passoUm: require("../../assets/images/exercicios/ex10-elevacao-calcanhar-pe/passo-1.webp"),
        passoDois: require("../../assets/images/exercicios/ex10-elevacao-calcanhar-pe/passo-2.webp"),
        demonstracao: require("../../assets/images/exercicios/ex10-elevacao-calcanhar-pe/loop.gif"),
        videoGuiado: require("../../assets/images/exercicios/ex10-elevacao-calcanhar-pe/guiado.mp4"),
      };
    default:
      throw new Error(`Mídias não encontradas para a atividade ${id}.`);
  }
}

export function buscarAtividadeAprovada(id: string | undefined) {
  return catalogoAtividadesAprovadas.find((atividade) => atividade.id === id);
}

export function atividadesDoGrupo(grupo: GrupoCatalogoAtividade) {
  return catalogoAtividadesAprovadas.filter(
    (atividade) => atividade.grupo === grupo,
  );
}

export function atividadesDoGrupoProfissional(grupoProfissional: unknown) {
  const grupoCatalogo = grupoCatalogoAtividadeAprovado(grupoProfissional);
  return grupoCatalogo ? atividadesDoGrupo(grupoCatalogo) : [];
}

export type DadosAtividade = {
  idade: number | null;
  perfil: {
    mobilidade: string;
    equilibrio: string;
    restricoes: string;
    orientacoes: string;
    grupoCatalogoAprovado: GrupoCatalogoProfissional;
    personalizationStatus?: string;
  } | null;
  ultimaMedicao: {
    sistolica?: number;
    diastolica?: number;
    dataMedicao?: string;
  } | null;
};

export type BloqueioSugestaoAtividade =
  | "DADOS_AUSENTES"
  | "SINAL_DE_ALERTA_OU_CONTRAINDICACAO"
  | "PROTOCOLO_CLINICO_PENDENTE"
  | "GRUPO_PROFISSIONAL_NAO_LIBERADO";

export function avaliarBloqueioSugestaoAtividade({
  dados,
  estadoInformado,
  pressaoVerificada,
}: {
  dados: DadosAtividade | undefined;
  estadoInformado: "WELL" | "TIRED" | "UNWELL" | null;
  pressaoVerificada: boolean | null;
}): BloqueioSugestaoAtividade | null {
  if (
    !dados ||
    dados.idade === null ||
    !dados.perfil ||
    !dados.perfil.mobilidade.trim() ||
    !dados.perfil.equilibrio.trim()
  ) {
    return "DADOS_AUSENTES";
  }
  if (
    estadoInformado !== "WELL" ||
    pressaoVerificada !== true ||
    Boolean(dados.perfil.restricoes.trim())
  ) {
    return "SINAL_DE_ALERTA_OU_CONTRAINDICACAO";
  }
  if (!grupoCatalogoAtividadeAprovado(dados.perfil.grupoCatalogoAprovado)) {
    return "GRUPO_PROFISSIONAL_NAO_LIBERADO";
  }
  return null;
}

export async function buscarDadosAtividade(
  requisicao: RequisicaoPaciente,
  idPaciente: string,
): Promise<DadosAtividade> {
  const [perfil, medicoes, pessoais] = await Promise.all([
    requisicao<{
      mobility: string;
      balance: string;
      restrictions: string;
      professionalGuidance: string;
      approvedCatalogGroup?: string;
      personalizationStatus?: string;
    } | null>(`/patients/${idPaciente}/activity-profile`),
    requisicao<{ items: components["schemas"]["RegistroPressao"][] }>(
      `/patients/${idPaciente}/readings?size=1`,
    ),
    requisicao<DadosPessoaisPaciente>(
      `/pacientes/${idPaciente}/dados-pessoais`,
    ),
  ]);
  const ultima = medicoes.items[0];
  return {
    idade: calcularIdade(pessoais.dataNascimento),
    perfil: perfil
      ? {
          mobilidade: perfil.mobility,
          equilibrio: perfil.balance,
          restricoes: perfil.restrictions,
          orientacoes: perfil.professionalGuidance,
          grupoCatalogoAprovado: normalizarGrupoCatalogoProfissional(
            perfil.approvedCatalogGroup,
          ),
          personalizationStatus: perfil.personalizationStatus,
        }
      : null,
    ultimaMedicao: ultima
      ? {
          sistolica: ultima.systolic,
          diastolica: ultima.diastolic,
          dataMedicao: ultima.measuredAt,
        }
      : null,
  };
}
