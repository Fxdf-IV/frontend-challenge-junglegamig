// Verifica que as seções principais da home renderizam em desktop e mobile.
import { expect, test } from "@playwright/test";

test("exibe oferta, campanhas e diário da home", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/?scenario=default");

  await expect(page.getByRole("heading", { name: "Oferta limitada" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sage Nomad #046" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Arte digital selecionada e muito mais" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diário da Cunhagem" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
