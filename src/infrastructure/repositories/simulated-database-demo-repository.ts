import type { DemoData } from "~/domain/models";
import type { DemoRepository, RepositoryLoadResult } from "./demo-repository";

const writeLatencyMs = 650;

export class SimulatedDatabaseDemoRepository implements DemoRepository {
  constructor(private readonly storage: DemoRepository) {}

  load(): Promise<RepositoryLoadResult> {
    return this.storage.load();
  }

  async save(data: DemoData): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, writeLatencyMs));
    await this.storage.save(data);
  }

  reset(): Promise<RepositoryLoadResult> {
    return this.storage.reset();
  }
}
