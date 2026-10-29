package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;
import java.nio.file.Path;
public interface ProvedorOcr {
 record Resultado(String texto,double confianca,String versaoModelo) {}
 Resultado reconhecer(Path image) throws Exception;
 default String versaoCriterios(){return "ocr-safety-v1";}
}
