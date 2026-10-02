import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

// Obtiene el "testing token" de Clerk para saltarse la protección anti-bots
setup("configurar Clerk para testing", async () => {
  await clerkSetup();
});
