package com.vivamais.security;

import static org.assertj.core.api.Assertions.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class CodigoTotpTest {
    private static final String SEGREDO_RFC = CodigoTotp.base32("12345678901234567890".getBytes(StandardCharsets.US_ASCII));

    @Test void reproduzVetoresDaRfc6238() {
        assertThat(CodigoTotp.gerar(SEGREDO_RFC, 59 / 30)).isEqualTo("287082");
        assertThat(CodigoTotp.gerar(SEGREDO_RFC, 1111111109L / 30)).isEqualTo("081804");
        assertThat(CodigoTotp.gerar(SEGREDO_RFC, 2000000000L / 30)).isEqualTo("279037");
    }
    @Test void aceitaUmPassoDeToleranciaEDevolveOPasso() {
        Instant agora = Instant.ofEpochSecond(1_800_000_000L);
        long atual = CodigoTotp.passo(agora);
        assertThat(CodigoTotp.verificar(SEGREDO_RFC, CodigoTotp.gerar(SEGREDO_RFC, atual - 1), agora)).isEqualTo(atual - 1);
        assertThat(CodigoTotp.verificar(SEGREDO_RFC, CodigoTotp.gerar(SEGREDO_RFC, atual + 2), agora)).isEqualTo(-1);
    }
    @Test void novoSegredoTemTamanhoDeAutenticador() { assertThat(CodigoTotp.novoSegredo()).matches("[A-Z2-7]{32}"); }
    @Test void cifraNaoExpoeSegredoEDetectaChaveErrada() {
        var cifra = new CifraMfa(Base64.getEncoder().encodeToString(new byte[32]));
        String cifrado = cifra.cifrar(SEGREDO_RFC);
        assertThat(cifrado).doesNotContain(SEGREDO_RFC);
        assertThat(cifra.decifrar(cifrado)).isEqualTo(SEGREDO_RFC);
        byte[] outra = new byte[32]; outra[0] = 1;
        assertThatThrownBy(() -> new CifraMfa(Base64.getEncoder().encodeToString(outra)).decifrar(cifrado)).isInstanceOf(IllegalStateException.class);
    }
}
