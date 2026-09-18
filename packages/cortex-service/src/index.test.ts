import { describe, expect, it, vi } from "vitest";
import { createCortexProject, listCortexProjects } from "./index";

const project = {
  id: "project_1",
  workspaceId: "workspace_1",
  createdBy: "user_1",
  name: "Classifier",
  slug: "classifier",
  description: null,
  status: "ACTIVE" as const,
  createdAt: new Date("2026-09-18T00:00:00Z"),
  updatedAt: new Date("2026-09-18T00:00:00Z"),
};

describe("Cortex project service", () => {
  it("creates projects with the caller's workspace scope", async () => {
    const create = vi.fn().mockResolvedValue(project);
    const repository = { cortexProject: { create, findMany: vi.fn() } } as never;

    await createCortexProject(repository, {
      workspaceId: "workspace_1",
      createdBy: "user_1",
      name: "Classifier",
      slug: "classifier",
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace_1",
        createdBy: "user_1",
        name: "Classifier",
        slug: "classifier",
        description: null,
      },
    });
  });

  it("always scopes listings by workspace and active status", async () => {
    const findMany = vi.fn().mockResolvedValue([project]);
    const repository = { cortexProject: { create: vi.fn(), findMany } } as never;

    await listCortexProjects(repository, "workspace_1");

    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId: "workspace_1", status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
    });
  });
});
