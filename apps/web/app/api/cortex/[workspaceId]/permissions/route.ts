import { NextResponse } from "next/server";
import { cortexPermissionRoleSchema } from "@formbricks/cortex-types/auth";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const GET = async (_request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Cortex permission administration requires manage access" },
      { status: 403 }
    );
  const grants = await prisma.cortexPermissionGrant.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ grants });
};

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Cortex permission administration requires manage access" },
      { status: 403 }
    );
  const body = (await request.json().catch(() => null)) as {
    userId?: string;
    projectId?: string;
    role?: string;
  } | null;
  const role = cortexPermissionRoleSchema.safeParse(body?.role);
  if (!body?.userId || !role.success)
    return NextResponse.json({ error: "userId and a valid role are required" }, { status: 400 });
  if (body.projectId) {
    const project = await prisma.cortexProject.findFirst({
      where: { id: body.projectId, workspaceId },
      select: { id: true },
    });
    if (!project) return NextResponse.json({ error: "Project is not in this workspace" }, { status: 404 });
  }
  const grant = await prisma.cortexPermissionGrant.upsert({
    where: {
      workspaceId_projectId_userId: { workspaceId, projectId: body.projectId ?? null, userId: body.userId },
    },
    update: { role: role.data },
    create: { workspaceId, projectId: body.projectId, userId: body.userId, role: role.data },
  });
  return NextResponse.json({ grant }, { status: 201 });
};
