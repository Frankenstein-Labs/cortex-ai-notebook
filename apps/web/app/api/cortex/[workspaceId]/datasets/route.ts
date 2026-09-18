import { NextResponse } from "next/server";
import { cortexDatasetCreateSchema } from "@formbricks/cortex-types/registry";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const GET = async (_request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const datasets = await prisma.cortexDataset.findMany({
    where: { workspaceId },
    include: { revisions: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ datasets });
};

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Dataset Registry administration requires manage access" },
      { status: 403 }
    );
  const parsed = cortexDatasetCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid dataset", issues: parsed.error.flatten() }, { status: 400 });
  const dataset = await prisma.cortexDataset.create({
    data: { ...parsed.data, workspaceId, createdBy: auth.session.user.id },
  });
  return NextResponse.json({ dataset }, { status: 201 });
};
