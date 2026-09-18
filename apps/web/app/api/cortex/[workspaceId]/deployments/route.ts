import { NextResponse } from "next/server";
import { cortexDeploymentCreateSchema } from "@formbricks/cortex-types/experiments";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const GET = async (_request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deployments = await prisma.cortexDeployment.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ deployments });
};

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json({ error: "Deployment administration requires manage access" }, { status: 403 });
  const parsed = cortexDeploymentCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid deployment", issues: parsed.error.flatten() },
      { status: 400 }
    );
  const version = await prisma.cortexModelVersion.findFirst({
    where: { id: parsed.data.modelVersionId, model: { workspaceId } },
    select: { id: true },
  });
  if (!version)
    return NextResponse.json({ error: "Model version not found in this workspace" }, { status: 404 });
  const deployment = await prisma.cortexDeployment.create({
    data: { ...parsed.data, workspaceId, createdBy: auth.session.user.id, status: "PENDING" },
  });
  return NextResponse.json({ deployment }, { status: 201 });
};
