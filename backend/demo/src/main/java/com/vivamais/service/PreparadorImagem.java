package com.vivamais.service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.*;
import java.util.*;
import java.util.concurrent.Semaphore;
import javax.imageio.*;

/** Decodificação limitada e regravação dos pixels: metadados nunca são armazenados. */
public final class PreparadorImagem {
 public static final int LIMITE_ORIGINAL=10*1024*1024, LIMITE_ARMAZENADO=2*1024*1024;
 private static final Semaphore vagas=new Semaphore(1);
 private PreparadorImagem(){}
 public static byte[] preparar(byte[] bytes)throws IOException {
  if(bytes.length==0||bytes.length>LIMITE_ORIGINAL)throw CuidadoService.error(413,"Escolha uma foto de até 10 MB.");
  if(!vagas.tryAcquire())throw CuidadoService.error(429,"Outra foto está sendo preparada. Aguarde e tente novamente.");
  try(var entrada=new javax.imageio.stream.MemoryCacheImageInputStream(new ByteArrayInputStream(bytes))){
   var leitores=ImageIO.getImageReaders(entrada);
   if(!leitores.hasNext())throw CuidadoService.error(415,"Foto inválida. Envie JPEG ou PNG; HEIC precisa ser convertido pelo aparelho.");
   var leitor=leitores.next();
   try{
    if(!Set.of("png","jpeg","jpg").contains(leitor.getFormatName().toLowerCase(Locale.ROOT)))throw CuidadoService.error(415,"Formato não permitido.");
    leitor.setInput(entrada,true,true);
    int largura=leitor.getWidth(0),altura=leitor.getHeight(0);
    if(largura<20||altura<20||largura>12000||altura>12000||(long)largura*altura>50000000)throw CuidadoService.error(413,"Dimensões da foto fora do limite.");
    var parametros=leitor.getDefaultReadParam();
    int amostragem=Math.max(1,(int)Math.ceil(Math.max(largura,altura)/2048.0));
    parametros.setSourceSubsampling(amostragem,amostragem,0,0);
    BufferedImage imagem=orientar(leitor.read(0,parametros),orientacao(bytes));
    for(int tentativa=0;tentativa<6;tentativa++){
     var destino=new BufferedImage(imagem.getWidth(),imagem.getHeight(),BufferedImage.TYPE_INT_RGB);
     Graphics2D desenho=destino.createGraphics();
     try{desenho.setColor(Color.WHITE);desenho.fillRect(0,0,destino.getWidth(),destino.getHeight());desenho.drawImage(imagem,0,0,null);}finally{desenho.dispose();}
     var saida=new ByteArrayOutputStream();ImageIO.write(destino,"png",saida);destino.flush();
     if(saida.size()<=LIMITE_ARMAZENADO){imagem.flush();return saida.toByteArray();}
     int novaLargura=Math.max(20,(int)(imagem.getWidth()*0.75)),novaAltura=Math.max(20,(int)(imagem.getHeight()*0.75));
     var reduzida=new BufferedImage(novaLargura,novaAltura,BufferedImage.TYPE_INT_RGB);desenho=reduzida.createGraphics();
     try{desenho.setRenderingHint(RenderingHints.KEY_INTERPOLATION,RenderingHints.VALUE_INTERPOLATION_BILINEAR);desenho.drawImage(imagem,0,0,novaLargura,novaAltura,null);}finally{desenho.dispose();imagem.flush();}
     imagem=reduzida;
    }
    imagem.flush();throw CuidadoService.error(413,"Não foi possível preparar esta foto. Escolha outra imagem.");
   }catch(javax.imageio.IIOException|IllegalArgumentException falha){throw CuidadoService.error(415,"Foto corrompida ou inválida. Escolha outra imagem.");}finally{leitor.dispose();}
  }finally{vagas.release();}
 }
 // Lê somente a orientação no segmento APP1. Nenhum EXIF é copiado à saída.
 static int orientacao(byte[] bytes){
  try{
   if(bytes.length<4||(bytes[0]&255)!=255||(bytes[1]&255)!=216)return 1;
   for(int pos=2;pos+4<bytes.length;){
    if((bytes[pos]&255)!=255)break;int marcador=bytes[pos+1]&255;
    if(marcador==218||marcador==217)break;
    int tamanho=((bytes[pos+2]&255)<<8)|(bytes[pos+3]&255),inicio=pos+4,fim=pos+2+tamanho;
    if(tamanho<2||fim>bytes.length)break;
    if(marcador==225&&tamanho>=16&&bytes[inicio]=='E'&&bytes[inicio+1]=='x'&&bytes[inicio+2]=='i'&&bytes[inicio+3]=='f'&&bytes[inicio+4]==0&&bytes[inicio+5]==0){
     int base=inicio+6;var dados=ByteBuffer.wrap(bytes).order(bytes[base]=='I'&&bytes[base+1]=='I'?ByteOrder.LITTLE_ENDIAN:ByteOrder.BIG_ENDIAN);
     if(dados.getShort(base+2)!=42)return 1;
     long deslocamento=Integer.toUnsignedLong(dados.getInt(base+4));if(deslocamento<8||deslocamento>fim-base-2)return 1;
     int tabela=base+(int)deslocamento,quantidade=Short.toUnsignedInt(dados.getShort(tabela));
     for(int indice=0;indice<quantidade&&tabela+2L+12L*(indice+1)<=fim;indice++){
      int registro=tabela+2+12*indice;
      if(Short.toUnsignedInt(dados.getShort(registro))==274&&dados.getShort(registro+2)==3&&dados.getInt(registro+4)==1){int valor=Short.toUnsignedInt(dados.getShort(registro+8));return valor>=1&&valor<=8?valor:1;}
     }
    }
    pos=fim;
   }
  }catch(IndexOutOfBoundsException falha){return 1;}
  return 1;
 }
 static BufferedImage orientar(BufferedImage imagem,int orientacao){
  if(orientacao==1)return imagem;
  int largura=imagem.getWidth(),altura=imagem.getHeight();boolean troca=orientacao>=5;
  var destino=new BufferedImage(troca?altura:largura,troca?largura:altura,BufferedImage.TYPE_INT_RGB);
  for(int y=0;y<altura;y++)for(int x=0;x<largura;x++){
   int dx=x,dy=y;
   switch(orientacao){case 2->dx=largura-1-x;case 3->{dx=largura-1-x;dy=altura-1-y;}case 4->dy=altura-1-y;case 5->{dx=y;dy=x;}case 6->{dx=altura-1-y;dy=x;}case 7->{dx=altura-1-y;dy=largura-1-x;}case 8->{dx=y;dy=largura-1-x;}default->{}}
   destino.setRGB(dx,dy,imagem.getRGB(x,y));
  }
  imagem.flush();return destino;
 }
}
