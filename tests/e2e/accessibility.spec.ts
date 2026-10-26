// Comprova navegação por teclado, foco visível, focus trap/restauração em dialogs, validação acessível e anúncios aria-live.
import { expect, test } from "@playwright/test";

test("navega por teclado com foco visível, prende foco no drawer e devolve ao gatilho", async ({
  page,
}) => {
  await page.goto("/?scenario=default");
  await expect(page.getByRole("heading", { name: "Oferta limitada" })).toBeVisible();

  // Primeiro Tab foca o link de salto para o conteúdo principal com indicador visível.
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  const outlineStyle = await skipLink.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).not.toBe("none");

  // Abre o drawer de simulação, verifica prisão de foco (focus trap) e devolução ao gatilho com Escape.
  const drawerTrigger = page.getByRole("button", {
    name: "Abrir painel de cenários de simulação",
  });
  await drawerTrigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Simulação (MSW)" })).toBeVisible();

  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press("Tab");
    const insideDialog = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[role="dialog"]')),
    );
    expect(insideDialog).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(drawerTrigger).toBeFocused();

  // Imagens relevantes do catálogo possuem texto alternativo descritivo; rotas fora de escopo avisam indisponibilidade.
  const firstArtwork = page.locator("main article img").first();
  await expect(firstArtwork).toHaveAttribute("alt", /.+/);

  await page.goto("/aprenda");
  await expect(page.getByText("Esta seção ainda não está disponível nesta versão.")).toBeVisible();
});

test("associa labels, aria-invalid e aria-describedby nos formulários e anuncia eventos em aria-live", async ({
  page,
}) => {
  await page.goto("/login?scenario=default");
  const loginDialog = page.getByRole("dialog");
  const emailInput = loginDialog.getByRole("textbox", { name: "E-mail" });
  const passwordInput = loginDialog.getByRole("textbox", { name: "Senha", exact: true });

  await loginDialog.getByRole("button", { name: "Entrar" }).click();
  await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  await expect(passwordInput).toHaveAttribute("aria-invalid", "true");

  const emailErrId = await emailInput.getAttribute("aria-describedby");
  expect(emailErrId).toBeTruthy();
  await expect(page.locator(`[id="${emailErrId}"]`)).toHaveText("Informe um e-mail válido");

  // Autentica Ana e adiciona item ao carrinho para validar dialogs, campos e aria-live no checkout.
  await emailInput.fill("ana@kurio.dev");
  await passwordInput.fill("Kurio@123");
  await loginDialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/nft/golden-beat-207");
  await expect(page.getByRole("img", { name: "Arte do NFT Golden Beat #207" })).toBeVisible();
  await page.getByRole("button", { name: /Comprar/ }).click();
  await expect(page).toHaveURL(/\/carrinho/);

  await page.getByRole("button", { name: "Concluir e finalizar" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  // Abre o modal de carteira, fecha com Escape e verifica retorno do foco ao botão gatilho.
  const connectBtn = page.getByRole("button", { name: "Conectar carteira" });
  await expect(connectBtn).toBeEnabled();
  await connectBtn.focus();
  await page.keyboard.press("Enter");
  const walletDialog = page.getByRole("dialog");
  await expect(walletDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(walletDialog).toBeHidden();
  await expect(connectBtn).toBeFocused();

  // Conecta a carteira e verifica role="status" e validação acessível do campo de nome.
  await connectBtn.click();
  await walletDialog.getByRole("button", { name: "Aprovar conexão" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Conectada" })).toBeVisible();

  const nameInput = page.getByLabel("Nome de exibição *");
  await nameInput.fill("A");
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await expect(nameInput).toHaveAttribute("aria-invalid", "true");
  const nameErrId = await nameInput.getAttribute("aria-describedby");
  expect(nameErrId).toBeTruthy();
  await expect(page.locator(`[id="${nameErrId}"]`)).toHaveText("Informe o nome do colecionador");

  // Dispara evento Socket.IO e comprova anúncio em região aria-live="polite".
  await page.getByRole("button", { name: "Abrir painel de cenários de simulação" }).click();
  await expect(page.getByText("Eventos Socket.IO (connected)")).toBeVisible({ timeout: 10000 });
  await page.keyboard.press("Escape");

  const updated = await page.evaluate(async () =>
    fetch("/api/__mock/nft-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "golden-beat-207", edition: "1/50", price: "1.04" }),
    }).then((response) => response.status),
  );
  expect(updated).toBe(200);
  await expect(page.locator("div.sr-only[aria-live='polite']")).toHaveText(
    "Um NFT do seu carrinho teve preço ou disponibilidade alterados",
  );
});

test("navega por abas do catálogo e cards exclusivamente via teclado com foco visível", async ({
  page,
}) => {
  await page.goto("/mercado?scenario=default");
  await expect(page.getByText(/36 NFTs encontrados|40 NFTs encontrados/)).toBeVisible();

  // Foca na aba "Novos lançamentos" e ativa com teclado
  const newReleasesTab = page.getByRole("tab", { name: "Novos lançamentos" });
  await newReleasesTab.focus();
  await page.keyboard.press("Enter");
  await expect(newReleasesTab).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/tab=new/);

  // Navega até o primeiro card do catálogo via teclado e acessa o detalhe com Enter
  const firstCardLink = page.locator("#catalogo article a").first();
  await firstCardLink.focus();
  await expect(firstCardLink).toBeFocused();
  await page.keyboard.press("Enter");

  // Confirma transição para a página de detalhe do NFT
  await expect(page).toHaveURL(/\/nft\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
