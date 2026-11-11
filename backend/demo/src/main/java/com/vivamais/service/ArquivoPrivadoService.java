package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import static com.vivamais.dto.ModelosApi.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import java.util.regex.*;
import javax.imageio.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service @Transactional
public class ArquivoPrivadoService {
 private static final String VALIDACAO_ALIMENTAR="food-response-safety-v2";
 private final JdbcTemplate db;private final CuidadoService cuidados;private final InstituicaoRepository instituicoes;private final ArmazenamentoArquivos armazenamento;private final CodificadorToken codificadorTokens;private final ProvedorOcr ocr;private final ProvedorAnaliseAlimentacao alimentacao;private final double confiancaMinimaOcr;
 public ArquivoPrivadoService(JdbcTemplate db,CuidadoService cuidados,InstituicaoRepository instituicoes,ArmazenamentoArquivos armazenamento,CodificadorToken codificadorTokens,ProvedorOcr ocr,ProvedorAnaliseAlimentacao alimentacao,@Value("${ocr.minimum-confidence:0.85}")double confiancaMinimaOcr){if(!Double.isFinite(confiancaMinimaOcr)||confiancaMinimaOcr<=0||confiancaMinimaOcr>1)throw new IllegalArgumentException("Confiança mínima do OCR deve estar entre zero exclusivo e um.");this.db=db;this.cuidados=cuidados;this.instituicoes=instituicoes;this.armazenamento=armazenamento;this.codificadorTokens=codificadorTokens;this.ocr=ocr;this.alimentacao=alimentacao;this.confiancaMinimaOcr=confiancaMinimaOcr;}
 public static byte[] sanitizarImagem(byte[] bytes)throws Exception{return PreparadorImagem.preparar(bytes);}
 public Map<String,Object> estadoAnaliseAlimentar(){return Map.of("enabled",alimentacao.enabled(),"status",alimentacao.enabled()?"ENABLED":"DISABLED","processingMode","SYNCHRONOUS","message",alimentacao.enabled()?"Análise educativa disponível sob solicitação; exige conferência humana.":"Análise não habilitada. Sua foto é salva para consulta pela equipe; nenhum alimento ou nutriente é identificado automaticamente neste ambiente.");}
 public Map<String,Object> upload(UUID paciente,String finalidade,MultipartFile arquivo,Usuario ator)throws Exception{
  cuidados.autorizarPaciente(paciente,ator);if(!Set.of("MEAL","PRESSURE_DISPLAY").contains(finalidade))throw CuidadoService.error(400,"Finalidade inválida.");
  db.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,1))",Object.class,paciente.toString());
  if(db.queryForObject("SELECT count(*) FROM file_object WHERE patient_id=? AND created_at>=date_trunc('month',now())",Integer.class,paciente)>=20)throw CuidadoService.error(429,"Limite de 20 fotos por mês nesta demonstração.");
  byte[] imagemSanitizada=sanitizarImagem(arquivo.getBytes());UUID id=UUID.randomUUID();String key=id+".bin";armazenamento.put(key,imagemSanitizada);
  try{db.update("INSERT INTO file_object(id,patient_id,author_id,object_key,mime_type,byte_size,sha256,purpose) VALUES(?,?,?,?,'image/png',?,?,?)",id,paciente,ator.id(),key,imagemSanitizada.length,HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(imagemSanitizada)),finalidade);instituicoes.auditar(ator,"PRIVATE_FILE_CREATED","file_object",id);}
  catch(RuntimeException e){armazenamento.delete(key);throw e;}
  return cuidados.consultarLinhas("SELECT id,patient_id,mime_type,byte_size,purpose,created_at FROM file_object WHERE id=?",id).getFirst();
 }
 private Map<String,Object> arquivo(UUID id,Usuario ator){var encontrado=cuidados.consultarLinhas("SELECT * FROM file_object WHERE id=?",id);if(encontrado.isEmpty())throw CuidadoService.error(403,"Arquivo não autorizado.");cuidados.autorizarPaciente(UUID.fromString(encontrado.getFirst().get("patientId").toString()),ator);return encontrado.getFirst();}
 public Map<String,Object> link(UUID arquivo,SessaoAutenticada principalAutenticado){arquivo(arquivo,principalAutenticado.usuario());String grant=codificadorTokens.issue();Instant expires=Instant.now().plusSeconds(60);db.update("DELETE FROM file_download_grant WHERE expires_at<now()");db.update("INSERT INTO file_download_grant(token_hash,file_id,session_id,expires_at) VALUES(?,?,?,?)",codificadorTokens.hash(grant),arquivo,principalAutenticado.idSessao(),java.sql.Timestamp.from(expires));instituicoes.auditar(principalAutenticado.usuario(),"PRIVATE_FILE_LINK_CREATED","file_object",arquivo);return Map.of("path","/api/v1/files/"+arquivo+"/content?access="+grant,"expiresAt",expires.toString());}
 public byte[] content(UUID arquivo,String grant)throws Exception{
  if(grant==null||grant.length()>128)throw CuidadoService.error(403,"Link inválido ou expirado.");
  var encontrado=cuidados.consultarLinhas("SELECT f.object_key,f.patient_id,s.token_hash FROM file_download_grant g JOIN auth_session s ON s.id=g.session_id JOIN file_object f ON f.id=g.file_id WHERE g.token_hash=? AND g.file_id=? AND g.expires_at>now()",codificadorTokens.hash(grant),arquivo);
  if(encontrado.isEmpty())throw CuidadoService.error(403,"Link inválido ou expirado.");
  var linha=encontrado.getFirst();
  // A política central também verifica sessões de convite, sua validade e revogação.
  var sessao=instituicoes.principalAutenticado(linha.get("tokenHash").toString()).orElseThrow(()->CuidadoService.error(403,"Link inválido ou expirado."));
  cuidados.autorizarPaciente(UUID.fromString(linha.get("patientId").toString()),sessao.usuario());
  instituicoes.auditar(sessao.usuario(),"PRIVATE_FILE_VIEWED","file_object",arquivo);
  return armazenamento.get(linha.get("objectKey").toString());
 }
 static record AvaliacaoOcr(String status,Integer sistolica,Integer diastolica,Integer pulso,Double confianca,String motivo) {}
 public Map<String,Object> reconhecer(UUID id,Usuario ator)throws Exception{
  var arquivo=arquivo(id,ator);if(!arquivo.get("purpose").equals("PRESSURE_DISPLAY"))throw CuidadoService.error(400,"Selecione uma foto de visor de aparelho.");
  UUID paciente=UUID.fromString(arquivo.get("patientId").toString()),document=UUID.randomUUID();Path image=Files.createTempFile("viva-ocr-",".png");AvaliacaoOcr avaliacao=indisponivelOcr("UNAVAILABLE");String modelo="tesseract-eng-psm6";
  try{Files.write(image,armazenamento.get(arquivo.get("objectKey").toString()));ProvedorOcr.Resultado bruto=ocr.reconhecer(image);modelo=bruto.versaoModelo();avaliacao=avaliarOcr(bruto,confiancaMinimaOcr);
  }catch(org.springframework.web.server.ResponseStatusException e){if(e.getStatusCode().value()==429)throw e;avaliacao=indisponivelOcr(e.getReason()!=null&&e.getReason().contains("demorou")?"TIMEOUT":"UNAVAILABLE");
  }catch(Exception e){avaliacao=indisponivelOcr("UNAVAILABLE");
  }finally{Files.deleteIfExists(image);}
  db.update("INSERT INTO pressure_ocr_document(id,patient_id,file_id,status,systolic,diastolic,pulse,confidence,model_version,criteria_version,review_required,review_reason) VALUES(?,?,?,?,?,?,?,?,?,?,true,?)",document,paciente,id,avaliacao.status(),avaliacao.sistolica(),avaliacao.diastolica(),avaliacao.pulso(),avaliacao.confianca(),modelo,ocr.versaoCriterios(),avaliacao.motivo());instituicoes.auditar(ator,"OCR_PROCESSED","pressure_ocr_document",document);
  var resultado=cuidados.consultarLinhas("SELECT id,file_id,status,systolic,diastolic,pulse,confidence,model_version,criteria_version,review_required,review_reason,created_at FROM pressure_ocr_document WHERE id=?",document).getFirst();resultado.put("confirmationRequired",true);resultado.put("message",mensagemOcr(avaliacao.status(),avaliacao.motivo()));return resultado;
 }
 static AvaliacaoOcr avaliarOcr(ProvedorOcr.Resultado bruto,double minimo){
  if(bruto==null||!Double.isFinite(bruto.confianca())||bruto.confianca()<0||bruto.confianca()>1)return new AvaliacaoOcr("UNREADABLE",null,null,null,null,"LOW_CONFIDENCE");
  if(bruto.confianca()<minimo)return new AvaliacaoOcr("UNREADABLE",null,null,null,bruto.confianca(),"LOW_CONFIDENCE");
  String texto=bruto.texto();if(texto==null||texto.isBlank())return new AvaliacaoOcr("UNREADABLE",null,null,null,bruto.confianca(),"INCOMPLETE_VALUES");
  NumeroOcr campoSys=extrairNumero(texto,"(?:SYS|SIS|SYSTOLIC|SISTOLICA)"),campoDia=extrairNumero(texto,"(?:DIA|DIASTOLIC|DIASTOLICA)"),campoPulso=extrairNumero(texto,"(?:PULSE|PULSO|PUL)");
  if(campoSys.invalido()||campoDia.invalido()||campoPulso.invalido())return new AvaliacaoOcr("UNREADABLE",null,null,null,bruto.confianca(),"AMBIGUOUS_OR_MALFORMED_VALUES");
  Integer sys=campoSys.valor(),dia=campoDia.valor(),pulso=campoPulso.valor();
  // O formato sem rótulos só vale para uma única leitura completa, sem texto extra.
  // Não usar outra linha numérica para completar um rótulo ausente ou ilegível.
  if(!campoSys.presente()&&!campoDia.presente()&&!campoPulso.presente()){
   var m=Pattern.compile("\\s*(\\d{2,3})(?:\\s*[/|]\\s*|\\s+)(\\d{2,3})(?:\\s+(\\d{2,3}))?\\s*").matcher(texto);
   if(m.matches()){sys=Integer.valueOf(m.group(1));dia=Integer.valueOf(m.group(2));if(m.group(3)!=null)pulso=Integer.valueOf(m.group(3));}
  }
  if(sys==null||dia==null)return new AvaliacaoOcr("UNREADABLE",null,null,null,bruto.confianca(),"INCOMPLETE_VALUES");
  if(sys<=dia)return new AvaliacaoOcr("UNREADABLE",null,null,null,bruto.confianca(),"INVERTED_VALUES");
  if(sys<50||sys>300||dia<30||dia>200||(pulso!=null&&(pulso<30||pulso>250)))return new AvaliacaoOcr("UNREADABLE",null,null,null,bruto.confianca(),"OUT_OF_PLAUSIBLE_RANGE");
  return new AvaliacaoOcr("RECOGNIZED",sys,dia,pulso,bruto.confianca(),"HUMAN_CONFIRMATION_REQUIRED");
 }
 static AvaliacaoOcr indisponivelOcr(String motivo){return new AvaliacaoOcr("UNAVAILABLE",null,null,null,null,motivo);}
 private static String mensagemOcr(String status,String motivo){if(status.equals("RECOGNIZED"))return "Confira todos os números antes de salvar. A foto é do visor; o celular não mede pressão.";if(status.equals("UNREADABLE"))return motivo.equals("LOW_CONFIDENCE")?"A foto não teve confiança técnica suficiente. Tire outra foto ou digite os valores.":"Não foi possível validar todos os números da foto. Tire outra foto ou digite os valores.";return motivo.equals("TIMEOUT")?"OCR demorou demais. Digite os valores ou tente outra foto.":"OCR indisponível neste ambiente. Digite os valores ou tente novamente depois.";}
 private record NumeroOcr(Integer valor,boolean presente,boolean invalido){}
 private static NumeroOcr extrairNumero(String texto,String identificacao){
  var rotulos=Pattern.compile("(?i)\\b"+identificacao+"\\b").matcher(texto);
  if(!rotulos.find())return new NumeroOcr(null,false,false);
  int inicio=rotulos.end();
  if(rotulos.find())return new NumeroOcr(null,true,true);
  var numero=Pattern.compile("(?i)[\\s:;=]*(?:mmhg[\\s:;=]*)?([+\\-\\u2212]?[0-9]+(?:[.,][0-9]+)?)").matcher(texto.substring(inicio));
  if(!numero.lookingAt()||!numero.group(1).matches("[0-9]{2,3}"))return new NumeroOcr(null,true,true);
  return new NumeroOcr(Integer.valueOf(numero.group(1)),true,false);
 }
 public Map<String,Object> registrarRefeicao(UUID paciente,UUID arquivo,Instant occurredAt,String observacoes,Usuario ator){
  cuidados.autorizarPaciente(paciente,ator);var armazenado=arquivo(arquivo,ator);if(!armazenado.get("patientId").equals(paciente.toString())||!armazenado.get("purpose").equals("MEAL"))throw CuidadoService.error(400,"Foto não pertence a esta refeição.");if(occurredAt==null||occurredAt.isAfter(Instant.now().plusSeconds(300)))throw CuidadoService.error(400,"Data da refeição inválida.");if(observacoes!=null&&observacoes.length()>2000)throw CuidadoService.error(400,"Observação muito longa.");
  var existente=cuidados.consultarLinhas("SELECT * FROM meal_photo WHERE file_id=?",arquivo);if(!existente.isEmpty())return existente.getFirst();UUID id=UUID.randomUUID();db.update("INSERT INTO meal_photo(id,patient_id,file_id,author_id,occurred_at,notes) VALUES(?,?,?,?,?,?)",id,paciente,arquivo,ator.id(),java.sql.Timestamp.from(occurredAt),Objects.toString(observacoes,""));instituicoes.auditar(ator,"MEAL_CREATED","meal_photo",id);return cuidados.consultarLinhas("SELECT * FROM meal_photo WHERE id=?",id).getFirst();
 }
 public ModelosCuidado.Pagina<Map<String,Object>> listarRefeicoes(UUID paciente,int paginar,int size,Usuario ator){cuidados.autorizarPaciente(paciente,ator);if(paginar<0||paginar>100000||size<1||size>100)throw CuidadoService.error(400,"Paginação inválida.");return new ModelosCuidado.Pagina<>(cuidados.consultarLinhas("SELECT * FROM meal_photo WHERE patient_id=? ORDER BY occurred_at DESC,id DESC LIMIT ? OFFSET ?",paciente,size,(long)paginar*size),db.queryForObject("SELECT count(*) FROM meal_photo WHERE patient_id=?",Long.class,paciente),paginar,size);}
 public Map<String,Object> buscarRefeicao(UUID idRefeicao,Usuario ator){
  var encontrados=cuidados.consultarLinhas("SELECT * FROM meal_photo WHERE id=?",idRefeicao);
  if(encontrados.isEmpty())throw CuidadoService.error(403,"Refeição não autorizada.");
  var refeicao=encontrados.getFirst();cuidados.autorizarPaciente(UUID.fromString(refeicao.get("patientId").toString()),ator);
  instituicoes.auditar(ator,"MEAL_VIEWED","meal_photo",idRefeicao);return refeicao;
 }
 public Map<String,Object> analisarAlimentacao(UUID registrarRefeicao,Usuario ator)throws Exception{
  var encontrado=cuidados.consultarLinhas("SELECT m.*,f.object_key FROM meal_photo m JOIN file_object f ON f.id=m.file_id WHERE m.id=?",registrarRefeicao);if(encontrado.isEmpty())throw CuidadoService.error(403,"Refeição não autorizada.");var linha=encontrado.getFirst();cuidados.autorizarPaciente(UUID.fromString(linha.get("patientId").toString()),ator);
  if(!alimentacao.enabled())return analiseIndisponivel(false);
  ProvedorAnaliseAlimentacao.Contexto contexto=alimentacao.contexto();
  db.queryForObject("SELECT pg_advisory_xact_lock(41050821)",Object.class);
  linha=cuidados.consultarLinhas("SELECT m.*,f.object_key FROM meal_photo m JOIN file_object f ON f.id=m.file_id WHERE m.id=?",registrarRefeicao).getFirst();
  var cache=cuidados.consultarLinhas("SELECT assessment FROM food_analysis_attempt WHERE meal_id=? AND status='SUCCEEDED' AND provider_name=? AND model_version=? AND criteria_version=? AND contract_version=? AND approval_reference=? AND assessment->>'validationVersion'=? ORDER BY completed_at DESC NULLS LAST,created_at DESC LIMIT 1",registrarRefeicao,contexto.provedor(),contexto.versaoModelo(),contexto.versaoCriterios(),contexto.versaoContrato(),contexto.referenciaAprovacao(),VALIDACAO_ALIMENTAR);
  if(!cache.isEmpty()){@SuppressWarnings("unchecked")Map<String,Object> resultado=(Map<String,Object>)cache.getFirst().get("assessment");return resultado;}
  if(db.queryForObject("SELECT count(*) FROM food_analysis_attempt WHERE created_at>=date_trunc('day',now())",Integer.class)>=5)throw CuidadoService.error(429,"Limite diário de análises atingido nesta demonstração.");
  if(db.queryForObject("SELECT count(*) FROM food_analysis_attempt WHERE meal_id=?",Integer.class,registrarRefeicao)>=2)throw CuidadoService.error(429,"Limite de tentativas para esta foto atingido.");
  UUID tentativa=UUID.randomUUID();db.update("INSERT INTO food_analysis_attempt(id,meal_id,actor_id,status,provider_name,model_version,criteria_version,contract_version,approval_reference) VALUES(?,?,?,'STARTED',?,?,?,?,?)",tentativa,registrarRefeicao,ator.id(),contexto.provedor(),contexto.versaoModelo(),contexto.versaoCriterios(),contexto.versaoContrato(),contexto.referenciaAprovacao());
  try{var resultado=new LinkedHashMap<String,Object>(alimentacao.assess(armazenamento.get(linha.get("objectKey").toString())));resultado.put("validationVersion",VALIDACAO_ALIMENTAR);db.update("UPDATE meal_photo SET analysis_status=?,assessment=?::jsonb WHERE id=?",resultado.get("status"),cuidados.encode(resultado),registrarRefeicao);db.update("UPDATE food_analysis_attempt SET status='SUCCEEDED',model_version=?,confidence=?,assessment=?::jsonb,completed_at=now() WHERE id=?",resultado.get("modelVersion"),resultado.get("confidence"),cuidados.encode(resultado),tentativa);instituicoes.auditar(ator,"FOOD_ANALYSIS_COMPLETED","meal_photo",registrarRefeicao);return resultado;}
  catch(Exception exception){db.update("UPDATE food_analysis_attempt SET status='FAILED',failure_code='INVALID_OR_UNAVAILABLE',completed_at=now() WHERE id=?",tentativa);db.update("UPDATE meal_photo SET analysis_status='UNAVAILABLE',assessment=NULL WHERE id=?",registrarRefeicao);instituicoes.auditar(ator,"FOOD_ANALYSIS_UNAVAILABLE","meal_photo",registrarRefeicao);return analiseIndisponivel(true);}
 }
 private static Map<String,Object> analiseIndisponivel(boolean fornecedorChamado){Map<String,Object> resultado=new LinkedHashMap<>();resultado.put("status","UNAVAILABLE");resultado.put("providerCalled",fornecedorChamado);resultado.put("message",fornecedorChamado?"Análise automatizada indisponível. O serviço não retornou uma avaliação educativa válida.":"Análise automatizada indisponível. Critérios, fornecedor e revisão clínica precisam de configuração aprovada.");resultado.put("educationalAlternative","Leve a foto à equipe de saúde para conversar sobre a refeição. A foto, sozinha, não mede sódio, gordura, porções, calorias ou pressão arterial.");return resultado;}
}
