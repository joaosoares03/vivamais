package com.vivamais.service;

import static org.assertj.core.api.Assertions.*;
import java.nio.file.*;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class ArmazenamentoArquivosTest {
    @TempDir Path pasta;
    private String chaveArquivo(){return Base64.getEncoder().encodeToString(new byte[32]);}
    @Test void chaveNovaUsaApikeySemBearerELegadaMantemCompatibilidade() throws Exception {
        String objeto=UUID.randomUUID()+".bin";
        var novo=new ArmazenamentoArquivos(pasta.toString(),chaveArquivo(),"supabase","https://projeto.supabase.co","privado","sb_secret_teste");
        var requisicao=novo.requisicao(objeto).GET().build();
        assertThat(requisicao.headers().firstValue("apikey")).contains("sb_secret_teste");
        assertThat(requisicao.headers().firstValue("Authorization")).isEmpty();
        assertThat(requisicao.uri().getPath()).isEqualTo("/storage/v1/object/privado/"+objeto);
        var legado=new ArmazenamentoArquivos(pasta.toString(),chaveArquivo(),"supabase","https://projeto.supabase.co","privado","jwt-legado-de-teste");
        assertThat(legado.requisicao(objeto).GET().build().headers().firstValue("Authorization")).contains("Bearer jwt-legado-de-teste");
        assertThatThrownBy(()->novo.requisicao("../segredo")).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void recusaChavePublicaEPreservaCifraAutenticadaNaLeituraLocal() throws Exception {
        assertThatThrownBy(()->new ArmazenamentoArquivos(pasta.toString(),chaveArquivo(),"supabase","https://projeto.supabase.co","privado","sb_publishable_teste")).isInstanceOf(IllegalStateException.class);
        var local=new ArmazenamentoArquivos(pasta.toString(),chaveArquivo(),"local","","","");
        String objeto=UUID.randomUUID()+".bin"; byte[] imagem="imagem-sintetica-unitaria".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        local.put(objeto,imagem);
        assertThat(local.get(objeto)).isEqualTo(imagem);
        byte[] cifrada=Files.readAllBytes(pasta.resolve(objeto));
        assertThat(new String(cifrada,java.nio.charset.StandardCharsets.ISO_8859_1)).doesNotContain("imagem-sintetica-unitaria");
        cifrada[cifrada.length-1]^=1; Files.write(pasta.resolve(objeto),cifrada);
        assertThatThrownBy(()->local.get(objeto)).isInstanceOf(javax.crypto.AEADBadTagException.class);
    }
}
