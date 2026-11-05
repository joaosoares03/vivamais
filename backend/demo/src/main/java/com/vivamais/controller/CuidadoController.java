package com.vivamais.controller;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosCuidado.*;
import static com.vivamais.dto.ModelosAcessoPaciente.*;
import java.time.*;
import java.util.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name="bearerAuth")
public class CuidadoController {
 @GetMapping("/pacientes/{idPaciente}/registros-pressao/{idRegistro}") public Map<String,Object> buscarRegistroPressao(@PathVariable("idPaciente") UUID idPaciente,@PathVariable("idRegistro") UUID idRegistro,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.buscarRegistroPressao(idPaciente,idRegistro,principalAutenticado.usuario());}
 private final AcessoPacienteService acessoPaciente; private final CuidadoService cuidados; private final LimitadorTentativasAcesso limiter; private final CodificadorToken codificadorTokens;
 public CuidadoController(AcessoPacienteService acessoPaciente,CuidadoService cuidados,LimitadorTentativasAcesso limiter,CodificadorToken codificadorTokens){this.acessoPaciente=acessoPaciente;this.cuidados=cuidados;this.limiter=limiter;this.codificadorTokens=codificadorTokens;}
 @PostMapping("/patients") public PacienteCadastrado create(@Valid @RequestBody CadastroPaciente entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){var cadastro=cuidados.cadastrarPaciente(entrada,principalAutenticado.usuario());return new PacienteCadastrado(cadastro.paciente(),null,null,"APP".equals(cadastro.paciente().modalidade())?acessoPaciente.estado(cadastro.paciente().id(),principalAutenticado.usuario()):null);}
 @GetMapping("/patients/search") public Pagina<Paciente> search(@RequestParam(defaultValue="") String q,@RequestParam(name="page",defaultValue="0") int paginar,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.search(principalAutenticado.usuario(),q,paginar,size);}
 @PostMapping("/patients/{id}/access-reset") public SolicitacaoSms reset(@PathVariable UUID id,@Valid @RequestBody EmissaoCodigo entrada,@AuthenticationPrincipal SessaoAutenticada sessao,HttpServletRequest requisicao){return acessoPaciente.emitir(id,entrada,sessao.usuario());}
 @GetMapping("/patients/{id}/access-status") public EstadoAtivacao estadoAcesso(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada sessao){return acessoPaciente.estado(id,sessao.usuario());}
 @GetMapping("/professionals") public List<Map<String,Object>> listarProfissionais(@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarProfissionais(principalAutenticado.usuario());}
 @PostMapping("/patients/{id}/assignments") public ResponseEntity<Void> autorizarVinculo(@PathVariable UUID id,@Valid @RequestBody VinculoProfissional entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){cuidados.autorizarVinculo(id,entrada.idProfissional(),principalAutenticado.usuario());return ResponseEntity.noContent().build();}
 @GetMapping("/patients/{id}/assignments") public List<Map<String,Object>> listarVinculos(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarVinculos(id,principalAutenticado.usuario());}
 @PostMapping("/patients/{id}/assignments/revoke") public ResponseEntity<Void> revogarVinculo(@PathVariable UUID id,@Valid @RequestBody VinculoProfissional entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){cuidados.revogarVinculo(id,entrada.idProfissional(),principalAutenticado.usuario());return ResponseEntity.noContent().build();}
 @GetMapping("/patients/{id}/readings") public Pagina<RegistroPressao> listarRegistrosPressao(@PathVariable UUID id,@RequestParam(name="page",defaultValue="0") int paginar,@RequestParam(defaultValue="20") int size,@RequestParam(required=false) Instant from,@RequestParam(required=false) Instant to,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarRegistrosPressao(id,principalAutenticado.usuario(),paginar,size,from,to);}
 @PostMapping("/patients/{id}/readings") public RegistroPressao salvarRegistroPressao(@PathVariable UUID id,@Valid @RequestBody EntradaRegistroPressao entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.salvarRegistroPressao(id,entrada,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/medications") public List<Map<String,Object>> listarMedicamentos(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarMedicamentos(id,principalAutenticado.usuario());}
 @PostMapping("/patients/{id}/medications") public Map<String,Object> salvarMedicamento(@PathVariable UUID id,@Valid @RequestBody EntradaMedicamento entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.salvarMedicamento(id,null,entrada,principalAutenticado.usuario());}
 @PutMapping("/medications/{plan}") public Map<String,Object> updateMedication(@PathVariable UUID plan,@Valid @RequestBody EntradaMedicamento entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.salvarMedicamento(cuidados.buscarPacientePlano(plan,principalAutenticado.usuario()),plan,entrada,principalAutenticado.usuario());}
 @GetMapping("/medications/{plan}/history") public List<Map<String,Object>> history(@PathVariable UUID plan,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarHistoricoMedicamento(plan,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/medication-events") public List<Map<String,Object>> events(@PathVariable UUID id,@RequestParam LocalDate date,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarHorariosMedicamentos(id,date,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/medication-agenda") public Map<String,Object> agendaMedicamentos(@PathVariable UUID id,@RequestParam LocalDate from,@RequestParam LocalDate to,@AuthenticationPrincipal SessaoAutenticada sessao){return cuidados.agendaMedicamentos(id,from,to,sessao.usuario());}
 @PostMapping("/patients/{id}/medication-reports") public Map<String,Object> registrarAutorrelato(@PathVariable UUID id,@Valid @RequestBody EntradaAutorrelato entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.registrarAutorrelato(id,entrada,principalAutenticado.usuario());}
 private Pagina<Map<String,Object>> paginar(String table,UUID id,int paginar,int size,SessaoAutenticada principalAutenticado){cuidados.autorizarPaciente(id,principalAutenticado.usuario());return cuidados.paginar(table,id,paginar,size);}
 @GetMapping("/patients/{id}/diary") public Pagina<Map<String,Object>> diario(@PathVariable UUID id,@RequestParam(name="page",defaultValue="0") int paginar,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return paginar("printed_diary_entry",id,paginar,size,principalAutenticado);}
 @PostMapping("/patients/{id}/diary") public Map<String,Object> diario(@PathVariable UUID id,@Valid @RequestBody EntradaDiario entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.diario(id,entrada,principalAutenticado.usuario());}
 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode="204",description="Perfil funcional ainda não cadastrado")
 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode="200",description="Perfil funcional cadastrado")
 @GetMapping("/patients/{id}/activity-profile") public ResponseEntity<Map<String,Object>> perfilAtividade(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){var perfil=cuidados.perfilAtividade(id,principalAutenticado.usuario());return perfil==null?ResponseEntity.noContent().build():ResponseEntity.ok(perfil);}
 @PutMapping("/patients/{id}/activity-profile") public Map<String,Object> perfilAtividade(@PathVariable UUID id,@Valid @RequestBody PerfilAtividade entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.perfilAtividade(id,entrada,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/activities") public Pagina<Map<String,Object>> activities(@PathVariable UUID id,@RequestParam(name="page",defaultValue="0") int paginar,@RequestParam(defaultValue="20") int size,@RequestParam(required=false) Instant from,@RequestParam(required=false) Instant to,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarAtividades(id,principalAutenticado.usuario(),paginar,size,from,to);}
 @GetMapping("/pacientes/{idPaciente}/atividades/semana") public Map<String,Object> semanaAtividades(@PathVariable UUID idPaciente,@RequestParam LocalDate inicio,@AuthenticationPrincipal SessaoAutenticada sessao){return cuidados.resumirSemanaAtividades(idPaciente,inicio,sessao.usuario());}
 @PostMapping("/patients/{id}/activities") public Map<String,Object> registrarAtividade(@PathVariable UUID id,@Valid @RequestBody EntradaAtividade entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.registrarAtividade(id,entrada,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/consultations") public Pagina<Map<String,Object>> consultations(@PathVariable UUID id,@RequestParam(name="page",defaultValue="0") int paginar,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){cuidados.exigirProfissional(principalAutenticado.usuario());return paginar("consultation",id,paginar,size,principalAutenticado);}
 @PostMapping("/patients/{id}/consultations") public Map<String,Object> registrarConsulta(@PathVariable UUID id,@Valid @RequestBody EntradaConsulta entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.registrarConsulta(id,entrada,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/summary") public Map<String,Object> resumirConsulta(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.resumirConsulta(id,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/export") public Map<String,Object> exportarResumo(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.exportarResumo(id,principalAutenticado.usuario());}
 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode="204",description="Pulseira ainda não cadastrada")
 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode="200",description="Pulseira cadastrada")
 @GetMapping("/patients/{id}/device") public ResponseEntity<Map<String,Object>> pulseira(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){var pulseira=cuidados.pulseira(id,principalAutenticado.usuario());return pulseira==null?ResponseEntity.noContent().build():ResponseEntity.ok(pulseira);}
 @PostMapping("/patients/{id}/device") public Map<String,Object> pulseira(@PathVariable UUID id,@Valid @RequestBody EntradaPulseira entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.pulseira(id,entrada,principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/device/configurations") public List<Map<String,Object>> listarConfiguracoes(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.listarConfiguracoes(id,principalAutenticado.usuario());}
 @PostMapping("/patients/{id}/device/configurations") public Map<String,Object> configurar(@PathVariable UUID id,@Valid @RequestBody EntradaConfiguracaoPulseira entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return cuidados.configurar(id,entrada,principalAutenticado.usuario());}
}
