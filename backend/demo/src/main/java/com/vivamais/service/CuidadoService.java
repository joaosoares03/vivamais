package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosCuidado.*;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import java.util.function.Supplier;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@Transactional
public class CuidadoService {
 private static final String INICIO_MARCADOR_GRUPO_CATALOGO="[[VIVAMAIS_G16=";
 private static final String FIM_MARCADOR_GRUPO_CATALOGO="]]";
 private static final Set<String> GRUPOS_CATALOGO_APROVADOS=Set.of("NAO_DEFINIDO","COM_RISCO_QUEDA_SENTADO","SEM_RISCO_QUEDA_EM_PE");
 public Map<String,Object> buscarRegistroPressao(UUID idPaciente,UUID idRegistro,Usuario ator){autorizarPaciente(idPaciente,ator);var registros=consultarLinhas("SELECT r.*,(SELECT u.display_name FROM user_account u WHERE u.id=r.author_id) AS author_name FROM blood_pressure_reading r WHERE patient_id=? AND id=?",idPaciente,idRegistro);if(registros.isEmpty())throw error(404,"Registro não encontrado.");instituicoes.auditar(ator,"REGISTRO_PRESSAO_CONSULTADO","blood_pressure_reading",idRegistro);return registros.getFirst();}
 @org.springframework.beans.factory.annotation.Value("${app.ambiente:development}") private String ambiente;
 private final JdbcTemplate db; private final InstituicaoRepository instituicoes; private final ObjectMapper json;
 private final CodificadorToken codificadorTokens; private final PasswordEncoder codificadorSenhas;
 public CuidadoService(JdbcTemplate db,InstituicaoRepository instituicoes,ObjectMapper json,CodificadorToken codificadorTokens,PasswordEncoder codificadorSenhas) {
  this.db=db;this.instituicoes=instituicoes;this.json=json;this.codificadorTokens=codificadorTokens;this.codificadorSenhas=codificadorSenhas;
 }
 public Paciente autorizarPaciente(UUID id,Usuario ator) {
  return instituicoes.buscarPacienteAutorizado(id,ator).orElseThrow(()->error(403,"Você não possui permissão para este paciente."));
 }
 public void exigirProfissional(Usuario ator) { if(ator.papel()==Papel.PATIENT) throw error(403,"Ação exclusiva de profissional autorizado."); }
 public static ResponseStatusException error(int status,String detail) { return new ResponseStatusException(HttpStatus.valueOf(status),detail); }
 private void validarHorario(Instant at) { if(at==null||at.isAfter(Instant.now().plusSeconds(300))||at.isBefore(Instant.parse("1900-01-01T00:00:00Z"))) throw error(400,"Confira a data e a hora informadas."); }
 private static Timestamp ts(Instant value) { return Timestamp.from(value); }
 public String encode(Object value) { try{return json.writeValueAsString(value);}catch(Exception e){throw new IllegalStateException("Serialization failed");} }
 public Map<String,Object> decode(String value) { try{return json.readValue(value,new TypeReference<Map<String,Object>>(){});}catch(Exception e){throw new IllegalStateException("Stored operation invalid");} }
 public List<Map<String,Object>> consultarLinhas(String sql,Object... args) {
  return db.query(sql,(rs,n)->{
   Map<String,Object> out=new LinkedHashMap<>();var meta=rs.getMetaData();
   for(int i=1;i<=meta.getColumnCount();i++){
    String key=meta.getColumnLabel(i);StringBuilder camel=new StringBuilder();boolean upper=false;
    for(char c:key.toCharArray()){if(c=='_'){upper=true;continue;}camel.append(upper?Character.toUpperCase(c):c);upper=false;}
    Object value=rs.getObject(i);
    if(value instanceof Timestamp stamp)value=stamp.toInstant().toString();
    else if(value instanceof java.sql.Date date)value=date.toLocalDate().toString();
    else if(value instanceof java.sql.Time local)value=local.toLocalTime().toString();
    else if(value instanceof UUID uuid)value=uuid.toString();
    else if(value!=null&&("jsonb".equals(meta.getColumnTypeName(i))||"json".equals(meta.getColumnTypeName(i)))){
     try{value=json.readValue(value.toString(),Object.class);}catch(Exception ex){throw new IllegalStateException("Invalid JSON");}
    }
    out.put(camel.toString(),value);
   }return out;
  },args);
 }
 private Map<String,Object> one(String sql,Object...args){return consultarLinhas(sql,args).stream().findFirst().orElseThrow(()->error(404,"Registro não encontrado."));}
 public Pagina<Map<String,Object>> paginar(String table,UUID paciente,int paginar,int size) {
  if(!Set.of("blood_pressure_reading","activity_record","printed_diary_entry","consultation").contains(table))throw new IllegalArgumentException();
  validarPaginacao(paginar,size);long total=db.queryForObject("SELECT count(*) FROM "+table+" WHERE patient_id=?",Long.class,paciente);
  return new Pagina<>(consultarLinhas("SELECT r.*,u.display_name AS author_name FROM "+table+" r JOIN user_account u ON u.id=r.author_id WHERE r.patient_id=? ORDER BY r."+(table.equals("blood_pressure_reading")?"measured_at":"occurred_at")+" DESC,r.id DESC LIMIT ? OFFSET ?",paciente,size,(long)paginar*size),total,paginar,size);
 }
 private void validarPaginacao(int paginar,int size){if(paginar<0||paginar>100000||size<1||size>100)throw error(400,"Paginação inválida.");}
 public Pagina<Paciente> search(Usuario ator,String query,int paginar,int size){
  exigirProfissional(ator);validarPaginacao(paginar,size);String q=query==null?"":query.trim();if(q.length()>120)throw error(400,"Busca muito longa.");
  String predicate="FROM patient p WHERE p.organization_id=? AND ( ?='ADMIN' OR EXISTS(SELECT 1 FROM patient_professional_assignment a WHERE a.patient_id=p.id AND a.professional_id=?)) AND lower(p.display_name) LIKE lower(?)";
  Object[] values={ator.idUnidade(),ator.papel().name(),ator.id(),"%"+q+"%"};
  long total=db.queryForObject("SELECT count(*) "+predicate,Long.class,values);
  List<Paciente> items=db.query("SELECT p.* "+predicate+" ORDER BY p.display_name,p.id LIMIT ? OFFSET ?",(rs,n)->new Paciente(rs.getObject("id",UUID.class),rs.getString("display_name"),rs.getString("modality"),rs.getObject("organization_id",UUID.class)),ator.idUnidade(),ator.papel().name(),ator.id(),"%"+q+"%",size,(long)paginar*size);
  instituicoes.auditar(ator,"PATIENT_SEARCHED","patient",null);return new Pagina<>(items,total,paginar,size);
 }
 public PacienteCadastrado cadastrarPaciente(CadastroPaciente entrada,Usuario ator){
  exigirProfissional(ator);UUID id=UUID.randomUUID(),account=null;
  if(entrada.nomeExibicao().trim().isBlank())throw error(400,"Informe o nome completo.");
  String cpf=DadosPessoaisService.normalizarCpf(entrada.cpf()),telefone=DadosPessoaisService.normalizarTelefone(entrada.telefone()),sexo=DadosPessoaisService.validarSexo(entrada.sexo());
  if(telefone==null)throw error(400,"Informe um celular válido com DDD para cadastrar o paciente.");
  DadosPessoaisService.validarNascimento(entrada.dataNascimento());
  if(entrada.modalidade().equals("APP")){
   if(cpf==null || entrada.dataNascimento()==null)throw error(400,"Informe CPF e data de nascimento para o aplicativo.");
   account=UUID.randomUUID();
   db.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role,enabled) VALUES(?,?,?,?,?,'PATIENT',false)",account,ator.idUnidade(),account+"@paciente.vivamais.invalid",entrada.nomeExibicao().trim(),codificadorSenhas.encode(codificadorTokens.issue()));
  }
  db.update("INSERT INTO patient(id,organization_id,user_account_id,display_name,modality) VALUES(?,?,?,?,?)",id,ator.idUnidade(),account,entrada.nomeExibicao().trim(),entrada.modalidade());
  db.update("UPDATE patient SET cpf=?,data_nascimento=?,telefone=?,email_contato=?,sexo=?,endereco=? WHERE id=?",cpf,entrada.dataNascimento(),telefone,DadosPessoaisService.textoOpcional(entrada.email()),sexo,DadosPessoaisService.textoOpcional(entrada.endereco()),id);
  if(ator.papel()==Papel.PROFESSIONAL)db.update("INSERT INTO patient_professional_assignment(patient_id,professional_id,organization_id) VALUES(?,?,?)",id,ator.id(),ator.idUnidade());
  instituicoes.auditar(ator,"PATIENT_CREATED","patient",id);
  return new PacienteCadastrado(new Paciente(id,entrada.nomeExibicao().trim(),entrada.modalidade(),ator.idUnidade()),null,null);
 }
 public void autorizarVinculo(UUID paciente,UUID exigirProfissional,Usuario ator){
  if(ator.papel()!=Papel.ADMIN)throw error(403,"Somente administrador atribui vínculos.");autorizarPaciente(paciente,ator);
  if(db.queryForObject("SELECT count(*) FROM professional WHERE id=? AND organization_id=?",Integer.class,exigirProfissional,ator.idUnidade())!=1)throw error(400,"Profissional não pertence à unidade.");
  db.update("INSERT INTO patient_professional_assignment(patient_id,professional_id,organization_id) VALUES(?,?,?) ON CONFLICT DO NOTHING",paciente,exigirProfissional,ator.idUnidade());instituicoes.auditar(ator,"PATIENT_ASSIGNED","patient",paciente);
 }
 public List<Map<String,Object>> listarProfissionais(Usuario ator){if(ator.papel()!=Papel.ADMIN)throw error(403,"Ação exclusiva da administração.");return consultarLinhas("SELECT p.id,u.display_name FROM professional p JOIN user_account u ON u.id=p.id WHERE p.organization_id=? ORDER BY u.display_name",ator.idUnidade());}
 public List<Map<String,Object>> listarVinculos(UUID paciente,Usuario ator){if(ator.papel()!=Papel.ADMIN)throw error(403,"Ação exclusiva da administração.");autorizarPaciente(paciente,ator);return consultarLinhas("SELECT a.professional_id,u.display_name FROM patient_professional_assignment a JOIN user_account u ON u.id=a.professional_id WHERE a.patient_id=? ORDER BY u.display_name",paciente);}
 public void revogarVinculo(UUID paciente,UUID exigirProfissional,Usuario ator){if(ator.papel()!=Papel.ADMIN)throw error(403,"Ação exclusiva da administração.");autorizarPaciente(paciente,ator);db.update("DELETE FROM patient_professional_assignment WHERE patient_id=? AND professional_id=? AND organization_id=?",paciente,exigirProfissional,ator.idUnidade());instituicoes.auditar(ator,"PATIENT_UNASSIGNED","patient",paciente);}
 public Map<String,Object> executarIdempotente(UUID id,UUID paciente,Usuario ator,String kind,Object entrada,Supplier<Map<String,Object>> write){
  autorizarPaciente(paciente,ator);db.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,0))",Object.class,id.toString());
  String hash=codificadorTokens.hash(encode(entrada));var existente=consultarLinhas("SELECT * FROM sync_operation WHERE id=?",id);
  if(!existente.isEmpty()){
   var linha=existente.getFirst();if(!linha.get("patientId").equals(paciente.toString())||!linha.get("actorId").equals(ator.id().toString())||!linha.get("kind").equals(kind)||!linha.get("payloadHash").equals(hash))throw error(409,"O identificador já foi usado com outro conteúdo.");
   @SuppressWarnings("unchecked") var resposta=(Map<String,Object>)linha.get("response");return resposta;
  }
  Map<String,Object> resultado=write.get();db.update("INSERT INTO sync_operation(id,patient_id,actor_id,kind,payload_hash,response) VALUES(?,?,?,?,?,?::jsonb)",id,paciente,ator.id(),kind,hash,encode(resultado));instituicoes.auditar(ator,kind+"_CREATED",kind,id);return resultado;
 }
 public Pagina<RegistroPressao> listarRegistrosPressao(UUID paciente,Usuario ator,int paginar,int size,Instant from,Instant to){
  autorizarPaciente(paciente,ator);validarPaginacao(paginar,size);if(from!=null&&to!=null&&from.isAfter(to))throw error(400,"Período inválido.");
  String where=" WHERE patient_id=?";List<Object> args=new ArrayList<>();args.add(paciente);
  if(from!=null){where+=" AND measured_at>=?";args.add(ts(from));}if(to!=null){where+=" AND measured_at<=?";args.add(ts(to));}
  long total=db.queryForObject("SELECT count(*) FROM blood_pressure_reading"+where,Long.class,args.toArray());args.add(size);args.add((long)paginar*size);
  var items=consultarLinhas("SELECT r.*,(SELECT u.display_name FROM user_account u WHERE u.id=r.author_id) AS author_name FROM blood_pressure_reading r"+where+" ORDER BY measured_at DESC,id DESC LIMIT ? OFFSET ?",args.toArray()).stream().map(linha->json.convertValue(linha,RegistroPressao.class)).toList();
  instituicoes.auditar(ator,"READINGS_VIEWED","patient",paciente);return new Pagina<>(items,total,paginar,size);
 }
 public RegistroPressao salvarRegistroPressao(UUID paciente,EntradaRegistroPressao entrada,Usuario ator){
  autorizarPaciente(paciente,ator);validarHorario(entrada.dataMedicao());
  if(ator.papel()==Papel.PATIENT&&!Set.of("MANUAL","OCR_CONFIRMED").contains(entrada.source()))throw error(403,"Origem não permitida para autorregistro.");
  if(entrada.source().equals("OCR_CONFIRMED")){
   if(!Boolean.TRUE.equals(entrada.ocrConfirmado())||entrada.idDocumentoOcr()==null)throw error(400,"Confirme os valores reconhecidos antes de salvar.");
   // A porta OCR será conectada ao documento privado na migração de arquivos; nunca aceitar prova fictícia.
   if(!Boolean.TRUE.equals(db.queryForObject("SELECT to_regclass('pressure_ocr_document') IS NOT NULL",Boolean.class)))throw error(503,"OCR ainda indisponível. Use digitação manual.");
   if(db.queryForObject("SELECT count(*) FROM pressure_ocr_document WHERE id=? AND patient_id=? AND status='RECOGNIZED' AND review_required=true",Integer.class,entrada.idDocumentoOcr(),paciente)!=1)throw error(400,"Documento OCR inválido.");
  }
  var resultado=executarIdempotente(entrada.id(),paciente,ator,"READING",entrada,()->{
   db.update("INSERT INTO blood_pressure_reading(id,patient_id,author_id,systolic,diastolic,pulse,measured_at,source,ocr_document_id) VALUES(?,?,?,?,?,?,?,?,?)",entrada.id(),paciente,ator.id(),entrada.sistolica(),entrada.diastolica(),entrada.pulso(),ts(entrada.dataMedicao()),entrada.source(),entrada.idDocumentoOcr());
   return one("SELECT r.*,(SELECT u.display_name FROM user_account u WHERE u.id=r.author_id) AS author_name FROM blood_pressure_reading r WHERE id=?",entrada.id());
  });return json.convertValue(resultado,RegistroPressao.class);
 }
 public List<Map<String,Object>> listarMedicamentos(UUID paciente,Usuario ator){autorizarPaciente(paciente,ator);return consultarLinhas("SELECT m.*,(SELECT u.display_name FROM user_account u WHERE u.id=m.author_id) AS author_name,coalesce((SELECT jsonb_agg(to_char(s.local_time,'HH24:MI') ORDER BY s.local_time) FROM medication_schedule s WHERE s.plan_id=m.id),'[]'::jsonb) schedules FROM medication_plan m WHERE patient_id=? ORDER BY created_at DESC,id",paciente);}
 public Map<String,Object> salvarMedicamento(UUID paciente,UUID plan,EntradaMedicamento entrada,Usuario ator){
  exigirProfissional(ator);autorizarPaciente(paciente,ator);if(entrada.fimVigencia()!=null&&entrada.fimVigencia().isBefore(entrada.inicioVigencia()))throw error(400,"Vigência inválida.");
  try{ZoneId.of(entrada.fusoHorario());}catch(Exception e){throw error(400,"Fuso horário inválido.");}
  if(new HashSet<>(entrada.horarios()).size()!=entrada.horarios().size())throw error(400,"Horários repetidos.");UUID id=plan==null?UUID.randomUUID():plan;
  if(plan==null)db.update("INSERT INTO medication_plan(id,patient_id,author_id,name,instruction,starts_on,ends_on,time_zone) VALUES(?,?,?,?,?,?,?,?)",id,paciente,ator.id(),entrada.name(),entrada.instrucaoProfissional(),entrada.inicioVigencia(),entrada.fimVigencia(),entrada.fusoHorario());
  else{
   var old=consultarLinhas("SELECT * FROM medication_plan WHERE id=? AND patient_id=? FOR UPDATE",plan,paciente);if(old.isEmpty())throw error(404,"Plano não encontrado.");
   int versao=((Number)old.getFirst().get("version")).intValue();if(entrada.versao()==null||entrada.versao()!=versao)throw error(409,"Plano alterado. Atualize os dados.");
   var snapshot=listarMedicamentos(paciente,ator).stream().filter(m->m.get("id").equals(id.toString())).findFirst().orElseThrow();
   db.update("INSERT INTO medication_plan_history(id,plan_id,version,snapshot,changed_by) VALUES(?,?,?,?::jsonb,?)",UUID.randomUUID(),plan,versao,encode(snapshot),ator.id());
   db.update("UPDATE medication_plan SET name=?,instruction=?,starts_on=?,ends_on=?,time_zone=?,version=version+1,author_id=? WHERE id=?",entrada.name(),entrada.instrucaoProfissional(),entrada.inicioVigencia(),entrada.fimVigencia(),entrada.fusoHorario(),ator.id(),id);
   db.update("DELETE FROM medication_schedule WHERE plan_id=?",id);
  }
  for(String schedule:entrada.horarios())db.update("INSERT INTO medication_schedule(plan_id,local_time) VALUES(?,?::time)",id,schedule);
  instituicoes.auditar(ator,"MEDICATION_PLAN_SAVED","medication_plan",id);return listarMedicamentos(paciente,ator).stream().filter(m->m.get("id").equals(id.toString())).findFirst().orElseThrow();
 }
 public UUID buscarPacientePlano(UUID plan,Usuario ator){UUID paciente=db.query("SELECT patient_id FROM medication_plan WHERE id=?",(rs,n)->rs.getObject(1,UUID.class),plan).stream().findFirst().orElseThrow(()->error(404,"Plano não encontrado."));autorizarPaciente(paciente,ator);return paciente;}
 public List<Map<String,Object>> listarHistoricoMedicamento(UUID plan,Usuario ator){buscarPacientePlano(plan,ator);return consultarLinhas("SELECT h.version,h.snapshot,h.changed_by,h.changed_at,u.display_name AS author_name FROM medication_plan_history h JOIN user_account u ON u.id=h.changed_by WHERE h.plan_id=? ORDER BY h.version DESC",plan);}
 public List<Map<String,Object>> listarHorariosMedicamentos(UUID paciente,LocalDate date,Usuario ator){
  List<Map<String,Object>> events=new ArrayList<>();for(var plan:listarMedicamentos(paciente,ator)){
   LocalDate start=LocalDate.parse(plan.get("startsOn").toString());Object end=plan.get("endsOn");if(date.isBefore(start)||(end!=null&&date.isAfter(LocalDate.parse(end.toString()))))continue;
   for(Object schedule:(List<?>)plan.get("schedules")){
    Instant at=date.atTime(LocalTime.parse(schedule.toString())).atZone(ZoneId.of(plan.get("timeZone").toString())).toInstant();
    Map<String,Object> event=new LinkedHashMap<>();event.put("planId",plan.get("id"));event.put("name",plan.get("name"));event.put("instruction",plan.get("instruction"));event.put("scheduledAt",at.toString());event.put("status","NO_CONFIRMATION");
    var reports=consultarLinhas("SELECT status,reported_at,author_id FROM medication_self_report WHERE plan_id=? AND scheduled_at=?",UUID.fromString(plan.get("id").toString()),ts(at));if(!reports.isEmpty())event.putAll(reports.getFirst());events.add(event);
   }
  }events.sort(Comparator.comparing(m->m.get("scheduledAt").toString()));return events;
 }
 public Map<String,Object> registrarAutorrelato(UUID paciente,EntradaAutorrelato entrada,Usuario ator){
  autorizarPaciente(paciente,ator);if(!buscarPacientePlano(entrada.idPlano(),ator).equals(paciente))throw error(400,"Plano de outro paciente.");validarHorario(entrada.dataAutorrelato());
  var plan=one("SELECT * FROM medication_plan WHERE id=?",entrada.idPlano());var zone=ZoneId.of(plan.get("timeZone").toString());var local=entrada.horarioProgramado().atZone(zone);LocalDate day=local.toLocalDate();
  if(day.isBefore(LocalDate.parse(plan.get("startsOn").toString()))||(plan.get("endsOn")!=null&&day.isAfter(LocalDate.parse(plan.get("endsOn").toString())))||db.queryForObject("SELECT count(*) FROM medication_schedule WHERE plan_id=? AND local_time=?::time",Integer.class,entrada.idPlano(),local.toLocalTime().toString())!=1)throw error(400,"Horário não pertence ao plano vigente.");
  return executarIdempotente(entrada.id(),paciente,ator,"MEDICATION_REPORT",entrada,()->{
   db.update("INSERT INTO medication_self_report(id,patient_id,plan_id,author_id,scheduled_at,reported_at,status,source) VALUES(?,?,?,?,?,?,?,?)",entrada.id(),paciente,entrada.idPlano(),ator.id(),ts(entrada.horarioProgramado()),ts(entrada.dataAutorrelato()),entrada.status(),ator.papel()==Papel.PATIENT?"SELF_REPORT":"PROFESSIONAL_TRANSCRIPTION");return one("SELECT * FROM medication_self_report WHERE id=?",entrada.id());
  });
 }
 private static String normalizarGrupoCatalogo(String grupo){return grupo!=null&&GRUPOS_CATALOGO_APROVADOS.contains(grupo)?grupo:"NAO_DEFINIDO";}
 private static String marcadorGrupoCatalogo(String grupo){return INICIO_MARCADOR_GRUPO_CATALOGO+grupo+FIM_MARCADOR_GRUPO_CATALOGO;}
 private static String grupoCatalogoArmazenado(String orientacoes){
  if(!orientacoes.startsWith(INICIO_MARCADOR_GRUPO_CATALOGO))return "NAO_DEFINIDO";
  int fim=orientacoes.indexOf(FIM_MARCADOR_GRUPO_CATALOGO);
  if(fim<0)return "NAO_DEFINIDO";
  return normalizarGrupoCatalogo(orientacoes.substring(INICIO_MARCADOR_GRUPO_CATALOGO.length(),fim));
 }
 private static String orientacoesPublicas(String orientacoes){
  String grupo=grupoCatalogoArmazenado(orientacoes);
  if(grupo.equals("NAO_DEFINIDO")||!orientacoes.startsWith(INICIO_MARCADOR_GRUPO_CATALOGO))return orientacoes;
  int inicio=orientacoes.indexOf(FIM_MARCADOR_GRUPO_CATALOGO)+FIM_MARCADOR_GRUPO_CATALOGO.length();
  return orientacoes.substring(inicio).replaceFirst("^\\r?\\n","");
 }
 private static String codificarGrupoCatalogo(String orientacoes,String grupo){
  if(orientacoes.contains(INICIO_MARCADOR_GRUPO_CATALOGO))throw error(400,"As orientações profissionais contêm um marcador reservado.");
  if(grupo.equals("NAO_DEFINIDO"))return orientacoes;
  String marcador=marcadorGrupoCatalogo(grupo),resultado=marcador+"\n"+orientacoes;
  if(resultado.length()>2000)throw error(400,"Reduza as orientações profissionais para salvar o grupo aprovado.");
  return resultado;
 }
 public Map<String,Object> perfilAtividade(UUID paciente,Usuario ator){
  autorizarPaciente(paciente,ator);var encontrado=consultarLinhas("SELECT p.*,u.display_name AS author_name FROM physical_activity_profile p JOIN user_account u ON u.id=p.author_id WHERE p.patient_id=?",paciente);if(encontrado.isEmpty())return null;
  var perfil=encontrado.getFirst();String orientacoes=Objects.toString(perfil.get("professionalGuidance"),""),grupo=grupoCatalogoArmazenado(orientacoes);
  perfil.put("professionalGuidance",orientacoesPublicas(orientacoes));perfil.put("approvedCatalogGroup",grupo);perfil.put("personalizationStatus",grupo.equals("NAO_DEFINIDO")?"BLOCKED_PENDING_CLINICAL_APPROVAL":"PROFESSIONAL_GROUP_APPROVED");
  return perfil;
 }
 public Map<String,Object> perfilAtividade(UUID paciente,PerfilAtividade entrada,Usuario ator){
  exigirProfissional(ator);autorizarPaciente(paciente,ator);String grupo=normalizarGrupoCatalogo(entrada.grupoCatalogoAprovado()),orientacoes=codificarGrupoCatalogo(entrada.orientacoesProfissionais(),grupo);
  db.update("INSERT INTO physical_activity_profile(patient_id,mobility,balance,restrictions,professional_guidance,author_id) VALUES(?,?,?,?,?,?) ON CONFLICT(patient_id) DO UPDATE SET mobility=excluded.mobility,balance=excluded.balance,restrictions=excluded.restrictions,professional_guidance=excluded.professional_guidance,author_id=excluded.author_id,updated_at=now()",paciente,entrada.mobilidade(),entrada.equilibrio(),entrada.restricoes(),orientacoes,ator.id());instituicoes.auditar(ator,"ACTIVITY_PROFILE_SAVED","patient",paciente);return perfilAtividade(paciente,ator);
 }
 public Map<String,Object> registrarAtividade(UUID paciente,EntradaAtividade entrada,Usuario ator){validarHorario(entrada.occurredAt());return executarIdempotente(entrada.id(),paciente,ator,"ACTIVITY",entrada,()->{db.update("INSERT INTO activity_record(id,patient_id,author_id,type,duration_minutes,occurred_at,notes,feeling) VALUES(?,?,?,?,?,?,?,?)",entrada.id(),paciente,ator.id(),entrada.type(),entrada.duracaoMinutos(),ts(entrada.occurredAt()),Objects.toString(entrada.observacoes(),""),entrada.estadoInformado());return one("SELECT * FROM activity_record WHERE id=?",entrada.id());});}
 public Pagina<Map<String,Object>> listarAtividades(UUID paciente,Usuario ator,int pagina,int tamanho,Instant inicio,Instant fim){
  autorizarPaciente(paciente,ator);validarPaginacao(pagina,tamanho);
  if(inicio!=null&&fim!=null&&!inicio.isBefore(fim))throw error(400,"Confira o período informado.");
  String filtro=" WHERE patient_id=?";List<Object> argumentos=new ArrayList<>();argumentos.add(paciente);
  if(inicio!=null){filtro+=" AND occurred_at>=?";argumentos.add(ts(inicio));}if(fim!=null){filtro+=" AND occurred_at<?";argumentos.add(ts(fim));}
  long total=db.queryForObject("SELECT count(*) FROM activity_record"+filtro,Long.class,argumentos.toArray());
  argumentos.add(tamanho);argumentos.add((long)pagina*tamanho);
  return new Pagina<>(consultarLinhas("SELECT r.*,(SELECT u.display_name FROM user_account u WHERE u.id=r.author_id) AS author_name FROM activity_record r"+filtro+" ORDER BY occurred_at DESC,id DESC LIMIT ? OFFSET ?",argumentos.toArray()),total,pagina,tamanho);
 }
 public Map<String,Object> resumirSemanaAtividades(UUID paciente,LocalDate inicio,Usuario ator){
  autorizarPaciente(paciente,ator);if(inicio.getDayOfWeek()!=DayOfWeek.MONDAY)throw error(400,"A semana deve iniciar na segunda-feira.");
  ZoneId fuso=ZoneId.of("America/Sao_Paulo");LocalDate fim=inicio.plusDays(7);
  var dias=consultarLinhas("SELECT (occurred_at AT TIME ZONE 'America/Sao_Paulo')::date AS data,sum(duration_minutes) AS minutos,count(*) AS registros FROM activity_record WHERE patient_id=? AND occurred_at>=? AND occurred_at<? GROUP BY 1 ORDER BY 1",paciente,ts(inicio.atStartOfDay(fuso).toInstant()),ts(fim.atStartOfDay(fuso).toInstant()));
  long minutos=dias.stream().mapToLong(dia->((Number)dia.get("minutos")).longValue()).sum(),registros=dias.stream().mapToLong(dia->((Number)dia.get("registros")).longValue()).sum();
  return Map.of("inicio",inicio.toString(),"fimExclusivo",fim.toString(),"dias",dias,"totalMinutos",minutos,"totalRegistros",registros);
 }
 public Map<String,Object> diario(UUID paciente,EntradaDiario entrada,Usuario ator){
  exigirProfissional(ator);validarHorario(entrada.occurredAt());if((entrada.sistolica()==null)!=(entrada.diastolica()==null))throw error(400,"Informe os dois valores da pressão.");
  return executarIdempotente(entrada.id(),paciente,ator,"DIARY",entrada,()->{db.update("INSERT INTO printed_diary_entry(id,patient_id,author_id,occurred_at,systolic,diastolic,pulse,medication_report,notes) VALUES(?,?,?,?,?,?,?,?,?)",entrada.id(),paciente,ator.id(),ts(entrada.occurredAt()),entrada.sistolica(),entrada.diastolica(),entrada.pulso(),Objects.toString(entrada.medicationReport(),""),Objects.toString(entrada.observacoes(),""));
   if(entrada.sistolica()!=null)db.update("INSERT INTO blood_pressure_reading(id,patient_id,author_id,systolic,diastolic,pulse,measured_at,source) VALUES(?,?,?,?,?,?,?,'PRINTED_DIARY')",entrada.id(),paciente,ator.id(),entrada.sistolica(),entrada.diastolica(),entrada.pulso(),ts(entrada.occurredAt()));return one("SELECT * FROM printed_diary_entry WHERE id=?",entrada.id());});
 }
 public Map<String,Object> registrarConsulta(UUID paciente,EntradaConsulta entrada,Usuario ator){exigirProfissional(ator);validarHorario(entrada.occurredAt());return executarIdempotente(entrada.id(),paciente,ator,"CONSULTATION",entrada,()->{db.update("INSERT INTO consultation(id,patient_id,author_id,occurred_at,notes,goals,care_plan) VALUES(?,?,?,?,?,?,?)",entrada.id(),paciente,ator.id(),ts(entrada.occurredAt()),entrada.observacoes(),entrada.objetivos(),entrada.planoCuidado());return one("SELECT * FROM consultation WHERE id=?",entrada.id());});}
 public Map<String,Object> pulseira(UUID paciente,Usuario ator){autorizarPaciente(paciente,ator);return consultarLinhas("SELECT * FROM device WHERE patient_id=?",paciente).stream().findFirst().orElse(null);}
 public Map<String,Object> pulseira(UUID paciente,EntradaPulseira entrada,Usuario ator){exigirProfissional(ator);if(!autorizarPaciente(paciente,ator).modalidade().equals("BRACELET_DIARY"))throw error(409,"Paciente não está na modalidade pulseira + diário.");db.update("INSERT INTO device(id,patient_id,author_id,label,serial_number) VALUES(?,?,?,?,?) ON CONFLICT(patient_id) DO UPDATE SET label=excluded.label,serial_number=excluded.serial_number,author_id=excluded.author_id",UUID.randomUUID(),paciente,ator.id(),entrada.identificacao(),entrada.numeroSerie());instituicoes.auditar(ator,"DEVICE_SAVED","patient",paciente);return pulseira(paciente,ator);}
 public List<Map<String,Object>> listarConfiguracoes(UUID paciente,Usuario ator){autorizarPaciente(paciente,ator);return consultarLinhas("SELECT c.* FROM device_configuration c JOIN device d ON d.id=c.device_id WHERE d.patient_id=? ORDER BY c.created_at DESC",paciente);}
 public Map<String,Object> configurar(UUID paciente,EntradaConfiguracaoPulseira entrada,Usuario ator){exigirProfissional(ator);if(entrada.adaptador().equals("SIMULATED")&&!Set.of("development","test").contains(ambiente))throw error(409,"Simulador disponível somente no ambiente de desenvolvimento.");var pulseira=pulseira(paciente,ator);if(pulseira==null)throw error(409,"Cadastre a pulseira primeiro.");UUID id=UUID.randomUUID();var adaptador=entrada.adaptador().equals("SIMULATED")?AdaptadorPulseira.developmentSimulator():AdaptadorPulseira.unavailableHardware();var resultado=adaptador.configurar(entrada.horarios());db.update("INSERT INTO device_configuration(id,device_id,schedules,status,simulated,adapter,message,author_id) VALUES(?,?,?::jsonb,?,?,?,?,?)",id,UUID.fromString(pulseira.get("id").toString()),encode(entrada.horarios()),resultado.status(),resultado.simulado(),entrada.adaptador(),resultado.message(),ator.id());instituicoes.auditar(ator,"DEVICE_CONFIGURATION_CREATED","device",UUID.fromString(pulseira.get("id").toString()));return one("SELECT * FROM device_configuration WHERE id=?",id);}
 public Map<String,Object> resumirConsulta(UUID paciente,Usuario ator){exigirProfissional(ator);Map<String,Object> out=new LinkedHashMap<>();out.put("patient",autorizarPaciente(paciente,ator));out.put("generatedAt",Instant.now().toString());out.put("totais",one("SELECT (SELECT count(*) FROM meal_photo WHERE patient_id=?) AS refeicoes,(SELECT count(*) FROM activity_record WHERE patient_id=?) AS atividades,(SELECT count(*) FROM consultation WHERE patient_id=?) AS consultas,(SELECT count(*) FROM blood_pressure_reading WHERE patient_id=?) AS pressoes",paciente,paciente,paciente,paciente));out.put("readings",listarRegistrosPressao(paciente,ator,0,20,null,null).items());out.put("medications",listarMedicamentos(paciente,ator));for(String[] pair:new String[][]{{"activities","activity_record"},{"diary","printed_diary_entry"},{"consultations","consultation"}})out.put(pair[0],paginar(pair[1],paciente,0,20).items());out.put("functionalProfile",perfilAtividade(paciente,ator));out.put("medicationEvents",listarHorariosMedicamentos(paciente,LocalDate.now(ZoneId.of("America/Sao_Paulo")),ator));out.put("meals",consultarLinhas("SELECT id,occurred_at,notes,analysis_status,assessment FROM meal_photo WHERE patient_id=? ORDER BY occurred_at DESC LIMIT 20",paciente));instituicoes.auditar(ator,"CONSULTATION_SUMMARY_VIEWED","patient",paciente);return out;}
 public Map<String,Object> exportarResumo(UUID paciente,Usuario ator){var resultado=resumirConsulta(paciente,ator);instituicoes.auditar(ator,"PATIENT_SUMMARY_EXPORTED","patient",paciente);return resultado;}
}
