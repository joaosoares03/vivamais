export type LoginInput = {
  email: string;
  password: string;
  codigoMfa?: string;
};

export function parseLogin(entrada: {
  email: unknown;
  password: unknown;
  codigoMfa?: unknown;
}): LoginInput | null {
  if (typeof entrada.email !== "string" || typeof entrada.password !== "string")
    return null;
  const email = entrada.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return null;
  // Login aceita senhas existentes; política de criação pertence ao backend.
  if (entrada.password.length < 1 || entrada.password.length > 128) return null;
  const codigoMfa =
    typeof entrada.codigoMfa === "string" ? entrada.codigoMfa.trim() : "";
  if (codigoMfa.length > 32) return null;
  return codigoMfa
    ? { email, password: entrada.password, codigoMfa }
    : { email, password: entrada.password };
}

export function origemPermitida(
  origin: string | null,
  requestUrl: string,
  configuredOrigin?: string,
): boolean {
  if (!origin || origin === "null") return false;
  try {
    const expected = new URL(configuredOrigin || requestUrl).origin;
    return new URL(origin).origin === expected && origin === expected;
  } catch {
    return false;
  }
}

export function origemPublica(
  requestUrl: string,
  servidor: string | null,
  configuredOrigin?: string,
): string {
  if (configuredOrigin) return new URL(configuredOrigin).origin;
  const url = new URL(requestUrl);
  // NextRequest normaliza 127.0.0.1 para localhost; preserve Host local para o cookie não mudar de domínio no redirect.
  if (
    url.protocol === "http:" &&
    servidor &&
    /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(servidor)
  ) {
    return `http://${servidor}`;
  }
  return url.origin;
}

export function podeAcessarPortal(role: string): boolean {
  return role === "PROFESSIONAL" || role === "ADMIN";
}

export function idPacienteValido(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    valor,
  );
}
