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

test("admin can generate and inspect a teacher monthly settlement", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("Email").fill(MOCK_ADMIN_CREDENTIALS.email);
  await page.getByLabel("Contraseña").fill(MOCK_ADMIN_CREDENTIALS.password);
  await page.getByRole("button", { name: "Entrar al backoffice" }).click();

  await page.getByRole("link", { name: "Facturación", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/facturacion$/);
  await expect(
    page.getByRole("heading", { name: "Liquidaciones de profesores" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Generar liquidaciones" }).click();
  await page.getByRole("button", { name: "Liquidaciones generadas" }).click();

  await expect(
    page.getByText("Disponible para el profesor").first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver clases" }).first().click();
  await expect(page.getByText("Clases incluidas en la factura")).toBeVisible();
});

test("admin can inspect a client's booking history", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("Email").fill(MOCK_ADMIN_CREDENTIALS.email);
  await page.getByLabel("Contraseña").fill(MOCK_ADMIN_CREDENTIALS.password);
  await page.getByRole("button", { name: "Entrar al backoffice" }).click();

  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/clientes$/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Clientes", level: 2 }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/admin\/clientes$/);
  await page
    .getByRole("link", { name: "Ver historial de Lucía Martín" })
    .click();

  await expect(page).toHaveURL(/\/admin\/reservas\?cliente=student-lucia$/);
  await expect(
    page.getByRole("heading", { name: "Reservas de Lucía Martín" }),
  ).toBeVisible();
  await expect(page.getByLabel("Buscar cliente")).toHaveValue("Lucía Martín");
  await expect(
    page.getByRole("link", { name: "Quitar filtro de cliente" }),
  ).toBeVisible();
  await expect(page.getByText("Clase privada · 1 jugador")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Descargar factura/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^factura-.*\.pdf$/);
  await page.getByLabel("Buscar cliente").fill("");
  await expect(page).toHaveURL(/\/admin\/reservas$/);
});
