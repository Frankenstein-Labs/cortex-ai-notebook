import { NextResponse } from "next/server";
import { cortexExperimentRunCreateSchema } from "@formbricks/cortex-types/experiments";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const POST = async (
  request: Request,
  context: { params: Promise<{ workspaceId: string; experimentId: string }> }
) => {
  const { workspaceId, experimentId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json({ error: "Experiment administration requires manage access" }, { status: 403 });
  const experiment = await prisma.cortexExperiment.findFirst({
    where: { id: experimentId, workspaceId },
    select: { id: true },
  });
  if (!experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  const parsed = cortexExperimentRunCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid run", issues: parsed.error.flatten() }, { status: 400 });
  const run = await prisma.cortexExperimentRun.create({
    data: { ...parsed.data, experimentId, status: "DRAFT" },
  });
  return NextResponse.json({ run }, { status: 201 });
};
