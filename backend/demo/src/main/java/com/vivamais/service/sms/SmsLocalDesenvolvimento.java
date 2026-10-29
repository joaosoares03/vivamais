package com.vivamais.service.sms;

import tools.jackson.databind.ObjectMapper;
import java.nio.file.*;
import java.nio.file.attribute.*;
import java.security.SecureRandom;
import java.util.*;
import javax.crypto.Cipher;
import javax.crypto.spec.*;

/** Caixa cifrada exclusiva de testes locais; não envia mensagens a uma operadora. */
public final class SmsLocalDesenvolvimento implements ServicoEnvioSms {
    private final Path diretorio;
    private final byte[] chave;
    private final ObjectMapper json;
    private final SecureRandom aleatorio=new SecureRandom();
    public SmsLocalDesenvolvimento(Path arquivos,ObjectMapper json) {
        this.json=json;
        try {
            diretorio=arquivos.resolve("sms-teste");Files.createDirectories(diretorio);
            proteger(diretorio,true);
            Path arquivoChave=diretorio.resolve(".chave");
            if(!Files.exists(arquivoChave)) {
                byte[] nova=new byte[32];aleatorio.nextBytes(nova);
                try { Files.writeString(arquivoChave,Base64.getEncoder().encodeToString(nova),StandardOpenOption.CREATE_NEW); }
                catch(FileAlreadyExistsException existente) { /* Instância concorrente criou a chave. */ }
            }
            proteger(arquivoChave,false);chave=Base64.getDecoder().decode(Files.readString(arquivoChave).trim());
            if(chave.length!=32) throw new IllegalStateException("Chave local inválida.");
        } catch(Exception erro) { throw new IllegalStateException("Caixa SMS local indisponível."); }
    }
    private static void proteger(Path arquivo,boolean pasta) throws Exception {
        var posix=Files.getFileAttributeView(arquivo,PosixFileAttributeView.class);
        if(posix!=null) posix.setPermissions(PosixFilePermissions.fromString(pasta?"rwx------":"rw-------"));
        var acl=Files.getFileAttributeView(arquivo,AclFileAttributeView.class);
        if(acl!=null) {
            var dono=Files.getOwner(arquivo);
            var permissao=AclEntry.newBuilder().setType(AclEntryType.ALLOW).setPrincipal(dono).setPermissions(EnumSet.allOf(AclEntryPermission.class));
            if(pasta) permissao.setFlags(AclEntryFlag.DIRECTORY_INHERIT,AclEntryFlag.FILE_INHERIT);
            acl.setAcl(List.of(permissao.build()));
        }
    }
    @Override public String provedor() { return "LOCAL"; }
    @Override public Resultado enviar(Mensagem mensagem) {
        try {
            byte[] iv=new byte[12];aleatorio.nextBytes(iv);
            Cipher cifra=Cipher.getInstance("AES/GCM/NoPadding");cifra.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(chave,"AES"),new GCMParameterSpec(128,iv));
            byte[] conteudo=json.writeValueAsBytes(Map.of("idEnvio",mensagem.idEnvio().toString(),"codigo",mensagem.codigo(),"destino",mensagem.destino(),"expiraEm",mensagem.expiraEm().toString(),"somenteTesteLocal",true));
            byte[] cifrado=cifra.doFinal(conteudo),envelope=new byte[iv.length+cifrado.length];
            System.arraycopy(iv,0,envelope,0,iv.length);System.arraycopy(cifrado,0,envelope,iv.length,cifrado.length);
            Path arquivo=diretorio.resolve(mensagem.idEnvio()+".sms");Files.write(arquivo,envelope,StandardOpenOption.CREATE_NEW);proteger(arquivo,false);
            Arrays.fill(conteudo,(byte)0);
            return new Resultado("TESTE_LOCAL",mensagem.idEnvio().toString());
        } catch(Exception falha) { throw new Falha("FALHA"); }
    }
}
