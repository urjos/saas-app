import { test, expect, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

const username = process.env.E2E_CLERK_USER_USERNAME;
const password = process.env.E2E_CLERK_USER_PASSWORD;

// Abre un Select de shadcn/base-ui por su placeholder y elige una opción
async function pick(page: Page, placeholder: string, option: string) {
  await page.getByText(placeholder).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test.describe("flujo principal (con sesión)", () => {
  test.skip(
    !username || !password,
    "Define E2E_CLERK_USER_USERNAME y E2E_CLERK_USER_PASSWORD en .env.local",
  );

  test("crear una companion y abrir su lección", async ({ page }) => {
    const companionName = `E2E Codey ${Date.now()}`;

    // Hay que cargar una página pública que use Clerk antes de iniciar sesión
    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: username!,
        password: password!,
      },
    });

    await page.goto("/companions/new");
    // Si el usuario de pruebas llegó a su límite de companions, aquí falla:
    // usa un usuario con plan Pro o con cupo disponible.
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
