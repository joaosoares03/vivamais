package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import java.nio.file.*;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Ciphertext only, in either a private local directory or a private Supabase bucket. */
@Component
public class ArmazenamentoArquivos {
 private final Path diretorio;private final byte[] key;private final String provedor,url,repositorioObjetos,chaveServico;
 private final HttpClient http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).followRedirects(HttpClient.Redirect.NEVER).build();
 public ArmazenamentoArquivos(@Value("${files.directory:${user.dir}/.local/private-files}") String diretorio,@Value("${files.encryption-key:}") String valorChave,@Value("${files.backend:local}") String provedor,@Value("${files.supabase-url:}") String url,@Value("${files.bucket:viva-private}") String repositorioObjetos,@Value("${files.service-key:}") String chaveServico)throws Exception{
  this.diretorio=Path.of(diretorio).toAbsolutePath().normalize();this.provedor=provedor;this.url=url;this.repositorioObjetos=repositorioObjetos;this.chaveServico=chaveServico;
  if(!provedor.equals("local")&&!provedor.equals("supabase"))throw new IllegalStateException("Unknown private storage backend");
  if(provedor.equals("supabase")&&(!url.startsWith("https://")||chaveServico.isBlank()||valorChave.isBlank()||!repositorioObjetos.matches("[a-zA-Z0-9_-]+")))throw new IllegalStateException("Supabase private storage configuration incomplete");
  if(provedor.equals("supabase")&&chaveServico.startsWith("sb_publishable_"))throw new IllegalStateException("Armazenamento privado exige chave secreta de servidor, nunca chave pública.");
  Files.createDirectories(this.diretorio);
  if(valorChave.isBlank()){
   Path secret=this.diretorio.resolve(".encryption-key");if(!Files.exists(secret)){byte[] generated=new byte[32];new java.security.SecureRandom().nextBytes(generated);try{Files.writeString(secret,Base64.getEncoder().encodeToString(generated),StandardOpenOption.CREATE_NEW);}catch(FileAlreadyExistsException ignored){}}
   valorChave=Files.readString(secret).trim();
  }
  key=Base64.getDecoder().decode(valorChave);if(key.length!=32)throw new IllegalStateException("File encryption key must have 32 bytes");
 }
 private byte[] encrypt(byte[] data)throws Exception{byte[] iv=new byte[12];new java.security.SecureRandom().nextBytes(iv);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));byte[] encrypted=c.doFinal(data);byte[] resultado=Arrays.copyOf(iv,iv.length+encrypted.length);System.arraycopy(encrypted,0,resultado,iv.length,encrypted.length);return resultado;}
 private byte[] decrypt(byte[] data)throws Exception{if(data.length<28)throw new IllegalStateException("Invalid encrypted object");Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,Arrays.copyOf(data,12)));return c.doFinal(Arrays.copyOfRange(data,12,data.length));}
 private String safe(String objeto){if(!objeto.matches("[a-f0-9-]{36}\\.bin"))throw new IllegalArgumentException("Invalid object key");return objeto;}
 HttpRequest.Builder requisicao(String objeto){
  var requisicao=HttpRequest.newBuilder(URI.create(url.replaceAll("/$","")+"/storage/v1/object/"+repositorioObjetos+"/"+safe(objeto))).timeout(Duration.ofSeconds(15)).header("apikey",chaveServico);
  // Chaves novas não são JWTs. O gateway autentica sb_secret_ pelo cabeçalho apikey.
  if(!chaveServico.startsWith("sb_secret_"))requisicao.header("Authorization","Bearer "+chaveServico);
  return requisicao;
 }
 public void put(String objeto,byte[] image)throws Exception{byte[] data=encrypt(image);if(provedor.equals("local"))Files.write(diretorio.resolve(safe(objeto)),data,StandardOpenOption.CREATE_NEW);else{var r=http.send(requisicao(objeto).header("Content-Type","application/octet-stream").POST(HttpRequest.BodyPublishers.ofByteArray(data)).build(),HttpResponse.BodyHandlers.discarding());if(r.statusCode()!=200&&r.statusCode()!=201)throw new IllegalStateException("Private object storage unavailable");}}
 public byte[] get(String objeto)throws Exception{byte[] data;if(provedor.equals("local")){try(var in=Files.newInputStream(diretorio.resolve(safe(objeto)))){data=in.readNBytes(2097181);}}else{var r=http.send(requisicao(objeto).GET().build(),HttpResponse.BodyHandlers.ofInputStream());try(var in=r.body()){if(r.statusCode()!=200)throw new IllegalStateException("Private object storage unavailable");data=in.readNBytes(2097181);}}if(data.length>2097180)throw new IllegalStateException("Stored object exceeds limit");return decrypt(data);}
 public void delete(String objeto)throws Exception{if(provedor.equals("local"))Files.deleteIfExists(diretorio.resolve(safe(objeto)));else http.send(requisicao(objeto).DELETE().build(),HttpResponse.BodyHandlers.discarding());}
}
