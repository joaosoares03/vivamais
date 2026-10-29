package com.vivamais.security;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import tools.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Set;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ProblemDetail;
import org.springframework.web.filter.OncePerRequestFilter;

/** Foundation JSON requests are small. Future file uploads must use an explicit, bounded flow. */
public final class FiltroLimiteRequisicao extends OncePerRequestFilter {
    public static final int MAX_BYTES=8192;
    private static final Set<String> BODY_METHODS=Set.of("POST","PUT","PATCH","DELETE");
    private final ObjectMapper mapper;
    public FiltroLimiteRequisicao(ObjectMapper mapper) { this.mapper=mapper; }
    @Override protected void doFilterInternal(HttpServletRequest requisicao,HttpServletResponse resposta,FilterChain chain)
            throws IOException,ServletException {
        if (!BODY_METHODS.contains(requisicao.getMethod())) { chain.doFilter(requisicao,resposta); return; }
        if (requisicao.getMethod().equals("POST") && requisicao.getRequestURI().matches("/api/v1/patients/[a-fA-F0-9-]{36}/files") && requisicao.getContentType()!=null && requisicao.getContentType().startsWith("multipart/form-data")) {
            // Servlet multipart resolver enforces 2 MB file / 3 MB total, including chunked requests.
            if(requisicao.getContentLengthLong()>3145728){reject(resposta);return;}chain.doFilter(requisicao,resposta);return;
        }
        int limit=requisicao.getRequestURI().startsWith("/api/v1/auth/")?MAX_BYTES:32768;
        if (requisicao.getContentLengthLong()>limit) { reject(resposta); return; }
        // Read at most MAX+1 even for chunked requests with no Content-Length header.
        byte[] bytes=requisicao.getInputStream().readNBytes(limit+1);
        if (bytes.length>limit) { reject(resposta); return; }
        var stream=new ByteArrayInputStream(bytes);
        HttpServletRequestWrapper bounded=new HttpServletRequestWrapper(requisicao) {
            private final ServletInputStream entrada=new ServletInputStream() {
                @Override public boolean isFinished() { return stream.available()==0; }
                @Override public boolean isReady() { return true; }
                @Override public void setReadListener(ReadListener listener) { throw new UnsupportedOperationException("Synchronous API only"); }
                @Override public int read() { return stream.read(); }
                @Override public int read(byte[] buffer,int offset,int length) { return stream.read(buffer,offset,length); }
            };
            @Override public ServletInputStream getInputStream() { return entrada; }
            @Override public int getContentLength() { return bytes.length; }
            @Override public long getContentLengthLong() { return bytes.length; }
        };
        chain.doFilter(bounded,resposta);
    }
    private void reject(HttpServletResponse resposta) throws IOException {
        var problem=ProblemDetail.forStatus(413);
        problem.setTitle("Solicitação muito grande"); problem.setDetail("O corpo da solicitação excede o limite permitido.");
        resposta.setStatus(413); resposta.setContentType("application/problem+json");
        mapper.writeValue(resposta.getOutputStream(),problem);
    }
}
