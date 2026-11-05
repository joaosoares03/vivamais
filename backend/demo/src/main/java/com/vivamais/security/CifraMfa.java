package com.vivamais.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Cifra o segredo TOTP no banco. Fora de produção, sem chave configurada, usa uma chave efêmera. */
@Component
public class CifraMfa {
    private static final int TAMANHO_IV = 12;
    private final SecureRandom aleatorio = new SecureRandom();
    private final byte[] chave;

    public CifraMfa(@Value("${app.mfa-chave:}") String configurada) {
        if (configurada.isBlank()) { chave = new byte[32]; aleatorio.nextBytes(chave); return; }
        chave = Base64.getDecoder().decode(configurada);
        if (chave.length != 32) throw new IllegalStateException("MFA_ENCRYPTION_KEY precisa ter 32 bytes em Base64.");
    }

    public String cifrar(String segredo) {
        try {
            byte[] iv = new byte[TAMANHO_IV];
            aleatorio.nextBytes(iv);
            var cifra = Cipher.getInstance("AES/GCM/NoPadding");
            cifra.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(chave, "AES"), new GCMParameterSpec(128, iv));
            byte[] corpo = cifra.doFinal(segredo.getBytes(StandardCharsets.US_ASCII));
            return Base64.getEncoder().encodeToString(ByteBuffer.allocate(iv.length + corpo.length).put(iv).put(corpo).array());
        } catch (GeneralSecurityException falha) { throw new IllegalStateException("Cifra de MFA indisponível."); }
    }

    public String decifrar(String texto) {
        try {
            byte[] tudo = Base64.getDecoder().decode(texto);
            var cifra = Cipher.getInstance("AES/GCM/NoPadding");
            cifra.init(Cipher.DECRYPT_MODE, new SecretKeySpec(chave, "AES"), new GCMParameterSpec(128, tudo, 0, TAMANHO_IV));
            return new String(cifra.doFinal(tudo, TAMANHO_IV, tudo.length - TAMANHO_IV), StandardCharsets.US_ASCII);
        } catch (GeneralSecurityException falha) { throw new IllegalStateException("Cifra de MFA indisponível."); }
    }
}
