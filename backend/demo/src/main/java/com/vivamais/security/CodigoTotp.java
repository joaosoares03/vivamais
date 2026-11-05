package com.vivamais.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** TOTP da RFC 6238: SHA-1, seis dígitos e passos de 30 segundos, o padrão dos autenticadores. */
public final class CodigoTotp {
    private static final String BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final SecureRandom ALEATORIO = new SecureRandom();
    private CodigoTotp() { }

    public static String novoSegredo() {
        byte[] bytes = new byte[20];
        ALEATORIO.nextBytes(bytes);
        return base32(bytes);
    }
    public static long passo(Instant instante) { return instante.getEpochSecond() / 30; }

    public static String gerar(String segredo, long passo) {
        try {
            var mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(decodificar(segredo), "HmacSHA1"));
            byte[] resumo = mac.doFinal(ByteBuffer.allocate(8).putLong(passo).array());
            int inicio = resumo[resumo.length - 1] & 0x0f;
            int valor = ByteBuffer.wrap(resumo, inicio, 4).getInt() & 0x7fffffff;
            return String.format("%06d", valor % 1_000_000);
        } catch (GeneralSecurityException falha) { throw new IllegalStateException("TOTP indisponível."); }
    }

    /** Devolve o passo aceito, com tolerância de um passo para relógios próximos, ou -1. */
    public static long verificar(String segredo, String codigo, Instant agora) {
        long atual = passo(agora);
        for (long candidato = atual - 1; candidato <= atual + 1; candidato++)
            if (MessageDigest.isEqual(gerar(segredo, candidato).getBytes(StandardCharsets.US_ASCII), codigo.getBytes(StandardCharsets.US_ASCII)))
                return candidato;
        return -1;
    }

    static String base32(byte[] bytes) {
        var texto = new StringBuilder();
        int buffer = 0, bits = 0;
        for (byte valor : bytes) {
            buffer = (buffer << 8) | (valor & 0xff); bits += 8;
            while (bits >= 5) { texto.append(BASE32.charAt((buffer >> (bits - 5)) & 31)); bits -= 5; }
        }
        if (bits > 0) texto.append(BASE32.charAt((buffer << (5 - bits)) & 31));
        return texto.toString();
    }

    private static byte[] decodificar(String texto) {
        var saida = new java.io.ByteArrayOutputStream();
        int buffer = 0, bits = 0;
        for (char letra : texto.toCharArray()) {
            int valor = BASE32.indexOf(letra);
            if (valor < 0) throw new IllegalArgumentException("Segredo TOTP inválido.");
            buffer = (buffer << 5) | valor; bits += 5;
            if (bits >= 8) { saida.write((buffer >> (bits - 8)) & 0xff); bits -= 8; }
        }
        return saida.toByteArray();
    }
}
