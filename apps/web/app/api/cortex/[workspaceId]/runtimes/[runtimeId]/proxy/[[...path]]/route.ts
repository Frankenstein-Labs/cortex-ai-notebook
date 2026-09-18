import { NextResponse } from "next/server";
import { JupyterHubHttpAdapter } from "@formbricks/cortex-runtime/jupyterhub-adapter";
import { prisma } from "@formbricks/database";
import { env } from "@/lib/env";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

const getAdapter = () => {
  return {
    baseUrl: env.HUB_API_URL.replace(/\/$/, ""),
    adapter: new JupyterHubHttpAdapter({ baseUrl: env.HUB_API_URL, apiToken: env.HUB_API_KEY }),
  };
};

const proxy = async (
  request: Request,
  context: { params: Promise<{ workspaceId: string; runtimeId: string; path?: string[] }> }
) => {
  const { workspaceId, runtimeId, path = [] } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  const runtime = await prisma.cortexRuntime.findFirst({
    where: { id: runtimeId, project: { workspaceId } },
  });
  if (!runtime) return NextResponse.json({ error: "Runtime not found" }, { status: 404 });
  const configured = getAdapter();
  if (!configured) return NextResponse.json({ error: "JupyterHub is not configured" }, { status: 503 });
  if (request.headers.get("upgrade")?.toLowerCase() === "websocket")
    return NextResponse.json(
      { error: "WebSocket proxy requires the configured JupyterHub ingress" },
      { status: 426 }
    );
  const session = await configured.adapter.createProxySession(runtime.id, auth.session.user.id);
  const target = `${configured.baseUrl}${session.path}${path.length ? `/${path.map(encodeURIComponent).join("/")}` : ""}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("authorization");
  headers.set("authorization", `token ${env.HUB_API_KEY}`);
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    duplex: "half",
  } as RequestInit);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("set-cookie");
  responseHeaders.set("cache-control", "no-store");
  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
};

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
