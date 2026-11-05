package com.vivamais.service;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.service.CuidadoService.error;
import com.vivamais.repositories.InstituicaoRepository;
import java.util.*;
import jakarta.validation.constraints.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class RetificacaoRegistroService {
    public enum TipoRegistro { CONSULTAS, DIARIO }
    public record EntradaRetificacao(@NotNull @Min(0) Integer versaoAtual,
        @NotBlank @Size(min=10,max=1000) String motivo,@NotNull Map<String,String> conteudo) {}
    private final JdbcTemplate banco;
    private final CuidadoService cuidados;
    private final InstituicaoRepository instituicoes;
    public RetificacaoRegistroService(JdbcTemplate banco,CuidadoService cuidados,InstituicaoRepository instituicoes) {
        this.banco=banco;this.cuidados=cuidados;this.instituicoes=instituicoes;
    }
    private String coluna(TipoRegistro tipo) { return tipo==TipoRegistro.CONSULTAS?"id_consulta":"id_diario"; }
    private String tabela(TipoRegistro tipo) { return tipo==TipoRegistro.CONSULTAS?"consultation":"printed_diary_entry"; }
    private void autorizar(UUID paciente,Usuario ator) { cuidados.exigirProfissional(ator);cuidados.autorizarPaciente(paciente,ator); }
    public List<Map<String,Object>> listar(UUID paciente,TipoRegistro tipo,UUID registro,Usuario ator) {
        autorizar(paciente,ator);
        if (banco.queryForObject("SELECT count(*) FROM "+tabela(tipo)+" WHERE id=? AND patient_id=?",Integer.class,registro,paciente)==0)
            throw error(404,"Registro não encontrado.");
        return cuidados.consultarLinhas("SELECT r.id,r.versao,r.motivo,r.conteudo,r.criado_em,u.display_name AS autor FROM retificacao_registro r JOIN user_account u ON u.id=r.id_autor WHERE r.id_paciente=? AND r."+coluna(tipo)+"=? ORDER BY r.versao DESC",paciente,registro);
    }
    public Map<String,Object> salvar(UUID paciente,TipoRegistro tipo,UUID registro,EntradaRetificacao entrada,Usuario ator) {
        autorizar(paciente,ator);
        var originais=cuidados.consultarLinhas("SELECT * FROM "+tabela(tipo)+" WHERE id=? AND patient_id=? FOR UPDATE",registro,paciente);
        if (originais.isEmpty()) throw error(404,"Registro não encontrado.");
        Set<String> permitidos=tipo==TipoRegistro.CONSULTAS?Set.of("notes","goals","carePlan"):Set.of("notes","medicationReport");
        if (entrada.conteudo().isEmpty() || !permitidos.containsAll(entrada.conteudo().keySet()))
            throw error(400,"Retifique somente as anotações deste registro. Valores de medições são preservados.");
        int versao=banco.queryForObject("SELECT coalesce(max(versao),0) FROM retificacao_registro WHERE "+coluna(tipo)+"=?",Integer.class,registro);
        if (versao!=entrada.versaoAtual()) throw error(409,"Outro profissional atualizou este registro. Consulte a versão atual antes de retificar.");
        var historico=listar(paciente,tipo,registro,ator);
        // Cada versão guarda o conjunto completo de anotações, sem perder correções de versões anteriores.
        var conteudo=new LinkedHashMap<String,Object>();
        for (String campo:permitidos) conteudo.put(campo,originais.getFirst().getOrDefault(campo,""));
        if (!historico.isEmpty()) {
            var anterior=historico.getFirst().get("conteudo");
            if (anterior instanceof Map<?,?> dados) for (String campo:permitidos) if (dados.containsKey(campo)) conteudo.put(campo,dados.get(campo));
        }
        for (var campo:entrada.conteudo().entrySet()) {
            int maximo=tipo==TipoRegistro.DIARIO || campo.getKey().equals("goals")?2000:4000;
            if (campo.getValue()==null || campo.getValue().length()>maximo || (tipo==TipoRegistro.CONSULTAS && campo.getValue().isBlank()))
                throw error(400,"Confira as anotações e seus limites de tamanho.");
            conteudo.put(campo.getKey(),campo.getValue());
        }
        if (entrada.motivo().trim().length()<10) throw error(400,"Informe o motivo da retificação com pelo menos dez caracteres.");
        UUID id=UUID.randomUUID();
        banco.update("INSERT INTO retificacao_registro(id,id_paciente,id_unidade,"+coluna(tipo)+",id_autor,papel_autor,versao,motivo,conteudo) VALUES(?,?,?,?,?,?,?,?,?::jsonb)",
            id,paciente,ator.idUnidade(),registro,ator.id(),ator.papel().name(),versao+1,entrada.motivo().trim(),cuidados.encode(conteudo));
        instituicoes.auditar(ator,"ANOTACAO_RETIFICADA","retificacao_registro",id);
        return listar(paciente,tipo,registro,ator).getFirst();
    }
}
