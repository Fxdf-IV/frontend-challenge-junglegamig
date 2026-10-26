// Script para captura automatizada dos prints de demonstração do projeto (desktop e mobile)
// utilizados na documentação e no README do marketplace Kurio.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

/** Aguarda o servidor HTTP local responder 200 antes de iniciar as capturas. */
async function waitForServer(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Servidor ainda iniciando; aguarda próximo ciclo.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Servidor não respondeu em ${url} após ${timeoutMs}ms.`);
}

/** Prepara a página ocultando o botão flutuante e aguardando as fontes carregarem. */
async function stabilize(page, hideFloating = true) {
  if (hideFloating) {
    await page.addStyleTag({
      content: `
        [aria-label="Abrir painel de cenários de simulação"] { display: none !important; }
        [data-sonner-toaster] { display: none !important; }
      `,
    });
  }
  await page.evaluate(() => document.fonts.ready);
}

/** Realiza login simulado como Ana Sato para garantir carteira e dados de perfil preenchidos. */
async function loginAsAna(page, baseUrl) {
  await page.goto(`${baseUrl}/login?scenario=default`);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"));
}

/** Executa o fluxo de captura das telas principais em alta resolução. */
async function main() {
  const rootDir = process.cwd();
  const outDir = path.join(rootDir, "docs", "screenshots");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const port = 4174;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log("Iniciando servidor local com mocks ativos...");
  const devServer = spawn(
    "bun",
    ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: rootDir,
      env: {
        ...process.env,
        VITE_ENABLE_MOCKS: "true",
        VITE_SHOW_MOCK_PANEL: "true",
      },
      stdio: "ignore",
      shell: true,
    },
  );

  try {
    await waitForServer(baseUrl);
    console.log("Servidor pronto em", baseUrl);

    const browser = await chromium.launch({ headless: true });

    // 1. Contexto Desktop (1440x900)
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    const page = await desktopContext.newPage();

    console.log("Capturando 01-catalog-desktop.png...");
    await page.goto(`${baseUrl}/?scenario=default`);
    await page.waitForSelector("#catalogo article");
    await stabilize(page, true);
    await page.screenshot({
      path: path.join(outDir, "01-catalog-desktop.png"),
    });

    console.log("Capturando 02-nft-detail-desktop.png...");
    await page.goto(`${baseUrl}/nft/golden-beat-207`);
    await page.getByRole("heading", { name: "Golden Beat #207" }).waitFor();
    await stabilize(page, true);
    await page.screenshot({
      path: path.join(outDir, "02-nft-detail-desktop.png"),
    });

    console.log("Capturando 03-cart-desktop.png...");
    await loginAsAna(page, baseUrl);
    await page.goto(`${baseUrl}/nft/golden-beat-207`);
    await page.getByRole("button", { name: /Comprar/ }).click();
    await page.waitForURL((url) => url.pathname.includes("/carrinho"));
    const couponInput = page.getByPlaceholder("Digite o código promocional...");
    await couponInput.fill("KURIO10");
    await page.getByRole("button", { name: "Aplicar" }).click();
    await page
      .getByText("- 0.10 ETH")
      .or(page.getByText("- 0.099 ETH"))
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
    await stabilize(page, true);
    await page.screenshot({
      path: path.join(outDir, "03-cart-desktop.png"),
    });

    console.log("Capturando 04-checkout-desktop.png...");
    await page.goto(`${baseUrl}/checkout`);
    await page.getByRole("heading", { name: "Perfil do colecionador" }).waitFor();
    const connectButton = page.getByRole("button", { name: "Conectar carteira" });
    if (await connectButton.isVisible()) {
      await connectButton.click();
      const walletDialog = page.getByRole("dialog");
      await walletDialog.getByRole("button", { name: "Aprovar conexão" }).click();
    }
    await page.waitForTimeout(500);
    await stabilize(page, true);
    await page.screenshot({
      path: path.join(outDir, "04-checkout-desktop.png"),
    });

    console.log("Capturando 05-order-receipt-desktop.png...");
    await page.getByRole("button", { name: "Revisar pedido" }).click();
    const reviewDialog = page.getByRole("dialog");
    await reviewDialog.getByRole("heading", { name: "Revise seu pedido" }).waitFor();
    await reviewDialog.getByRole("button", { name: "Confirmar compra" }).click();
    await page.waitForURL((url) => url.pathname.includes("/pedido/"));
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(600);
    await stabilize(page, true);
    await page.screenshot({
      path: path.join(outDir, "05-order-receipt-desktop.png"),
    });

    console.log("Capturando 06-simulation-panel.png...");
    await page.goto(`${baseUrl}/?scenario=default`);
    await page.waitForSelector("#catalogo article");
    // Aqui não ocultamos o botão flutuante e abrimos o painel
    await page.evaluate(() => document.fonts.ready);
    const trigger = page.getByRole("button", { name: "Cenários" });
    await trigger.click();
    await page.getByText("Simulação (MSW)").waitFor();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(outDir, "06-simulation-panel.png"),
    });

    await desktopContext.close();

    // 2. Contexto Mobile (390x844)
    console.log("Capturando telas mobile...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();

    console.log("Capturando 07-mobile-catalog.png...");
    await mobilePage.goto(`${baseUrl}/?scenario=default`);
    await mobilePage.waitForSelector("article");
    await stabilize(mobilePage, true);
    await mobilePage.screenshot({
      path: path.join(outDir, "07-mobile-catalog.png"),
    });

    console.log("Capturando 08-mobile-cart.png...");
    await loginAsAna(mobilePage, baseUrl);
    await mobilePage.goto(`${baseUrl}/nft/golden-beat-207`);
    await mobilePage.getByRole("button", { name: /Comprar/ }).click();
    await mobilePage.waitForURL((url) => url.pathname.includes("/carrinho"));
    await stabilize(mobilePage, true);
    await mobilePage.screenshot({
      path: path.join(outDir, "08-mobile-cart.png"),
    });

    await mobileContext.close();
    await browser.close();
    console.log("Todas as capturas foram salvas com sucesso em docs/screenshots/!");
  } finally {
    if (devServer.pid) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(devServer.pid), "/f", "/t"]);
      } else {
        devServer.kill("SIGTERM");
      }
    }
  }
}

main().catch((err) => {
  console.error("Erro durante a captura de screenshots:", err);
  process.exit(1);
});
