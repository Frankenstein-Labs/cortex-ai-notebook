import { NextResponse } from "next/server";
import { JupyterHubHttpAdapter } from "@formbricks/cortex-runtime/jupyterhub-adapter";
import { prisma } from "@formbricks/database";
import { env } from "@/lib/env";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

const getAdapter = () => {
  return new JupyterHubHttpAdapter({ baseUrl: env.HUB_API_URL, apiToken: env.HUB_API_KEY });
};

const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasReadWriteAccess) return jsonError("Workspace write access is required", 403);
  const adapter = getAdapter();
  if (!adapter) return jsonError("JupyterHub is not configured", 503);
  const body = (await request.json()) as {
    projectId?: string;
    policy?: Parameters<typeof adapter.start>[0]["policy"];
  };
  if (!body.projectId) return jsonError("projectId is required", 400);
  const project = await prisma.cortexProject.findFirst({
    where: { id: body.projectId, workspaceId, status: "ACTIVE" },
  });
  if (!project) return jsonError("Cortex project not found", 404);
  const runtime = await adapter.start({
    projectId: project.id,
    userId: auth.session.user.id,
    policy: body.policy ?? {
      runAsNonRoot: true,
      allowPrivileged: false,
      allowHostNetwork: false,
      allowHostPid: false,
      allowHostMounts: false,
      networkAccess: "DENY",
      maxTtlMinutes: 60,
      cpuLimit: 1,
      memoryLimitMb: 2048,
      gpuLimit: 0,
    },
  });
  const saved = await prisma.cortexRuntime.create({
    data: {
      id: runtime.id,
      projectId: project.id,
      provider: runtime.provider,
      kind: runtime.kind,
      status: runtime.status,
      cpu: runtime.securityPolicy.cpuLimit,
      memoryMb: runtime.securityPolicy.memoryLimitMb,
      gpu: runtime.securityPolicy.gpuLimit,
    },
  });
  return NextResponse.json(
    { runtime: { ...saved, proxyPath: runtime.proxyPath, capabilities: runtime.capabilities } },
    { status: 201 }
  );
};

export const GET = async (_request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  await getWorkspaceAuth(workspaceId);
  const runtimes = await prisma.cortexRuntime.findMany({
    where: { project: { workspaceId }, status: { not: "STOPPED" } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ runtimes });
};
