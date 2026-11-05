package com.vivamais.controller;

import com.vivamais.dto.ModelosApi.SessaoAutenticada;
import com.vivamais.service.AcessoPacienteService;
import com.vivamais.service.ContasInstitucionaisService;
import com.vivamais.service.ContasInstitucionaisService.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1")
public class ContasInstitucionaisController {
    private final ContasInstitucionaisService contas;
    private final AcessoPacienteService limites;
    public ContasInstitucionaisController(ContasInstitucionaisService contas, AcessoPacienteService limites) { this.contas = contas; this.limites = limites; }

    private static <T> ResponseEntity<T> semCache(T corpo) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(corpo); }

    @GetMapping("/contas-institucionais")
    public ResponseEntity<List<Map<String,Object>>> listar(@AuthenticationPrincipal SessaoAutenticada sessao) { return semCache(contas.listar(sessao.usuario())); }
    @PostMapping("/contas-institucionais")
    public ResponseEntity<ConviteEmitido> criar(@Valid @RequestBody NovaConta entrada, @AuthenticationPrincipal SessaoAutenticada sessao) { return semCache(contas.criar(entrada, sessao.usuario())); }
    @PostMapping("/contas-institucionais/{id}/convite")
    public ResponseEntity<ConviteEmitido> reemitir(@PathVariable UUID id, @Valid @RequestBody Reautenticacao entrada, @AuthenticationPrincipal SessaoAutenticada sessao) { return semCache(contas.reemitir(id, entrada, sessao.usuario())); }
    @PostMapping("/contas-institucionais/{id}/desativar")
    public ResponseEntity<Void> desativar(@PathVariable UUID id, @Valid @RequestBody Reautenticacao entrada, @AuthenticationPrincipal SessaoAutenticada sessao) {
        contas.desativar(id, entrada, sessao.usuario());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/conta/convite") @io.swagger.v3.oas.annotations.security.SecurityRequirements
    public ResponseEntity<DadosMfa> iniciar(@Valid @RequestBody ConsultaConvite entrada, HttpServletRequest requisicao) {
        limites.limitarPublico("conta-convite-ip", requisicao.getRemoteAddr(), 20, 900);
        return semCache(contas.iniciarAtivacao(entrada));
    }
    @PostMapping("/auth/conta/ativar") @io.swagger.v3.oas.annotations.security.SecurityRequirements
    public ResponseEntity<ContaAtivada> ativar(@Valid @RequestBody AtivacaoConta entrada, HttpServletRequest requisicao) {
        limites.limitarPublico("conta-ativar-ip", requisicao.getRemoteAddr(), 20, 900);
        return semCache(contas.ativar(entrada));
    }
}
