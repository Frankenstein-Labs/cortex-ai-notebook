import { z } from "zod";

export const cortexProjectStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);
export type CortexProjectStatus = z.infer<typeof cortexProjectStatusSchema>;

export const cortexRuntimeKindSchema = z.enum(["LOCAL", "CONTAINER", "CLOUD"]);
export type CortexRuntimeKind = z.infer<typeof cortexRuntimeKindSchema>;

export const cortexRuntimeStatusSchema = z.enum(["PROVISIONING", "READY", "BUSY", "STOPPED", "ERROR"]);
export type CortexRuntimeStatus = z.infer<typeof cortexRuntimeStatusSchema>;

export const cortexCapabilitySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  available: z.boolean(),
  reason: z.string().optional(),
});
export type CortexCapability = z.infer<typeof cortexCapabilitySchema>;

export const cortexProjectSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(500).nullable(),
  status: cortexProjectStatusSchema,
  createdBy: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CortexProject = z.infer<typeof cortexProjectSchema>;

export const cortexRuntimeSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  provider: z.string().min(1),
  kind: cortexRuntimeKindSchema,
  status: cortexRuntimeStatusSchema,
  cpu: z.number().int().positive().optional(),
  memoryMb: z.number().int().positive().optional(),
  gpu: z.number().int().nonnegative().optional(),
  capabilities: z.array(cortexCapabilitySchema),
});
export type CortexRuntime = z.infer<typeof cortexRuntimeSchema>;

export interface NotebookRuntimeAdapter {
  readonly provider: string;
  getCapabilities(): Promise<ReadonlyArray<CortexCapability>>;
  getRuntime(runtimeId: string): Promise<CortexRuntime>;
}

export interface ModelProviderAdapter {
  readonly provider: string;
  search(
    query: string
  ): Promise<ReadonlyArray<{ repository: string; revision?: string; capabilities: string[] }>>;
}

export interface DatasetProviderAdapter {
  readonly provider: string;
  search(query: string): Promise<ReadonlyArray<{ repository: string; revision?: string }>>;
}

export interface ExecutionAdapter {
  readonly provider: string;
  submit(input: {
    projectId: string;
    entrypoint: string;
    environment?: Record<string, string>;
  }): Promise<{ runId: string }>;
  getStatus(runId: string): Promise<"QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED">;
  cancel(runId: string): Promise<void>;
}
