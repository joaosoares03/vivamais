package com.vivamais.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** No perfil migracao, o Flyway roda na inicialização e o processo termina sem atender tráfego. */
@Component
@Profile("migracao")
public class ConcluirMigracao implements ApplicationRunner {
    private final ApplicationContext contexto;
    public ConcluirMigracao(ApplicationContext contexto) { this.contexto = contexto; }
    @Override public void run(ApplicationArguments argumentos) { System.exit(SpringApplication.exit(contexto, () -> 0)); }
}
