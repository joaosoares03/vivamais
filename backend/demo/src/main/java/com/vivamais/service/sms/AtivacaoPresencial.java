package com.vivamais.service.sms;

/** Canal sem mensagem: o código é mostrado uma vez ao profissional, com o paciente à sua frente. */
public final class AtivacaoPresencial implements ServicoEnvioSms {
    public static final String PROVEDOR = "PRESENCIAL";
    @Override public String provedor() { return PROVEDOR; }
    @Override public boolean disponivel() { return true; }
    @Override public Resultado enviar(Mensagem mensagem) { return new Resultado(PROVEDOR, null); }
}
