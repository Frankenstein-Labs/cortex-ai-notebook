import { describe, expect, it, vi } from "vitest";
import { authenticateCortexToken, createCortexToken, revokeCortexToken } from "./tokens";

const db = {
  cortexProject: { findFirst: vi.fn().mockResolvedValue({ id: "project_1" }) },
  cortexToken: {
    create: vi
      .fn()
      .mockImplementation(async ({ data }) => ({
        id: "token_1",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
        revokedAt: null,
        ...data,
      })),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    update: vi.fn(),
  },
} as any;

describe("Cortex token service", () => {
  it("returns a secret only at creation and stores a hash", async () => {
    const result = await createCortexToken(db, {
      workspaceId: "workspace_1",
      createdBy: "user_1",
      name: "CI",
      projectId: "project_1",
      scopes: ["projects:read"],
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(result.token).toMatch(/^ctx_/);
    expect(result.metadata.prefix).toBe(result.token.slice(0, 12));
    expect(db.cortexToken.create.mock.calls[0][0].data.tokenHash).not.toBe(result.token);
  });

  it("rejects expired tokens at creation", async () => {
    await expect(
      createCortexToken(db, {
        workspaceId: "workspace_1",
        createdBy: "user_1",
        name: "Expired",
        scopes: ["projects:read"],
        expiresAt: new Date(Date.now() - 1),
      })
    ).rejects.toThrow("future");
  });

  it("revokes only an active token in its workspace", async () => {
    await revokeCortexToken(db, "workspace_1", "token_1");
    expect(db.cortexToken.updateMany).toHaveBeenCalledWith({
      where: { id: "token_1", workspaceId: "workspace_1", revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it("denies a token that lacks the required scope", async () => {
    db.cortexToken.findUnique.mockResolvedValue({
      id: "token_1",
      workspaceId: "workspace_1",
      projectId: null,
      scopes: ["projects:read"],
      revokedAt: null,
      expiresAt: null,
    });
    expect(await authenticateCortexToken(db, "ctx_secret", "runtimes:write", "workspace_1")).toBeNull();
  });
});
