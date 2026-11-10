package com.vivamais.service;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosExercicios.*;
import static com.vivamais.service.CuidadoService.error;

import com.vivamais.model.*;
import com.vivamais.repositories.InstituicaoRepository;
import java.io.InputStream;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Plano de exercícios definido pela equipe. O sistema não escolhe exercícios nem infere risco:
 * só guarda a decisão do profissional, e só a libera quando a unidade registrou a aprovação
 * clínica da versão do catálogo. Sem aprovação vigente, o estado é BLOCKED_PENDING_CLINICAL_APPROVAL.
 */
@Service
@Transactional
public class ExerciciosService {
    public static final String BLOQUEADO = "BLOCKED_PENDING_CLINICAL_APPROVAL";
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    public record ItemCatalogo(String id, String nome, String grupo) {}

    private final JdbcTemplate db;
    private final CuidadoService cuidados;
    private final InstituicaoRepository instituicoes;
    private final String versaoCatalogo;
    private final Map<String, ItemCatalogo> catalogo;

    public ExerciciosService(JdbcTemplate db, CuidadoService cuidados, InstituicaoRepository instituicoes, ObjectMapper json) {
        this.db = db; this.cuidados = cuidados; this.instituicoes = instituicoes;
        try (InputStream entrada = new ClassPathResource("exercicios/catalogo.json").getInputStream()) {
            JsonNode raiz = json.readTree(entrada);
            this.versaoCatalogo = raiz.get("versao").asText();
            Map<String, ItemCatalogo> itens = new LinkedHashMap<>();
            for (JsonNode item : raiz.get("itens")) {
                var lido = new ItemCatalogo(item.get("id").asText(), item.get("nome").asText(), item.get("grupo").asText());
                if (itens.put(lido.id(), lido) != null) throw new IllegalStateException("Catálogo de exercícios com item repetido.");
            }
            this.catalogo = Collections.unmodifiableMap(itens);
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Catálogo de exercícios indisponível.", e);
        }
    }

    public String versaoCatalogo() { return versaoCatalogo; }

    // ---------- Aprovação clínica do catálogo ----------

    private Map<String, Object> aprovacaoVigente(UUID unidade) {
        var linhas = cuidados.consultarLinhas(
                "SELECT id,versao_catalogo,nome_responsavel,conselho,registro_conselho,observacao,aprovado_em,"
                        + "(SELECT u.display_name FROM user_account u WHERE u.id=a.registrado_por) AS registrado_por_nome "
                        + "FROM aprovacao_catalogo_exercicio a WHERE id_unidade=? AND versao_catalogo=? AND revogado_em IS NULL",
                unidade, versaoCatalogo);
        return linhas.isEmpty() ? null : linhas.getFirst();
    }

    public Map<String, Object> catalogo(Usuario ator) {
        cuidados.exigirProfissional(ator);
        var aprovacao = aprovacaoVigente(ator.idUnidade());
        Map<String, Object> saida = new LinkedHashMap<>();
        saida.put("versaoCatalogo", versaoCatalogo);
        saida.put("situacao", aprovacao == null ? BLOQUEADO : "APROVADO");
        saida.put("aprovacao", aprovacao);
        saida.put("itens", catalogo.values());
        return saida;
    }

    private void exigirAdministrador(Usuario ator) {
        if (ator.papel() != Papel.ADMIN) throw error(403, "Somente administradores registram a aprovação do catálogo.");
    }

    public Map<String, Object> aprovarCatalogo(AprovacaoCatalogo entrada, Usuario ator) {
        exigirAdministrador(ator);
        db.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,0))", Object.class, "aprovacao-catalogo:" + ator.idUnidade());
        if (aprovacaoVigente(ator.idUnidade()) != null) throw error(409, "Esta versão do catálogo já está aprovada nesta unidade.");
        UUID id = UUID.randomUUID();
        db.update("INSERT INTO aprovacao_catalogo_exercicio(id,id_unidade,versao_catalogo,registrado_por,nome_responsavel,conselho,registro_conselho,observacao) VALUES(?,?,?,?,?,?,?,?)",
                id, ator.idUnidade(), versaoCatalogo, ator.id(), entrada.nomeResponsavel().strip(), entrada.conselho().strip(),
                entrada.registroConselho().strip(), Objects.toString(entrada.observacao(), "").strip());
        instituicoes.auditar(ator, "CATALOGO_EXERCICIOS_APROVADO", "aprovacao_catalogo_exercicio", id);
        return catalogo(ator);
    }

    public Map<String, Object> revogarAprovacao(Usuario ator) {
        exigirAdministrador(ator);
        var aprovacao = aprovacaoVigente(ator.idUnidade());
        if (aprovacao == null) throw error(404, "Não há aprovação vigente para revogar.");
        UUID id = UUID.fromString(aprovacao.get("id").toString());
        db.update("UPDATE aprovacao_catalogo_exercicio SET revogado_em=now(),revogado_por=? WHERE id=? AND revogado_em IS NULL", ator.id(), id);
        instituicoes.auditar(ator, "CATALOGO_EXERCICIOS_REVOGADO", "aprovacao_catalogo_exercicio", id);
        return catalogo(ator);
    }

    // ---------- Plano do paciente ----------

    private String grupoDoPerfil(UUID paciente) {
        var grupo = db.query("SELECT grupo_catalogo FROM physical_activity_profile WHERE patient_id=?", (rs, n) -> rs.getString(1), paciente);
        return grupo.isEmpty() ? "NAO_DEFINIDO" : grupo.getFirst();
    }

    private Map<String, Object> planoVigente(UUID paciente) {
        var linhas = cuidados.consultarLinhas(
                "SELECT p.id,p.versao_catalogo,p.orientacao,p.criado_em,p.id_aprovacao,u.display_name AS autor_nome,"
                        + "a.nome_responsavel,a.conselho,a.registro_conselho,a.aprovado_em,(a.revogado_em IS NULL) AS aprovacao_vigente "
                        + "FROM plano_exercicio p JOIN user_account u ON u.id=p.autor_id JOIN aprovacao_catalogo_exercicio a ON a.id=p.id_aprovacao "
                        + "WHERE p.id_paciente=? AND p.encerrado_em IS NULL",
                paciente);
        return linhas.isEmpty() ? null : linhas.getFirst();
    }

    private static List<Integer> dias(int mascara) {
        List<Integer> saida = new ArrayList<>();
        for (int dia = 1; dia <= 7; dia++) if ((mascara & (1 << (dia - 1))) != 0) saida.add(dia);
        return saida;
    }

    public Map<String, Object> plano(UUID paciente, Usuario ator) {
        cuidados.autorizarPaciente(paciente, ator);
        var plano = planoVigente(paciente);
        if (plano == null) return null;
        UUID idPlano = UUID.fromString(plano.get("id").toString());
        boolean liberado = Boolean.TRUE.equals(plano.get("aprovacaoVigente")) && versaoCatalogo.equals(plano.get("versaoCatalogo"));
        Map<String, Object> saida = new LinkedHashMap<>();
        saida.put("id", idPlano.toString());
        saida.put("situacao", liberado ? "ATIVO" : BLOQUEADO);
        saida.put("versaoCatalogo", plano.get("versaoCatalogo"));
        saida.put("orientacao", plano.get("orientacao"));
        saida.put("autorNome", plano.get("autorNome"));
        saida.put("criadoEm", plano.get("criadoEm"));
        Map<String, Object> aprovacao = new LinkedHashMap<>();
        for (String campo : List.of("nomeResponsavel", "conselho", "registroConselho", "aprovadoEm")) aprovacao.put(campo, plano.get(campo));
        saida.put("aprovacao", aprovacao);
        // O paciente não vê itens de um plano cuja aprovação foi revogada.
        boolean ocultar = !liberado && ator.papel() == Papel.PATIENT;
        List<Map<String, Object>> itens = new ArrayList<>();
        if (!ocultar) {
            db.query("SELECT id_exercicio,ordem,dias_semana,duracao_minutos,observacao FROM plano_exercicio_item WHERE id_plano=? ORDER BY ordem", rs -> {
                Map<String, Object> item = new LinkedHashMap<>();
                String idExercicio = rs.getString("id_exercicio");
                var doCatalogo = catalogo.get(idExercicio);
                item.put("idExercicio", idExercicio);
                item.put("nome", doCatalogo == null ? idExercicio : doCatalogo.nome());
                item.put("ordem", rs.getInt("ordem"));
                item.put("diasSemana", dias(rs.getInt("dias_semana")));
                item.put("duracaoMinutos", rs.getInt("duracao_minutos"));
                item.put("observacao", rs.getString("observacao"));
                itens.add(item);
            }, idPlano);
        }
        saida.put("itens", itens);
        LocalDate hoje = LocalDate.now(FUSO), inicio = hoje.with(DayOfWeek.MONDAY);
        Map<String, Object> semana = new LinkedHashMap<>();
        semana.put("inicio", inicio.toString());
        semana.put("hoje", hoje.toString());
        semana.put("registros", ocultar ? List.of() : cuidados.consultarLinhas(
                "SELECT id_exercicio,(occurred_at AT TIME ZONE 'America/Sao_Paulo')::date AS data,count(*) AS registros "
                        + "FROM activity_record WHERE patient_id=? AND id_plano_exercicio=? AND occurred_at>=? AND occurred_at<? GROUP BY 1,2 ORDER BY 2,1",
                paciente, idPlano, Timestamp.from(inicio.atStartOfDay(FUSO).toInstant()), Timestamp.from(inicio.plusWeeks(1).atStartOfDay(FUSO).toInstant())));
        saida.put("semana", semana);
        instituicoes.auditar(ator, "PLANO_EXERCICIO_CONSULTADO", "patient", paciente);
        return saida;
    }

    private void exigirPlanoAtual(UUID paciente, UUID idInformado) {
        var atual = planoVigente(paciente);
        String idAtual = atual == null ? null : atual.get("id").toString();
        String informado = idInformado == null ? null : idInformado.toString();
        if (!Objects.equals(idAtual, informado)) throw error(409, "O plano foi alterado por outra pessoa. Atualize a página antes de salvar.");
    }

    public Map<String, Object> salvarPlano(UUID paciente, EntradaPlanoExercicio entrada, Usuario ator) {
        cuidados.exigirProfissional(ator);
        var dados = cuidados.autorizarPaciente(paciente, ator);
        db.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,0))", Object.class, "plano-exercicio:" + paciente);
        var aprovacao = aprovacaoVigente(dados.idUnidade());
        if (aprovacao == null) throw error(409, "O catálogo de exercícios ainda não tem aprovação clínica registrada nesta unidade.");
        String grupo = grupoDoPerfil(paciente);
        if (grupo.equals("NAO_DEFINIDO")) throw error(409, "Defina o grupo do catálogo no perfil funcional antes de montar o plano.");
        exigirPlanoAtual(paciente, entrada.idPlanoAtual());
        Set<String> vistos = new HashSet<>();
        for (var item : entrada.itens()) {
            var doCatalogo = catalogo.get(item.idExercicio());
            if (doCatalogo == null) throw error(400, "Exercício fora do catálogo aprovado.");
            if (!doCatalogo.grupo().equals(grupo)) throw error(400, "\"" + doCatalogo.nome() + "\" não pertence ao grupo definido no perfil funcional.");
            if (!vistos.add(item.idExercicio())) throw error(400, "Cada exercício pode aparecer uma vez no plano.");
            if (new HashSet<>(item.diasSemana()).size() != item.diasSemana().size()) throw error(400, "Dia da semana repetido.");
        }
        UUID novo = UUID.randomUUID();
        db.update("UPDATE plano_exercicio SET encerrado_em=now(),encerrado_por=? WHERE id_paciente=? AND encerrado_em IS NULL", ator.id(), paciente);
        db.update("INSERT INTO plano_exercicio(id,id_paciente,id_aprovacao,versao_catalogo,autor_id,orientacao) VALUES(?,?,?,?,?,?)",
                novo, paciente, UUID.fromString(aprovacao.get("id").toString()), versaoCatalogo, ator.id(), Objects.toString(entrada.orientacao(), "").strip());
        int ordem = 1;
        for (var item : entrada.itens()) {
            int mascara = 0;
            for (int dia : item.diasSemana()) mascara |= 1 << (dia - 1);
            db.update("INSERT INTO plano_exercicio_item(id_plano,id_exercicio,ordem,dias_semana,duracao_minutos,observacao) VALUES(?,?,?,?,?,?)",
                    novo, item.idExercicio(), ordem++, mascara, item.duracaoMinutos(), Objects.toString(item.observacao(), "").strip());
        }
        instituicoes.auditar(ator, "PLANO_EXERCICIO_SALVO", "plano_exercicio", novo);
        return plano(paciente, ator);
    }

    public void encerrarPlano(UUID paciente, EncerramentoPlanoExercicio entrada, Usuario ator) {
        cuidados.exigirProfissional(ator);
        cuidados.autorizarPaciente(paciente, ator);
        db.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,0))", Object.class, "plano-exercicio:" + paciente);
        exigirPlanoAtual(paciente, entrada.idPlanoAtual());
        db.update("UPDATE plano_exercicio SET encerrado_em=now(),encerrado_por=? WHERE id=?", ator.id(), entrada.idPlanoAtual());
        instituicoes.auditar(ator, "PLANO_EXERCICIO_ENCERRADO", "plano_exercicio", entrada.idPlanoAtual());
    }

    /** Encerra o plano quando o grupo do perfil muda, porque os itens deixam de pertencer ao grupo. */
    public void encerrarPlanoSeGrupoMudou(UUID paciente, String grupoAnterior, String grupoNovo, Usuario ator) {
        if (Objects.equals(grupoAnterior, grupoNovo)) return;
        var atual = planoVigente(paciente);
        if (atual == null) return;
        UUID id = UUID.fromString(atual.get("id").toString());
        db.update("UPDATE plano_exercicio SET encerrado_em=now(),encerrado_por=? WHERE id=?", ator.id(), id);
        instituicoes.auditar(ator, "PLANO_EXERCICIO_ENCERRADO", "plano_exercicio", id);
    }

    /** Valida o exercício informado num registro de atividade e devolve o plano vigente a que ele pertence. */
    public UUID planoDoExercicio(UUID paciente, String idExercicio) {
        var plano = planoVigente(paciente);
        if (plano == null || !Boolean.TRUE.equals(plano.get("aprovacaoVigente")) || !versaoCatalogo.equals(plano.get("versaoCatalogo")))
            throw error(409, "Não há plano de exercícios ativo para este registro.");
        UUID id = UUID.fromString(plano.get("id").toString());
        Integer existe = db.queryForObject("SELECT count(*) FROM plano_exercicio_item WHERE id_plano=? AND id_exercicio=?", Integer.class, id, idExercicio);
        if (existe == null || existe == 0) throw error(400, "Este exercício não faz parte do plano atual.");
        return id;
    }
}
