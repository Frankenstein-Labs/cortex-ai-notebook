import { z } from "zod";

export const cortexArtifactStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);
export const registrySlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const cortexModelCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: registrySlugSchema,
  description: z.string().trim().max(500).nullable().default(null),
  provider: z.string().trim().min(1).max(60),
  externalId: z.string().trim().max(300).optional(),
});
export const cortexModelVersionCreateSchema = z.object({
  version: z.string().trim().min(1).max(120),
  artifactUri: z.string().url().or(z.string().startsWith("s3://")).or(z.string().startsWith("hf://")),
  checksum: z.string().trim().max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export const cortexDatasetCreateSchema = cortexModelCreateSchema;
export const cortexDatasetRevisionCreateSchema = z.object({
  revision: z.string().trim().min(1).max(120),
  artifactUri: z.string().url().or(z.string().startsWith("s3://")).or(z.string().startsWith("hf://")),
  checksum: z.string().trim().max(256).optional(),
  rowCount: z.coerce.bigint().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
