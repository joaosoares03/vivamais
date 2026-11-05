package com.vivamais.service;
import static org.junit.jupiter.api.Assertions.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Random;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
class PreparadorImagemTest {
 @Test void otimizaPngMaiorQueDoisMbSemMetadados()throws Exception{
  var imagem=new BufferedImage(1600,1200,BufferedImage.TYPE_INT_RGB);var sorteio=new Random(42);
  for(int y=0;y<1200;y++)for(int x=0;x<1600;x++)imagem.setRGB(x,y,sorteio.nextInt());
  var origem=new ByteArrayOutputStream();ImageIO.write(imagem,"png",origem);assertTrue(origem.size()>2097152);
  byte[] saida=PreparadorImagem.preparar(origem.toByteArray());assertTrue(saida.length<=2097152);
  var lida=ImageIO.read(new ByteArrayInputStream(saida));assertTrue(lida.getWidth()<1600);assertTrue(lida.getHeight()<1200);
 }
 @Test void rejeitaConteudoInvalidoEExcessoDeBytes(){
  for(byte[] dados:new byte[][]{"<svg><script>teste</script></svg>".getBytes(),new byte[PreparadorImagem.LIMITE_ORIGINAL+1]})
   assertThrows(ResponseStatusException.class,()->PreparadorImagem.preparar(dados));
 }
 @Test void rejeitaBombaDeDimensoesAntesDaDecodificacao()throws Exception{
  var imagem=new BufferedImage(20,20,BufferedImage.TYPE_INT_RGB);var origem=new ByteArrayOutputStream();ImageIO.write(imagem,"png",origem);
  byte[] dados=origem.toByteArray();java.nio.ByteBuffer.wrap(dados).putInt(16,100000);
  assertThrows(ResponseStatusException.class,()->PreparadorImagem.preparar(dados));
 }
 @Test void orientaRotacaoEEspelhamento(){
  for(int sentido=2;sentido<=8;sentido++){
   var origem=new BufferedImage(30,20,BufferedImage.TYPE_INT_RGB);origem.setRGB(0,0,0xffcc0000);
   var destino=PreparadorImagem.orientar(origem,sentido);assertEquals(sentido>=5?20:30,destino.getWidth());assertEquals(sentido>=5?30:20,destino.getHeight());
   int x=switch(sentido){case 2,3->29;case 6,7->19;default->0;};int y=switch(sentido){case 3,4->19;case 7,8->29;default->0;};assertEquals(0xffcc0000,destino.getRGB(x,y));
  }
 }
 @Test void aceitaJpegPertoDoLimiteOriginal()throws Exception{
  var imagem=new BufferedImage(40,30,BufferedImage.TYPE_INT_RGB);var origem=new ByteArrayOutputStream();ImageIO.write(imagem,"jpeg",origem);
  byte[] dados=java.util.Arrays.copyOf(origem.toByteArray(),PreparadorImagem.LIMITE_ORIGINAL);assertNotNull(ImageIO.read(new ByteArrayInputStream(PreparadorImagem.preparar(dados))));
 }
}
