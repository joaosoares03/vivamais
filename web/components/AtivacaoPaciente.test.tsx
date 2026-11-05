import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { AtivacaoPaciente } from "./AtivacaoPaciente";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("mostra acesso demonstrativo sem controles ou emissão de SMS", async () => {
  const consulta = vi.fn().mockResolvedValue(Response.json({estado:"DEMONSTRACAO_HABILITADA",smsDisponivel:false,dispositivosAutorizados:0,envioSms:null}));
  vi.stubGlobal("fetch",consulta);
  render(<AtivacaoPaciente idPaciente="paciente-sintetico" />);
  await screen.findByRole("heading",{name:"Acesso demonstrativo habilitado"});
  expect(screen.queryByText("Ativar ou recuperar acesso")).toBeNull();
  expect(screen.queryByLabelText("Sua senha profissional")).toBeNull();
  expect(screen.queryByRole("button",{name:"Solicitar código por SMS"})).toBeNull();
  expect(consulta.mock.calls.every(([,opcoes])=>opcoes?.method!=="POST")).toBe(true);
});
it("solicita SMS com confirmação profissional sem exibir o código", async () => {
  let emitido = false;
  const consulta = vi.fn().mockImplementation((_url, opcoes) => {
    if (opcoes?.method === "POST") {
      emitido = true;
      return Promise.resolve(
        Response.json({
          idEnvio: "referencia-teste",
          estadoEnvio: "TESTE_LOCAL",
          expiraEm: new Date(Date.now() + 600000).toISOString(),
          provedor: "LOCAL",
        }),
      );
    }
    return Promise.resolve(
      Response.json({
        estado: emitido ? "AGUARDANDO_ATIVACAO" : "AGUARDANDO_EMISSAO",
        expiraEm: null,
        dispositivosAutorizados: 0,
        smsDisponivel: true,
        envioSms: emitido
          ? {
              idEnvio: "referencia-teste",
              estado: "TESTE_LOCAL",
              provedor: "LOCAL",
            }
          : null,
      }),
    );
  });
  vi.stubGlobal("fetch", consulta);
  render(<AtivacaoPaciente idPaciente="paciente-sintetico" />);
  await screen.findByText("Acesso ainda não ativado");
  fireEvent.click(
    screen.getByLabelText(
      "Conferi pessoalmente a identidade e o celular cadastrado.",
    ),
  );
  fireEvent.change(screen.getByLabelText("Sua senha profissional"), {
    target: { value: "credencial-exclusiva-do-teste" },
  });
  fireEvent.submit(
    screen.getByLabelText("Sua senha profissional").closest("form")!,
  );
  await screen.findByText(/Nenhum SMS real foi enviado/);
  const chamada = consulta.mock.calls.find(
    ([, opcoes]) => opcoes?.method === "POST",
  );
  expect(JSON.parse(chamada![1].body)).toEqual({
    senhaProfissional: "credencial-exclusiva-do-teste",
    identidadeConferida: true,
  });
  expect(screen.queryByLabelText("Código de ativação")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Aguarde um minuto para reenviar" }),
  ).toBeDisabled();
});
it("estado de ativação não recupera código usado ou expirado", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          Response.json({
            estado: "ATIVADO",
            expiraEm: null,
            dispositivosAutorizados: 1,
            smsDisponivel: true,
          }),
        ),
      ),
  );
  render(<AtivacaoPaciente idPaciente="paciente-sintetico" />);
  await screen.findByText("Acesso ativado");
  expect(screen.queryByLabelText("Código de ativação")).toBeNull();
});
it("falha do provedor informa o erro sem prometer envio", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation((_url, opcoes) =>
        Promise.resolve(
          opcoes?.method === "POST"
            ? Response.json(
                { detail: "SMS não enviado. Tente novamente após o prazo." },
                { status: 503 },
              )
            : Response.json({
                estado: "AGUARDANDO_EMISSAO",
                expiraEm: null,
                dispositivosAutorizados: 0,
                smsDisponivel: true,
              }),
        ),
      ),
  );
  render(<AtivacaoPaciente idPaciente="paciente-sintetico" />);
  await screen.findByText("Acesso ainda não ativado");
  fireEvent.submit(
    screen.getByLabelText("Sua senha profissional").closest("form")!,
  );
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain("SMS não enviado"),
  );
  expect(screen.queryByLabelText("Código de ativação")).toBeNull();
});
it("serviço não configurado bloqueia a solicitação", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          Response.json({
            estado: "AGUARDANDO_EMISSAO",
            expiraEm: null,
            dispositivosAutorizados: 0,
            smsDisponivel: false,
          }),
        ),
      ),
  );
  render(<AtivacaoPaciente idPaciente="paciente-sintetico" />);
  await screen.findByText(/Ativação por SMS indisponível/);
  expect(
    screen.getByRole("button", { name: "Solicitar código por SMS" }),
  ).toBeDisabled();
});
