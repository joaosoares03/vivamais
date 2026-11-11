package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;
import java.util.Map;
public interface ProvedorAnaliseAlimentacao {
 record Contexto(String provedor,String versaoModelo,String versaoCriterios,String referenciaAprovacao,String versaoContrato) {}
 boolean enabled();
 Contexto contexto();
 Map<String,Object> assess(byte[] privateImage) throws Exception;
}
