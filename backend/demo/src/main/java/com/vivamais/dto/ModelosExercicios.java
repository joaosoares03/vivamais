package com.vivamais.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

/** Entradas do plano de exercícios definido pela equipe e da aprovação clínica do catálogo. */
public final class ModelosExercicios {
    private ModelosExercicios() {}

    public record AprovacaoCatalogo(
            @NotBlank @Size(min = 3, max = 160) String nomeResponsavel,
            @NotBlank @Size(min = 2, max = 40) String conselho,
            @NotBlank @Size(min = 2, max = 40) String registroConselho,
            @Size(max = 1000) String observacao,
            @AssertTrue(message = "Confirme que o catálogo foi revisado pelo responsável clínico.") boolean confirmacao) {}

    public record ItemPlanoExercicio(
            @NotBlank @Pattern(regexp = "^ex[0-9]{2}-[a-z0-9-]+$") @Size(max = 60) String idExercicio,
            @NotEmpty @Size(max = 7) List<@NotNull @Min(1) @Max(7) Integer> diasSemana,
            @Min(1) @Max(60) int duracaoMinutos,
            @Size(max = 300) String observacao) {}

    public record EntradaPlanoExercicio(
            UUID idPlanoAtual,
            @Size(max = 1000) String orientacao,
            @NotEmpty @Size(max = 5) List<@Valid @NotNull ItemPlanoExercicio> itens) {}

    public record EncerramentoPlanoExercicio(@NotNull UUID idPlanoAtual) {}
}
