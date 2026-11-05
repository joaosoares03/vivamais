package com.vivamais.controller;

import static com.vivamais.dto.ModelosAcessoPaciente.*;
import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.service.CuidadoService.error;
import com.vivamais.config.PropriedadesAplicacao;
import com.vivamais.config.ConfiguracaoRedeDemonstracao;
import com.vivamais.service.AcessoPacienteService;
import java.time.*;
import java.util.Arrays;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/paciente")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
public class AcessoPacienteController {
    public static final String COOKIE="__Secure-viva_paciente";
    private final AcessoPacienteService acesso;
    private final PropriedadesAplicacao propriedades;
    private final ConfiguracaoRedeDemonstracao redeDemonstracao;
    public AcessoPacienteController(AcessoPacienteService acesso,PropriedadesAplicacao propriedades,ConfiguracaoRedeDemonstracao redeDemonstracao) {
        this.acesso=acesso;this.propriedades=propriedades;this.redeDemonstracao=redeDemonstracao;
    }
    private void validarCanal(TipoDispositivo tipo,HttpServletRequest requisicao) {
        String origem=requisicao.getHeader("Origin");
        if(tipo==TipoDispositivo.WEB) {
            if(origem==null || !propriedades.corsOrigins().contains(origem)) throw error(403,"Origem não autorizada.");
        } else if(origem!=null || requisicao.getHeader("Sec-Fetch-Site")!=null) {
            // Um navegador não pode pedir a credencial nativa legível em JavaScript.
            throw error(403,"Canal de acesso não autorizado.");
        }
    }
    private String credencial(TipoDispositivo tipo,String nativa,HttpServletRequest requisicao) {
        validarCanal(tipo,requisicao);
        if(tipo==TipoDispositivo.NATIVO) return nativa;
        if(requisicao.getCookies()==null) return null;
        return Arrays.stream(requisicao.getCookies()).filter(c->COOKIE.equals(c.getName())).map(c->c.getValue()).findFirst().orElse(null);
    }
    private String cookie(String valor,Duration validade) {
        return ResponseCookie.from(COOKIE,valor).httpOnly(true).secure(true).sameSite("Strict")
            .path("/api/v1/auth/paciente").maxAge(validade).build().toString();
    }
    private ResponseEntity<RespostaPaciente> responder(RespostaPaciente resposta,TipoDispositivo tipo) {
        var construtor=ResponseEntity.ok().cacheControl(CacheControl.noStore());
        if(tipo==TipoDispositivo.WEB && resposta.credencialDispositivo()!=null) {
            construtor.header(HttpHeaders.SET_COOKIE,cookie(resposta.credencialDispositivo(),Duration.between(Instant.now(),resposta.dispositivoExpiraEm())));
            resposta=new RespostaPaciente(resposta.estado(),resposta.desafio(),resposta.desafioExpiraEm(),resposta.sessao(),null,resposta.dispositivoExpiraEm());
        }
        return construtor.body(resposta);
    }
    @PostMapping("/iniciar")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    public ResponseEntity<RespostaPaciente> iniciar(@Valid @RequestBody EntradaPaciente entrada,HttpServletRequest requisicao) {
        return responder(acesso.iniciar(entrada,credencial(entrada.tipo(),entrada.credencialDispositivo(),requisicao),requisicao.getRemoteAddr()),entrada.tipo());
    }
    @PostMapping("/demonstracao")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    public ResponseEntity<RespostaPaciente> demonstracao(@Valid @RequestBody EntradaPaciente entrada,HttpServletRequest requisicao) {
        validarCanal(entrada.tipo(),requisicao);
        boolean loopback=java.util.Set.of("127.0.0.1","::1","0:0:0:0:0:0:0:1").contains(requisicao.getRemoteAddr()) &&
            java.util.Set.of("localhost","127.0.0.1","::1","[::1]").contains(requisicao.getServerName()) &&
            requisicao.getLocalPort()!=ConfiguracaoRedeDemonstracao.PORTA;
        if ((!loopback && !redeDemonstracao.permite(requisicao)) ||
            requisicao.getHeader("Forwarded")!=null || requisicao.getHeader("X-Forwarded-For")!=null ||
            requisicao.getHeader("X-Forwarded-Host")!=null)
            throw error(403,"A demonstração simplificada está disponível somente no ambiente local.");
        return responder(acesso.entrarDemonstracao(entrada,requisicao.getRemoteAddr()),entrada.tipo());
    }
    @PostMapping("/verificar")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    public ResponseEntity<RespostaPaciente> verificar(@Valid @RequestBody VerificacaoPaciente entrada,HttpServletRequest requisicao) {
        validarCanal(entrada.tipo(),requisicao);
        return responder(acesso.verificar(entrada,requisicao.getRemoteAddr()),entrada.tipo());
    }
    @PostMapping("/renovar")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    public ResponseEntity<RespostaPaciente> renovar(@Valid @RequestBody RenovacaoPaciente entrada,HttpServletRequest requisicao) {
        return responder(acesso.renovar(entrada.tipo(),credencial(entrada.tipo(),entrada.credencialDispositivo(),requisicao),requisicao.getRemoteAddr()),entrada.tipo());
    }
    @PostMapping("/esquecer")
    public ResponseEntity<Void> esquecer(@AuthenticationPrincipal SessaoAutenticada sessao,@Valid @RequestBody RenovacaoPaciente entrada,HttpServletRequest requisicao) {
        validarCanal(entrada.tipo(),requisicao);acesso.esquecer(sessao);
        var resposta=ResponseEntity.noContent().cacheControl(CacheControl.noStore());
        if(entrada.tipo()==TipoDispositivo.WEB) resposta.header(HttpHeaders.SET_COOKIE,cookie("",Duration.ZERO));
        return resposta.build();
    }
}
