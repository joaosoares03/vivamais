package com.vivamais.service;
import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosCuidado.*;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.time.*;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.*;
import org.springframework.web.multipart.MultipartFile;

/** Fixtures exclusivas de contas novas de homologação; não são orientação clínica. */
@Service
public class DadosGrupoTeste {
 private final CuidadoService cuidados;private final ArquivoPrivadoService arquivos;private final ArmazenamentoArquivos armazenamento;
 public DadosGrupoTeste(CuidadoService cuidados,ArquivoPrivadoService arquivos,ArmazenamentoArquivos armazenamento){this.cuidados=cuidados;this.arquivos=arquivos;this.armazenamento=armazenamento;}
 public void preencher(UUID paciente,Usuario ator)throws Exception{
  Instant agora=Instant.now();LocalDate hoje=LocalDate.now(ZoneId.of("America/Sao_Paulo"));
  cuidados.salvarRegistroPressao(paciente,new EntradaRegistroPressao(UUID.randomUUID(),120,80,70,agora.minusSeconds(3600),"PROFESSIONAL",null,null),ator);
  cuidados.salvarMedicamento(paciente,null,new EntradaMedicamento("Medicamento fictício de teste","Somente exemplo para testar os botões. Não tomar nenhum medicamento com base nesta conta.",hoje.minusDays(1),null,"America/Sao_Paulo",java.util.List.of("08:00","20:00"),null,null),ator);
  cuidados.registrarAtividade(paciente,new EntradaAtividade(UUID.randomUUID(),"Atividade fictícia",10,agora.minusSeconds(7200),"Registro de exemplo, sem recomendação de exercício.","WELL",null),ator);
  cuidados.registrarConsulta(paciente,new EntradaConsulta(UUID.randomUUID(),agora.minusSeconds(10800),"Consulta fictícia para explorar a ficha.","Testar a navegação.","Nenhuma conduta clínica prescrita."),ator);
  cuidados.diario(paciente,new EntradaDiario(UUID.randomUUID(),agora.minusSeconds(14400),120,80,70,"Relato fictício, sem indicação de uso.","Diário de exemplo do grupo."),ator);
  var imagem=new BufferedImage(160,120,BufferedImage.TYPE_INT_RGB);var desenho=imagem.createGraphics();
  try{desenho.setColor(new Color(235,242,245));desenho.fillRect(0,0,160,120);desenho.setColor(Color.WHITE);desenho.fillOval(25,10,110,100);desenho.setColor(new Color(70,150,90));desenho.fillOval(45,25,40,40);desenho.setColor(new Color(220,170,80));desenho.fillOval(80,55,35,30);}finally{desenho.dispose();}
  var saida=new ByteArrayOutputStream();ImageIO.write(imagem,"png",saida);byte[] bytes=saida.toByteArray();imagem.flush();
  MultipartFile fotografia=new MultipartFile(){public String getName(){return "file";}public String getOriginalFilename(){return "refeicao-ficticia.png";}public String getContentType(){return "image/png";}public boolean isEmpty(){return false;}public long getSize(){return bytes.length;}public byte[] getBytes(){return bytes;}public InputStream getInputStream(){return new ByteArrayInputStream(bytes);}public void transferTo(File destino)throws IOException{java.nio.file.Files.write(destino.toPath(),bytes);}};
  var arquivo=arquivos.upload(paciente,"MEAL",fotografia,ator);UUID id=UUID.fromString(arquivo.get("id").toString());
  TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization(){@Override public void afterCompletion(int estado){if(estado!=STATUS_COMMITTED)try{armazenamento.delete(id+".bin");}catch(Exception falha){/* A chave aleatória não é exposta; a coleta operacional pode remover o órfão. */}}});
  arquivos.registrarRefeicao(paciente,id,agora.minusSeconds(18000),"Ilustração sintética, sem fotografia pessoal e sem análise de IA.",ator);
 }
}
