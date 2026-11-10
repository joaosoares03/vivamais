import qrcode from "qrcode-generator";

const MARGEM = 4;

/** Traça os módulos escuros como um único caminho SVG: sem canvas, imagem externa nem estilo inline (CSP). */
export function caminhoQrCode(texto: string) {
  const qr = qrcode(0, "M");
  qr.addData(texto);
  qr.make();
  const modulos = qr.getModuleCount();
  let caminho = "";
  for (let linha = 0; linha < modulos; linha += 1)
    for (let coluna = 0; coluna < modulos; coluna += 1)
      if (qr.isDark(linha, coluna))
        caminho += `M${coluna + MARGEM} ${linha + MARGEM}h1v1h-1z`;
  return { caminho, lado: modulos + MARGEM * 2 };
}

export function QrCodeAutenticador({ endereco }: { endereco: string }) {
  const { caminho, lado } = caminhoQrCode(endereco);
  return (
    <svg
      className="qr-autenticador"
      role="img"
      aria-label="QR code para o aplicativo autenticador"
      viewBox={`0 0 ${lado} ${lado}`}
      shapeRendering="crispEdges"
    >
      <rect width={lado} height={lado} fill="#ffffff" />
      <path d={caminho} fill="#000000" />
    </svg>
  );
}
