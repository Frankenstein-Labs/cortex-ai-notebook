import { describe, expect, it, vi } from "vitest";
import { JupyterHubHttpAdapter } from "./jupyterhub-adapter";

const response = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;

describe("JupyterHubHttpAdapter", () => {
  it("discovers real Hub capabilities with an auth header", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ version: "5.0" }));
    const adapter = new JupyterHubHttpAdapter({
      baseUrl: "https://hub.example",
      apiToken: "secret",
      fetchImpl,
    });
    const capabilities = await adapter.discoverCapabilities();
    expect(capabilities.every((capability) => capability.available)).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://hub.example/hub/api",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "token secret" }) })
    );
  });

  it("starts a scoped server with resource limits", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({}));
    const adapter = new JupyterHubHttpAdapter({
      baseUrl: "https://hub.example/",
      apiToken: "secret",
      fetchImpl,
    });
    const runtime = await adapter.start({
      projectId: "project_1",
      userId: "user_1",
      policy: {
        runAsNonRoot: true,
        allowPrivileged: false,
        allowHostNetwork: false,
        allowHostPid: false,
        allowHostMounts: false,
        networkAccess: "DENY",
        maxTtlMinutes: 60,
        cpuLimit: 2,
        memoryLimitMb: 4096,
        gpuLimit: 0,
      },
    });
    expect(runtime.proxyPath).toContain("/user/cortex-user_1/project-project_1/lab");
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("/hub/api/users/cortex-user_1/servers/project-project_1"),
      expect.objectContaining({ method: "POST", body: expect.stringContaining('"cpu_limit":2') })
    );
  });

  it("refuses proxy sessions for a different user", async () => {
    const adapter = new JupyterHubHttpAdapter({
      baseUrl: "https://hub.example",
      apiToken: "secret",
      fetchImpl: vi.fn(),
    });
    await expect(adapter.createProxySession("cortex-user_1/project-project_1", "user_2")).rejects.toThrow(
      "not owned"
    );
  });
});
