// Comprova skeletons com prefers-reduced-motion, recuperação de falha 500, expiração de sessão e isolamento entre contas.
import { expect, test } from "@playwright/test";

test("exibe skeletons sem layout shift no carregamento lento e respeita prefers-reduced-motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/mercado?scenario=slow");

  const firstSkeleton = page.locator("#catalogo .shimmer.aspect-square").first();
  await expect(firstSkeleton).toBeVisible();

  // Com prefers-reduced-motion: reduce, o pseudo-elemento ::after do shimmer desativa a animação.
  const afterAnimation = await firstSkeleton.evaluate(
    (el) => getComputedStyle(el, "::after").animationName,
  );
  expect(afterAnimation).toBe("none");

  const skeletonBox = await firstSkeleton.boundingBox();
  expect(skeletonBox).not.toBeNull();

  // Aguarda os cards reais substituírem os skeletons e confirma que a largura da coluna permanece estável.
  const firstCard = page.locator("#catalogo article").first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });
  const cardBox = await firstCard.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(Math.abs((cardBox?.width ?? 0) - (skeletonBox?.width ?? 0))).toBeLessThanOrEqual(2);
});

test("exibe estado de erro 500 no catálogo e recupera os itens ao tentar novamente", async ({
  page,
}) => {
  await page.goto("/mercado?scenario=server-error");

  const alert = page.getByRole("alert");
  await expect(alert.getByText("Não foi possível carregar o catálogo.")).toBeVisible({
    timeout: 10000,
  });

  // Restaura o cenário padrão na camada de mock e aciona a recuperação pela própria interface.
  const switched = await page.evaluate(async () =>
    fetch("/api/__mock/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: "default" }),
    }).then((res) => res.status),
  );
  expect(switched).toBe(200);

  await alert.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("heading", { name: "Golden Beat #207" })).toBeVisible();
});

test("recupera fluxo após expiração de sessão preservando rascunho e isola dados privados entre usuários", async ({
  page,
}) => {
  await page.goto("/login?scenario=default");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/nft/golden-beat-207");
  await page.getByRole("button", { name: /Comprar/ }).click();
  await expect(page).toHaveURL(/\/carrinho/);

  await page.getByRole("button", { name: "Concluir e finalizar" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  const noteField = page.getByLabel("Observação do colecionador (opcional)");
  await noteField.fill("Entrega prioritária da Ana");

  await page.getByRole("button", { name: "Conectar carteira" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Aprovar conexão" }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();

  // Invalida o token atual antes de confirmar para simular sessão expirada durante o checkout.
  await page.evaluate(() => {
    localStorage.setItem("kurio.token", "tok_expired_session");
  });
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar compra" }).click();

  await expect(page).toHaveURL(/\/login\?.*expired=true/);
  await expect(
    page.getByRole("status").filter({
      hasText: "Sua sessão expirou. Entre novamente para continuar de onde parou.",
    }),
  ).toBeVisible();

  const reloginDialog = page.getByRole("dialog");
  await reloginDialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await reloginDialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await reloginDialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  // Confirma que o rascunho preenchido antes da expiração foi preservado ao retornar ao checkout.
  await expect(page.getByLabel("Observação do colecionador (opcional)")).toHaveValue(
    "Entrega prioritária da Ana",
  );

  // Autentica Bruno e comprova que carteiras, favoritos e carrinho da Ana não vazam entre sessões.
  await page.goto("/login");
  const brunoDialog = page.getByRole("dialog");
  await brunoDialog.getByRole("textbox", { name: "E-mail" }).fill("bruno@kurio.dev");
  await brunoDialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await brunoDialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/carteiras");
  await expect(page.getByRole("button", { name: "Adicionar" })).toHaveCount(2);
  await expect(page.getByText("Cofre Principal")).toHaveCount(0);

  await page.goto("/favoritos");
  await expect(page.getByText("Você ainda não salvou nenhum NFT.")).toBeVisible();

  await page.goto("/carrinho");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});
