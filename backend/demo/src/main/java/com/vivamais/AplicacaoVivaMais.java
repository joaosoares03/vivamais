package com.vivamais;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(exclude=org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration.class)
@EnableConfigurationProperties(PropriedadesAplicacao.class)
public class AplicacaoVivaMais {
    public static void main(String[] args) { SpringApplication.run(AplicacaoVivaMais.class, args); }
}
