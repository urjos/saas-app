import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

// Inicia sesión una sola vez y guarda cookies/localStorage para reutilizarlos
setup("autenticarse con Clerk", async ({ page }) => {
  const email = process.env.E2E_CLERK_USER_EMAIL;
  if (!email) {
    throw new Error("Falta E2E_CLERK_USER_EMAIL en .env.local");
  }

  await clerkSetup();

  // Hay que cargar una página pública que use Clerk antes de iniciar sesión
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: email });

  // Comprueba que la sesión es real antes de guardarla
  await page.goto("/companions/new");
  await expect(page).not.toHaveURL(/sign-in/);

  await page.context().storageState({ path: authFile });
});
