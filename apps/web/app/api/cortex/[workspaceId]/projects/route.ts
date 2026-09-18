import { NextResponse } from "next/server";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasReadWriteAccess)
    return NextResponse.json({ error: "Workspace write access is required" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { name?: string; slug?: string };
  const name = body.name?.trim() || "My first Cortex project";
  const slug = body.slug?.trim() || "default-project";
  const project = await prisma.cortexProject.upsert({
    where: { workspaceId_slug: { workspaceId, slug } },
    update: { status: "ACTIVE" },
    create: { workspaceId, createdBy: auth.session.user.id, name, slug },
  });
  return NextResponse.json({ project }, { status: 201 });
};
