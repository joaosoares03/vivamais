package com.vivamais.config;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
@org.springframework.core.annotation.Order(org.springframework.core.Ordered.HIGHEST_PRECEDENCE)
public class TratadorExcecoesApi {
    private static final org.slf4j.Logger LOGGER=org.slf4j.LoggerFactory.getLogger(TratadorExcecoesApi.class);
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ProblemDetail> status(ResponseStatusException exception) {
        ProblemDetail problem=ProblemDetail.forStatusAndDetail(exception.getStatusCode(),exception.getReason()==null?"Falha na solicitação.":exception.getReason());
        problem.setTitle(title(exception.getStatusCode().value()));
        var builder=ResponseEntity.status(exception.getStatusCode());
        if (exception.getStatusCode().value()==429) builder.header("Retry-After","900");
        return builder.body(problem);
    }
    @ExceptionHandler({MethodArgumentNotValidException.class, MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class})
    ProblemDetail invalid(Exception exception) {
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,"Revise o formato dos campos enviados.");
        problem.setTitle("Solicitação inválida"); return problem;
    }
    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail forbidden(AccessDeniedException exception) {
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,"Você não possui permissão para este recurso.");
        problem.setTitle("Acesso negado"); return problem;
    }
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    ProblemDetail conflict(Exception exception) {
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,"O registro já existe ou conflita com os dados vinculados.");
        problem.setTitle("Conflito de dados"); return problem;
    }
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    ProblemDetail uploadSize(Exception exception) {var problem=ProblemDetail.forStatusAndDetail(HttpStatus.PAYLOAD_TOO_LARGE,"Use uma imagem com até 2 MB.");problem.setTitle("Arquivo muito grande");return problem;}
    @ExceptionHandler({org.springframework.web.bind.MissingServletRequestParameterException.class,org.springframework.web.multipart.support.MissingServletRequestPartException.class})
    ProblemDetail missingPart(Exception exception) {return invalid(exception);}
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    ProblemDetail notFound(Exception exception) {
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,"Recurso não encontrado.");
        problem.setTitle("Recurso não encontrado"); return problem;
    }
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    ProblemDetail methodNotAllowed(Exception exception) {
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.METHOD_NOT_ALLOWED,"Método não permitido para este recurso.");
        problem.setTitle("Método não permitido"); return problem;
    }
    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception exception) {
        // Registra somente a posição no código, sem mensagem, parâmetros ou stack trace completo.
        var origem = java.util.Arrays.stream(exception.getStackTrace())
            .filter(quadro -> quadro.getClassName().startsWith("com.vivamais."))
            .findFirst().map(quadro -> quadro.getClassName()+"."+quadro.getMethodName()+":"+quadro.getLineNumber())
            .orElse("origem_nao_identificada");
        LOGGER.error("Request failed: {} em {}", exception.getClass().getSimpleName(), origem);
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,"Serviço temporariamente indisponível.");
        problem.setTitle("Falha interna"); return problem;
    }
    private static String title(int status) {
        return switch(status) {
            case 401 -> "Não autenticado"; case 403 -> "Acesso negado"; case 404 -> "Recurso não encontrado";
            case 429 -> "Limite de tentativas"; default -> "Falha na solicitação";
        };
    }
}
