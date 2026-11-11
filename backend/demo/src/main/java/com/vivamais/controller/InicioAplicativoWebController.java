package com.vivamais.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** A raiz explícita precede o mapeamento estático padrão do Spring Boot. */
@RestController
@ConditionalOnProperty(name="app.web-paciente", havingValue="true")
public class InicioAplicativoWebController {
    @GetMapping(value="/", produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> inicio() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(new ClassPathResource("paciente-web/index.html"));
    }
}
