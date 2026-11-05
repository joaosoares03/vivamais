export function validarApiExpoRemoto(valor) {
  let endereco;
  try {
    endereco = new URL(valor);
  } catch {
    throw new Error(
      "Defina a origem HTTPS da API de homologação. Nenhum túnel iniciado.",
    );
  }
  const nome = endereco.hostname.toLowerCase();
  const partes = nome.split(".").map(Number),
    ipv4 =
      partes.length === 4 &&
      partes.every((n) => Number.isInteger(n) && n >= 0 && n <= 255);
  const reservado =
    ipv4 &&
    (partes[0] === 0 ||
      partes[0] === 10 ||
      partes[0] === 127 ||
      (partes[0] === 100 && partes[1] >= 64 && partes[1] <= 127) ||
      (partes[0] === 169 && partes[1] === 254) ||
      (partes[0] === 172 && partes[1] >= 16 && partes[1] <= 31) ||
      (partes[0] === 192 && partes[1] === 168));
  if (
    endereco.protocol !== "https:" ||
    endereco.username ||
    endereco.password ||
    endereco.search ||
    endereco.hash ||
    endereco.pathname !== "/" ||
    reservado ||
    nome.includes(":") ||
    nome === "localhost" ||
    nome.endsWith(".localhost") ||
    nome.endsWith(".local") ||
    nome.endsWith(".invalid") ||
    nome.endsWith(".test") ||
    /^(?:.+\.)?example\.(?:com|org|net)$/.test(nome)
  )
    throw new Error(
      "Informe uma origem HTTPS real da API de homologação por convite. Não use localhost, rede privada, URL de exemplo ou credenciais.",
    );
  return endereco.origin;
}
