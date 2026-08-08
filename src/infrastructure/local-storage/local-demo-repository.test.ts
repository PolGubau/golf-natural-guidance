/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { LocalStorageDemoRepository } from "./local-demo-repository";

describe("LocalStorageDemoRepository", () => {
  beforeEach(() => window.localStorage.clear());

  it("initializes, persists and restores the versioned seed", async () => {
    const repository = new LocalStorageDemoRepository();
    const first = await repository.load();
    first.data.teachers[0].name = "Nombre editado";
    await repository.save(first.data);
    const second = await repository.load();
    expect(second.data.teachers[0].name).toBe("Nombre editado");
    expect(
      JSON.parse(window.localStorage.getItem("gng-demo:teachers") ?? "{}")
        .version,
    ).toBe(1);
  });

  it("recovers safely from corrupt JSON", async () => {
    window.localStorage.setItem("gng-demo:bookings", "not-json");
    const result = await new LocalStorageDemoRepository().load();
    expect(result.recovered).toBe(true);
    expect(result.data.bookings.length).toBeGreaterThan(0);
  });

  it("resets local changes", async () => {
    const repository = new LocalStorageDemoRepository();
    const current = await repository.load();
    current.data.bookings = [];
    await repository.save(current.data);
    const reset = await repository.reset();
    expect(reset.data.bookings.length).toBeGreaterThan(0);
  });
});
