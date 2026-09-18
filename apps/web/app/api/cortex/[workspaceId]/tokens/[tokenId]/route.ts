import { NextResponse } from "next/server";
import {
  type CortexTokenDatabase,
  revokeCortexToken,
  rotateCortexToken,
} from "@formbricks/cortex-service/tokens";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const DELETE = async (
  _request: Request,
  context: { params: Promise<{ workspaceId: string; tokenId: string }> }
) => {
  const { workspaceId, tokenId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Cortex token administration requires manage access" },
      { status: 403 }
    );
  try {
    await revokeCortexToken(prisma as unknown as CortexTokenDatabase, workspaceId, tokenId);
    return NextResponse.json({ revoked: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to revoke token" },
      { status: 404 }
    );
  }
};

export const POST = async (
  _request: Request,
  context: { params: Promise<{ workspaceId: string; tokenId: string }> }
) => {
  const { workspaceId, tokenId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Cortex token administration requires manage access" },
      { status: 403 }
    );
  try {
    return NextResponse.json(
      await rotateCortexToken(prisma as unknown as CortexTokenDatabase, {
        workspaceId,
        tokenId,
        actorId: auth.session.user.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to rotate token" },
      { status: 404 }
    );
  }
};
