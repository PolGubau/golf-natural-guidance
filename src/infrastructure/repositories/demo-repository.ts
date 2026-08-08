import type { DemoData } from "~/domain/models";

export type RepositoryLoadResult = { data: DemoData; recovered: boolean };

export interface DemoRepository {
  load(): Promise<RepositoryLoadResult>;
  save(data: DemoData): Promise<void>;
  reset(): Promise<RepositoryLoadResult>;
}
