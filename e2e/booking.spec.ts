import { expect, test } from "@playwright/test";
import { MOCK_ADMIN_CREDENTIALS } from "../src/infrastructure/auth/mock-auth-provider";

async function loginAsToni(page: import("@playwright/test").Page) {
  await expect(
    page.getByRole("heading", { name: "Bienvenido de nuevo" }),
  ).toBeVisible();
  await page.getByLabel("Email").fill(MOCK_ADMIN_CREDENTIALS.email);
  await page.getByLabel("Contraseña").fill(MOCK_ADMIN_CREDENTIALS.password);
  await page.getByRole("button", { name: "Entrar al backoffice" }).click();
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
}

test("private lesson appears in the backoffice", async ({ page }) => {
  await page.goto("/booking");
  await page.getByRole("button", { name: /Clase con Toni Planells/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  const weekday = page
    .getByRole("button", { name: /^(lun|mar|mié|jue|vie|sáb)/ })
    .first();
  await weekday.click();
  await page.getByRole("button", { name: /^08:00$/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Nombre y apellidos").fill("Cliente E2E");
  await page.getByLabel("Email").fill("cliente-e2e@example.com");
  await page.getByRole("button", { name: /Continuar al pago/ }).click();
  await page.getByRole("button", { name: /Pagar en persona/ }).click();
  await page
    .getByRole("button", { name: /Confirmar y pagar en persona/ })
    .click();

  await expect(
    page.getByRole("heading", { name: "Nos vemos en el campo" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Ver en backoffice/ }).click();
  await loginAsToni(page);
  await page.getByRole("button", { name: "Reservas" }).click();
  await expect(page.getByText("Cliente E2E")).toBeVisible();
  await expect(page.getByText(/En persona · Pendiente/)).toBeVisible();
});

test("group activity only offers online payment and consumes a place", async ({
  page,
}) => {
  await page.goto("/booking");
  await page.getByRole("button", { name: /Swing Lab/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Nombre y apellidos").fill("Grupo E2E");
  await page.getByLabel("Email").fill("grupo-e2e@example.com");
  await page.getByRole("button", { name: /Continuar al pago/ }).click();

  await expect(
    page.getByRole("button", { name: /Pagar en persona/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Completar pago mock/ }).click();
  await expect(
    page.getByRole("heading", { name: "Nos vemos en el campo" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Ver en backoffice/ }).click();
  await loginAsToni(page);
  await page.getByRole("button", { name: "Cursos y actividades" }).click();
  await expect(page.getByText("1/6")).toBeVisible();
});
