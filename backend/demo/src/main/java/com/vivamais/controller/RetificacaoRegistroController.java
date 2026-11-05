package com.vivamais.controller;

import com.vivamais.dto.ModelosApi.SessaoAutenticada;
import com.vivamais.service.RetificacaoRegistroService;
import com.vivamais.service.RetificacaoRegistroService.*;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pacientes/{idPaciente}/registros/{tipo}/{idRegistro}/retificacoes")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
public class RetificacaoRegistroController {
    private final RetificacaoRegistroService retificacoes;
    public RetificacaoRegistroController(RetificacaoRegistroService retificacoes) { this.retificacoes=retificacoes; }
    @GetMapping public List<Map<String,Object>> listar(@PathVariable UUID idPaciente,@PathVariable TipoRegistro tipo,
            @PathVariable UUID idRegistro,@AuthenticationPrincipal SessaoAutenticada sessao) {
        return retificacoes.listar(idPaciente,tipo,idRegistro,sessao.usuario());
    }
    @PostMapping public Map<String,Object> salvar(@PathVariable UUID idPaciente,@PathVariable TipoRegistro tipo,
            @PathVariable UUID idRegistro,@Valid @RequestBody EntradaRetificacao entrada,@AuthenticationPrincipal SessaoAutenticada sessao) {
        return retificacoes.salvar(idPaciente,tipo,idRegistro,entrada,sessao.usuario());
    }
}
