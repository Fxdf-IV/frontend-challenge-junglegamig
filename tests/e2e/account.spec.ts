// Cobre cadastro, login, redirecionamento e isolamento da sessão.
import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, email: string, password = "Kurio@123") {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill(email);
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill(password);
  await dialog.getByRole("button", { name: "Entrar" }).click();
}

test("faz login e retorna ao perfil após atualizar a página", async ({ page }) => {
  await page.goto("/perfil?scenario=default");
  await expect(page).toHaveURL(/\/login\?/);
  await loginAs(page, "ana@kurio.dev");

  await expect(page).toHaveURL(/\/perfil/);
  await expect(page.getByRole("heading", { name: "Perfil do colecionador" })).toBeVisible();
  await expect(page.getByLabel("Nome de exibição *")).toHaveValue("Ana Sato");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Perfil do colecionador" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Conta de Ana Sato" })).toBeVisible();
});

test("exibe erro de credenciais sem autenticar", async ({ page }) => {
  await page.goto("/login?scenario=default");
  await loginAs(page, "ana@kurio.dev", "senha-errada");

  await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
  await expect(page.getByRole("button", { name: "Conta de Ana Sato" })).toHaveCount(0);
});

test("cria uma conta e recupera a sessão após refresh", async ({ page }) => {
  await page.goto("/cadastro?scenario=default");
  await page.getByPlaceholder("Nome de usuário").fill("colecionador_novo");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("novo@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("senha1234");
  await dialog.getByRole("textbox", { name: "Confirmar senha", exact: true }).fill("senha1234");
  await dialog.getByRole("button", { name: "Criar conta" }).click();

  const signedInControl =
    page.viewportSize()?.width === 390
      ? page
          .getByRole("navigation", { name: "Navegação inferior" })
          .getByRole("link", { name: "Perfil" })
      : page.getByRole("button", { name: "Conta de colecionador_novo" });
  await expect(signedInControl).toBeVisible();
  await page.reload();
  await expect(signedInControl).toBeVisible();
});

test("informa conflito ao cadastrar um e-mail já utilizado", async ({ page }) => {
  await page.goto("/cadastro?scenario=default");
  await page.getByPlaceholder("Nome de usuário").fill("ana_segunda");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("senha1234");
  await dialog.getByRole("textbox", { name: "Confirmar senha", exact: true }).fill("senha1234");
  await dialog.getByRole("button", { name: "Criar conta" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Já existe uma conta com estes dados. Entre ou use outros dados.",
  );
});

test("limpa token expirado e redireciona à tela de login", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kurio.token", "tok_expirado"));
  await page.goto("/perfil?scenario=default");

  await expect.poll(() => page.evaluate(() => localStorage.getItem("kurio.token"))).toBeNull();
  await expect(page).toHaveURL(/\/login\?/);
});

// Valida alternância entre contas, logout em rota privada e isolamento dos dados em desktop e mobile.
test("troca de conta remove os dados privados da sessão anterior", async ({ page }) => {
  await page.goto("/login?scenario=default");
  await loginAs(page, "bruno@kurio.dev");
  await page.goto("/perfil");
  await expect(page.getByRole("button", { name: "Conta de Bruno Lima" })).toBeVisible();

  await page.getByRole("button", { name: "Conta de Bruno Lima" }).click();
  await page.getByRole("menuitem", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();

  await loginAs(page, "ana@kurio.dev");
  await page.goto("/perfil");
  await expect(page.getByRole("button", { name: "Conta de Ana Sato" })).toBeVisible();
  await expect(page.getByLabel("Nome de exibição *")).toHaveValue("Ana Sato");
});
