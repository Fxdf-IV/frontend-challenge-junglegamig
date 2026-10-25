// Verifica edição de perfil, segurança de senha e carteiras nos dois viewports.
import { expect, test, type Page } from "@playwright/test";

/** Autentica uma conta de teste e aguarda a rota privada ficar disponível. */
async function loginAs(page: Page, email: string) {
  await page.goto("/login?scenario=default");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill(email);
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** Confirma que o viewport mobile não ganha rolagem horizontal. */
async function expectNoHorizontalOverflow(page: Page) {
  if (page.viewportSize()?.width === 390) {
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  }
}

test("valida limites dos metadados ENS e salva os valores aceitos", async ({ page }) => {
  await loginAs(page, "ana@kurio.dev");
  await page.goto("/perfil");
  const ens = page.getByLabel("Nome ENS *");
  const nickname = page.getByLabel("Apelido da carteira *");

  await ens.fill("a".repeat(64));
  await nickname.fill("n".repeat(41));
  await page.getByRole("button", { name: "Salvar" }).first().click();
  await expect(page.getByText("Informe seu nome ENS")).toBeVisible();
  await expect(page.getByText("Informe o apelido da carteira")).toBeVisible();

  await ens.fill("ana-nova");
  await nickname.fill("Fria principal");
  const update = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/me" && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Salvar" }).first().click();
  expect((await update).status()).toBe(200);
  await expect(page.getByText("Perfil atualizado")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.reload();
  await expect(page.getByLabel("Nome ENS *")).toHaveValue("ana-nova");
  await expect(page.getByLabel("Apelido da carteira *")).toHaveValue("Fria principal");
});

test("envia, salva e remove um avatar", async ({ page }) => {
  await loginAs(page, "ana@kurio.dev");
  await page.goto("/perfil");
  await page.getByLabel("Avatar").setInputFiles("public/favicon.png");
  await expect(page.getByRole("img", { name: "Seu avatar" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Salvar" }).first().click();
  await expect(page.getByText("Perfil atualizado")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("img", { name: "Seu avatar" })).toBeVisible();

  await page.getByRole("button", { name: "Remover" }).click();
  await page.getByRole("button", { name: "Salvar" }).first().click();
  await expect(page.getByText("Perfil atualizado")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("img", { name: "Seu avatar" })).toHaveCount(0);
});

test("valida a senha atual e salva uma nova senha", async ({ page }) => {
  await loginAs(page, "ana@kurio.dev");
  await page.goto("/perfil");
  const form = page
    .locator("form")
    .filter({ has: page.getByRole("heading", { name: "Alterar senha" }) });
  await form.getByLabel("Senha atual").fill("senha-incorreta");
  await form.getByLabel("Nova senha", { exact: true }).fill("NovaSenha123");
  await form.getByLabel("Confirmar nova senha").fill("NovaSenha123");
  await form.getByRole("button", { name: "Salvar" }).click();
  await expect(form.getByText("Senha atual incorreta")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await form.getByLabel("Senha atual").fill("Kurio@123");
  const update = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/me/password" &&
      response.request().method() === "POST",
  );
  await form.getByRole("button", { name: "Salvar" }).click();
  expect((await update).status()).toBe(204);
  await expect(page.getByText("Senha alterada")).toBeVisible();
  await expect(form.getByLabel("Senha atual")).toHaveValue("");
});

test("cria e edita carteiras principal e secundária com validação de endereço", async ({
  page,
}) => {
  await loginAs(page, "bruno@kurio.dev");
  await page.goto("/carteiras");
  const primary = page.locator("form[aria-labelledby='primary-title']");
  const secondary = page.locator("form[aria-labelledby='secondary-title']");

  await primary.getByLabel("Nome da carteira *").fill("Bruno principal");
  await primary.getByLabel("Tipo de carteira *").selectOption("coinbase");
  await primary.getByLabel("Endereço da carteira *").fill("invalid");
  await primary.getByLabel("Rede *").selectOption("ethereum");
  await primary.getByRole("button", { name: "Adicionar" }).click();
  await expect(primary.getByText("Use 0x seguido de 40 caracteres hexadecimais")).toBeVisible();

  await primary
    .getByLabel("Endereço da carteira *")
    .fill("0xB000000000000000000000000000000000000001");
  await primary.getByLabel("Rede *").selectOption("polygon");
  await primary.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Carteira cadastrada")).toBeVisible();
  await expect(primary.getByRole("button", { name: "Editar" })).toBeVisible();

  await secondary.getByLabel("Nome da carteira *").fill("Bruno secundária");
  await secondary.getByLabel("Tipo de carteira *").selectOption("walletconnect");
  await secondary.getByLabel("Endereço da carteira *").fill("11111111111111111111111111111111");
  await secondary.getByLabel("Rede *").selectOption("solana");
  await secondary.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Carteira cadastrada")).toBeVisible();

  await primary.getByRole("button", { name: "Editar" }).click();
  await primary.getByLabel("Nome da carteira *").fill("Bruno frio");
  await primary.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Carteira atualizada")).toBeVisible();
  await expect(primary.getByLabel("Nome da carteira *")).toHaveValue("Bruno frio");

  await secondary.getByRole("button", { name: "Editar" }).click();
  await secondary.getByLabel("Nome da carteira *").fill("Bruno solana");
  await secondary.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Carteira atualizada")).toBeVisible();
  await expect(secondary.getByLabel("Nome da carteira *")).toHaveValue("Bruno solana");
  await expectNoHorizontalOverflow(page);
});
