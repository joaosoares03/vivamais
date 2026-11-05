import { describe, expect, it } from "vitest";
import { reunirExportacaoPaciente } from "./exportacaoPaciente";

describe("exportação com todas as páginas", () => {
  it("reúne mais de vinte registros, transmite filtros e confere o corte em todas as categorias", async () => {
    const caminhos: string[] = [];
    const arquivo = await reunirExportacaoPaciente(
      async (caminho) => {
        caminhos.push(caminho);
        const url = new URL(caminho, "https://teste.invalid");
        const pagina = Number(url.searchParams.get("pagina")),
          pressao = url.pathname.endsWith("PRESSAO");
        const total = pressao ? 143 : 0;
        return {
          itens: pressao
            ? Array.from({ length: pagina === 0 ? 100 : 43 }, (_, indice) => ({
                id: `registro-${pagina * 100 + indice}`,
              }))
            : [],
          total,
          pagina,
          tamanho: 100,
          corteCriacao: "2026-11-03T15:00:00Z",
        };
      },
      "paciente",
      "2026-01-01",
      "2026-11-03",
    );
    expect(arquivo.quantidade).toBe(143);
    expect(arquivo.registros.PRESSAO).toHaveLength(143);
    expect(caminhos).toHaveLength(9);
    expect(
      caminhos.every(
        (caminho) =>
          caminho.includes("inicio=2026-01-01") &&
          caminho.includes("fim=2026-11-03"),
      ),
    ).toBe(true);
    expect(
      caminhos.slice(1).every((caminho) => caminho.includes("corteCriacao=")),
    ).toBe(true);
  });
  it("recusa páginas truncadas ou duplicadas sem declarar arquivo completo", async () => {
    await expect(
      reunirExportacaoPaciente(
        async () => ({
          itens: [],
          total: 2,
          pagina: 0,
          tamanho: 100,
          corteCriacao: "teste",
        }),
        "paciente",
      ),
    ).rejects.toThrow("incompleta");
    await expect(
      reunirExportacaoPaciente(
        async () => ({
          itens: [{ id: "duplicado" }, { id: "duplicado" }],
          total: 2,
          pagina: 0,
          tamanho: 100,
          corteCriacao: "teste",
        }),
        "paciente",
      ),
    ).rejects.toThrow("conferir");
  });
});
