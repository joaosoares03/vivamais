import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import path from "node:path";
test("build do grupo mostra convite privado, recusa formato inválido e não oferece CPF/SMS",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("http://127.0.0.1:8084/acesso");await expect(page).toHaveURL(/\/convite$/);await expect(page.getByRole("heading",{name:"Entrar nos testes do Viva+"})).toBeVisible();await expect(page.getByTestId("cpf-input")).toHaveCount(0);await expect(page.getByLabel("Código de ativação")).toHaveCount(0);
 const diretorio=path.resolve("docs/evidencias/medicamentos-grupo-2026-11-04");await mkdir(diretorio,{recursive:true});await page.screenshot({path:path.join(diretorio,"app-convite-privado-390.png"),fullPage:true});
 await page.getByTestId("convite-input").fill("convite-invalido");await page.getByRole("button",{name:"ENTRAR",exact:true}).click();await expect(page.getByText("Confira o convite recebido do responsável pelos testes.",{exact:true})).toBeVisible();await expect(page).toHaveURL(/\/convite$/);
});
