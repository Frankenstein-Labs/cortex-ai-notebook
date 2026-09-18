import { z } from "zod";
import { cortexProjectSchema } from "@formbricks/cortex-types";

const projectInputSchema = z.object({
  workspaceId: z.string().min(1),
  createdBy: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).nullable().default(null),
});
export type CreateCortexProjectInput = z.input<typeof projectInputSchema>;

export type CortexProjectRecord = z.infer<typeof cortexProjectSchema>;
export type CortexProjectRepository = {
  cortexProject: {
    create(args: { data: z.output<typeof projectInputSchema> }): Promise<CortexProjectRecord>;
    findMany(args: {
      where: { workspaceId: string; status: "ACTIVE" };
      orderBy: { updatedAt: "desc" };
    }): Promise<ReadonlyArray<CortexProjectRecord>>;
  };
};

export const createCortexProject = async (
  repository: CortexProjectRepository,
  input: CreateCortexProjectInput
) => {
  const data = projectInputSchema.parse(input);
  const project = await repository.cortexProject.create({ data });
  return cortexProjectSchema.parse(project);
};

export const listCortexProjects = async (repository: CortexProjectRepository, workspaceId: string) => {
  const projects = await repository.cortexProject.findMany({
    where: { workspaceId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
  return projects.map((project) => cortexProjectSchema.parse(project));
};
