import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import type {
  OperacaoPendente,
  ArmazenamentoFila,
} from "./regrasSincronizacao";
let bancoLocal: Promise<SQLite.SQLiteDatabase> | null = null;
export async function abrirBancoProtegido() {
  if (!bancoLocal)
    bancoLocal = (async () => {
      let chave = await SecureStore.getItemAsync("viva.queue.key");
      if (!chave) {
        chave = Array.from(Crypto.getRandomBytes(32), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        await SecureStore.setItemAsync("viva.queue.key", chave, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
      if (!/^[a-f0-9]{64}$/.test(chave))
        throw new Error("Chave local inválida.");
      const db = await SQLite.openDatabaseAsync("viva-queue.db");
      await db.execAsync(`PRAGMA key = "x'${chave}'"`);
      const cipher = await db.getFirstAsync<Record<string, unknown>>(
        "PRAGMA cipher_version",
      );
      if (!cipher || !Object.values(cipher).some(Boolean)) {
        await db.closeAsync();
        throw new Error(
          "Esta instalação não oferece armazenamento protegido. Solicite à equipe a versão compatível antes de registrar dados sem conexão.",
        );
      }
      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS pending_operation(id TEXT PRIMARY KEY,owner TEXT NOT NULL,payload TEXT NOT NULL)",
      );
      return db;
    })().catch((e) => {
      bancoLocal = null;
      throw e;
    });
  return bancoLocal;
}
export const armazenamentoFila: ArmazenamentoFila = {
  async read(idTitular) {
    return (
      await (
        await abrirBancoProtegido()
      ).getAllAsync<{ payload: string }>(
        "SELECT payload FROM pending_operation WHERE owner=?",
        idTitular,
      )
    ).map((x) => JSON.parse(x.payload) as OperacaoPendente);
  },
  async put(x) {
    await (
      await abrirBancoProtegido()
    ).runAsync(
      "INSERT INTO pending_operation(id,owner,payload) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload WHERE pending_operation.owner=excluded.owner",
      x.id,
      x.owner,
      JSON.stringify(x),
    );
  },
  async remove(id) {
    await (
      await abrirBancoProtegido()
    ).runAsync("DELETE FROM pending_operation WHERE id=?", id);
  },
};
export const descricaoArmazenamentoFila =
  "Fila local criptografada neste aparelho. Registros pendentes ficam disponíveis para esta mesma conta após entrar novamente.";
