// Cobre URL, resultados e histórico da navegação no catálogo de NFTs.
import { expect, test, type Page } from "@playwright/test";

async function openCollectionFilter(page: Page) {
  const trigger = page.getByRole("button", { name: /Filtros/ });
  if (await trigger.isVisible()) await trigger.click();
  return page.getByRole("button", { name: /^Arte 3D/ });
}

test("sincroniza busca, coleção e histórico com a URL", async ({ page }) => {
  await page.goto("/mercado?scenario=default&page=3");
  await expect(page.getByRole("button", { name: "Página 3" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("searchbox", { name: "Buscar no catálogo" }).fill("Golden");
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("Golden");
  await expect.poll(() => new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(page.getByRole("heading", { name: "Golden Beat #207" })).toBeVisible();

  await (await openCollectionFilter(page)).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("collections"))
    .toBe(JSON.stringify(["arte-3d"]));
  await page.keyboard.press("Escape");

  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.get("collections")).toBeNull();
  await expect(page.getByRole("heading", { name: "Golden Beat #207" })).toBeVisible();
  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBeNull();
  await expect(page.getByRole("button", { name: "Página 3" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("ordena o catálogo por preço crescente", async ({ page, isMobile }) => {
  test.skip(isMobile, "O seletor de ordenação não aparece no frame mobile fornecido.");

  await page.goto("/mercado?scenario=default");
  await expect(page.getByText(/36 NFTs encontrados|40 NFTs encontrados/)).toBeVisible();
  await page.getByLabel("Ordenar por:").selectOption("price-asc");

  await expect.poll(() => new URL(page.url()).searchParams.get("sort")).toBe("price-asc");
  await expect(page.getByRole("heading", { name: /^Onyx Curator/ }).first()).toBeVisible();
});

test("paginação acompanha voltar do navegador", async ({ page }) => {
  await page.goto("/mercado?scenario=default");
  await page.getByRole("button", { name: "Página 2" }).click();

  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect(page.getByRole("button", { name: "Página 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(page.getByRole("button", { name: "Página 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("mostra estado vazio no cenário determinístico", async ({ page }) => {
  await page.goto("/mercado?scenario=empty");

  await expect(page.getByText("Nenhum NFT encontrado")).toBeVisible();
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);
});

test("mantém os resultados da última aba durante respostas com latência variável", async ({
  page,
}) => {
  await page.goto("/mercado?scenario=jitter");
  await expect(page.getByText(/36 NFTs encontrados|40 NFTs encontrados/)).toBeVisible();

  await page.getByRole("tab", { name: "Novos lançamentos" }).click();
  await page.getByRole("tab", { name: "Todos os NFTs" }).click();

  await expect(page.getByRole("tab", { name: "Todos os NFTs" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText(/36 NFTs encontrados|40 NFTs encontrados/)).toBeVisible();
});

test("filtra catálogo por faixa de preço digitada nos inputs e limpa o filtro", async ({
  page,
  isMobile,
}) => {
  await page.goto("/mercado?scenario=default");
  await expect(page.getByText(/36 NFTs encontrados|40 NFTs encontrados/)).toBeVisible();

  if (isMobile) {
    const trigger = page.getByRole("button", { name: /Filtros/ });
    await trigger.click();
  }

  const container = isMobile ? page.getByRole("dialog") : page.locator("aside");
  const minInput = container.getByLabel("Preço mínimo em ETH");
  const maxInput = container.getByLabel("Preço máximo em ETH");

  await expect(minInput).toBeVisible();
  await expect(maxInput).toBeVisible();

  await minInput.fill("0.50");
  await maxInput.fill("1.50");
  await container.getByRole("button", { name: "Aplicar" }).click();

  if (isMobile) {
    await page.keyboard.press("Escape");
  }

  await expect.poll(() => new URL(page.url()).searchParams.get("min")).toBe(JSON.stringify("0.50"));
  await expect.poll(() => new URL(page.url()).searchParams.get("max")).toBe(JSON.stringify("1.50"));

  if (isMobile) {
    const trigger = page.getByRole("button", { name: /Filtros/ });
    await trigger.click();
  }

  await container.getByRole("button", { name: "Limpar" }).click();

  if (isMobile) {
    await page.keyboard.press("Escape");
  }

  await expect.poll(() => new URL(page.url()).searchParams.has("min")).toBe(false);
  await expect.poll(() => new URL(page.url()).searchParams.has("max")).toBe(false);
});
