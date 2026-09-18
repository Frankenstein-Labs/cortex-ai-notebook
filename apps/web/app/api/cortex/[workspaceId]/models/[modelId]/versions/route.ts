import { NextResponse } from "next/server";
import { cortexModelVersionCreateSchema } from "@formbricks/cortex-types/registry";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const POST = async (
  request: Request,
  context: { params: Promise<{ workspaceId: string; modelId: string }> }
) => {
  const { workspaceId, modelId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Model Registry administration requires manage access" },
      { status: 403 }
    );
  const model = await prisma.cortexModel.findFirst({
    where: { id: modelId, workspaceId },
    select: { id: true },
  });
  if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });
  const parsed = cortexModelVersionCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid model version", issues: parsed.error.flatten() },
      { status: 400 }
    );
  const version = await prisma.cortexModelVersion.create({ data: { ...parsed.data, modelId } });
  return NextResponse.json({ version }, { status: 201 });
};
