package com.vivamais.dto;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;
public final class ModelosTestadores {
 private ModelosTestadores(){}
 public record EmissaoConvite(@NotBlank @Size(max=72) String senhaProfissional,@Min(1) @Max(7) int validadeDias){}
 public record ConviteEmitido(UUID id,String convite,Instant expiraEm){}
 public record ConviteListado(UUID id,Instant criadoEm,Instant expiraEm,Instant utilizadoEm,Instant revogadoEm){}
 public record EntradaConvite(@NotBlank @Pattern(regexp="[A-Za-z0-9_-]{43}") String convite,@NotNull ModelosAcessoPaciente.TipoDispositivo tipo){}
 public record RenovacaoTestador(@Pattern(regexp="[A-Za-z0-9_-]{43}") String credencialRenovacao,@NotNull ModelosAcessoPaciente.TipoDispositivo tipo){}
 @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
 public record AcessoTestador(ModelosApi.RespostaAcesso sessao,String credencialRenovacao,Instant expiraEm){}
}
