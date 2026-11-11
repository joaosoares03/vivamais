package com.vivamais.service;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.service.CuidadoService.error;
import com.vivamais.config.ConfiguracaoTestadores;
import com.vivamais.dto.ModelosTestadores.EmissaoConvite;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.security.*;
import jakarta.validation.constraints.*;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service @Transactional(rollbackFor=Exception.class)
public class GrupoTestesService {
 public record NovoIntegrante(@NotBlank @Size(max=90) String nome,@Pattern(regexp="PATIENT|PROFESSIONAL") @NotNull String papel,@Min(1) @Max(7) int validadeDias,@NotBlank @Size(max=72) String senhaProfissional,UUID idProfissional){}
 public record NovaEmissao(@Min(1) @Max(7) int validadeDias,@NotBlank @Size(max=72) String senhaProfissional){}
 public record Ativacao(@NotBlank @Pattern(regexp="[A-Za-z0-9_-]{43}") String convite,@NotBlank @Size(min=12,max=72) String senha){}
 private final JdbcTemplate banco;private final InstituicaoRepository instituicoes;private final ConfiguracaoTestadores modo;
 private final PasswordEncoder senhas;private final CodificadorToken tokens;private final TestadoresService testadores;private final DadosGrupoTeste dados;private final LimiteGrupoTestes limites;
 public GrupoTestesService(JdbcTemplate banco,InstituicaoRepository instituicoes,ConfiguracaoTestadores modo,PasswordEncoder senhas,CodificadorToken tokens,TestadoresService testadores,DadosGrupoTeste dados,LimiteGrupoTestes limites){this.banco=banco;this.instituicoes=instituicoes;this.modo=modo;this.senhas=senhas;this.tokens=tokens;this.testadores=testadores;this.dados=dados;this.limites=limites;}
 private void exigirModo(){if(!modo.habilitado())throw error(404,"Grupo indisponível.");}
 private void autorizar(Usuario ator){exigirModo();if(ator.papel()!=Papel.ADMIN||!ator.idUnidade().equals(modo.unidade()))throw error(403,"Somente o administrador da homologação gerencia o grupo.");}
 private void limitar(String chave,int limite){limites.verificar(chave,limite);}
 private void reautenticar(String senha,Usuario ator){autorizar(ator);limitar("gestao:"+ator.id(),40);var conta=instituicoes.buscarCredenciais(ator.email()).orElseThrow(()->error(401,"Entre novamente."));if(senha.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72||!conta.usuario().id().equals(ator.id())||!senhas.matches(senha,conta.hashSenha()))throw error(401,"Confira sua senha.");}
 public List<Map<String,Object>> listar(Usuario ator){autorizar(ator);return banco.queryForList("SELECT g.id,g.nome,g.papel,g.id_usuario AS \"idUsuario\",g.id_paciente AS \"idPaciente\",u.email,g.expira_em AS \"expiraEm\",g.desativado_em AS \"desativadoEm\",coalesce(g.utilizado_em,c.utilizado_em) AS \"utilizadoEm\" FROM integrante_grupo_teste g JOIN user_account u ON u.id=g.id_usuario LEFT JOIN LATERAL(SELECT utilizado_em FROM convite_testador WHERE id_paciente=g.id_paciente AND revogado_em IS NULL ORDER BY criado_em DESC LIMIT 1)c ON g.papel='PATIENT' WHERE g.id_unidade=? ORDER BY g.criado_em DESC LIMIT 200",ator.idUnidade());}
 private Map<String,Object> integrante(UUID id,Usuario ator){autorizar(ator);var encontrados=banco.queryForList("SELECT * FROM integrante_grupo_teste WHERE id=? AND id_unidade=? FOR UPDATE",id,ator.idUnidade());if(encontrados.isEmpty())throw error(404,"Integrante não encontrado.");return encontrados.getFirst();}
 public Map<String,Object> criar(NovoIntegrante entrada,Usuario ator)throws Exception{
  reautenticar(entrada.senhaProfissional(),ator);
  if(banco.queryForObject("SELECT count(*) FROM integrante_grupo_teste WHERE id_unidade=? AND criado_em>now()-interval '1 day'",Integer.class,ator.idUnidade())>=40)throw error(429,"Limite diário de integrantes atingido.");
  // O apelido é rotulado explicitamente; não se solicita nome, CPF ou e-mail pessoal.
  String nome="TESTE · "+entrada.nome().trim();if(entrada.nome().isBlank())throw error(400,"Informe um apelido fictício.");
  UUID id=UUID.randomUUID(),usuario=UUID.randomUUID(),paciente=UUID.randomUUID(),contaPaciente="PATIENT".equals(entrada.papel())?usuario:UUID.randomUUID();
  banco.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role,enabled) VALUES(?,?,?,?,?,?,false)",usuario,ator.idUnidade(),usuario+"@grupo.vivamais.invalid",nome,senhas.encode(tokens.issue()),entrada.papel());
  if("PROFESSIONAL".equals(entrada.papel())){
   banco.update("INSERT INTO professional(id,organization_id) VALUES(?,?)",usuario,ator.idUnidade());
   banco.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role,enabled) VALUES(?,?,?,?,?,'PATIENT',false)",contaPaciente,ator.idUnidade(),contaPaciente+"@grupo.vivamais.invalid","Paciente fictício · "+entrada.nome().trim(),senhas.encode(tokens.issue()));
  }
  banco.update("INSERT INTO patient(id,organization_id,user_account_id,display_name,modality) VALUES(?,?,?,?,'APP')",paciente,ator.idUnidade(),contaPaciente,"Paciente fictício · "+entrada.nome().trim());
  UUID profissional="PROFESSIONAL".equals(entrada.papel())?usuario:entrada.idProfissional();
  if(profissional!=null){
   if(banco.queryForObject("SELECT count(*) FROM professional p JOIN user_account u ON u.id=p.id WHERE p.id=? AND p.organization_id=? AND u.demo_only",Integer.class,profissional,ator.idUnidade())!=1)throw error(400,"Profissional inválido.");
   banco.update("INSERT INTO patient_professional_assignment(patient_id,professional_id,organization_id) VALUES(?,?,?)",paciente,profissional,ator.idUnidade());
  }
  Instant expira=Instant.now().plus(Duration.ofDays(entrada.validadeDias()));
  banco.update("INSERT INTO integrante_grupo_teste(id,id_unidade,id_usuario,papel,id_paciente,id_emissor,nome,expira_em) VALUES(?,?,?,?,?,?,?,?)",id,ator.idUnidade(),usuario,entrada.papel(),paciente,ator.id(),nome,Timestamp.from(expira));
  dados.preencher(paciente,ator);
  instituicoes.auditar(ator,"INTEGRANTE_TESTE_CRIADO","integrante_grupo_teste",id);
  return emitir(id,new NovaEmissao(entrada.validadeDias(),entrada.senhaProfissional()),ator);
 }
 public void desativar(UUID id,Usuario ator){var registro=integrante(id,ator);banco.update("UPDATE integrante_grupo_teste SET desativado_em=coalesce(desativado_em,now()),hash_convite=NULL WHERE id=?",id);revogarSessoes(registro);instituicoes.auditar(ator,"INTEGRANTE_TESTE_DESATIVADO","integrante_grupo_teste",id);}
 private void revogarSessoes(Map<String,Object> registro){
  banco.update("UPDATE auth_session SET revoked_at=now() WHERE user_account_id=? AND revoked_at IS NULL",registro.get("id_usuario"));
  if("PATIENT".equals(registro.get("papel")))banco.update("UPDATE convite_testador SET revogado_em=coalesce(revogado_em,now()),hash_renovacao=NULL WHERE id_paciente=?",registro.get("id_paciente"));
 }
 public Map<String,Object> emitir(UUID id,NovaEmissao entrada,Usuario ator){
  reautenticar(entrada.senhaProfissional(),ator);var registro=integrante(id,ator);revogarSessoes(registro);
  Instant expira=Instant.now().plus(Duration.ofDays(entrada.validadeDias()));
  banco.update("UPDATE integrante_grupo_teste SET desativado_em=NULL,utilizado_em=NULL,expira_em=?,hash_convite=NULL WHERE id=?",Timestamp.from(expira),id);
  String convite;
  if("PATIENT".equals(registro.get("papel")))convite=testadores.emitir((UUID)registro.get("id_paciente"),new EmissaoConvite(entrada.senhaProfissional(),entrada.validadeDias()),ator).convite();
  else{convite=tokens.issue();banco.update("UPDATE user_account SET enabled=false WHERE id=?",registro.get("id_usuario"));banco.update("UPDATE integrante_grupo_teste SET hash_convite=? WHERE id=?",tokens.hash(convite),id);}
  instituicoes.auditar(ator,"CONVITE_GRUPO_EMITIDO","integrante_grupo_teste",id);
  return Map.of("id",id,"papel",registro.get("papel"),"convite",convite,"expiraEm",expira);
 }
 public Map<String,Object> ativar(Ativacao entrada){
  exigirModo();
  if(entrada.senha().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72||entrada.senha().isBlank())throw error(400,"Use uma senha de 12 a 72 caracteres e no máximo 72 bytes.");
  var encontrados=banco.queryForList("SELECT g.*,u.email FROM integrante_grupo_teste g JOIN user_account u ON u.id=g.id_usuario WHERE g.hash_convite=? AND g.papel='PROFESSIONAL' AND g.id_unidade=? AND g.utilizado_em IS NULL AND g.desativado_em IS NULL AND g.expira_em>now() AND u.demo_only FOR UPDATE OF g",tokens.hash(entrada.convite()),modo.unidade());
  if(encontrados.size()!=1)throw error(401,"Convite inválido, utilizado ou expirado. Solicite outro ao responsável.");
  var registro=encontrados.getFirst();banco.update("UPDATE integrante_grupo_teste SET utilizado_em=now(),hash_convite=NULL WHERE id=?",registro.get("id"));
  banco.update("UPDATE user_account SET password_hash=?,enabled=true WHERE id=?",senhas.encode(entrada.senha()),registro.get("id_usuario"));
  var usuario=instituicoes.buscarCredenciais(registro.get("email").toString()).orElseThrow().usuario();instituicoes.auditar(usuario,"CONVITE_PROFISSIONAL_UTILIZADO","integrante_grupo_teste",(UUID)registro.get("id"));
  return Map.of("email",registro.get("email"),"expiraEm",registro.get("expira_em"));
 }
}
