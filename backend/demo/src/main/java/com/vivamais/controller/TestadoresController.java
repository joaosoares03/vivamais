package com.vivamais.controller;
import static com.vivamais.dto.ModelosTestadores.*;
import static com.vivamais.service.CuidadoService.error;
import com.vivamais.config.*;
import com.vivamais.dto.ModelosAcessoPaciente.TipoDispositivo;
import com.vivamais.dto.ModelosApi.SessaoAutenticada;
import com.vivamais.service.TestadoresService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@org.springframework.boot.autoconfigure.condition.ConditionalOnExpression("'${app.ambiente:development}' != 'production'")
@RestController @RequestMapping("/api/v1")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
public class TestadoresController {
 private static final String COOKIE="__Secure-viva_testador";
 private final TestadoresService testadores;private final ConfiguracaoTestadores configuracao;private final PropriedadesAplicacao propriedades;
 public TestadoresController(TestadoresService testadores,ConfiguracaoTestadores configuracao,PropriedadesAplicacao propriedades){this.testadores=testadores;this.configuracao=configuracao;this.propriedades=propriedades;}
 private void validarCanal(TipoDispositivo tipo,HttpServletRequest requisicao){
  boolean local=configuracao.transporteLocalDeTeste()&&Set.of("127.0.0.1","::1","0:0:0:0:0:0:0:1").contains(requisicao.getRemoteAddr())&&Set.of("localhost","127.0.0.1","::1","[::1]").contains(requisicao.getServerName())&&Collections.list(requisicao.getHeaderNames()).stream().noneMatch(nome->nome.equalsIgnoreCase("Forwarded")||nome.regionMatches(true,0,"X-Forwarded-",0,12));
  if(!requisicao.isSecure()&&!local)throw error(403,"O acesso de testadores exige conexão HTTPS.");
  String origem=requisicao.getHeader("Origin");
  if(tipo==TipoDispositivo.WEB){if(origem==null||!propriedades.corsOrigins().contains(origem))throw error(403,"Origem não autorizada.");}
  else if(origem!=null||requisicao.getHeader("Sec-Fetch-Site")!=null)throw error(403,"Canal nativo não autorizado.");
 }
 private ResponseEntity<AcessoTestador> responder(AcessoTestador resposta,TipoDispositivo tipo){
  var entidade=ResponseEntity.ok().cacheControl(CacheControl.noStore());
  if(tipo==TipoDispositivo.WEB){entidade.header(HttpHeaders.SET_COOKIE,ResponseCookie.from(COOKIE,resposta.credencialRenovacao()).httpOnly(true).secure(true).sameSite("Strict").path("/api/v1/auth/testadores").maxAge(Duration.between(Instant.now(),resposta.expiraEm())).build().toString());resposta=new AcessoTestador(resposta.sessao(),null,resposta.expiraEm());}
  return entidade.body(resposta);
 }
 @PostMapping("/patients/{paciente}/test-invites") public ResponseEntity<ConviteEmitido> emitir(@PathVariable UUID paciente,@Valid @RequestBody EmissaoConvite entrada,@AuthenticationPrincipal SessaoAutenticada sessao){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(testadores.emitir(paciente,entrada,sessao.usuario()));}
 @GetMapping("/patients/{paciente}/test-invites") public List<ConviteListado> listar(@PathVariable UUID paciente,@AuthenticationPrincipal SessaoAutenticada sessao){return testadores.listar(paciente,sessao.usuario());}
 @PostMapping("/patients/{paciente}/test-invites/{convite}/revoke") public ResponseEntity<Void> revogar(@PathVariable UUID paciente,@PathVariable UUID convite,@AuthenticationPrincipal SessaoAutenticada sessao){testadores.revogar(paciente,convite,sessao.usuario());return ResponseEntity.noContent().build();}
 @PostMapping("/auth/testadores/convite") @io.swagger.v3.oas.annotations.security.SecurityRequirements
 public ResponseEntity<AcessoTestador> entrar(@Valid @RequestBody EntradaConvite entrada,HttpServletRequest requisicao){validarCanal(entrada.tipo(),requisicao);return responder(testadores.entrar(entrada,requisicao.getRemoteAddr()),entrada.tipo());}
 @PostMapping("/auth/testadores/renovar") @io.swagger.v3.oas.annotations.security.SecurityRequirements
 public ResponseEntity<AcessoTestador> renovar(@Valid @RequestBody RenovacaoTestador entrada,HttpServletRequest requisicao){validarCanal(entrada.tipo(),requisicao);String credencial=entrada.credencialRenovacao();if(entrada.tipo()==TipoDispositivo.WEB)credencial=requisicao.getCookies()==null?null:Arrays.stream(requisicao.getCookies()).filter(cookie->COOKIE.equals(cookie.getName())).map(jakarta.servlet.http.Cookie::getValue).findFirst().orElse(null);return responder(testadores.renovar(credencial,entrada.tipo(),requisicao.getRemoteAddr()),entrada.tipo());}
}
