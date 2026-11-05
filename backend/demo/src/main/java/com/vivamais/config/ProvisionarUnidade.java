package com.vivamais.config;

import com.vivamais.service.ContasInstitucionaisService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Comando único: cria unidade e administrador e grava o convite em arquivo, nunca no log. */
@Component
@Profile("provisionar")
public class ProvisionarUnidade implements ApplicationRunner {
    private final ContasInstitucionaisService contas;
    private final ApplicationContext contexto;
    private final String unidade, email, nome, saida;
    public ProvisionarUnidade(ContasInstitucionaisService contas, ApplicationContext contexto,
            @Value("${PROVISAO_UNIDADE:}") String unidade, @Value("${PROVISAO_EMAIL:}") String email,
            @Value("${PROVISAO_NOME:}") String nome, @Value("${PROVISAO_SAIDA:}") String saida) {
        this.contas = contas; this.contexto = contexto; this.unidade = unidade; this.email = email; this.nome = nome; this.saida = saida;
    }
    @Override public void run(ApplicationArguments argumentos) throws Exception {
        if (unidade.isBlank() || email.isBlank() || nome.isBlank() || saida.isBlank())
            throw new IllegalStateException("Defina PROVISAO_UNIDADE, PROVISAO_EMAIL, PROVISAO_NOME e PROVISAO_SAIDA.");
        var convite = contas.provisionarInicial(unidade, email, nome);
        Files.writeString(Path.of(saida), convite.convite() + System.lineSeparator(), StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        System.exit(SpringApplication.exit(contexto, () -> 0));
    }
}
