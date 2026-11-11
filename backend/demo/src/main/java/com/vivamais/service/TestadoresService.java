package com.vivamais.service;
import static com.vivamais.service.CuidadoService.error;
import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosTestadores.*;
import com.vivamais.dto.ModelosAcessoPaciente.TipoDispositivo;
import com.vivamais.config.*;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.security.*;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service @Transactional(noRollbackFor=ResponseStatusException.class)
public class TestadoresService {
 private final JdbcTemplate banco;private final InstituicaoRepository instituicoes;
 private final ConfiguracaoTestadores configuracao;private final CodificadorToken tokens;private final ProtecaoAcessoPaciente protecao;
 private final PasswordEncoder senhas;private final PropriedadesAplicacao propriedades;
 public TestadoresService(JdbcTemplate banco,InstituicaoRepository instituicoes,ConfiguracaoTestadores configuracao,CodificadorToken tokens,ProtecaoAcessoPaciente protecao,PasswordEncoder senhas,PropriedadesAplicacao propriedades){this.banco=banco;this.instituicoes=instituicoes;this.configuracao=configuracao;this.tokens=tokens;this.protecao=protecao;this.senhas=senhas;this.propriedades=propriedades;}
 private static Timestamp instante(Instant valor){return Timestamp.from(valor);}
 private static Instant instante(Object valor){return valor==null?null:((Timestamp)valor).toInstant();}
 private void exigirModo(){if(!configuracao.habilitado())throw error(404,"Acesso de testadores indisponível.");}
 public boolean pacienteDaUnidadeTeste(UUID paciente){return configuracao.habilitado()&&banco.queryForObject("SELECT count(*) FROM patient p JOIN user_account u ON u.id=p.user_account_id JOIN organization o ON o.id=p.organization_id WHERE p.id=? AND p.organization_id=? AND p.modality='APP' AND u.role='PATIENT' AND u.organization_id=p.organization_id AND p.demo_only AND u.demo_only AND o.demo_only",Integer.class,paciente,configuracao.unidade())==1;}
 public boolean pacienteElegivel(UUID paciente){return configuracao.habilitado()&&banco.queryForObject("SELECT count(*) FROM patient p JOIN user_account u ON u.id=p.user_account_id JOIN organization o ON o.id=p.organization_id WHERE p.id=? AND p.organization_id=? AND p.modality='APP' AND u.role='PATIENT' AND u.organization_id=p.organization_id AND p.demo_only AND u.demo_only AND o.demo_only AND NOT EXISTS(SELECT 1 FROM integrante_grupo_teste g WHERE g.id_usuario=u.id AND (g.desativado_em IS NOT NULL OR g.expira_em<=now()))",Integer.class,paciente,configuracao.unidade())==1;}
 private void autorizar(UUID paciente,Usuario ator){exigirModo();if(ator.papel()==Papel.PATIENT)throw error(403,"Ação exclusiva da equipe autorizada.");if(instituicoes.buscarPacienteAutorizado(paciente,ator).isEmpty())throw error(403,"Você não possui permissão para este paciente.");if(!pacienteElegivel(paciente))throw error(403,"Convites permitidos somente para pacientes fictícios da unidade de testes.");}
 private void limitar(String contexto,String identificador,int maximo){
  String chave=protecao.resumo("testadores-"+contexto,identificador);
  int tentativas=banco.queryForObject("INSERT INTO limite_acesso_paciente(chave,inicio_janela,tentativas) VALUES(?,now(),1) ON CONFLICT(chave) DO UPDATE SET inicio_janela=CASE WHEN limite_acesso_paciente.inicio_janela<now()-interval '15 minutes' THEN now() ELSE limite_acesso_paciente.inicio_janela END,tentativas=CASE WHEN limite_acesso_paciente.inicio_janela<now()-interval '15 minutes' THEN 1 ELSE limite_acesso_paciente.tentativas+1 END RETURNING tentativas",Integer.class,chave);
  if(tentativas>maximo)throw error(429,"Muitas tentativas. Aguarde antes de tentar novamente.");
 }
 public ConviteEmitido emitir(UUID paciente,EmissaoConvite entrada,Usuario ator){
  autorizar(paciente,ator);limitar("emissao",ator.id().toString(),40);
  var propria=instituicoes.buscarCredenciais(ator.email()).orElseThrow(()->error(401,"Confira seu acesso profissional."));
  if(!propria.usuario().id().equals(ator.id())||!senhas.matches(entrada.senhaProfissional(),propria.hashSenha()))throw error(401,"Confira seu acesso profissional.");
  String segredo=tokens.issue();UUID id=UUID.randomUUID();Instant expira=Instant.now().plus(Duration.ofDays(entrada.validadeDias()));
  banco.update("INSERT INTO convite_testador(id,id_paciente,id_unidade,id_emissor,papel_emissor,hash_convite,expira_em) VALUES(?,?,?,?,?,?,?)",id,paciente,ator.idUnidade(),ator.id(),ator.papel().name(),tokens.hash(segredo),instante(expira));
  instituicoes.auditar(ator,"CONVITE_TESTADOR_EMITIDO","convite_testador",id);
  return new ConviteEmitido(id,segredo,expira);
 }
 public List<ConviteListado> listar(UUID paciente,Usuario ator){autorizar(paciente,ator);return banco.query("SELECT id,criado_em,expira_em,utilizado_em,revogado_em FROM convite_testador WHERE id_paciente=? ORDER BY criado_em DESC LIMIT 100",(linha,indice)->new ConviteListado(linha.getObject(1,UUID.class),linha.getTimestamp(2).toInstant(),linha.getTimestamp(3).toInstant(),instante(linha.getTimestamp(4)),instante(linha.getTimestamp(5))),paciente);}
 public void revogar(UUID paciente,UUID convite,Usuario ator){autorizar(paciente,ator);if(banco.update("UPDATE convite_testador SET revogado_em=coalesce(revogado_em,now()),hash_renovacao=NULL WHERE id=? AND id_paciente=? AND id_unidade=?",convite,paciente,ator.idUnidade())!=1)throw error(404,"Convite não encontrado.");instituicoes.auditar(ator,"CONVITE_TESTADOR_REVOGADO","convite_testador",convite);}
 private ResponseStatusException invalido(){return error(401,"Convite ou acesso inválido. Solicite um novo convite ao responsável pelos testes.");}
 public AcessoTestador entrar(EntradaConvite entrada,String endereco){
  exigirModo();limitar("entrada-ip",endereco,30);
  var registros=banco.queryForList("SELECT * FROM convite_testador WHERE hash_convite=? FOR UPDATE",tokens.hash(entrada.convite()));
  if(registros.size()!=1)throw invalido();var convite=registros.getFirst();
  if(convite.get("utilizado_em")!=null||convite.get("revogado_em")!=null||!instante(convite.get("expira_em")).isAfter(Instant.now())||!pacienteElegivel((UUID)convite.get("id_paciente")))throw invalido();
  banco.update("UPDATE convite_testador SET utilizado_em=now(),tipo=? WHERE id=?",entrada.tipo().name(),convite.get("id"));
  convite.put("tipo",entrada.tipo().name());
  return abrirSessao(convite);
 }
 public AcessoTestador renovar(String credencial,TipoDispositivo tipo,String endereco){
  exigirModo();limitar("renovacao-ip",endereco,120);
  if(credencial==null||!credencial.matches("[A-Za-z0-9_-]{43}"))throw invalido();
  var registros=banco.queryForList("SELECT * FROM convite_testador WHERE hash_renovacao=? FOR UPDATE",tokens.hash(credencial));
  if(registros.size()!=1)throw invalido();var convite=registros.getFirst();
  if(convite.get("revogado_em")!=null||!tipo.name().equals(convite.get("tipo"))||!instante(convite.get("expira_em")).isAfter(Instant.now())||!pacienteElegivel((UUID)convite.get("id_paciente")))throw invalido();
  return abrirSessao(convite);
 }
 private AcessoTestador abrirSessao(Map<String,Object> convite){
  UUID idConvite=(UUID)convite.get("id"),paciente=(UUID)convite.get("id_paciente");
  var usuario=banco.queryForObject("SELECT u.id,u.email,u.display_name,u.organization_id FROM patient p JOIN user_account u ON u.id=p.user_account_id WHERE p.id=? AND p.organization_id=?",(linha,indice)->new Usuario(linha.getObject(1,UUID.class),linha.getString(2),linha.getString(3),Papel.PATIENT,linha.getObject(4,UUID.class)),paciente,configuracao.unidade());
  String credencial=tokens.issue(),token=tokens.issue();Instant agora=Instant.now(),validade=instante(convite.get("expira_em")),expira=agora.plus(propriedades.sessionDuration());if(expira.isAfter(validade))expira=validade;
  banco.update("UPDATE auth_session SET revoked_at=now() WHERE id IN(SELECT id_sessao FROM sessao_testador WHERE id_convite=?) AND revoked_at IS NULL",idConvite);
  banco.update("UPDATE convite_testador SET hash_renovacao=? WHERE id=?",tokens.hash(credencial),idConvite);
  UUID sessao=instituicoes.inserirSessao(usuario.id(),tokens.hash(token),agora,expira);
  banco.update("INSERT INTO sessao_testador(id_sessao,id_convite,id_paciente,id_unidade) VALUES(?,?,?,?)",sessao,idConvite,paciente,usuario.idUnidade());
  instituicoes.auditar(usuario,"ACESSO_TESTADOR_AUTORIZADO","auth_session",sessao);
  return new AcessoTestador(new RespostaAcesso(token,expira,usuario),credencial,validade);
 }
}
