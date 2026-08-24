import { expect, test } from "@playwright/test";
import { MOCK_ADMIN_CREDENTIALS } from "../src/infrastructure/auth/mock-auth-provider";

async function loginAsDemo(page: import("@playwright/test").Page) {
  await expect(
    page.getByRole("heading", { name: "Bienvenido de nuevo" }),
  ).toBeVisible();
  await page.getByLabel("Email").fill(MOCK_ADMIN_CREDENTIALS.email);
  await page.getByLabel("Contraseña").fill(MOCK_ADMIN_CREDENTIALS.password);
  await page.getByRole("button", { name: "Entrar al backoffice" }).click();
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
}

test("mobile selection reveals its configuration and the next step", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/booking");
  await page
    .getByRole("button", { name: /Tengo un profesor en mente/ })
    .click();
  await page.getByRole("button", { name: /Alex Rivera/ }).click();

  await expect(
    page.getByRole("heading", { name: "Clase con Alex Rivera" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(
    page.getByRole("heading", { name: "Encuentra tu mejor momento" }),
  ).toBeInViewport();
});

test("a new client can search by time before choosing a teacher", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/booking");
  await page
    .getByRole("button", { name: /Buscar una hora disponible/ })
    .click();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByRole("heading", { name: "¿Cuándo puedes venir?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sin disponibilidad/ }).first(),
  ).toBeDisabled();
  await page.getByRole("button", { name: /^08:00/ }).click();
  await expect(
    page.getByRole("heading", { name: "Elige tu profesor" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: /Marina Costa/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Guarda tus datos para la próxima vez",
    }),
  ).toBeVisible();
});

test("offers another teacher when the selected one has no availability", async ({
  page,
}) => {
  await page.goto("/booking");
  await page.waitForFunction(() => localStorage.getItem("demo:teachers"));
  await page.evaluate(() => {
    const key = "demo:teachers";
    const store = JSON.parse(localStorage.getItem(key) ?? "null");
    const toni = store?.data?.find(
      (teacher: { id: string }) => teacher.id === "teacher-toni",
    );
    if (toni) toni.availability = [];
    localStorage.setItem(key, JSON.stringify(store));
  });
  await page.reload();
  await page
    .getByRole("button", { name: /Tengo un profesor en mente/ })
    .click();
  await page.getByRole("button", { name: /Alex Rivera/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: /^lunes/ }).click();

  await expect(
    page.getByText("Alex Rivera no tiene disponibilidad este día."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Otros profesores disponibles este día",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Marina Costa.*Cambiar/ }).click();
  await expect(page.getByRole("button", { name: /^08:00$/ })).toBeVisible();
});

test("a returning client skips access and receives saved details", async ({
  page,
}) => {
  await page.goto("/booking");
  await page
    .getByRole("button", { name: /Tengo un profesor en mente/ })
    .click();
  await page.getByRole("button", { name: /Alex Rivera/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page
    .getByRole("button", { name: /^(lun|mar|mié|jue|vie|sáb)/ })
    .first()
    .click();
  await page.getByRole("button", { name: /^08:00$/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar con Google" }).click();
  await expect(page.getByLabel("Nombre y apellidos")).toHaveValue(
    "Lucía Martín",
  );
  await expect(
    page.getByText("Has iniciado sesión como lucia@example.com"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cambiar cuenta" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Guarda tus datos para la próxima vez",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuar con Google" }).click();

  await page.reload();
  await page
    .getByRole("button", { name: /Tengo un profesor en mente/ })
    .click();
  await page.getByRole("button", { name: /Alex Rivera/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page
    .getByRole("button", { name: /^(lun|mar|mié|jue|vie|sáb)/ })
    .first()
    .click();
  await page.getByRole("button", { name: /^08:00$/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByRole("heading", { name: "¿A nombre de quién reservamos?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuar con Google" }),
  ).toHaveCount(0);
});

test("private lesson appears in the backoffice", async ({ page }) => {
  await page.goto("/booking");
  await page
    .getByRole("button", { name: /Tengo un profesor en mente/ })
    .click();
  await page.getByRole("button", { name: /Alex Rivera/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  const weekday = page
    .getByRole("button", { name: /^(lun|mar|mié|jue|vie|sáb)/ })
    .first();
  await weekday.click();
  await page.getByRole("button", { name: /^08:00$/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Guarda tus datos para la próxima vez",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuar con Google" }).click();
  await page.getByLabel("Nombre y apellidos").fill("Cliente E2E");
  await expect(page.getByLabel("Email")).toHaveValue("lucia@example.com");
  await page.getByRole("button", { name: /Continuar al pago/ }).click();
  await page.getByRole("button", { name: "Confirmar y pagar" }).click();
  await expect(
    page.getByRole("button", { name: "Registrando pago…" }),
  ).toBeDisabled();

  await expect(
    page.getByRole("heading", { name: "Nos vemos en el campo" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Ver en backoffice/ }).click();
  await loginAsDemo(page);
  await page.getByRole("link", { name: "Reservas", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/reservas$/);
  const clientRow = page
    .locator("tr")
    .filter({ hasText: "Cliente E2E" })
    .first();
  await expect(clientRow).toContainText("Online · Cobrado");
});

test("group activity only offers online payment and consumes a place", async ({
  page,
}) => {
  await page.goto("/booking");
  await page.getByRole("button", { name: /Quiero una actividad/ }).click();
  const swingLab = page.getByRole("button", { name: /Swing Lab/ });
  await expect(swingLab).toContainText(
    "Sesión de análisis técnico con vídeo y feedback personalizado.",
  );
  await expect(swingLab).toContainText(/plazas disponibles/);
  await expect(swingLab).toContainText("por persona");
  await swingLab.click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar con Google" }).click();
  await page.getByLabel("Nombre y apellidos").fill("Grupo E2E");
  await page.getByRole("button", { name: /Continuar al pago/ }).click();

  await expect(
    page.getByRole("button", { name: /Pagar en persona/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /^Confirmar y pagar$/ }).click();
  await expect(
    page.getByRole("heading", { name: "Nos vemos en el campo" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Ver en backoffice/ }).click();
  await loginAsDemo(page);
  await page
    .getByRole("link", { name: "Cursos y actividades", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/actividades$/);
  await expect(page.getByText("1/6")).toBeVisible();
});
