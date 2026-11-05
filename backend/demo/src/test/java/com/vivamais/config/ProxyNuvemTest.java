package com.vivamais.config;

import static org.assertj.core.api.Assertions.*;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.connector.Request;
import org.apache.catalina.connector.Response;
import org.apache.catalina.valves.RemoteIpValve;
import org.apache.catalina.valves.ValveBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

class ProxyNuvemTest {
    @Test void somenteParesDaBordaConfiguradaPodemAfirmarHttpsEIpDoCliente() throws Exception {
        var yaml=new YamlPropertiesFactoryBean();
        yaml.setResources(new ClassPathResource("application-nuvem.yml"));
        var propriedades=yaml.getObject();
        assertThat(propriedades).isNotNull();
        assertThat(propriedades.getProperty("management.endpoint.health.group.readiness.include")).isEqualTo("readinessState,db");
        for(String par:new String[]{"100.64.0.1","100.127.255.254","100.63.255.254","100.128.0.1","203.0.113.1","10.0.0.1","127.0.0.1"}) {
            boolean confiavel=par.startsWith("100.64.")||par.startsWith("100.127.");
            var dados=new org.apache.coyote.Request();
            dados.scheme().setString("http"); dados.serverName().setString("paciente.example.org"); dados.setServerPort(8080);
            dados.getMimeHeaders().addValue("X-Forwarded-Proto").setString("https");
            dados.getMimeHeaders().addValue("X-Real-IP").setString("198.51.100.24");
            var requisicao=new Request(new Connector(),dados); requisicao.setRemoteAddr(par); requisicao.setRemoteHost(par);
            var valvula=new RemoteIpValve();
            valvula.setInternalProxies(propriedades.getProperty("server.tomcat.remoteip.internal-proxies"));
            valvula.setRemoteIpHeader(propriedades.getProperty("server.tomcat.remoteip.remote-ip-header"));
            valvula.setProtocolHeader(propriedades.getProperty("server.tomcat.remoteip.protocol-header"));
            valvula.setNext(new ValveBase(){@Override public void invoke(Request entrada,Response saida){
                assertThat(entrada.isSecure()).as("HTTPS só para par confiável").isEqualTo(confiavel);
                assertThat(entrada.getRemoteAddr()).isEqualTo(confiavel?"198.51.100.24":par);
                assertThat(entrada.getScheme()).isEqualTo(confiavel?"https":"http");
            }});
            valvula.invoke(requisicao,new Response(new org.apache.coyote.Response()));
        }
    }
}
