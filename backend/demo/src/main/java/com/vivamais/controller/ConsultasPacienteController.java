package com.vivamais.controller;

import static com.vivamais.dto.ModelosApi.*;
import com.vivamais.dto.ModelosCuidado.Pagina;
import static com.vivamais.service.CuidadoService.error;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.service.CuidadoService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pacientes/me/consultas")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
public class ConsultasPacienteController {
    public record ConsultaPaciente(UUID id,Instant ocorridaEm,String profissional,String objetivos,String planoCuidado) {}
    private final InstituicaoRepository instituicoes;
    private final CuidadoService cuidados;
    private final JdbcTemplate banco;
    public ConsultasPacienteController(InstituicaoRepository instituicoes,CuidadoService cuidados,JdbcTemplate banco) {
        this.instituicoes=instituicoes;this.cuidados=cuidados;this.banco=banco;
    }
    @GetMapping public Pagina<ConsultaPaciente> listar(@RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessaoAutenticada sessao) {
        if (sessao.usuario().papel()!=Papel.PATIENT) throw error(403,"Recurso exclusivo do próprio paciente.");
        if (page<0 || page>100000 || size<1 || size>100) throw error(400,"Paginação inválida.");
        var paciente=instituicoes.ownPatient(sessao.usuario()).orElseThrow(()->error(404,"Cadastro indisponível."));
        cuidados.autorizarPaciente(paciente.id(),sessao.usuario());
        long total=banco.queryForObject("SELECT count(*) FROM consultation WHERE patient_id=?",Long.class,paciente.id());
        var itens=banco.query("""
            SELECT c.id,c.occurred_at,u.display_name,coalesce(r.conteudo->>'goals',c.goals) AS goals,
              coalesce(r.conteudo->>'carePlan',c.care_plan) AS care_plan FROM consultation c
              JOIN user_account u ON u.id=c.author_id
              LEFT JOIN LATERAL (SELECT conteudo FROM retificacao_registro WHERE id_consulta=c.id ORDER BY versao DESC LIMIT 1) r ON true
            WHERE c.patient_id=? ORDER BY c.occurred_at DESC,c.id DESC LIMIT ? OFFSET ?
            """,(linha,indice)->new ConsultaPaciente(linha.getObject("id",UUID.class),linha.getTimestamp("occurred_at").toInstant(),
                linha.getString("display_name"),linha.getString("goals"),linha.getString("care_plan")),paciente.id(),size,(long)page*size);
        // Anotações internas não fazem parte deste contrato de orientações do paciente.
        return new Pagina<>(itens,total,page,size);
    }
}
