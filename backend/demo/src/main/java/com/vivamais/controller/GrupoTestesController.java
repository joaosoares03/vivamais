package com.vivamais.controller;
import com.vivamais.dto.ModelosApi.SessaoAutenticada;
import com.vivamais.service.GrupoTestesService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1")
public class GrupoTestesController {
 private final GrupoTestesService grupo;
 private final com.vivamais.service.LimiteGrupoTestes limites;
 public GrupoTestesController(GrupoTestesService grupo,com.vivamais.service.LimiteGrupoTestes limites){this.grupo=grupo;this.limites=limites;}
 @GetMapping("/grupo-testes") public ResponseEntity<?> listar(@AuthenticationPrincipal SessaoAutenticada sessao){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(grupo.listar(sessao.usuario()));}
 @PostMapping("/grupo-testes") public ResponseEntity<?> criar(@Valid @RequestBody GrupoTestesService.NovoIntegrante entrada,@AuthenticationPrincipal SessaoAutenticada sessao)throws Exception{return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(grupo.criar(entrada,sessao.usuario()));}
 @PostMapping("/grupo-testes/{id}/convite") public ResponseEntity<?> emitir(@PathVariable UUID id,@Valid @RequestBody GrupoTestesService.NovaEmissao entrada,@AuthenticationPrincipal SessaoAutenticada sessao){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(grupo.emitir(id,entrada,sessao.usuario()));}
 @PostMapping("/grupo-testes/{id}/desativar") public ResponseEntity<?> desativar(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada sessao){grupo.desativar(id,sessao.usuario());return ResponseEntity.noContent().build();}
 @PostMapping("/auth/grupo/ativar-profissional") @io.swagger.v3.oas.annotations.security.SecurityRequirements
 public ResponseEntity<?> ativar(@Valid @RequestBody GrupoTestesService.Ativacao entrada,HttpServletRequest requisicao){limites.verificar("ativacao:"+requisicao.getRemoteAddr(),20);return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(grupo.ativar(entrada));}
}
