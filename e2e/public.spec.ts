import { test, expect } from "@playwright/test";

test.describe("páginas públicas", () => {
  test("la home muestra las companions populares", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Popular companions" }),
    ).toBeVisible();
  });

  test("la biblioteca actualiza la URL al buscar por tema", async ({
    page,
  }) => {
    await page.goto("/companions");
    await expect(
      page.getByRole("heading", { name: "Companion Library" }),
    ).toBeVisible();

    await page.getByPlaceholder("Search companions...").fill("react");

    // SearchInput aplica un debounce de 500 ms antes de actualizar la URL
    await expect(page).toHaveURL(/topic=react/);
  });

  test("un usuario sin sesión es enviado a /sign-in al crear una companion", async ({
    page,
  }) => {
    await page.goto("/companions/new");
    await expect(page).toHaveURL(/sign-in/);
  });
});
