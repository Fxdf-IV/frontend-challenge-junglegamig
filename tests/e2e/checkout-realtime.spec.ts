// Comprova atualização do pedido e recuperação do carrinho pelo socket real.
import { expect, test, type Page } from "@playwright/test";

/** Autentica Ana e espera que o canal de tempo real esteja conectado. */
async function loginAsAna(page: Page) {
  await page.goto("/login?scenario=default");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await expectRealtimeStatus(page, "connected");
}

/** Confirma o estado exibido pelo painel de desenvolvimento sem deixá-lo aberto. */
async function expectRealtimeStatus(page: Page, status: "connected" | "disconnected") {
  await page.getByRole("button", { name: "Abrir painel de cenários de simulação" }).click();
  await expect(page.getByText(`Eventos Socket.IO (${status})`)).toBeVisible({ timeout: 10000 });
  await page.keyboard.press("Escape");
}

/** Adiciona o NFT de teste ao carrinho através do fluxo público da interface. */
async function addGoldenBeat(page: Page) {
  await page.goto("/nft/golden-beat-207");
  const response = page.waitForResponse(
    (res) => new URL(res.url()).pathname === "/api/cart/items" && res.request().method() === "POST",
  );
  await page.getByRole("button", { name: /Comprar/ }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(/\/carrinho/);
}

/** Aprova a conexão simulada e abre a revisão do pedido. */
async function openCheckoutReview(page: Page) {
  await page.getByRole("button", { name: "Concluir e finalizar" }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await page.getByRole("button", { name: "Conectar carteira" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Aprovar conexão" }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Revise seu pedido" }),
  ).toBeVisible();
}

test("confirma o pedido pendente pelo evento Socket.IO antes do polling", async ({ page }) => {
  await loginAsAna(page);
  await addGoldenBeat(page);
  await openCheckoutReview(page);
  let orderReads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/orders/")) orderReads += 1;
  });

  const created = page.waitForResponse(
    (res) => new URL(res.url()).pathname === "/api/orders" && res.request().method() === "POST",
  );
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar compra" }).click();
  expect((await created).status()).toBe(201);
  await expect(page).toHaveURL(/\/pedido\/ord_/);
  await expect(page.getByRole("heading", { name: /Aguardando confirmação da rede/ })).toBeVisible();
  await expect(page.locator("div.sr-only[aria-live='polite']")).toHaveText("Pedido confirmado", {
    timeout: 7000,
  });
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Pedido confirmado" }),
  ).toBeVisible();
  expect(orderReads).toBeLessThanOrEqual(1);
});

test("atualiza cotação no checkout via Socket.IO quando preço muda ou edição esgota", async ({
  page,
}) => {
  await loginAsAna(page);
  await addGoldenBeat(page);
  await openCheckoutReview(page);

  const reviewDialog = page.getByRole("dialog");
  await expect(reviewDialog.getByRole("button", { name: "Confirmar compra" })).toBeEnabled();

  // Simula alteração de preço via endpoint de mock que emite `nft.updated` no Socket.IO.
  const priceUpdated = await page.evaluate(async () =>
    fetch("/api/__mock/nft-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "golden-beat-207", edition: "1/50", price: "1.04" }),
    }).then((response) => response.status),
  );
  expect(priceUpdated).toBe(200);

  await expect(
    reviewDialog.getByText(
      "Preço, disponibilidade ou taxas mudaram. Revise os novos valores antes de confirmar.",
    ),
  ).toBeVisible();
  await expect(reviewDialog.getByText("1.04 ETH").first()).toBeVisible();
  await expect(reviewDialog.getByRole("button", { name: "Confirmar novos valores" })).toBeEnabled();

  // Simula esgotamento da edição via Socket.IO e verifica bloqueio da confirmação.
  const soldOutUpdated = await page.evaluate(async () =>
    fetch("/api/__mock/nft-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "golden-beat-207", edition: "1/50", available: 0 }),
    }).then((response) => response.status),
  );
  expect(soldOutUpdated).toBe(200);

  await expect(
    reviewDialog.getByRole("button", { name: "Confirmar novos valores" }),
  ).toBeDisabled();
  await expect(page.getByRole("link", { name: "ajustar carrinho" })).toBeVisible();
});

test("reconecta o socket e reconcilia carrinho e cotação pela API", async ({ page }) => {
  await loginAsAna(page);
  await addGoldenBeat(page);
  await expect(page.getByRole("link", { name: "Golden Beat #207" })).toBeVisible();

  const cartReads: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/cart" && request.method() === "GET") {
      cartReads.push(request.url());
    }
  });
  const baselineCartReads = cartReads.length;
  const dropped = await page.evaluate(async () =>
    fetch("/api/__mock/socket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "drop" }),
    }).then((response) => response.status),
  );
  expect(dropped).toBe(200);
  await expectRealtimeStatus(page, "disconnected");

  const updated = await page.evaluate(async () =>
    fetch("/api/__mock/nft-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "golden-beat-207", edition: "1/50", price: "1.04" }),
    }).then((response) => response.status),
  );
  expect(updated).toBe(200);
  await expectRealtimeStatus(page, "connected");
  await expect.poll(() => cartReads.length).toBeGreaterThan(baselineCartReads);
  await expect(page.getByText("1.04 ETH", { exact: true }).first()).toBeVisible();
});
