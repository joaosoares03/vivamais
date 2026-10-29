import type { components } from "./generated";
export {
  validarCpf,
  normalizarCelularBrasileiro,
  mascararCelularBrasileiro,
  formatarCelularBrasileiro,
  type DadosPessoaisPaciente,
} from "./cadastro";
export type { components, paths, operations } from "./generated";
export type UsuarioSessao = components["schemas"]["Usuario"];
export type PapelUsuario = UsuarioSessao["role"];
export type RespostaAutenticacao = components["schemas"]["RespostaAcesso"];
export type Paciente = components["schemas"]["Paciente"];
export type ResumoPainel = components["schemas"]["ResumoPainel"];
export type EstadoModulo = components["schemas"]["Modulo"];
export type ChaveModulo = EstadoModulo["key"];
export {
  gruposCatalogoProfissional,
  grupoCatalogoProfissionalEstaLiberado,
  normalizarGrupoCatalogoProfissional,
  type GrupoCatalogoProfissional,
} from "./atividade";
export interface ProblemaApi {
  status: number;
  title: string;
  detail: string;
}
// Os tipos de domínio são derivados do OpenAPI; os campos JSON existentes mantêm compatibilidade.
export * from "./acessoPaciente";
