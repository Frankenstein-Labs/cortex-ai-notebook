import { NextResponse } from "next/server";
import { cortexEvaluationCreateSchema } from "@formbricks/cortex-types/experiments";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const POST = async (
  request: Request,
  context: { params: Promise<{ workspaceId: string; experimentId: string }> }
) => {
  const { workspaceId, experimentId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json({ error: "Evaluation administration requires manage access" }, { status: 403 });
  const experiment = await prisma.cortexExperiment.findFirst({
    where: { id: experimentId, workspaceId },
    select: { id: true },
  });
  if (!experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  const parsed = cortexEvaluationCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid evaluator", issues: parsed.error.flatten() }, { status: 400 });
  const evaluation = await prisma.cortexEvaluation.create({
    data: { ...parsed.data, experimentId, status: "DRAFT" },
  });
  return NextResponse.json({ evaluation }, { status: 201 });
};
