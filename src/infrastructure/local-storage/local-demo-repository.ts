import { createCustomerInvoice } from "~/domain/customer-invoices";
import { createFiscalSubmission } from "~/domain/fiscal-submissions";
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
  "leads",
  "automationTasks",
  "bookings",
  "payments",
  "compensationLines",
  "invoices",
  "customerInvoices",
  "fiscalSubmissions",
];
const storageKeys: Record<keyof DemoData, string> = {
  teachers: "gng-demo:teachers",
  products: "gng-demo:products",
  activities: "gng-demo:activities",
  students: "gng-demo:students",
  leads: "gng-demo:leads",
  automationTasks: "gng-demo:automation-tasks",
  bookings: "gng-demo:bookings",
  payments: "gng-demo:payments",
  compensationLines: "gng-demo:compensation-lines",
  invoices: "gng-demo:invoices",
  customerInvoices: "gng-demo:customer-invoices",
  fiscalSubmissions: "gng-demo:fiscal-submissions",
  settings: "gng-demo:settings",
};

export class LocalStorageDemoRepository implements DemoRepository {
  async load(): Promise<RepositoryLoadResult> {
    const seed = createSeed();
    if (typeof window === "undefined") return { data: seed, recovered: false };
    let recovered = false;
    const data = { ...seed };
    for (const key of collectionKeys) {
      const fallback = key === "customerInvoices" ? [] : seed[key];
      const result = this.read(storageKeys[key], fallback);
      data[key] = result.data as never;
      recovered ||= result.recovered;
    }
    const settings = this.read(storageKeys.settings, seed.settings);
    data.settings = settings.data;
    recovered ||= settings.recovered;
    const migrated = migrateInvoiceData(data);
    await this.save(migrated);
    return { data: migrated, recovered };
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

function migrateInvoiceData(data: DemoData): DemoData {
  let migrated: DemoData = {
    ...data,
    teachers: data.teachers.map((teacher) => ({
      ...teacher,
      fiscalName: teacher.fiscalName || teacher.name,
      fiscalId: teacher.fiscalId || "Pendiente de configurar",
      fiscalAddress: teacher.fiscalAddress || "Pendiente de configurar",
      invoiceSeries: teacher.invoiceSeries || `GNG-${teacher.id.toUpperCase()}`,
    })),
    students: data.students.map((student) => ({
      ...student,
      fiscalId: student.fiscalId || "Pendiente de configurar",
      fiscalAddress: student.fiscalAddress || "Pendiente de configurar",
    })),
    fiscalSubmissions: data.fiscalSubmissions.filter((submission) =>
      data.customerInvoices.some(
        (invoice) => invoice.id === submission.customerInvoiceId,
      ),
    ),
  };

  for (const booking of migrated.bookings) {
    if (migrated.customerInvoices.some((item) => item.bookingId === booking.id))
      continue;
    const teacher = migrated.teachers.find(
      (item) => item.id === booking.teacherId,
    );
    const student = migrated.students.find(
      (item) => item.id === booking.studentId,
    );
    if (!teacher || !student) continue;
    const invoice = createCustomerInvoice(
      migrated,
      booking,
      student,
      teacher,
      migrated.activities.find((item) => item.id === booking.activityId),
      booking.createdAt,
    );
    migrated = {
      ...migrated,
      customerInvoices: [...migrated.customerInvoices, invoice],
    };
  }
  for (const invoice of migrated.customerInvoices) {
    if (
      migrated.fiscalSubmissions.some(
        (item) => item.customerInvoiceId === invoice.id,
      )
    )
      continue;
    migrated = {
      ...migrated,
      fiscalSubmissions: [
        ...migrated.fiscalSubmissions,
        createFiscalSubmission(invoice),
      ],
    };
  }
  return migrated;
}
