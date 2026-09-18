import { NextResponse } from "next/server";
import { cortexModelCreateSchema } from "@formbricks/cortex-types/registry";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const GET = async (_request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const models = await prisma.cortexModel.findMany({
    where: { workspaceId },
    include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ models });
};

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Model Registry administration requires manage access" },
      { status: 403 }
    );
  const parsed = cortexModelCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid model", issues: parsed.error.flatten() }, { status: 400 });
  const model = await prisma.cortexModel.create({
    data: { ...parsed.data, workspaceId, createdBy: auth.session.user.id },
  });
  return NextResponse.json({ model }, { status: 201 });
};
