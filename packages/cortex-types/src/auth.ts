import { z } from "zod";

export const cortexScopeSchema = z.enum([
  "projects:read",
  "projects:write",
  "runtimes:read",
  "runtimes:write",
  "notebooks:read",
  "notebooks:write",
  "files:read",
  "files:write",
  "tokens:read",
  "tokens:write",
  "permissions:read",
  "permissions:write",
]);
export type CortexScope = z.infer<typeof cortexScopeSchema>;

export const cortexPermissionRoleSchema = z.enum(["VIEWER", "EDITOR", "RUNNER", "ADMIN"]);
export type CortexPermissionRole = z.infer<typeof cortexPermissionRoleSchema>;

export const cortexTokenCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  projectId: z.string().min(1).optional(),
  scopes: z.array(cortexScopeSchema).min(1).max(20),
  expiresAt: z.coerce.date().optional(),
});
export type CortexTokenCreate = z.infer<typeof cortexTokenCreateSchema>;

export const cortexTokenMetadataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  prefix: z.string().regex(/^ctx_[a-z0-9]+$/),
  scopes: z.array(cortexScopeSchema),
  projectId: z.string().nullable(),
  createdBy: z.string().min(1),
  lastUsedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  revokedAt: z.coerce.date().nullable(),
});
export type CortexTokenMetadata = z.infer<typeof cortexTokenMetadataSchema>;

export const roleScopes: Record<CortexPermissionRole, readonly CortexScope[]> = {
  VIEWER: ["projects:read", "runtimes:read", "notebooks:read", "files:read"],
  EDITOR: [
    "projects:read",
    "projects:write",
    "runtimes:read",
    "notebooks:read",
    "notebooks:write",
    "files:read",
    "files:write",
  ],
  RUNNER: ["projects:read", "runtimes:read", "runtimes:write", "notebooks:read", "files:read"],
  ADMIN: cortexScopeSchema.options,
};

export const scopeAllowedByRole = (role: CortexPermissionRole, scope: CortexScope) =>
  roleScopes[role].includes(scope);
