import { z } from "zod";
import { registrySlugSchema } from "./registry";

export const cortexExperimentCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: registrySlugSchema,
  config: z.record(z.string(), z.unknown()).default({}),
  modelVersionId: z.string().min(1).optional(),
  datasetRevisionId: z.string().min(1).optional(),
});
export const cortexExperimentRunCreateSchema = z.object({
  parameters: z.record(z.string(), z.unknown()).default({}),
});
export const cortexEvaluationCreateSchema = z.object({
  evaluator: z.string().trim().min(1).max(120),
});
export const cortexDeploymentCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  target: z.enum(["vllm", "jupyter", "external"]),
  modelVersionId: z.string().min(1),
  config: z.record(z.string(), z.unknown()).default({}),
});
