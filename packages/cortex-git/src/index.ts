import { z } from "zod";

export const gitRepositorySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  defaultBranch: z.string().regex(/^[a-zA-Z0-9._/-]+$/),
  provider: z.enum(["INTERNAL", "GITHUB"]),
});
export type GitRepository = z.infer<typeof gitRepositorySchema>;

export const gitRevisionSchema = z.object({
  id: z.string().min(1),
  repositoryId: z.string().min(1),
  hash: z.string().regex(/^[0-9a-f]{7,64}$/),
  message: z.string().min(1).max(500),
  authorId: z.string().min(1),
  parentHashes: z.array(z.string().regex(/^[0-9a-f]{7,64}$/)),
  createdAt: z.coerce.date(),
});
export type GitRevision = z.infer<typeof gitRevisionSchema>;

export const gitBranchSchema = z.object({
  name: z.string().regex(/^[a-zA-Z0-9._/-]+$/),
  repositoryId: z.string().min(1),
  headHash: z
    .string()
    .regex(/^[0-9a-f]{7,64}$/)
    .nullable(),
  protected: z.boolean(),
});
export type GitBranch = z.infer<typeof gitBranchSchema>;

export interface CortexGitAdapter {
  readonly provider: GitRepository["provider"];
  createRepository(input: { projectId: string; name: string }): Promise<GitRepository>;
  createCommit(input: {
    repositoryId: string;
    branch: string;
    message: string;
    authorId: string;
    files: ReadonlyArray<{ path: string; content: string }>;
  }): Promise<GitRevision>;
  listBranches(repositoryId: string): Promise<ReadonlyArray<GitBranch>>;
  checkout(repositoryId: string, branch: string): Promise<ReadonlyArray<{ path: string; content: string }>>;
}
