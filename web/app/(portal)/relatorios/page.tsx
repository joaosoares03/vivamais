import type { Paciente } from "@viva/contracts";
import { requisicaoAutenticada } from "@/services/api";
import { ListaPacientes } from "@/components/ListaPacientes";
export default async function Relatorios() {
  const pacientes = await requisicaoAutenticada<Paciente[]>("/patients");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Gestão</span>
          <h1>Relatórios e resumos</h1>
          <p>
            Escolha um paciente, reúna o resumo dos registros disponíveis e
            exporte os dados em JSON. O acesso fica registrado para auditoria.
          </p>
        </div>
      </div>
      <ol className="passos-relatorio" aria-label="Como gerar um relatório">
        <li>
          <strong>Escolha o paciente</strong>
          <span>Somente pacientes do seu escopo aparecem.</span>
        </li>
        <li>
          <strong>Reúna o resumo</strong>
          <span>Na aba Consultas, use “Reunir resumo para consulta”.</span>
        </li>
        <li>
          <strong>Exporte</strong>
          <span>
            Escolha a categoria e o período. Cada exportação fica auditada.
          </span>
        </li>
      </ol>
      <section
        className="panel padded"
        aria-label="Pacientes disponíveis para relatório"
      >
        <ListaPacientes patients={pacientes} abaInicial="consultations" />
      </section>
    </>
  );
}
