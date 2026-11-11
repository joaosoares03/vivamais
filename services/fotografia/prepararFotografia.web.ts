import {
  LIMITE_ORIGINAL,
  LIMITE_OTIMIZADO,
  validarOriginal,
  type FotografiaPreparada,
} from "./tipos";

// O seletor é aberto antes de qualquer await, preservando o gesto no Safari.
export function selecionarFotografia(
  camera: boolean,
): Promise<FotografiaPreparada | null> {
  return new Promise((resolver, rejeitar) => {
    const entrada = document.createElement("input");
    entrada.type = "file";
    entrada.accept = "image/jpeg,image/png,image/heic,image/heif";
    if (camera) entrada.setAttribute("capture", "environment");
    entrada.hidden = true;
    document.body.appendChild(entrada);
    entrada.oncancel = () => {
      entrada.remove();
      resolver(null);
    };
    entrada.onchange = () => {
      const arquivo = entrada.files?.[0];
      entrada.remove();
      if (!arquivo) {
        resolver(null);
        return;
      }
      prepararArquivo(arquivo).then(resolver, rejeitar);
    };
    entrada.click();
  });
}

export async function prepararArquivo(
  arquivo: File,
): Promise<FotografiaPreparada> {
  if (!arquivo.size || arquivo.size > LIMITE_ORIGINAL)
    throw new Error(
      "Escolha uma foto de até 10 MB. As fotos aceitas são reduzidas automaticamente.",
    );
  const assinatura = new Uint8Array(await arquivo.slice(0, 32).arrayBuffer());
  const jpeg =
    assinatura[0] === 255 && assinatura[1] === 216 && assinatura[2] === 255;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every(
    (valor, indice) => assinatura[indice] === valor,
  );
  const heic =
    String.fromCharCode(...assinatura.slice(4, 8)) === "ftyp" &&
    /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(
      String.fromCharCode(...assinatura.slice(8, 12)),
    );
  if (!jpeg && !png && !heic)
    throw new Error("Escolha uma foto JPEG, PNG ou HEIC válida.");
  // O MIME informado pelo seletor não é usado como prova do conteúdo.
  const uri = URL.createObjectURL(arquivo);
  const imagem = new Image();
  try {
    await new Promise<void>((resolver, rejeitar) => {
      const tempo = setTimeout(
        () =>
          rejeitar(
            new Error("A foto demorou para abrir. Escolha outra imagem."),
          ),
        20000,
      );
      imagem.onload = () => {
        clearTimeout(tempo);
        resolver();
      };
      imagem.onerror = () => {
        clearTimeout(tempo);
        rejeitar(
          new Error(
            "Este navegador não conseguiu abrir a foto. Use JPEG ou PNG, ou tire outra foto pela câmera. HEIC depende do suporte do navegador.",
          ),
        );
      };
      imagem.src = uri;
    });
    validarOriginal(arquivo.size, imagem.naturalWidth, imagem.naturalHeight);
    // Image aplica a orientação EXIF; canvas regrava somente os pixels, sem GPS/EXIF.
    const tela = document.createElement("canvas");
    const proporcao = Math.min(
      1,
      2048 / Math.max(imagem.naturalWidth, imagem.naturalHeight),
    );
    tela.width = Math.round(imagem.naturalWidth * proporcao);
    tela.height = Math.round(imagem.naturalHeight * proporcao);
    const contexto = tela.getContext("2d");
    if (!contexto)
      throw new Error("Não foi possível preparar a foto neste navegador.");
    try {
      for (let tentativa = 0; tentativa < 4; tentativa++) {
        contexto.fillStyle = "#fff";
        contexto.fillRect(0, 0, tela.width, tela.height);
        contexto.drawImage(imagem, 0, 0, tela.width, tela.height);
        const dados = await new Promise<Blob>((resolver, rejeitar) =>
          tela.toBlob(
            (valor) =>
              valor
                ? resolver(valor)
                : rejeitar(new Error("Não foi possível preparar a foto.")),
            "image/jpeg",
            0.82 - tentativa * 0.12,
          ),
        );
        if (dados.size <= LIMITE_OTIMIZADO) {
          const pronta = new File([dados], "foto.jpg", { type: "image/jpeg" });
          const previa = URL.createObjectURL(pronta);
          return {
            uri: previa,
            arquivo: pronta,
            largura: tela.width,
            altura: tela.height,
            tamanho: pronta.size,
            liberar: () => URL.revokeObjectURL(previa),
          };
        }
        tela.width = Math.round(tela.width * 0.75);
        tela.height = Math.round(tela.height * 0.75);
      }
      throw new Error(
        "Não foi possível preparar esta foto. Escolha outra imagem.",
      );
    } finally {
      tela.width = 0;
      tela.height = 0;
    }
  } finally {
    imagem.src = "";
    URL.revokeObjectURL(uri);
  }
}
