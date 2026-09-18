import { describe, expect, it } from "vitest";
import { gitBranchSchema, gitRepositorySchema, gitRevisionSchema } from "./index";

describe("Cortex Git contracts", () => {
  it("accepts an internal repository without a GitHub dependency", () => {
    expect(
      gitRepositorySchema.parse({
        id: "repo_1",
        projectId: "project_1",
        name: "notebooks",
        defaultBranch: "main",
        provider: "INTERNAL",
      }).provider
    ).toBe("INTERNAL");
  });

  it("requires immutable-looking revision hashes and parent history", () => {
    const revision = gitRevisionSchema.parse({
      id: "rev_1",
      repositoryId: "repo_1",
      hash: "abcdef1234567",
      message: "Add notebook",
      authorId: "user_1",
      parentHashes: [],
      createdAt: new Date(),
    });
    expect(revision.parentHashes).toEqual([]);
    expect(() => gitRevisionSchema.parse({ ...revision, hash: "not-a-hash" })).toThrow();
  });

  it("allows an empty branch head for a newly initialized repository", () => {
    expect(
      gitBranchSchema.parse({ name: "main", repositoryId: "repo_1", headHash: null, protected: true })
        .headHash
    ).toBeNull();
  });
});
