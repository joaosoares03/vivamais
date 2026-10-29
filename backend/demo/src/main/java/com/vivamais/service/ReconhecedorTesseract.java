package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;
import java.nio.file.*;
import java.util.concurrent.*;
import tools.jackson.databind.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ReconhecedorTesseract implements ProvedorOcr {
 private final String command,script,node,versaoModelo,versaoCriterios;private final ObjectMapper json;private final Semaphore slot=new Semaphore(1);
 public ReconhecedorTesseract(@Value("${ocr.command:tesseract}") String command,@Value("${ocr.node-script:}") String script,@Value("${ocr.node:node}") String node,@Value("${ocr.model-version:tesseract-eng-psm6}") String versaoModelo,@Value("${ocr.criteria-version:ocr-safety-v1}") String versaoCriterios,ObjectMapper json){this.command=command;this.script=script;this.node=node;this.versaoModelo=versaoModelo;this.versaoCriterios=versaoCriterios;this.json=json;}
 @Override public Resultado reconhecer(Path image)throws Exception{
  if(!slot.tryAcquire())throw CuidadoService.error(429,"OCR ocupado. Tente novamente em instantes.");
  Path out=Files.createTempFile("viva-ocr-output-",".txt");Process process=null;
  try{
   ProcessBuilder pb=script.isBlank()?new ProcessBuilder(command,image.toString(),"stdout","-l","eng","--psm","6","tsv"):new ProcessBuilder(node,script,image.toString());
   pb.redirectOutput(out.toFile());pb.redirectError(ProcessBuilder.Redirect.DISCARD);process=pb.start();
   if(!process.waitFor(30,TimeUnit.SECONDS)){process.destroyForcibly();throw CuidadoService.error(503,"OCR demorou demais. Digite os valores ou tente outra foto.");}
   if(process.exitValue()!=0||Files.size(out)>16384)throw CuidadoService.error(503,"OCR indisponível neste ambiente.");return interpretarSaida(Files.readString(out));
  }finally{if(process!=null&&process.isAlive())process.destroyForcibly();Files.deleteIfExists(out);slot.release();}
 }
 @Override public String versaoCriterios(){return versaoCriterios;}
 Resultado interpretarSaida(String saida)throws Exception{
  if(script.isBlank())return interpretarTsv(saida);
  JsonNode resultado=json.readTree(saida);String texto=resultado.path("text").asText("");double confianca=resultado.path("confidence").asDouble(-1);
  if(texto.isBlank()||!Double.isFinite(confianca)||confianca<0||confianca>1)throw CuidadoService.error(503,"OCR indisponível neste ambiente.");
  return new Resultado(texto,confianca,versaoModelo);
 }
 private Resultado interpretarTsv(String tsv){
  StringBuilder texto=new StringBuilder();double total=0;int palavras=0;
  for(String linha:tsv.split("\\R")){
   String[] campos=linha.split("\\t",12);if(campos.length!=12||campos[0].equals("level"))continue;
   try{double confianca=Double.parseDouble(campos[10]);String palavra=campos[11].trim();if(confianca>=0&&!palavra.isBlank()){if(!texto.isEmpty())texto.append(' ');texto.append(palavra);total+=confianca;palavras++;}}catch(NumberFormatException ignorar){}
  }
  if(palavras==0)throw CuidadoService.error(503,"OCR indisponível neste ambiente.");
  return new Resultado(texto.toString(),total/palavras/100d,versaoModelo);
 }
}
