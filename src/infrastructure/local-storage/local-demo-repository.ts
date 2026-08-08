import type { DemoData } from "~/domain/models";
import { createSeed } from "~/infrastructure/seed";
import type {
  DemoRepository,
  RepositoryLoadResult,
} from "../repositories/demo-repository";

type LocalStore<T> = { version: 1; data: T };
type CollectionKey = Exclude<keyof DemoData, "settings">;

const collectionKeys: CollectionKey[] = [
  "teachers",
  "products",
  "activities",
  "students",
  "bookings",
  "payments",
  "compensationLines",
  "invoices",
];
const storageKeys: Record<keyof DemoData, string> = {
  teachers: "gng-demo:teachers",
  products: "gng-demo:products",
  activities: "gng-demo:activities",
  students: "gng-demo:students",
  bookings: "gng-demo:bookings",
  payments: "gng-demo:payments",
  compensationLines: "gng-demo:compensation-lines",
  invoices: "gng-demo:invoices",
  settings: "gng-demo:settings",
};

export class LocalStorageDemoRepository implements DemoRepository {
  async load(): Promise<RepositoryLoadResult> {
    const seed = createSeed();
    if (typeof window === "undefined") return { data: seed, recovered: false };
    let recovered = false;
    const data = { ...seed };
    for (const key of collectionKeys) {
      const result = this.read(storageKeys[key], seed[key]);
      data[key] = result.data as never;
      recovered ||= result.recovered;
    }
    const settings = this.read(storageKeys.settings, seed.settings);
    data.settings = settings.data;
    recovered ||= settings.recovered;
    await this.save(data);
    return { data, recovered };
  }

  async save(data: DemoData) {
    if (typeof window === "undefined") return;
    for (const key of [...collectionKeys, "settings" as const]) {
      window.localStorage.setItem(
        storageKeys[key],
        JSON.stringify({ version: 1, data: data[key] }),
      );
    }
  }

  async reset() {
    if (typeof window !== "undefined") {
      for (const key of Object.values(storageKeys))
        window.localStorage.removeItem(key);
    }
    return this.load();
  }

  private read<T>(key: string, fallback: T): { data: T; recovered: boolean } {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return { data: fallback, recovered: false };
    try {
      const store = JSON.parse(raw) as LocalStore<T>;
      if (store.version !== 1 || store.data == null)
        throw new Error("Unsupported local store");
      return { data: store.data, recovered: false };
    } catch {
      return { data: fallback, recovered: true };
    }
  }
}
