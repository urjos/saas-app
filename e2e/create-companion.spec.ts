import { test, expect, type Page } from "@playwright/test";

// Abre un Select de shadcn/base-ui por su placeholder y elige una opción
async function pick(page: Page, placeholder: string, option: string) {
  await page.getByText(placeholder).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test.describe("flujo principal (con sesión)", () => {
  test("crear una companion y abrir su lección", async ({ page }) => {
    const companionName = `E2E Codey ${Date.now()}`;

    await page.goto("/companions/new");

    await expect(
      page.getByRole("heading", { name: "Companion Builder" }),
    ).toBeVisible();

    await page.getByLabel("Companion name").fill(companionName);
    await pick(page, "Select the subject", "coding");
    await page
      .getByLabel(/what should the companion help with/i)
      .fill("If-Else statements");
    await pick(page, "Select the voice", "Male");
    await pick(page, "Select the style", "Casual");
    await page.getByRole("button", { name: "Build Your Companion" }).click();

    // Debe redirigir a /companions/<id> y mostrar la lección recién creada
    await expect(page).toHaveURL(/\/companions\/(?!new)[^/]+$/);
    await expect(page.getByText(companionName).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start Session" }),
    ).toBeVisible();
  });
});
