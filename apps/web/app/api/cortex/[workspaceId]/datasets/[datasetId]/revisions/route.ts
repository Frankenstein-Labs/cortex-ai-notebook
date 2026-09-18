import { NextResponse } from "next/server";
import { cortexDatasetRevisionCreateSchema } from "@formbricks/cortex-types/registry";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const POST = async (
  request: Request,
  context: { params: Promise<{ workspaceId: string; datasetId: string }> }
) => {
  const { workspaceId, datasetId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Dataset Registry administration requires manage access" },
      { status: 403 }
    );
  const dataset = await prisma.cortexDataset.findFirst({
    where: { id: datasetId, workspaceId },
    select: { id: true },
  });
  if (!dataset) return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  const parsed = cortexDatasetRevisionCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid dataset revision", issues: parsed.error.flatten() },
      { status: 400 }
    );
  const revision = await prisma.cortexDatasetRevision.create({ data: { ...parsed.data, datasetId } });
  return NextResponse.json({ revision }, { status: 201 });
};
