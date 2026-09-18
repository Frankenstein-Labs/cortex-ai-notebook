import { type JupyterRuntime, type RuntimeSecurityPolicy, assertSafeRuntimePolicy } from "./index";

export type JupyterHubAdapterConfig = {
  baseUrl: string;
  apiToken: string;
  userPrefix?: string;
  fetchImpl?: typeof fetch;
};

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, "");
const encode = (value: string) => encodeURIComponent(value);

export class JupyterHubHttpAdapter {
  readonly provider = "jupyterhub" as const;
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly userPrefix: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: JupyterHubAdapterConfig) {
    if (!/^https?:\/\//.test(config.baseUrl)) throw new Error("JupyterHub baseUrl must use HTTP(S)");
    if (!config.apiToken.trim()) throw new Error("JupyterHub apiToken is required");
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.apiToken = config.apiToken;
    this.userPrefix = config.userPrefix ?? "cortex";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  private async request(path: string, init?: RequestInit) {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `token ${this.apiToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (!response.ok) throw new Error(`JupyterHub request failed: ${response.status}`);
    return response.status === 204 ? null : response.json();
  }

  async discoverCapabilities() {
    const info = await this.request("/hub/api");
    return [
      { id: "jupyter-server", label: "Jupyter Server", available: true },
      { id: "jupyterlab", label: "JupyterLab", available: true },
      {
        id: "terminals",
        label: "Terminals",
        available: info?.version !== undefined,
        reason: info?.version ? undefined : "Hub version unavailable",
      },
      { id: "kernels", label: "Kernels", available: true },
    ];
  }

  async start(input: {
    projectId: string;
    userId: string;
    policy: RuntimeSecurityPolicy;
  }): Promise<JupyterRuntime> {
    const policy = assertSafeRuntimePolicy(input.policy);
    const user = `${this.userPrefix}-${input.userId}`;
    const server = `project-${input.projectId}`;
    await this.request(`/hub/api/users/${encode(user)}/servers/${encode(server)}`, {
      method: "POST",
      body: JSON.stringify({
        image: "jupyter/base-notebook",
        cpu_limit: policy.cpuLimit,
        mem_limit: `${policy.memoryLimitMb}M`,
        environment: { CORTEX_PROJECT_ID: input.projectId },
      }),
    });
    return {
      id: `${user}/${server}`,
      projectId: input.projectId,
      provider: this.provider,
      kind: "CONTAINER",
      status: "PROVISIONING",
      proxyPath: `/user/${encode(user)}/${encode(server)}/lab`,
      capabilities: await this.discoverCapabilities(),
      securityPolicy: policy,
    };
  }

  async status(runtimeId: string): Promise<JupyterRuntime> {
    const [user, server] = runtimeId.split("/");
    if (!user || !server) throw new Error("Invalid Jupyter runtime id");
    const data = await this.request(`/hub/api/users/${encode(user)}/servers/${encode(server)}`);
    const status = data?.ready ? "READY" : data?.pending ? "PROVISIONING" : "STOPPED";
    return {
      id: runtimeId,
      projectId: data?.user_options?.CORTEX_PROJECT_ID ?? "unknown",
      provider: this.provider,
      kind: "CONTAINER",
      status,
      proxyPath: `/user/${encode(user)}/${encode(server)}/lab`,
      capabilities: await this.discoverCapabilities(),
      securityPolicy: {
        runAsNonRoot: true,
        allowPrivileged: false,
        allowHostNetwork: false,
        allowHostPid: false,
        allowHostMounts: false,
        networkAccess: "DENY",
        maxTtlMinutes: 60,
        cpuLimit: 1,
        memoryLimitMb: 1024,
        gpuLimit: 0,
      },
    };
  }

  async stop(runtimeId: string) {
    const [user, server] = runtimeId.split("/");
    if (!user || !server) throw new Error("Invalid Jupyter runtime id");
    await this.request(`/hub/api/users/${encode(user)}/servers/${encode(server)}`, { method: "DELETE" });
  }

  async createProxySession(runtimeId: string, userId: string) {
    const [runtimeUser, server] = runtimeId.split("/");
    if (!runtimeUser || !server || !userId || runtimeUser !== `${this.userPrefix}-${userId}`)
      throw new Error("Runtime is not owned by the requested user");
    return {
      path: `/user/${encode(runtimeUser)}/${encode(server)}/lab`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
  }
}
