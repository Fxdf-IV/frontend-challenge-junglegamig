// Verifica acesso direto, edição e ações do detalhe de um NFT.
import { expect, test } from "@playwright/test";

test("abre o detalhe direto e leva a edição selecionada ao carrinho", async ({ page }) => {
  await page.goto("/nft/emerald-ape-042?scenario=default");
  await expect(page.getByRole("heading", { name: "Emerald Ape #042" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Arte do NFT Emerald Ape #042" })).toBeVisible();

  const edition = page.getByRole("radio", { name: /^1\/10/ });
  await edition.locator("xpath=..").click();
  await expect(edition).toBeChecked();
  await expect.poll(() => new URL(page.url()).searchParams.get("edition")).toBe("1/10");

  const quantity = page.getByRole("group", { name: "Quantidade" });
  await quantity.getByRole("button", { name: "Aumentar quantidade" }).click();
  await expect(quantity.locator("output")).toHaveText("2");
  await page.getByRole("button", { name: /^Comprar( NFT)?$/ }).click();

  await expect(page).toHaveURL(/\/carrinho/);
  await expect(page.getByRole("link", { name: /Emerald Ape #042/ })).toBeVisible();
  await expect(page.getByText(/Edição 1\/10/)).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Quantidade de Emerald Ape #042" }).locator("output"),
  ).toHaveText("2");
});

test("informa quando o NFT não existe", async ({ page }) => {
  await page.goto("/nft/item-inexistente?scenario=default");

  await expect(page.getByRole("heading", { name: "NFT não encontrado" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver mercado" })).toBeVisible();
});

test("renderiza as miniaturas da galeria sem chaves React repetidas", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/nft/emerald-ape-042?scenario=default");
  await expect(page.getByRole("heading", { name: "Emerald Ape #042" })).toBeVisible();

  expect(consoleErrors.filter((message) => message.includes("same key"))).toEqual([]);
});

test("pede autenticação antes de favoritar como visitante", async ({ page }) => {
  await page.goto("/nft/emerald-ape-042?scenario=default");
  const favorite = page.getByRole("button", {
    name: /favoritar|adicionar aos favoritos/i,
  });
  await favorite.click();

  await expect(page).toHaveURL(/\/login\?/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
