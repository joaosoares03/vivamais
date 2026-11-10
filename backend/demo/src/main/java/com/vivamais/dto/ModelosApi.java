package com.vivamais.dto;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import java.time.Instant;
import java.util.UUID;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

public final class ModelosApi {
    private ModelosApi() { }
    public enum Papel { ADMIN, PROFESSIONAL, PATIENT }
    @Schema(requiredProperties={"id","email","displayName","role","organizationId"})
    public record Usuario(UUID id, String email,@com.fasterxml.jackson.annotation.JsonProperty("displayName")  String nomeExibicao,@com.fasterxml.jackson.annotation.JsonProperty("role")  Papel papel,@com.fasterxml.jackson.annotation.JsonProperty("organizationId")  UUID idUnidade) { }
    public record SolicitacaoAcesso(@NotBlank @Email @Size(max=254) String email,@com.fasterxml.jackson.annotation.JsonProperty("password")
                               @NotBlank @Size(max=72) String senha,@Size(max=32) String codigoMfa) { }
    @Schema(requiredProperties={"accessToken","expiresAt","user"})
    public record RespostaAcesso(String accessToken,@com.fasterxml.jackson.annotation.JsonProperty("expiresAt")  Instant expiraEm,@com.fasterxml.jackson.annotation.JsonProperty("user")  Usuario usuario) { }
    @Schema(requiredProperties={"id","name"})
    public record Unidade(UUID id, String name) { }
    @Schema(requiredProperties={"id","displayName","modality","organizationId"})
    public record Paciente(UUID id,@com.fasterxml.jackson.annotation.JsonProperty("displayName")  String nomeExibicao,@com.fasterxml.jackson.annotation.JsonProperty("modality")  @Schema(allowableValues={"APP","BRACELET_DIARY"}) String modalidade,@com.fasterxml.jackson.annotation.JsonProperty("organizationId")  UUID idUnidade) { }
    @Schema(requiredProperties={"patientCount","appCount","diaryCount","organizationName"})
    public record ResumoPainel(long patientCount, long appCount, long diaryCount, String organizationName, long consultasSemana) { }
    @Schema(requiredProperties={"key","phase","status","reason"})
    public record Modulo(@Schema(allowableValues={"blood-pressure","medications","food","activity","diary","consultations","bracelet"}) String key,
                             int phase,@Schema(allowableValues={"AVAILABLE","NOT_STARTED","BLOCKED_PENDING_CLINICAL_APPROVAL","BLOCKED_PENDING_HARDWARE_SPEC"}) String status,String reason) { }
    public record SessaoAutenticada(@com.fasterxml.jackson.annotation.JsonProperty("user") Usuario usuario,@com.fasterxml.jackson.annotation.JsonProperty("sessionId")  UUID idSessao) { }
}
