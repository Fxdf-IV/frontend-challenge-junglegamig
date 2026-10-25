// Verifica recusas e reenvio seguro de pedidos no fluxo de checkout.
import { expect, test, type Page } from "@playwright/test";

/** Autentica a usuária de teste e aguarda o redirecionamento. */
async function loginAsAna(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** Prepara a cotação e abre a revisão com a carteira simulada conectada. */
async function prepareReview(page: Page, scenario: string) {
  await page.goto(`/login?scenario=${scenario}`);
  await loginAsAna(page);
  await page.goto("/nft/golden-beat-207");
  const addResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/cart/items" &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: /Comprar/ }).click();
  expect((await addResponse).status()).toBe(200);
  await page.getByRole("button", { name: "Concluir e finalizar" }).click();
  await page.getByRole("button", { name: "Conectar carteira" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Aprovar conexão" }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  const review = page.getByRole("dialog");
  await expect(review.getByRole("heading", { name: "Revise seu pedido" })).toBeVisible();
  return review;
}

test("registra pagamento recusado sem perder o item do carrinho", async ({ page }) => {
  const review = await prepareReview(page, "payment-declined");
  const orderResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/orders" && response.request().method() === "POST",
  );
  await review.getByRole("button", { name: "Confirmar compra" }).click();
  expect((await orderResponse).status()).toBe(201);
  await expect(page.getByRole("heading", { name: "Pagamento recusado" })).toBeVisible();
  await page.getByRole("link", { name: /Voltar ao carrinho/ }).click();
  await expect(page.getByText("Golden Beat #207")).toBeVisible();
});

test("exige nova confirmação quando o preço muda", async ({ page }) => {
  const review = await prepareReview(page, "price-change");
  const staleResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/orders" && response.request().method() === "POST",
  );
  await review.getByRole("button", { name: "Confirmar compra" }).click();
  expect((await staleResponse).status()).toBe(409);
  await expect(review.getByRole("alert")).toContainText("Preço, disponibilidade ou taxas mudaram");
  const retryResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/orders" && response.request().method() === "POST",
  );
  await review.getByRole("button", { name: "Confirmar novos valores" }).click();
  expect((await retryResponse).status()).toBe(201);
  await expect(page).toHaveURL(/\/pedido\/ord_/);
});

test("bloqueia o checkout quando a edição esgota antes da confirmação", async ({ page }) => {
  const review = await prepareReview(page, "sold-out");
  const orderResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/orders" && response.request().method() === "POST",
  );
  await review.getByRole("button", { name: "Confirmar compra" }).click();
  expect((await orderResponse).status()).toBe(409);
  await expect(review.getByRole("alert")).toContainText("esgotou");
  await expect(review.getByRole("button", { name: "Confirmar novos valores" })).toBeDisabled();
});

test("envia somente um pedido ao receber clique duplo", async ({ page }) => {
  const review = await prepareReview(page, "default");
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/orders" && request.method() === "POST") {
      requests.push(request.url());
    }
  });
  const orderResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/orders" && response.request().method() === "POST",
  );
  await review.getByRole("button", { name: "Confirmar compra" }).dblclick();
  expect((await orderResponse).status()).toBe(201);
  await expect(page).toHaveURL(/\/pedido\/ord_/);
  expect(requests).toHaveLength(1);
});

test("recupera timeout repetindo a mesma chave de idempotência", async ({ page }) => {
  const review = await prepareReview(page, "order-timeout");
  const requests: Array<{ key: string | undefined; body: string | null }> = [];
  page.on("request", async (request) => {
    if (new URL(request.url()).pathname === "/api/orders" && request.method() === "POST") {
      requests.push({
        key: (await request.allHeaders())["idempotency-key"],
        body: request.postData(),
      });
    }
  });
  await review.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(review.getByText(/Não recebemos resposta do servidor/)).toBeVisible({
    timeout: 15000,
  });
  await review.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page).toHaveURL(/\/pedido\/ord_/);
  expect(requests).toHaveLength(2);
  expect(requests[0]?.key).toBeTruthy();
  expect(requests[1]?.key).toBe(requests[0]?.key);
  expect(requests[1]?.body).toBe(requests[0]?.body);
});
