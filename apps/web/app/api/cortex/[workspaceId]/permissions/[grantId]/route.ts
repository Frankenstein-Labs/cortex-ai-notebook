import { NextResponse } from "next/server";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const DELETE = async (
  _request: Request,
  context: { params: Promise<{ workspaceId: string; grantId: string }> }
) => {
  const { workspaceId, grantId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Cortex permission administration requires manage access" },
      { status: 403 }
    );
  const deleted = await prisma.cortexPermissionGrant.deleteMany({ where: { id: grantId, workspaceId } });
  if (deleted.count !== 1) return NextResponse.json({ error: "Permission grant not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
};
