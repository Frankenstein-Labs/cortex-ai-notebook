import { z } from "zod";
import {
  cortexCapabilitySchema,
  cortexRuntimeKindSchema,
  cortexRuntimeStatusSchema,
} from "@formbricks/cortex-types";

export const runtimeSecurityPolicySchema = z.object({
  runAsNonRoot: z.literal(true),
  allowPrivileged: z.literal(false),
  allowHostNetwork: z.literal(false),
  allowHostPid: z.literal(false),
  allowHostMounts: z.literal(false),
  networkAccess: z.enum(["DENY", "ALLOWLIST"]),
  maxTtlMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60),
  cpuLimit: z.number().positive(),
  memoryLimitMb: z.number().int().positive(),
  gpuLimit: z.number().int().nonnegative(),
});
export type RuntimeSecurityPolicy = z.infer<typeof runtimeSecurityPolicySchema>;

export const jupyterRuntimeSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  provider: z.string().min(1),
  kind: cortexRuntimeKindSchema,
  status: cortexRuntimeStatusSchema,
  proxyPath: z.string().startsWith("/user/").optional(),
  capabilities: z.array(cortexCapabilitySchema),
  securityPolicy: runtimeSecurityPolicySchema,
});
export type JupyterRuntime = z.infer<typeof jupyterRuntimeSchema>;

export interface JupyterRuntimeAdapter {
  readonly provider: string;
  discoverCapabilities(): Promise<ReadonlyArray<z.infer<typeof cortexCapabilitySchema>>>;
  start(input: { projectId: string; userId: string; policy: RuntimeSecurityPolicy }): Promise<JupyterRuntime>;
  status(runtimeId: string): Promise<JupyterRuntime>;
  stop(runtimeId: string): Promise<void>;
  createProxySession(runtimeId: string, userId: string): Promise<{ path: string; expiresAt: Date }>;
}

export const assertSafeRuntimePolicy = (policy: RuntimeSecurityPolicy) => {
  const parsed = runtimeSecurityPolicySchema.parse(policy);
  if (parsed.networkAccess === "ALLOWLIST" && parsed.maxTtlMinutes > 120) {
    throw new Error("Allowlisted network runtimes must expire within 120 minutes");
  }
  return parsed;
};
