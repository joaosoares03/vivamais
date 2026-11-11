import * as Seletor from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { File as ArquivoLocal } from "expo-file-system";
import {
  LIMITE_OTIMIZADO,
  validarOriginal,
  type FotografiaPreparada,
} from "./tipos";

export async function selecionarFotografia(
  camera: boolean,
): Promise<FotografiaPreparada | null> {
  if (camera && !(await Seletor.requestCameraPermissionsAsync()).granted)
    throw new Error("Permita o uso da câmera ou escolha uma foto da galeria.");
  const opcoes: Seletor.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 1,
    exif: false,
  };
  const resultado = await (camera
    ? Seletor.launchCameraAsync(opcoes)
    : Seletor.launchImageLibraryAsync(opcoes));
  if (resultado.canceled) return null;
  const original = resultado.assets[0];
  if (!original) return null;
  const arquivo = new ArquivoLocal(original.uri);
  validarOriginal(
    original.fileSize ?? arquivo.size,
    original.width,
    original.height,
  );
  let lado = Math.min(2048, Math.max(original.width, original.height));
  for (
    let tentativa = 0;
    tentativa < 4;
    tentativa++, lado = Math.floor(lado * 0.75)
  ) {
    const contexto = ImageManipulator.manipulate(original.uri);
    contexto.resize(
      original.width >= original.height ? { width: lado } : { height: lado },
    );
    const imagem = await contexto.renderAsync();
    const salva = await imagem.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.8 - tentativa * 0.1,
    });
    contexto.release();
    imagem.release();
    const preparado = new ArquivoLocal(salva.uri);
    if (preparado.size <= LIMITE_OTIMIZADO)
      return {
        uri: salva.uri,
        largura: salva.width,
        altura: salva.height,
        tamanho: preparado.size,
        liberar: () => {
          if (preparado.exists) preparado.delete();
        },
      };
    preparado.delete();
  }
  throw new Error("Não foi possível preparar esta foto. Escolha outra imagem.");
}
