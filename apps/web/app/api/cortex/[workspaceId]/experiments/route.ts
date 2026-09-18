import { NextResponse } from "next/server";
import { cortexExperimentCreateSchema } from "@formbricks/cortex-types/experiments";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const GET = async (_request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const experiments = await prisma.cortexExperiment.findMany({
    where: { workspaceId },
    include: { runs: true, evaluations: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ experiments });
};

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json({ error: "Experiment administration requires manage access" }, { status: 403 });
  const parsed = cortexExperimentCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid experiment", issues: parsed.error.flatten() },
      { status: 400 }
    );
  const experiment = await prisma.cortexExperiment.create({
    data: { ...parsed.data, workspaceId, createdBy: auth.session.user.id },
  });
  return NextResponse.json({ experiment }, { status: 201 });
};
