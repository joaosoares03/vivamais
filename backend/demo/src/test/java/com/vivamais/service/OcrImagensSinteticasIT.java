package com.vivamais.service;

import static org.assertj.core.api.Assertions.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.*;
import java.util.LinkedHashMap;
import java.util.stream.Stream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

/** Imagens geradas por código, sem pessoas, fotos ou dados de pacientes. */
class OcrImagensSinteticasIT {
    record Caso(String id, String[] linhas, String degradacao, boolean deveReconhecer) {
        @Override public String toString() { return id; }
    }

    static Stream<Caso> casos() {
        String[] legivel = {"SYS 118", "DIA 76", "PULSE 71"};
        return Stream.of(
            new Caso("legivel", legivel, "nenhuma", true),
            new Caso("valores-invertidos", new String[]{"SYS 76", "DIA 118", "PULSE 71"}, "nenhuma", false),
            new Caso("fora-da-faixa", new String[]{"SYS 399", "DIA 76", "PULSE 71"}, "nenhuma", false),
            new Caso("sem-numeros", new String[]{"VIVA TESTE", "IMAGEM SINTETICA", "SEM NUMEROS"}, "nenhuma", false),
            new Caso("branco", new String[]{}, "nenhuma", false),
            new Caso("desfocado", legivel, "desfoque", false),
            new Caso("rotacionado-180", legivel, "rotacao", false),
            new Caso("rotulos-repetidos", new String[]{"SYS 118 DIA 76", "SYS 188 DIA 106", "PULSE 71"}, "nenhuma", false)
        );
    }

    static byte[] imagem(Caso caso) throws Exception {
        var imagem = new BufferedImage(960, 460, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = imagem.createGraphics();
        g.setColor(Color.WHITE); g.fillRect(0, 0, 960, 460);
        g.setColor(Color.BLACK); g.setFont(new Font("SansSerif", Font.PLAIN, 64));
        for (int i = 0; i < caso.linhas().length; i++) g.drawString(caso.linhas()[i], 35, 100 + i * 130);
        g.dispose();
        if (caso.degradacao().equals("rotacao")) {
            imagem = PreparadorImagem.orientar(imagem, 3);
        } else if (caso.degradacao().equals("desfoque")) {
            var pequena = new BufferedImage(48, 23, BufferedImage.TYPE_INT_RGB);
            g = pequena.createGraphics(); g.drawImage(imagem, 0, 0, 48, 23, null); g.dispose();
            g = imagem.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(pequena, 0, 0, 960, 460, null); g.dispose(); pequena.flush();
        }
        var saida = new ByteArrayOutputStream(); ImageIO.write(imagem, "png", saida); imagem.flush();
        return PreparadorImagem.preparar(saida.toByteArray());
    }

    @ParameterizedTest(name = "{0}") @MethodSource("casos")
    void motorRealNaoPodeSugerirValoresDeImagensInvalidas(Caso caso) throws Exception {
        String script = System.getenv().getOrDefault("TEST_OCR_NODE_SCRIPT", "");
        Assumptions.assumeTrue(!script.isBlank() || "true".equals(System.getenv("TEST_NATIVE_OCR")), "Runtime OCR real necessário");
        var json = new ObjectMapper();
        var motor = new ReconhecedorTesseract(System.getenv().getOrDefault("TESSERACT_COMMAND", "tesseract"), script,
            System.getenv().getOrDefault("OCR_NODE_EXECUTABLE", "node"), "tesseract-eng-psm6", "ocr-safety-v2", json);
        Path arquivo = Files.createTempFile("viva-corpus-sintetico-", ".png");
        byte[] png = imagem(caso);
        ArquivoPrivadoService.AvaliacaoOcr resultado;
        try {
            Files.write(arquivo, png);
            try { resultado = ArquivoPrivadoService.avaliarOcr(motor.reconhecer(arquivo), 0.85); }
            catch (ResponseStatusException e) {
                if (e.getStatusCode().value() != 503) throw e;
                resultado = ArquivoPrivadoService.indisponivelOcr("UNAVAILABLE");
            }
        } finally { Files.deleteIfExists(arquivo); }

        String destino = System.getProperty("viva.ocr.corpus-dir", "");
        if (!destino.isBlank()) {
            Path pasta = Path.of(destino); Files.createDirectories(pasta); Files.write(pasta.resolve(caso.id() + ".png"), png);
            var dados = new LinkedHashMap<String, Object>();
            dados.put("caso", caso.id()); dados.put("status", resultado.status()); dados.put("motivo", resultado.motivo());
            dados.put("confianca", resultado.confianca()); dados.put("sistolica", resultado.sistolica()); dados.put("diastolica", resultado.diastolica());
            dados.put("pulso", resultado.pulso()); dados.put("criterios", motor.versaoCriterios());
            Files.writeString(pasta.resolve("resultados.jsonl"), json.writeValueAsString(dados) + "\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        }
        if (caso.deveReconhecer()) {
            assertThat(resultado.status()).as(caso.id()).isEqualTo("RECOGNIZED");
            assertThat(resultado.sistolica()).isEqualTo(118); assertThat(resultado.diastolica()).isEqualTo(76); assertThat(resultado.pulso()).isEqualTo(71);
            assertThat(resultado.motivo()).isEqualTo("HUMAN_CONFIRMATION_REQUIRED");
        } else {
            assertThat(resultado.status()).as(caso.id()).isIn("UNREADABLE", "UNAVAILABLE");
            assertThat(resultado.sistolica()).isNull(); assertThat(resultado.diastolica()).isNull(); assertThat(resultado.pulso()).isNull();
        }
    }
}
