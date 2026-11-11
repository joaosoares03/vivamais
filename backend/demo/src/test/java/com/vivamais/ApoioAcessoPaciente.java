package com.vivamais;

import com.vivamais.security.CodificadorToken;
import tools.jackson.databind.ObjectMapper;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Fixtures de autorização para testes de domínio; o fluxo público é provado em AcessoPacienteIT. */
final class ApoioAcessoPaciente {
    static String gerarTelefone() { return "+55119"+String.format(java.util.Locale.ROOT,"%08d",new java.security.SecureRandom().nextInt(100000000)); }
    static String lerCodigoSms(String arquivos,String idEnvio,ObjectMapper json) throws Exception {
        var pasta=java.nio.file.Path.of(arquivos,"sms-teste");
        byte[] chave=Base64.getDecoder().decode(java.nio.file.Files.readString(pasta.resolve(".chave")).trim()), envelope=java.nio.file.Files.readAllBytes(pasta.resolve(idEnvio+".sms"));
        var cifra=javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");
        cifra.init(javax.crypto.Cipher.DECRYPT_MODE,new javax.crypto.spec.SecretKeySpec(chave,"AES"),new javax.crypto.spec.GCMParameterSpec(128,java.util.Arrays.copyOf(envelope,12)));
        return json.readTree(cifra.doFinal(java.util.Arrays.copyOfRange(envelope,12,envelope.length))).get("codigo").asText();
    }
    static String gerarCpf() {
        var aleatorio=new java.security.SecureRandom();StringBuilder valor=new StringBuilder();
        for(int i=0;i<9;i++)valor.append(aleatorio.nextInt(10));
        for(int posicao=9;posicao<11;posicao++){int soma=0;for(int i=0;i<posicao;i++)soma+=(valor.charAt(i)-'0')*(posicao+1-i);valor.append(((soma*10)%11)%10);}
        return valor.toString();
    }
    static String sessaoAutorizada(MockMvc mvc,ObjectMapper json,JdbcTemplate banco,String email) throws Exception {
        UUID usuario=banco.queryForObject("SELECT id FROM user_account WHERE email=? AND role='PATIENT' AND enabled=true",UUID.class,email);
        String credencial=new CodificadorToken().issue();
        banco.update("INSERT INTO dispositivo_acesso_paciente(id,id_usuario,hash_credencial,expira_em,tipo) VALUES(?,?,?,now()+interval '30 days','NATIVO')",UUID.randomUUID(),usuario,new CodificadorToken().hash(credencial));
        var resposta=mvc.perform(post("/api/v1/auth/paciente/renovar").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("tipo","NATIVO","credencialDispositivo",credencial))))
            .andExpect(status().isOk()).andReturn();
        return json.readTree(resposta.getResponse().getContentAsString()).get("sessao").get("accessToken").asText();
    }
}
