package com.vivamais.controller;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import static com.vivamais.dto.ModelosApi.*;
import java.util.List;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name="bearerAuth")
public class InstituicaoController {
    private final AutenticacaoService auth;
    private final InstituicaoRepository repositorio;
    private final LimitadorTentativasAcesso limiter;
    private final AcessoPacienteService limitesPersistidos;
    private final boolean limitePersistido;
    public InstituicaoController(AutenticacaoService auth, InstituicaoRepository repositorio, LimitadorTentativasAcesso limiter,
            AcessoPacienteService limitesPersistidos, @org.springframework.beans.factory.annotation.Value("${app.limite-login-persistido:false}") boolean limitePersistido) {
        this.auth=auth; this.repositorio=repositorio; this.limiter=limiter; this.limitesPersistidos=limitesPersistidos; this.limitePersistido=limitePersistido;
    }
    @PostMapping("/auth/login")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    @Operation(summary="Abre sessão opaca de 30 minutos", security={})
    public RespostaAcesso entrar(@Valid @RequestBody SolicitacaoAcesso requisicao, HttpServletRequest servletRequest) {
        if (limitePersistido) {
            limitesPersistidos.limitarPublico("login-ip",servletRequest.getRemoteAddr(),40,900);
            limitesPersistidos.limitarPublico("login-email",requisicao.email().trim().toLowerCase(java.util.Locale.ROOT),10,900);
        }
        if (!limiter.allow(servletRequest.getRemoteAddr(),requisicao.email())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Muitas tentativas. Aguarde 15 minutos e tente novamente.");
        }
        return auth.entrar(requisicao);
    }
    @GetMapping("/auth/me")
    public Usuario me(@AuthenticationPrincipal SessaoAutenticada principalAutenticado) { return principalAutenticado.usuario(); }
    @PostMapping("/auth/logout")
    public ResponseEntity<Void> sair(@AuthenticationPrincipal SessaoAutenticada principalAutenticado) {
        auth.sair(principalAutenticado); return ResponseEntity.noContent().build();
    }
    @GetMapping("/organization")
    public Unidade buscarUnidade(@AuthenticationPrincipal SessaoAutenticada principalAutenticado) {
        return repositorio.buscarUnidade(principalAutenticado.usuario().idUnidade());
    }
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSIONAL')")
    public ResumoPainel consultarPainel(@AuthenticationPrincipal SessaoAutenticada principalAutenticado) {
        var pacientes=repositorio.listarPacientesAutorizados(principalAutenticado.usuario());
        long appCount=pacientes.stream().filter(paciente -> paciente.modalidade().equals("APP")).count();
        return new ResumoPainel(pacientes.size(),appCount,pacientes.size()-appCount,
                repositorio.buscarUnidade(principalAutenticado.usuario().idUnidade()).name(),repositorio.contarConsultasSemana(principalAutenticado.usuario()));
    }
    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSIONAL')")
    @Transactional
    public List<Paciente> pacientes(@AuthenticationPrincipal SessaoAutenticada principalAutenticado) {
        var resultado=repositorio.listarPacientesAutorizados(principalAutenticado.usuario());
        repositorio.auditar(principalAutenticado.usuario(),"PATIENT_LIST_VIEWED","patient",null);
        return resultado;
    }
    @GetMapping("/patients/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public Paciente ownPatient(@AuthenticationPrincipal SessaoAutenticada principalAutenticado) {
        var resultado=repositorio.ownPatient(principalAutenticado.usuario()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Cadastro de paciente indisponível."));
        repositorio.auditar(principalAutenticado.usuario(),"PATIENT_VIEWED","patient",resultado.id());
        return resultado;
    }
    @GetMapping("/patients/{id}")
    @Transactional
    public Paciente paciente(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado) {
        var resultado=repositorio.buscarPacienteAutorizado(id,principalAutenticado.usuario()).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,"Você não possui permissão para este recurso."));
        repositorio.auditar(principalAutenticado.usuario(),"PATIENT_VIEWED","patient",id);
        return resultado;
    }
    @GetMapping("/system/modules")
    public List<Modulo> listarModulos() {
        return List.of(
                new Modulo("blood-pressure",2,"AVAILABLE","Digitação, foto com OCR e revisão obrigatória, histórico e gráfico persistidos na API."),
                new Modulo("medications",3,"AVAILABLE","Planos profissionais e autorrelatos disponíveis. Notificações locais exigem build nativo e permissão do aparelho."),
                new Modulo("food",5,"AVAILABLE","Fotos privadas e registros disponíveis. Análise automatizada exige serviço configurado e critérios clínicos aprovados."),
                new Modulo("activity",5,"AVAILABLE","Registro e perfil profissional disponíveis. Recomendação personalizada bloqueada até aprovação clínica."),
                new Modulo("diary",3,"AVAILABLE","Transcrição profissional com autoria, origem e horário da ocorrência."),
                new Modulo("consultations",6,"AVAILABLE","Registro, objetivos, plano individual e resumo dos dados disponíveis."),
                new Modulo("bracelet",6,"BLOCKED_PENDING_HARDWARE_SPEC","Integração real depende de fabricante, protocolo, firmware e ensaio físico."));
    }
}
