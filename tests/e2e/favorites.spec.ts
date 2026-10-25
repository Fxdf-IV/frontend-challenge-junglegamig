// Cobre o acesso, a persistência e a recuperação de falhas nos favoritos.
import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, email = "ana@kurio.dev") {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill(email);
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

async function favoriteRequest(page: Page, id: string, method: "PUT" | "DELETE") {
  return page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/favorites/${id}` &&
      response.request().method() === method,
  );
}

function detailFavorite(page: Page) {
  return page.getByRole("button", {
    name: /^(Adicionar aos|Remover dos) favoritos$|^Favorita(r|do)$/i,
  });
}

test("visitante recebe convite para entrar e volta aos favoritos", async ({ page }) => {
  await page.goto("/favoritos?scenario=default");

  await expect(page.getByText("Entre na sua conta para consultar seus favoritos.")).toBeVisible();
  await page.locator('main a[href="/login?redirect=%2Ffavoritos"]').click();
  await expect(page).toHaveURL(/\/login\?redirect=%2Ffavoritos/);

  await loginAs(page);
  await expect(page).toHaveURL(/\/favoritos/);
  await expect(page.getByRole("heading", { name: "Favoritos" })).toBeVisible();
});

test("adiciona e remove um NFT e mantém a lista após atualizar", async ({ page }) => {
  await page.goto("/login?redirect=%2Fnft%2Fgolden-beat-207&scenario=default");
  await loginAs(page);

  const favorite = detailFavorite(page);
  await expect(favorite).toHaveAttribute("aria-pressed", "false");
  const addResponse = favoriteRequest(page, "golden-beat-207", "PUT");
  await favorite.click();
  expect((await addResponse).status()).toBe(200);
  await expect(detailFavorite(page)).toHaveAttribute("aria-pressed", "true");

  await page.goto("/favoritos");
  await expect(page.getByRole("link", { name: /Golden Beat #207/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: /Golden Beat #207/ })).toBeVisible();
});

test("rollback de falha restaura o favorito e permite tentar novamente", async ({ page }) => {
  await page.goto("/nft/emerald-ape-042?scenario=favorite-fail");
  await detailFavorite(page).click();
  await expect(page).toHaveURL(/\/login\?/);
  await loginAs(page);
  await expect(page).toHaveURL(/\/nft\/emerald-ape-042\?scenario=favorite-fail/);

  const remove = detailFavorite(page);
  await expect(remove).toHaveAttribute("aria-pressed", "true");
  const failedResponse = favoriteRequest(page, "emerald-ape-042", "DELETE");
  await remove.click();
  expect((await failedResponse).status()).toBe(500);
  await expect(detailFavorite(page)).toHaveAttribute("aria-pressed", "true");

  await page.evaluate(async () => {
    await fetch("/api/__mock/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: "default" }),
    });
  });
  const recoveredResponse = favoriteRequest(page, "emerald-ape-042", "DELETE");
  await detailFavorite(page).click();
  expect((await recoveredResponse).status()).toBe(200);
  await expect(detailFavorite(page)).toHaveAttribute("aria-pressed", "false");
});

test("mostra o estado vazio para uma conta sem favoritos", async ({ page }) => {
  await page.goto("/login?redirect=%2Ffavoritos&scenario=default");
  await loginAs(page, "bruno@kurio.dev");

  await expect(page).toHaveURL(/\/favoritos/);
  await expect(page.getByText("Você ainda não salvou nenhum NFT.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar NFTs" })).toBeVisible();
});
