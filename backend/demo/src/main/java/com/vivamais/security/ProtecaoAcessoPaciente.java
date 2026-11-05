package com.vivamais.security;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Chave exclusiva do servidor: o banco não permite enumerar os 10.000 códigos offline. */
@Component
public class ProtecaoAcessoPaciente {
    private final SecureRandom aleatorio = new SecureRandom();
    private final byte[] chave;
    public ProtecaoAcessoPaciente(@Value("${files.directory:${user.dir}/.local/private-files}") String diretorio,
            @Value("${patient-auth.hmac-key:}") String configurada) throws Exception {
        if(configurada.isBlank()) {
            Path pasta=Path.of(diretorio).toAbsolutePath().normalize(); Files.createDirectories(pasta);
            Path arquivo=pasta.resolve(".patient-auth-key");
            if(!Files.exists(arquivo)) {
                byte[] nova=new byte[32]; aleatorio.nextBytes(nova);
                try {
                    if(Files.getFileStore(pasta).supportsFileAttributeView("posix"))
                        Files.createFile(arquivo,PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rw-------")));
                    else Files.createFile(arquivo);
                    Files.writeString(arquivo,Base64.getEncoder().encodeToString(nova));
                } catch(FileAlreadyExistsException existente) { /* Outro processo criou a chave. */ }
            }
            configurada=Files.readString(arquivo).trim();
        }
        chave=Base64.getDecoder().decode(configurada);
        if(chave.length!=32) throw new IllegalStateException("Chave de acesso do paciente inválida.");
    }
    public String gerarCodigo() { return String.format(Locale.ROOT,"%04d",aleatorio.nextInt(10000)); }
    public String gerarCodigoPresencial() { return String.format(Locale.ROOT,"%06d",aleatorio.nextInt(1_000_000)); }
    public String resumo(String contexto,String valor) {
        try {
            Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(chave,"HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal((contexto+":"+valor).getBytes(StandardCharsets.UTF_8)));
        } catch(Exception erro) { throw new IllegalStateException("Proteção indisponível."); }
    }
    public boolean confere(String contexto,String codigo,String hash) {
        return hash!=null && MessageDigest.isEqual(resumo(contexto,codigo).getBytes(StandardCharsets.US_ASCII),hash.getBytes(StandardCharsets.US_ASCII));
    }
}
