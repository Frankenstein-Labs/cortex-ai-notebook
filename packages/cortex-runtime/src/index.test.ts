import { describe, expect, it } from "vitest";
import { assertSafeRuntimePolicy, jupyterRuntimeSchema } from "./index";

const safePolicy = {
  runAsNonRoot: true as const,
  allowPrivileged: false as const,
  allowHostNetwork: false as const,
  allowHostPid: false as const,
  allowHostMounts: false as const,
  networkAccess: "DENY" as const,
  maxTtlMinutes: 60,
  cpuLimit: 2,
  memoryLimitMb: 4096,
  gpuLimit: 0,
};

describe("Jupyter runtime security contracts", () => {
  it("requires non-root, non-privileged runtime policies", () => {
    expect(assertSafeRuntimePolicy(safePolicy).runAsNonRoot).toBe(true);
    expect(() => assertSafeRuntimePolicy({ ...safePolicy, allowPrivileged: true } as never)).toThrow();
  });

  it("limits allowlisted network runtimes to a short TTL", () => {
    expect(() =>
      assertSafeRuntimePolicy({ ...safePolicy, networkAccess: "ALLOWLIST", maxTtlMinutes: 121 })
    ).toThrow("120 minutes");
  });

  it("accepts only proxy paths scoped to a Jupyter user", () => {
    const runtime = {
      id: "runtime_1",
      projectId: "project_1",
      provider: "jupyterhub",
      kind: "CONTAINER",
      status: "READY",
      proxyPath: "/user/alice/lab",
      capabilities: [],
      securityPolicy: safePolicy,
    };
    expect(jupyterRuntimeSchema.parse(runtime).proxyPath).toBe("/user/alice/lab");
    expect(() => jupyterRuntimeSchema.parse({ ...runtime, proxyPath: "https://unsafe.example" })).toThrow();
  });
});
