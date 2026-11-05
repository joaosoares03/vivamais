package com.vivamais.controller;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.service.CuidadoService.error;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.service.CuidadoService;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pacientes/{idPaciente}/exportacao")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
public class ExportacaoPacienteController {
    public enum CategoriaExportacao {
        PRESSAO("blood_pressure_reading","measured_at"), MEDICAMENTOS("medication_plan","created_at"),
        AUTORRELATOS("medication_self_report","scheduled_at"), ALIMENTACAO("meal_photo","occurred_at"),
        ATIVIDADES("activity_record","occurred_at"), DIARIO("printed_diary_entry","occurred_at"), CONSULTAS("consultation","occurred_at"),
        RETIFICACOES("retificacao_registro","criado_em","id_paciente","id_autor");
        final String tabela,horario,colunaPaciente,colunaAutor;
        CategoriaExportacao(String tabela,String horario) { this(tabela,horario,"patient_id","author_id"); }
        CategoriaExportacao(String tabela,String horario,String colunaPaciente,String colunaAutor) {
            this.tabela=tabela;this.horario=horario;this.colunaPaciente=colunaPaciente;this.colunaAutor=colunaAutor;
        }
    }
    public record PaginaExportacao(List<Map<String,Object>> itens,long total,int pagina,int tamanho,Instant corteCriacao) {}
    private final CuidadoService cuidados;
    private final InstituicaoRepository instituicoes;
    private final JdbcTemplate banco;
    public ExportacaoPacienteController(CuidadoService cuidados,InstituicaoRepository instituicoes,JdbcTemplate banco) {
        this.cuidados=cuidados;this.instituicoes=instituicoes;this.banco=banco;
    }
    @GetMapping("/{categoria}") @Transactional
    public PaginaExportacao exportar(@PathVariable UUID idPaciente,@PathVariable CategoriaExportacao categoria,
            @RequestParam(defaultValue="0") int pagina,@RequestParam(defaultValue="100") int tamanho,
            @RequestParam(required=false) LocalDate inicio,@RequestParam(required=false) LocalDate fim,
            @RequestParam(required=false) Instant corteCriacao,@AuthenticationPrincipal SessaoAutenticada sessao) {
        var ator=sessao.usuario(); cuidados.exigirProfissional(ator);cuidados.autorizarPaciente(idPaciente,ator);
        if (pagina<0 || pagina>100000 || tamanho<1 || tamanho>100 ||
                (inicio!=null && (inicio.getYear()<1900 || inicio.getYear()>9998)) || (fim!=null && (fim.getYear()<1900 || fim.getYear()>9998)) ||
                (inicio!=null && fim!=null && inicio.isAfter(fim))) throw error(400,"Período ou paginação inválidos.");
        Instant corte=corteCriacao==null?Instant.now():corteCriacao;
        if (corte.isAfter(Instant.now().plusSeconds(60)) || corte.isBefore(Instant.parse("1900-01-01T00:00:00Z")))
            throw error(400,"Corte da exportação inválido.");
        String condicao="r."+categoria.colunaPaciente+"=? AND r."+(categoria==CategoriaExportacao.RETIFICACOES?"criado_em":"created_at")+"<=?";
        var parametros=new ArrayList<Object>(List.of(idPaciente,Timestamp.from(corte)));
        String horarioFiltro=categoria==CategoriaExportacao.RETIFICACOES ?
            "coalesce((SELECT c.occurred_at FROM consultation c WHERE c.id=r.id_consulta),(SELECT d.occurred_at FROM printed_diary_entry d WHERE d.id=r.id_diario))" : "r."+categoria.horario;
        if (categoria==CategoriaExportacao.MEDICAMENTOS) {
            if (inicio!=null) {condicao+=" AND (r.ends_on IS NULL OR r.ends_on>=?)";parametros.add(java.sql.Date.valueOf(inicio));}
            if (fim!=null) {condicao+=" AND r.starts_on<=?";parametros.add(java.sql.Date.valueOf(fim));}
        } else {
            if (inicio!=null) {condicao+=" AND "+horarioFiltro+">=?";parametros.add(Timestamp.from(inicio.atStartOfDay(ZoneId.of("America/Sao_Paulo")).toInstant()));}
            if (fim!=null) {condicao+=" AND "+horarioFiltro+"<?";parametros.add(Timestamp.from(fim.plusDays(1).atStartOfDay(ZoneId.of("America/Sao_Paulo")).toInstant()));}
        }
        long total=banco.queryForObject("SELECT count(*) FROM "+categoria.tabela+" r WHERE "+condicao,Long.class,parametros.toArray());
        String complementos=categoria==CategoriaExportacao.MEDICAMENTOS ?
            ",(SELECT jsonb_agg(s.local_time ORDER BY s.local_time) FROM medication_schedule s WHERE s.plan_id=r.id) AS horarios,"+
            "(SELECT jsonb_agg(jsonb_build_object('versao',h.version,'dados',h.snapshot,'alteradoEm',h.changed_at,'autor',a.display_name) ORDER BY h.version) FROM medication_plan_history h JOIN user_account a ON a.id=h.changed_by WHERE h.plan_id=r.id) AS historico" : "";
        parametros.add(tamanho);parametros.add((long)pagina*tamanho);
        var itens=cuidados.consultarLinhas("SELECT r.*,u.display_name AS author_name"+complementos+
            " FROM "+categoria.tabela+" r JOIN user_account u ON u.id=r."+categoria.colunaAutor+" WHERE "+condicao+
            " ORDER BY r."+categoria.horario+",r.id LIMIT ? OFFSET ?",parametros.toArray());
        instituicoes.auditar(ator,"EXPORTACAO_PAGINA_CONSULTADA","patient",idPaciente);
        return new PaginaExportacao(itens,total,pagina,tamanho,corte);
    }
}
