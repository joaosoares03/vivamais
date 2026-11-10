package com.vivamais.controller;

import com.vivamais.config.ConfiguracaoRedeDemonstracao;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

/** Entrega somente o instalável escolhido pelo operador, nunca diretórios ou arquivos do paciente. */
@org.springframework.boot.autoconfigure.condition.ConditionalOnExpression("'${app.ambiente:development}' != 'production'")
@RestController
@io.swagger.v3.oas.annotations.Hidden
public class InstalacaoDemonstracaoController {
    public static final String ROTA="/demonstracao/vivamais.apk";
    private final ConfiguracaoRedeDemonstracao rede;
    private final String arquivo;
    public InstalacaoDemonstracaoController(ConfiguracaoRedeDemonstracao rede,
            @Value("${patient-auth.apk-demonstracao:}") String arquivo) {
        this.rede=rede; this.arquivo=arquivo;
    }
    @GetMapping(ROTA)
    public ResponseEntity<Resource> baixar(HttpServletRequest requisicao) throws IOException {
        if(!rede.permite(requisicao) || arquivo.isBlank()) return ResponseEntity.notFound().build();
        Path caminho=Path.of(arquivo);
        if(!caminho.isAbsolute() || !arquivo.endsWith(".apk") || !Files.isRegularFile(caminho,LinkOption.NOFOLLOW_LINKS))
            return ResponseEntity.notFound().build();
        long tamanho=Files.size(caminho);
        if(tamanho<=0 || tamanho>250L*1024*1024) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=VivaMais-DemoRede-arm64.apk")
            .header("X-Content-Type-Options","nosniff")
            .contentType(MediaType.parseMediaType("application/vnd.android.package-archive"))
            .contentLength(tamanho).body(new FileSystemResource(caminho));
    }
}
