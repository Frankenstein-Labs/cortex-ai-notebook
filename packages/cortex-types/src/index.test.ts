import { describe, expect, it } from "vitest";
import { cortexProjectSchema, cortexRuntimeSchema } from "./index";

describe("Cortex project contract", () => {
  it("accepts a tenant-scoped project with a stable slug", () => {
    const project = cortexProjectSchema.parse({
      id: "project_123",
      workspaceId: "workspace_123",
      name: "Support classifier",
      slug: "support-classifier",
      description: null,
      status: "ACTIVE",
      createdBy: "user_123",
      createdAt: "2026-09-18T00:00:00.000Z",
      updatedAt: "2026-09-18T00:00:00.000Z",
    });

    expect(project.slug).toBe("support-classifier");
  });

  it("rejects slugs that cannot be used in provider paths", () => {
    expect(() =>
      cortexProjectSchema.parse({
        id: "project_123",
        workspaceId: "workspace_123",
        name: "Support classifier",
        slug: "Support Classifier",
        description: null,
        status: "ACTIVE",
        createdBy: "user_123",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ).toThrow();
  });
});

describe("Cortex runtime contract", () => {
  it("does not imply availability when a capability is unavailable", () => {
    const runtime = cortexRuntimeSchema.parse({
      id: "runtime_123",
      projectId: "project_123",
      provider: "local",
      kind: "LOCAL",
      status: "READY",
      capabilities: [
        { id: "python", label: "Python kernel", available: true },
        { id: "gpu", label: "GPU", available: false, reason: "No local GPU detected" },
      ],
    });

    expect(runtime.capabilities.find((capability) => capability.id === "gpu")?.available).toBe(false);
  });
});
