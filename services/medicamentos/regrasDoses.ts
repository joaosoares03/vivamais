import type { EventoMedicamento } from "@viva/contracts";
import type { OperacaoPendente } from "../sincronizacao/regrasSincronizacao";
type CorpoDose = { id: string; planId: string; scheduledAt: string; status: "TAKEN" | "NOT_TAKEN"; reportedAt: string };
export function relatoPendente(itens: OperacaoPendente[], evento: EventoMedicamento) {
  return itens.find(item => {
    const corpo = item.body as Partial<CorpoDose> | null;
    return item.path.endsWith("/medication-reports") && corpo?.planId===evento.planId && corpo?.scheduledAt===evento.scheduledAt;
  });
}
export function criarEnfileiradorDoses(dependencias: {
  ler: (titular: string) => Promise<OperacaoPendente[]>;
  adicionar: (operacao: Omit<OperacaoPendente,"state"|"attempts"|"nextAttemptAt">) => Promise<void>;
  gerarId: () => string;
  agora: () => Date;
}) {
  let escrita: Promise<unknown> = Promise.resolve();
  return (titular: string, paciente: string, evento: EventoMedicamento, situacao: "TAKEN"|"NOT_TAKEN") => {
    const registrar = async () => {
      if(evento.status!=="NO_CONFIRMATION") throw new Error("Este horário já tem um autorrelato salvo.");
      const existente=relatoPendente(await dependencias.ler(titular),evento);
      if(existente) {
        if((existente.body as CorpoDose).status!==situacao) throw new Error("Este horário já tem uma resposta aguardando envio. Confira a fila antes de registrar outra.");
        return existente.id;
      }
      const id=dependencias.gerarId();
      await dependencias.adicionar({id,owner:titular,path:`/patients/${paciente}/medication-reports`,body:{id,planId:evento.planId,scheduledAt:evento.scheduledAt,status:situacao,reportedAt:dependencias.agora().toISOString()} satisfies CorpoDose});
      return id;
    };
    const resultado=escrita.then(registrar,registrar);
    escrita=resultado.catch(()=>undefined);
    return resultado;
  };
}
