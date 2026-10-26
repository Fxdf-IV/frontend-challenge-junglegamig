// Comprova deduplicação, descarte de versões antigas, retomada de pedido pendente e imutabilidade do recibo.
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

test("ignora eventos nft.updated duplicados e antigos e aplica versão mais nova", async ({
  page,
}) => {
  await loginAsAna(page);
  await addGoldenBeat(page);

  const summary = page.getByRole("complementary");
  await expect(summary.getByText("0.99 ETH", { exact: true })).toBeVisible();

  let cartReads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/cart" && request.method() === "GET") {
      cartReads += 1;
    }
  });

  // Emite versão 2 com preço 1.04 ETH e aguarda reconciliação no resumo.
  const v2Status = await page.evaluate(async () =>
    fetch("/api/__mock/nft-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "golden-beat-207", edition: "1/50", price: "1.04" }),
    }).then((response) => response.status),
  );
  expect(v2Status).toBe(200);
  await expect(summary.getByText("1.04 ETH", { exact: true })).toBeVisible();
  const readsAfterV2 = cartReads;

  // Reenvia o mesmo evento (duplicado) e uma versão anterior (stale): ambos devem ser descartados.
  const dupStatus = await page.evaluate(async () =>
    fetch("/api/__mock/socket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    }).then((response) => response.status),
  );
  const staleStatus = await page.evaluate(async () =>
    fetch("/api/__mock/socket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stale" }),
    }).then((response) => response.status),
  );
  expect(dupStatus).toBe(200);
  expect(staleStatus).toBe(200);

  // Aguarda janela assíncrona para entrega e descarte dos eventos Socket.IO duplicados/antigos
  await page.waitForTimeout(500);
  expect(cartReads).toBe(readsAfterV2);

  // Emite versão 3 com preço 1.12 ETH: apenas esta versão inédita deve disparar nova leitura.
  const v3Status = await page.evaluate(async () =>
    fetch("/api/__mock/nft-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "golden-beat-207", edition: "1/50", price: "1.12" }),
    }).then((response) => response.status),
  );
  expect(v3Status).toBe(200);
  await expect(summary.getByText("1.12 ETH", { exact: true })).toBeVisible();
  expect(cartReads).toBe(readsAfterV2 + 1);
});

test("retoma pedido pendente após queda do socket sem nova compra e preserva snapshot do recibo", async ({
  page,
}) => {
  await loginAsAna(page);
  await addGoldenBeat(page);

  await page.getByRole("button", { name: "Concluir e finalizar" }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await page.getByRole("button", { name: "Conectar carteira" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Aprovar conexão" }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();

  let orderPosts = 0;
  let cartReads = 0;
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/orders" && request.method() === "POST") orderPosts += 1;
    if (pathname === "/api/cart" && request.method() === "GET") cartReads += 1;
  });

  await page.getByRole("dialog").getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page).toHaveURL(/\/pedido\/ord_/);
  await expect(page.getByRole("heading", { name: /Aguardando confirmação da rede/ })).toBeVisible();

  // Derruba a conexão Socket.IO durante o pedido pendente e verifica a retomada pelo aviso do checkout.
  const dropped = await page.evaluate(async () =>
    fetch("/api/__mock/socket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "drop" }),
    }).then((response) => response.status),
  );
  expect(dropped).toBe(200);

  await page.goto("/checkout");
  await expect(page.getByText("Você tem um pedido em processamento.")).toBeVisible();
  await page.getByRole("link", { name: "Acompanhar pedido" }).click();
  await expect(page).toHaveURL(/\/pedido\/ord_/);

  const receiptDialog = page.getByRole("dialog");
  await expect(receiptDialog.getByRole("heading", { name: "Pedido confirmado" })).toBeVisible({
    timeout: 10000,
  });
  await expect(receiptDialog.getByText("0.9942 ETH").first()).toBeVisible();
  expect(orderPosts).toBe(1);

  // Reenvia order.updated duplicado e obsoleto e altera o catálogo: o recibo é snapshot e não muda.
  const readsAfterConfirm = cartReads;
  await page.evaluate(async () => {
    await fetch("/api/__mock/socket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    await fetch("/api/__mock/socket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stale" }),
    });
    await fetch("/api/__mock/nft-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "golden-beat-207", edition: "1/50", price: "1.35" }),
    });
  });

  // Aguarda janela assíncrona para entrega e descarte no cliente dos eventos de pedido e catálogo
  await page.waitForTimeout(500);
  expect(cartReads).toBe(readsAfterConfirm);
  await expect(receiptDialog.getByText("0.9942 ETH").first()).toBeVisible();
  await expect(receiptDialog.getByText("1.35 ETH")).toHaveCount(0);
});
