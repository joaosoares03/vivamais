package com.vivamais.service;
import com.vivamais.security.CodificadorToken;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@Service
public class LimiteGrupoTestes {
 private final JdbcTemplate banco;private final CodificadorToken tokens;
 public LimiteGrupoTestes(JdbcTemplate banco,CodificadorToken tokens){this.banco=banco;this.tokens=tokens;}
 @Transactional(propagation=Propagation.REQUIRES_NEW,noRollbackFor=ResponseStatusException.class)
 public void verificar(String chave,int limite){
  int total=banco.queryForObject("INSERT INTO limite_acesso_paciente(chave,inicio_janela,tentativas) VALUES(?,now(),1) ON CONFLICT(chave) DO UPDATE SET tentativas=CASE WHEN limite_acesso_paciente.inicio_janela<now()-interval '15 minutes' THEN 1 ELSE limite_acesso_paciente.tentativas+1 END,inicio_janela=CASE WHEN limite_acesso_paciente.inicio_janela<now()-interval '15 minutes' THEN now() ELSE limite_acesso_paciente.inicio_janela END RETURNING tentativas",Integer.class,tokens.hash("grupo:"+chave));
  if(total>limite)throw CuidadoService.error(429,"Muitas tentativas. Aguarde antes de tentar novamente.");
 }
}
