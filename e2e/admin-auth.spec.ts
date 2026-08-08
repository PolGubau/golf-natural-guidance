import { expect, test } from "@playwright/test";
import { MOCK_ADMIN_CREDENTIALS } from "../src/infrastructure/auth/mock-auth-provider";

test("admin is private by default and supports login and logout", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Bienvenido de nuevo" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resumen" })).toHaveCount(0);

  await page.getByLabel("Email").fill(MOCK_ADMIN_CREDENTIALS.email);
  await page.getByLabel("Contraseña").fill("contraseña-incorrecta");
  await page.getByRole("button", { name: "Entrar al backoffice" }).click();
  await expect(
    page.getByText("El email o la contraseña no son correctos."),
  ).toBeVisible();

  await page.getByLabel("Contraseña").fill(MOCK_ADMIN_CREDENTIALS.password);
  await page.getByRole("button", { name: "Entrar al backoffice" }).click();
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
  await expect(page.getByText("Toni Planells")).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(
    page.getByRole("heading", { name: "Bienvenido de nuevo" }),
  ).toBeVisible();
});
