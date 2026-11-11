import { describe, expect, it } from "vitest";
import { linkConvite } from "./ContasEquipe";

describe("convite de conta", () => {
  it("mantém o segredo no fragmento, fora dos logs de acesso", () => {
    const link = new URL(
      linkConvite("https://portal.exemplo.org", "a".repeat(43)),
    );
    expect(link.pathname).toBe("/ativar-conta");
    expect(link.search).toBe("");
    expect(link.hash).toBe(`#${"a".repeat(43)}`);
  });
});
