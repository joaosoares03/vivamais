package com.vivamais.controller;

import static com.vivamais.dto.ModelosExercicios.*;

import com.vivamais.dto.ModelosApi.SessaoAutenticada;
import com.vivamais.service.ExerciciosService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "bearerAuth")
public class ExerciciosController {
    private final ExerciciosService exercicios;

    public ExerciciosController(ExerciciosService exercicios) { this.exercicios = exercicios; }

    @GetMapping("/exercicios/catalogo")
    public Map<String, Object> catalogo(@AuthenticationPrincipal SessaoAutenticada sessao) {
        return exercicios.catalogo(sessao.usuario());
    }

    @PostMapping("/exercicios/catalogo/aprovacao")
    public Map<String, Object> aprovar(@Valid @RequestBody AprovacaoCatalogo entrada, @AuthenticationPrincipal SessaoAutenticada sessao) {
        return exercicios.aprovarCatalogo(entrada, sessao.usuario());
    }

    @PostMapping("/exercicios/catalogo/aprovacao/revogar")
    public Map<String, Object> revogar(@AuthenticationPrincipal SessaoAutenticada sessao) {
        return exercicios.revogarAprovacao(sessao.usuario());
    }

    @GetMapping("/pacientes/{idPaciente}/plano-exercicios")
    public ResponseEntity<Map<String, Object>> plano(@PathVariable UUID idPaciente, @AuthenticationPrincipal SessaoAutenticada sessao) {
        var plano = exercicios.plano(idPaciente, sessao.usuario());
        return plano == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(plano);
    }

    @PutMapping("/pacientes/{idPaciente}/plano-exercicios")
    public Map<String, Object> salvar(@PathVariable UUID idPaciente, @Valid @RequestBody EntradaPlanoExercicio entrada, @AuthenticationPrincipal SessaoAutenticada sessao) {
        return exercicios.salvarPlano(idPaciente, entrada, sessao.usuario());
    }

    @PostMapping("/pacientes/{idPaciente}/plano-exercicios/encerrar")
    public ResponseEntity<Void> encerrar(@PathVariable UUID idPaciente, @Valid @RequestBody EncerramentoPlanoExercicio entrada, @AuthenticationPrincipal SessaoAutenticada sessao) {
        exercicios.encerrarPlano(idPaciente, entrada, sessao.usuario());
        return ResponseEntity.noContent().build();
    }
}
