package com.vivamais.service;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosAcessoPaciente.*;
import static com.vivamais.service.CuidadoService.error;
import com.vivamais.service.sms.ServicoEnvioSms;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.security.*;
import com.vivamais.config.PropriedadesAplicacao;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(noRollbackFor=ResponseStatusException.class)
public class AcessoPacienteService {
    private final JdbcTemplate banco;
    private final InstituicaoRepository instituicoes;
    private final CodificadorToken tokens;
    private final ProtecaoAcessoPaciente protecao;
    private final PasswordEncoder senhas;
    private final PropriedadesAplicacao propriedades;
    private final ServicoEnvioSms sms;
    private final com.vivamais.config.ConfiguracaoAcessoDemonstracao demonstracao;
    private final TestadoresService testadores;
    public AcessoPacienteService(JdbcTemplate banco,InstituicaoRepository instituicoes,CodificadorToken tokens,
            ProtecaoAcessoPaciente protecao,PasswordEncoder senhas,PropriedadesAplicacao propriedades,ServicoEnvioSms sms,
            com.vivamais.config.ConfiguracaoAcessoDemonstracao demonstracao,TestadoresService testadores) {
        this.banco=banco;this.instituicoes=instituicoes;this.tokens=tokens;
        this.protecao=protecao;this.senhas=senhas;this.propriedades=propriedades;this.sms=sms;this.demonstracao=demonstracao;this.testadores=testadores;
    }
    public RespostaPaciente entrarDemonstracao(EntradaPaciente entrada,String endereco) {
        if (!demonstracao.habilitado()) throw error(404,"Acesso demonstrativo indisponível.");
        limitar("demonstracao-ip",endereco,60,900);
        String cpf=DadosPessoaisService.normalizarCpf(entrada.cpf());
        if (cpf==null) throw error(400,"Confira o CPF informado.");
        DadosPessoaisService.validarNascimento(entrada.dataNascimento());
        limitar("demonstracao-cpf",cpf,15,900);
        var contas=banco.query("""
            SELECT u.*,p.id AS id_paciente FROM patient p JOIN user_account u ON u.id=p.user_account_id
              JOIN organization o ON o.id=p.organization_id
            WHERE p.cpf=? AND p.data_nascimento=? AND p.modality='APP' AND u.role='PATIENT'
              AND u.organization_id=p.organization_id AND p.organization_id=?
              AND p.demo_only=true AND u.demo_only=true AND o.demo_only=true LIMIT 2
            """,(linha,indice)->Map.of("paciente",linha.getObject("id_paciente",UUID.class),"usuario",
                new Usuario(linha.getObject("id",UUID.class),linha.getString("email"),linha.getString("display_name"),
                    Papel.PATIENT,linha.getObject("organization_id",UUID.class))),cpf,entrada.dataNascimento(),demonstracao.unidade());
        if (contas.size()!=1) throw error(401,"Não foi possível entrar. Confira CPF e nascimento com sua equipe.");
        var conta=contas.getFirst(); var usuario=(Usuario)conta.get("usuario");
        String token=tokens.issue(); Instant agora=Instant.now(),expira=agora.plus(propriedades.sessionDuration());
        UUID sessao=instituicoes.inserirSessao(usuario.id(),tokens.hash(token),agora,expira);
        banco.update("INSERT INTO sessao_demonstracao(id_sessao,id_paciente,id_unidade) VALUES(?,?,?)",sessao,conta.get("paciente"),usuario.idUnidade());
        instituicoes.auditar(usuario,"ACESSO_DEMONSTRACAO_SINTETICA","auth_session",sessao);
        // Nenhum aparelho é autorizado e nenhuma credencial renovável é entregue neste modo.
        return new RespostaPaciente("AUTENTICADO",null,null,new RespostaAcesso(token,expira,usuario),null,null);
    }
    private static Timestamp instante(Instant valor) { return Timestamp.from(valor); }
    // A janela é persistida e incrementada atomicamente, inclusive quando a resposta é 4xx.
    private void limitar(String contexto,String identificador,int maximo,int segundos) {
        String chave=protecao.resumo(contexto,identificador);
        Integer quantidade=banco.queryForObject("""
            INSERT INTO limite_acesso_paciente(chave,inicio_janela,tentativas) VALUES(?,now(),1)
            ON CONFLICT(chave) DO UPDATE SET
              inicio_janela=CASE WHEN limite_acesso_paciente.inicio_janela < now()-make_interval(secs=>?) THEN now() ELSE limite_acesso_paciente.inicio_janela END,
              tentativas=CASE WHEN limite_acesso_paciente.inicio_janela < now()-make_interval(secs=>?) THEN 1 ELSE limite_acesso_paciente.tentativas+1 END
            RETURNING tentativas
            """,Integer.class,chave,segundos,segundos);
        if(quantidade>maximo) throw error(429,"Muitas tentativas. Aguarde antes de tentar novamente.");
    }
    public RespostaPaciente iniciar(EntradaPaciente entrada,String credencial,String endereco) {
        limitar("inicio-ip",endereco,60,900);
        String cpf=DadosPessoaisService.normalizarCpf(entrada.cpf());
        if(cpf==null) throw error(400,"Confira o CPF informado.");
        DadosPessoaisService.validarNascimento(entrada.dataNascimento());
        limitar("inicio-cpf",cpf,15,900);
        var pacientes=banco.queryForList("""
            SELECT p.id,p.user_account_id FROM patient p JOIN user_account u ON u.id=p.user_account_id
            WHERE p.cpf=? AND p.data_nascimento=? AND p.modality='APP' AND u.role='PATIENT'
              AND u.organization_id=p.organization_id LIMIT 2
            """,cpf,entrada.dataNascimento());
        // Identidades ambíguas entre unidades nunca selecionam uma conta por aproximação.
        UUID paciente=pacientes.size()==1?(UUID)pacientes.getFirst().get("id"):null;
        UUID usuario=pacientes.size()==1?(UUID)pacientes.getFirst().get("user_account_id"):null;
        var dispositivo=buscarDispositivo(credencial,entrada.tipo());
        if(usuario!=null && dispositivo!=null && usuario.equals(dispositivo.get("id_usuario")))
            return abrirSessao(dispositivo,true);
        String desafio=tokens.issue(); Instant expira=Instant.now().plusSeconds(300);
        banco.update("INSERT INTO desafio_acesso_paciente(hash_desafio,id_paciente,chave_identidade,expira_em,tipo) VALUES(?,?,?,?,?)",
            tokens.hash(desafio),paciente,protecao.resumo("identidade",cpf),instante(expira),entrada.tipo().name());
        return new RespostaPaciente("VERIFICACAO_NECESSARIA",desafio,expira,null,null,null);
    }
    public RespostaPaciente verificar(VerificacaoPaciente entrada,String endereco) {
        limitar("verificacao-ip",endereco,30,900);
        var desafios=banco.queryForList("SELECT * FROM desafio_acesso_paciente WHERE hash_desafio=? FOR UPDATE",tokens.hash(entrada.desafio()));
        if(desafios.isEmpty()) throw invalido();
        var desafio=desafios.getFirst();
        limitar("verificacao-identidade",(String)desafio.get("chave_identidade"),5,900);
        if(!entrada.tipo().name().equals(desafio.get("tipo")) || desafio.get("utilizado_em")!=null ||
            !((Timestamp)desafio.get("expira_em")).toInstant().isAfter(Instant.now()) || (Integer)desafio.get("tentativas")>=5) throw invalido();
        banco.update("UPDATE desafio_acesso_paciente SET tentativas=tentativas+1 WHERE hash_desafio=?",tokens.hash(entrada.desafio()));
        UUID paciente=(UUID)desafio.get("id_paciente");
        if(paciente==null) { protecao.resumo("codigo-inexistente",entrada.codigo()); throw invalido(); }
        // Mesmo bloqueio de linha usado na emissão: código de uso único sob concorrência.
        banco.queryForObject("SELECT id FROM patient WHERE id=? FOR UPDATE",UUID.class,paciente);
        var codigos=banco.queryForList("SELECT * FROM codigo_ativacao_paciente WHERE id_paciente=? ORDER BY criado_em DESC,id DESC LIMIT 1 FOR UPDATE",paciente);
        if(codigos.isEmpty()) throw invalido();
        var codigo=codigos.getFirst(); UUID idCodigo=(UUID)codigo.get("id");
        var envios=banco.queryForList("SELECT e.estado FROM envio_sms_ativacao e JOIN patient p ON p.id=e.id_paciente WHERE e.id_codigo=? AND e.versao_telefone=p.versao_telefone",idCodigo);
        if(envios.isEmpty()) throw invalido();
        String estadoSms=(String)envios.getFirst().get("estado");
        if(!Set.of("TESTE_LOCAL","ACEITO_PROVEDOR","ENTREGUE").contains(estadoSms) || ("TESTE_LOCAL".equals(estadoSms) && !"LOCAL".equals(sms.provedor()))) throw invalido();
        boolean confere=protecao.confere("codigo:"+idCodigo,entrada.codigo(),(String)codigo.get("hash_codigo"));
        if(!confere || codigo.get("utilizado_em")!=null || !((Timestamp)codigo.get("expira_em")).toInstant().isAfter(Instant.now())) throw invalido();
        UUID usuario=banco.queryForObject("SELECT user_account_id FROM patient WHERE id=?",UUID.class,paciente);
        banco.update("UPDATE codigo_ativacao_paciente SET utilizado_em=now() WHERE id=?",idCodigo);
        banco.update("UPDATE desafio_acesso_paciente SET utilizado_em=now() WHERE hash_desafio=?",tokens.hash(entrada.desafio()));
        banco.update("UPDATE user_account SET enabled=true WHERE id=? AND role='PATIENT'",usuario);
        if(!"TESTE_LOCAL".equals(estadoSms)) banco.update("UPDATE patient SET telefone_confirmado_em=now() WHERE id=?",paciente);
        UUID idDispositivo=UUID.randomUUID(); String credencial=tokens.issue(); Instant expira=Instant.now().plus(Duration.ofDays(30));
        banco.update("INSERT INTO dispositivo_acesso_paciente(id,id_usuario,hash_credencial,expira_em,tipo) VALUES(?,?,?,?,?)",
            idDispositivo,usuario,tokens.hash(credencial),instante(expira),entrada.tipo().name());
        var dispositivo=buscarDispositivo(credencial,entrada.tipo());
        var resposta=abrirSessao(dispositivo,false);
        instituicoes.auditar(resposta.sessao().usuario(),"DISPOSITIVO_PACIENTE_AUTORIZADO","dispositivo_acesso_paciente",idDispositivo);
        return new RespostaPaciente("AUTENTICADO",null,null,resposta.sessao(),credencial,expira);
    }
    private ResponseStatusException invalido() { return error(401,"Não foi possível verificar. Confira o código ou procure sua equipe."); }
    private Map<String,Object> buscarDispositivo(String credencial,TipoDispositivo tipo) {
        if(credencial==null || !credencial.matches("[A-Za-z0-9_-]{43}")) return null;
        var resultados=banco.queryForList("""
            SELECT d.* FROM dispositivo_acesso_paciente d JOIN user_account u ON u.id=d.id_usuario
            WHERE d.hash_credencial=? AND d.tipo=? AND d.revogado_em IS NULL AND d.expira_em>now()
              AND u.enabled=true AND u.role='PATIENT' FOR UPDATE OF d
            """,tokens.hash(credencial),tipo.name());
        return resultados.isEmpty()?null:resultados.getFirst();
    }
    public RespostaPaciente renovar(TipoDispositivo tipo,String credencial,String endereco) {
        limitar("renovar-ip",endereco,120,900);
        var dispositivo=buscarDispositivo(credencial,tipo);
        if(dispositivo==null || !Boolean.TRUE.equals(dispositivo.get("manter_sessao"))) throw invalido();
        return abrirSessao(dispositivo,true);
    }
    private RespostaPaciente abrirSessao(Map<String,Object> dispositivo,boolean rotacionar) {
        UUID id=(UUID)dispositivo.get("id"), idUsuario=(UUID)dispositivo.get("id_usuario");
        var usuario=instituicoes.buscarUsuario(idUsuario).orElseThrow(this::invalido);
        banco.update("UPDATE auth_session SET revoked_at=now() WHERE id_dispositivo_paciente=? AND revoked_at IS NULL",id);
        String credencial=rotacionar?tokens.issue():null;
        if(rotacionar) banco.update("UPDATE dispositivo_acesso_paciente SET hash_credencial=?,ultimo_uso=now(),manter_sessao=true WHERE id=?",tokens.hash(credencial),id);
        String token=tokens.issue();Instant agora=Instant.now(),expira=agora.plus(propriedades.sessionDuration());
        UUID sessao=instituicoes.inserirSessao(usuario.id(),tokens.hash(token),agora,expira);
        banco.update("UPDATE auth_session SET id_dispositivo_paciente=? WHERE id=?",id,sessao);
        instituicoes.auditar(usuario,"SESSAO_PACIENTE_CRIADA","auth_session",sessao);
        return new RespostaPaciente("AUTENTICADO",null,null,new RespostaAcesso(token,expira,usuario),credencial,((Timestamp)dispositivo.get("expira_em")).toInstant());
    }
    public void esquecer(SessaoAutenticada sessao) {
        if(sessao.usuario().papel()!=Papel.PATIENT) throw error(403,"Ação exclusiva do paciente.");
        instituicoes.revogarSessao(sessao.idSessao());
        UUID dispositivo=banco.queryForObject("SELECT id_dispositivo_paciente FROM auth_session WHERE id=?",UUID.class,sessao.idSessao());
        banco.update("UPDATE dispositivo_acesso_paciente SET revogado_em=now(),manter_sessao=false WHERE id=? AND id_usuario=?",dispositivo,sessao.usuario().id());
        banco.update("UPDATE auth_session SET revoked_at=now() WHERE id_dispositivo_paciente=? AND revoked_at IS NULL",dispositivo);
        instituicoes.auditar(sessao.usuario(),"DISPOSITIVO_PACIENTE_REVOGADO","dispositivo_acesso_paciente",dispositivo);
    }
    private void autorizar(UUID paciente,Usuario ator) {
        if(ator.papel()==Papel.PATIENT || instituicoes.buscarPacienteAutorizado(paciente,ator).isEmpty()) throw error(403,"Acesso não permitido.");
    }
    private void confirmarProfissional(String senha,Boolean identidade,Usuario ator) {
        var propria=instituicoes.buscarCredenciais(ator.email()).orElseThrow(this::invalido);
        if(ator.papel()==Papel.PATIENT || senha==null || !Boolean.TRUE.equals(identidade) || senha.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72 ||
            !senhas.matches(senha,propria.hashSenha())) throw invalido();
    }
    @Transactional(propagation=org.springframework.transaction.annotation.Propagation.REQUIRES_NEW,noRollbackFor=ResponseStatusException.class)
    public void confirmarAlteracaoTelefone(String senha,Boolean identidade,Usuario ator) {
        limitar("alteracao-telefone-profissional",ator.id().toString(),10,900);
        confirmarProfissional(senha,identidade,ator);
    }
    public SolicitacaoSms emitir(UUID paciente,EmissaoCodigo entrada,Usuario ator) {
        autorizar(paciente,ator);
        if(pacienteDemonstrativo(paciente)) throw error(409,"Acesso demonstrativo já habilitado. Utilize CPF e nascimento; não há ativação por SMS neste modo.");
        if(testadores.pacienteDaUnidadeTeste(paciente))throw error(409,"Este ambiente utiliza convites privados de testes; não há emissão de SMS.");
        limitar("emissao-profissional",ator.id().toString(),40,3600);
        confirmarProfissional(entrada.senhaProfissional(),entrada.identidadeConferida(),ator);
        var linha=banco.queryForMap("SELECT id,user_account_id,cpf,data_nascimento,telefone,versao_telefone FROM patient WHERE id=? FOR UPDATE",paciente);
        UUID usuario=(UUID)linha.get("user_account_id");
        if(usuario==null || linha.get("cpf")==null || linha.get("data_nascimento")==null) throw error(409,"Complete CPF e nascimento antes de emitir o código.");
        String telefone;
        try { telefone=DadosPessoaisService.normalizarTelefone((String)linha.get("telefone")); }
        catch(ResponseStatusException invalido) { throw error(409,"Regularize o celular com DDD antes de solicitar a ativação por SMS."); }
        if(telefone==null) throw error(409,"Regularize o celular com DDD antes de solicitar a ativação por SMS.");
        limitar("emissao-paciente-minuto",paciente.toString(),1,60);
        limitar("emissao-paciente-hora",paciente.toString(),3,3600);
        limitar("emissao-paciente-dia",paciente.toString(),10,86400);
        limitar("sms-telefone-hora",telefone,3,3600);
        limitar("sms-telefone-dia",telefone,10,86400);
        limitar("sms-unidade-hora",ator.idUnidade().toString(),60,3600);
        limitar("sms-unidade-dia",ator.idUnidade().toString(),300,86400);
        limitar("sms-global-hora","instalacao",100,3600);
        limitar("sms-global-dia","instalacao",500,86400);
        UUID idEnvio=UUID.randomUUID();String mascarado="+55 (***) *****-"+telefone.substring(telefone.length()-4);
        if(!sms.disponivel()) {
            banco.update("INSERT INTO envio_sms_ativacao(id,id_paciente,versao_telefone,destino_mascarado,provedor,estado) VALUES(?,?,?,?,?,'NAO_CONFIGURADO')",idEnvio,paciente,linha.get("versao_telefone"),mascarado,sms.provedor());
            instituicoes.auditar(ator,"SMS_ATIVACAO_NAO_CONFIGURADO","envio_sms_ativacao",idEnvio);
            throw error(503,"SMS indisponível. Nenhuma mensagem foi enviada. Procure a equipe responsável pela configuração.");
        }
        var anteriores=banco.queryForList("SELECT id,hash_codigo FROM codigo_ativacao_paciente WHERE id_paciente=? ORDER BY criado_em DESC,id DESC LIMIT 1",paciente);
        String codigo;
        do { codigo=protecao.gerarCodigo(); }
        while(!anteriores.isEmpty() && protecao.confere("codigo:"+anteriores.getFirst().get("id"),codigo,(String)anteriores.getFirst().get("hash_codigo")));
        UUID id=UUID.randomUUID();Instant expira=Instant.now().plusSeconds(600);
        banco.update("UPDATE codigo_ativacao_paciente SET utilizado_em=now() WHERE id_paciente=? AND utilizado_em IS NULL",paciente);
        banco.update("INSERT INTO codigo_ativacao_paciente(id,id_paciente,hash_codigo,expira_em,id_emissor) VALUES(?,?,?,?,?)",id,paciente,protecao.resumo("codigo:"+id,codigo),instante(expira),ator.id());
        banco.update("INSERT INTO envio_sms_ativacao(id,id_paciente,id_codigo,versao_telefone,destino_mascarado,provedor,estado) VALUES(?,?,?,?,?,?,'PREPARADO')",idEnvio,paciente,id,linha.get("versao_telefone"),mascarado,sms.provedor());
        ServicoEnvioSms.Resultado resultado;
        try { resultado=sms.enviar(new ServicoEnvioSms.Mensagem(idEnvio,telefone,codigo,expira)); }
        catch(ServicoEnvioSms.Falha falha) { resultado=new ServicoEnvioSms.Resultado(falha.estado(),null); }
        banco.update("UPDATE envio_sms_ativacao SET estado=?,referencia_provedor=?,atualizado_em=now() WHERE id=?",resultado.estado(),resultado.referencia(),idEnvio);
        if(!Set.of("TESTE_LOCAL","ACEITO_PROVEDOR","ENTREGUE").contains(resultado.estado())) {
            banco.update("UPDATE codigo_ativacao_paciente SET utilizado_em=now() WHERE id=?",id);
            instituicoes.auditar(ator,"SMS_ATIVACAO_FALHOU","envio_sms_ativacao",idEnvio);
            throw error(503,"Não foi possível confirmar o envio do SMS. Aguarde antes de tentar novamente com sua equipe.");
        }
        banco.update("UPDATE dispositivo_acesso_paciente SET revogado_em=now(),manter_sessao=false WHERE id_usuario=? AND revogado_em IS NULL",usuario);
        banco.update("UPDATE auth_session SET revoked_at=now() WHERE user_account_id=? AND revoked_at IS NULL",usuario);
        instituicoes.auditar(ator,"CODIGO_PACIENTE_EMITIDO","patient",paciente);
        instituicoes.auditar(ator,"SMS_ATIVACAO_"+resultado.estado(),"envio_sms_ativacao",idEnvio);
        return new SolicitacaoSms(idEnvio,resultado.estado(),expira,mascarado,sms.provedor());
    }
    public EstadoAtivacao estado(UUID paciente,Usuario ator) {
        autorizar(paciente,ator);
        if(pacienteDemonstrativo(paciente)) return new EstadoAtivacao("DEMONSTRACAO_HABILITADA",null,0,null,false,"DEMONSTRACAO");
        if(testadores.pacienteDaUnidadeTeste(paciente))return new EstadoAtivacao(testadores.pacienteElegivel(paciente)?"TESTE_POR_CONVITE":"TESTE_DESATIVADO",null,0,null,false,"TESTADORES");
        var envios=banco.queryForList("SELECT * FROM envio_sms_ativacao WHERE id_paciente=? ORDER BY criado_em DESC,id DESC LIMIT 1",paciente);
        EstadoEnvioSms envio=null;
        if(!envios.isEmpty()) {
            var ultimo=envios.getFirst();UUID idEnvio=(UUID)ultimo.get("id");String estadoEnvio=(String)ultimo.get("estado");
            if("ACEITO_PROVEDOR".equals(estadoEnvio) && "TWILIO".equals(sms.provedor()) && "TWILIO".equals(ultimo.get("provedor")) && banco.update("UPDATE envio_sms_ativacao SET consultado_em=now() WHERE id=? AND (consultado_em IS NULL OR consultado_em<now()-interval '30 seconds')",idEnvio)==1) {
                try {
                    var retorno=sms.consultar((String)ultimo.get("referencia_provedor"));
                    if(retorno!=null && Set.of("ACEITO_PROVEDOR","ENTREGUE","NAO_ENTREGUE").contains(retorno.estado())) {
                        estadoEnvio=retorno.estado();banco.update("UPDATE envio_sms_ativacao SET estado=?,atualizado_em=now() WHERE id=?",estadoEnvio,idEnvio);
                        ultimo.put("atualizado_em",instante(Instant.now()));
                        if("NAO_ENTREGUE".equals(estadoEnvio)) banco.update("UPDATE codigo_ativacao_paciente SET utilizado_em=now() WHERE id=? AND utilizado_em IS NULL",ultimo.get("id_codigo"));
                    }
                } catch(ServicoEnvioSms.Falha falha) { /* Mantém último estado confirmado; nunca inventa entrega. */ }
            }
            envio=new EstadoEnvioSms(idEnvio,estadoEnvio,(String)ultimo.get("destino_mascarado"),(String)ultimo.get("provedor"),((Timestamp)ultimo.get("atualizado_em")).toInstant());
        }
        var linhas=banco.queryForList("SELECT expira_em,utilizado_em FROM codigo_ativacao_paciente WHERE id_paciente=? ORDER BY criado_em DESC,id DESC LIMIT 1",paciente);
        int dispositivos=banco.queryForObject("SELECT count(*) FROM dispositivo_acesso_paciente WHERE id_usuario=(SELECT user_account_id FROM patient WHERE id=?) AND revogado_em IS NULL AND expira_em>now()",Integer.class,paciente);
        if(linhas.isEmpty()) return new EstadoAtivacao(dispositivos>0?"ATIVADO":"AGUARDANDO_EMISSAO",null,dispositivos,envio,sms.disponivel(),sms.provedor());
        var codigo=linhas.getFirst();Instant expira=((Timestamp)codigo.get("expira_em")).toInstant();
        String estado=codigo.get("utilizado_em")!=null?(dispositivos>0?"ATIVADO":"UTILIZADO_OU_SUBSTITUIDO"):expira.isAfter(Instant.now())?"AGUARDANDO_ATIVACAO":"EXPIRADO";
        return new EstadoAtivacao(estado,"AGUARDANDO_ATIVACAO".equals(estado)?expira:null,dispositivos,envio,sms.disponivel(),sms.provedor());
    }
    private boolean pacienteDemonstrativo(UUID paciente) {
        return demonstracao.habilitado() && banco.queryForObject("""
            SELECT count(*) FROM patient p JOIN user_account u ON u.id=p.user_account_id
              JOIN organization o ON o.id=p.organization_id
            WHERE p.id=? AND p.organization_id=? AND p.modality='APP' AND u.role='PATIENT'
              AND u.organization_id=p.organization_id AND p.demo_only AND u.demo_only AND o.demo_only
              AND p.cpf IS NOT NULL AND p.data_nascimento IS NOT NULL
            """,Integer.class,paciente,demonstracao.unidade())==1;
    }
}
