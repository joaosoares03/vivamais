package com.vivamais.dto;

import java.time.Instant;
import java.time.LocalDate;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonInclude;

public final class ModelosAcessoPaciente {
    private ModelosAcessoPaciente() {}
    public enum TipoDispositivo { WEB, NATIVO }
    public record EntradaPaciente(@NotBlank @Size(max=14) String cpf, @NotNull LocalDate dataNascimento,
        @NotNull TipoDispositivo tipo, @Pattern(regexp="[A-Za-z0-9_-]{43}") String credencialDispositivo) {}
    public record VerificacaoPaciente(@NotBlank @Pattern(regexp="[A-Za-z0-9_-]{43}") String desafio,
        @NotBlank @Pattern(regexp="[0-9]{4}|[0-9]{6}") String codigo, @NotNull TipoDispositivo tipo) {}
    public record RenovacaoPaciente(@NotNull TipoDispositivo tipo,
        @Pattern(regexp="[A-Za-z0-9_-]{43}") String credencialDispositivo) {}
    public record EmissaoCodigo(@NotBlank @Size(max=72) String senhaProfissional,
        @NotNull @AssertTrue Boolean identidadeConferida) {}
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RespostaPaciente(String estado, String desafio, Instant desafioExpiraEm,
        ModelosApi.RespostaAcesso sessao, String credencialDispositivo, Instant dispositivoExpiraEm) {}
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SolicitacaoSms(java.util.UUID idEnvio,String estadoEnvio,Instant expiraEm,String destinoMascarado,String provedor,String codigoPresencial) {}
    public record EstadoEnvioSms(java.util.UUID idEnvio,String estado,String destinoMascarado,String provedor,Instant atualizadoEm) {}
    public record EstadoAtivacao(String estado, Instant expiraEm, int dispositivosAutorizados,EstadoEnvioSms envioSms,boolean smsDisponivel,String provedorSms) {}
}
