import { NextResponse } from "next/server";
import {
  type CortexTokenDatabase,
  createCortexToken,
  listCortexTokens,
} from "@formbricks/cortex-service/tokens";
import { cortexTokenCreateSchema } from "@formbricks/cortex-types/auth";
import { prisma } from "@formbricks/database";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const GET = async (_request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Cortex token administration requires manage access" },
      { status: 403 }
    );
  return NextResponse.json({
    tokens: await listCortexTokens(prisma as unknown as CortexTokenDatabase, workspaceId),
  });
};

export const POST = async (request: Request, context: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await context.params;
  const auth = await getWorkspaceAuth(workspaceId);
  if (!auth.hasManageAccess)
    return NextResponse.json(
      { error: "Cortex token administration requires manage access" },
      { status: 403 }
    );
  const parsed = cortexTokenCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid token configuration", issues: parsed.error.flatten() },
      { status: 400 }
    );
  try {
    const result = await createCortexToken(prisma as unknown as CortexTokenDatabase, {
      ...parsed.data,
      workspaceId,
      createdBy: auth.session.user.id,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create token" },
      { status: 400 }
    );
  }
};
