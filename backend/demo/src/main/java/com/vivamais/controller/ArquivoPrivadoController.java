package com.vivamais.controller;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;
import static com.vivamais.dto.ModelosApi.*;
import java.time.Instant;
import java.util.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1") @SecurityRequirement(name="bearerAuth")
public class ArquivoPrivadoController {
 private final ArquivoPrivadoService arquivos;
 public ArquivoPrivadoController(ArquivoPrivadoService arquivos){this.arquivos=arquivos;}
 @GetMapping("/food/status") public ResponseEntity<Map<String,Object>> estadoAnalise(){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(arquivos.estadoAnaliseAlimentar());}
 @PostMapping(value="/patients/{id}/files",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 public Map<String,Object> upload(@PathVariable UUID id,@RequestParam(name="purpose") String finalidade,@RequestPart(name="file") MultipartFile arquivo,@AuthenticationPrincipal SessaoAutenticada principalAutenticado)throws Exception{return arquivos.upload(id,finalidade,arquivo,principalAutenticado.usuario());}
 @PostMapping("/files/{id}/link") public Map<String,Object> link(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return arquivos.link(id,principalAutenticado);}
 @GetMapping("/files/{id}/content") @io.swagger.v3.oas.annotations.security.SecurityRequirements
 public ResponseEntity<byte[]> content(@PathVariable UUID id,@RequestParam(name="access") String autorizarPaciente)throws Exception{return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).header("Cache-Control","private, no-store").header("Referrer-Policy","no-referrer").header("Content-Disposition","inline; filename=imagem.png").body(arquivos.content(id,autorizarPaciente));}
 @PostMapping("/files/{id}/ocr") public Map<String,Object> ocr(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado)throws Exception{return arquivos.reconhecer(id,principalAutenticado.usuario());}
 public record EntradaRefeicao(@com.fasterxml.jackson.annotation.JsonProperty("fileId") @NotNull UUID idArquivo,@NotNull Instant occurredAt,@com.fasterxml.jackson.annotation.JsonProperty("notes") @Size(max=2000) String observacoes){}
 @PostMapping("/patients/{id}/meals") public Map<String,Object> registrarRefeicao(@PathVariable UUID id,@Valid @RequestBody EntradaRefeicao entrada,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return arquivos.registrarRefeicao(id,entrada.idArquivo(),entrada.occurredAt(),entrada.observacoes(),principalAutenticado.usuario());}
 @GetMapping("/patients/{id}/meals") public ModelosCuidado.Pagina<Map<String,Object>> listarRefeicoes(@PathVariable UUID id,@RequestParam(name="page",defaultValue="0") int paginar,@RequestParam(defaultValue="20")int size,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return arquivos.listarRefeicoes(id,paginar,size,principalAutenticado.usuario());}
 @PostMapping("/meals/{id}/analyze") public Map<String,Object> analisarAlimentacao(@PathVariable UUID id,@AuthenticationPrincipal SessaoAutenticada principalAutenticado)throws Exception{return arquivos.analisarAlimentacao(id,principalAutenticado.usuario());}
 @GetMapping("/refeicoes/{idRefeicao}") public Map<String,Object> buscarRefeicao(@PathVariable UUID idRefeicao,@AuthenticationPrincipal SessaoAutenticada principalAutenticado){return arquivos.buscarRefeicao(idRefeicao,principalAutenticado.usuario());}
}
