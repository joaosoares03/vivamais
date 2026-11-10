import type { Paciente } from "@viva/contracts";
import { requisicaoAutenticada } from "@/services/api";
import { ListaPacientes } from "@/components/ListaPacientes";
export default async function Consultas() {
  const pacientes = await requisicaoAutenticada<Paciente[]>("/patients");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Acompanhamento</span>
          <h1>Consultas de enfermagem</h1>
          <p>
            Selecione um paciente autorizado para consultar o histórico ou
            registrar uma nova consulta.
          </p>
        </div>
      </div>
      <section className="panel padded">
        <ListaPacientes patients={pacientes} abaInicial="consultations" />
      </section>
    </>
  );
}
