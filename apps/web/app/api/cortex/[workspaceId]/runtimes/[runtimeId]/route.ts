import { NextResponse } from "next/server";
import { JupyterHubHttpAdapter } from "@formbricks/cortex-runtime/jupyterhub-adapter";
import { prisma } from "@formbricks/database";
import { env } from "@/lib/env";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

const getAdapter = () => {
  return new JupyterHubHttpAdapter({ baseUrl: env.HUB_API_URL, apiToken: env.HUB_API_KEY });
};
const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

const resolveRuntime = async (workspaceId: string, runtimeId: string) => {
  const runtime = await prisma.cortexRuntime.findFirst({
    where: { id: runtimeId, project: { workspaceId } },
  });
  return runtime;
};

export const GET = async (
  _request: Request,
  context: { params: Promise<{ workspaceId: string; runtimeId: string }> }
) => {
  const { workspaceId, runtimeId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  const runtime = await resolveRuntime(workspaceId, runtimeId);
  if (!runtime) return error("Runtime not found", 404);
  const adapter = getAdapter();
  if (!adapter) return error("JupyterHub is not configured", 503);
  const status = await adapter.status(runtime.id);
  return NextResponse.json({ runtime: status, userId: auth.session.user.id });
};

export const POST = async (
  request: Request,
  context: { params: Promise<{ workspaceId: string; runtimeId: string }> }
) => {
  const { workspaceId, runtimeId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  const runtime = await resolveRuntime(workspaceId, runtimeId);
  if (!runtime) return error("Runtime not found", 404);
  const adapter = getAdapter();
  if (!adapter) return error("JupyterHub is not configured", 503);
  const body = (await request.json().catch(() => ({}))) as { action?: "stop" | "proxy" };
  if (body.action === "proxy") {
    const session = await adapter.createProxySession(runtime.id, auth.session.user.id);
    return NextResponse.json({ session });
  }
  if (!auth.hasReadWriteAccess) return error("Workspace write access is required", 403);
  await adapter.stop(runtime.id);
  await prisma.cortexRuntime.update({ where: { id: runtime.id }, data: { status: "STOPPED" } });
  return NextResponse.json({ stopped: true });
};
