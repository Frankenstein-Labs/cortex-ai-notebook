import { createHash, randomBytes } from "node:crypto";
import {
  type CortexScope,
  cortexTokenCreateSchema,
  cortexTokenMetadataSchema,
} from "@formbricks/cortex-types/auth";

export type CortexTokenDatabase = {
  cortexProject: {
    findFirst(args: {
      where: { id: string; workspaceId: string };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
  cortexToken: {
    create(args: { data: Record<string, unknown> }): Promise<CortexTokenRecord>;
    findUnique(args: { where: { tokenHash: string } }): Promise<CortexTokenRecord | null>;
    findFirst(args: {
      where: { id: string; workspaceId: string; revokedAt: null };
    }): Promise<CortexTokenRecord | null>;
    findMany(args: {
      where: { workspaceId: string };
      orderBy: { createdAt: "desc" };
      select: Record<string, boolean>;
    }): Promise<ReadonlyArray<CortexTokenRecord>>;
    updateMany(args: {
      where: { id: string; workspaceId: string; revokedAt: null };
      data: { revokedAt: Date };
    }): Promise<{ count: number }>;
    update(args: {
      where: { id: string };
      data: { revokedAt?: Date; lastUsedAt?: Date };
    }): Promise<CortexTokenRecord>;
  };
};
type CortexTokenRecord = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  prefix: string;
  tokenHash: string;
  scopes: unknown;
  workspaceId: string;
  projectId: string | null;
  createdBy: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const issueSecret = () => `ctx_${randomBytes(32).toString("hex")}`;
const metadata = (token: {
  id: string;
  name: string;
  prefix: string;
  scopes: unknown;
  projectId: string | null;
  createdBy: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
}) => cortexTokenMetadataSchema.parse({ ...token, scopes: token.scopes as CortexScope[] });

export const createCortexToken = async (
  db: CortexTokenDatabase,
  input: {
    workspaceId: string;
    createdBy: string;
    name: string;
    projectId?: string;
    scopes: CortexScope[];
    expiresAt?: Date;
  }
) => {
  const parsed = cortexTokenCreateSchema.parse(input);
  if (parsed.expiresAt && parsed.expiresAt <= new Date())
    throw new Error("Token expiry must be in the future");
  if (parsed.projectId) {
    const project = await db.cortexProject.findFirst({
      where: { id: parsed.projectId, workspaceId: input.workspaceId },
      select: { id: true },
    });
    if (!project) throw new Error("Project is not in the requested workspace");
  }
  const secret = issueSecret();
  const record = await db.cortexToken.create({
    data: {
      name: parsed.name,
      prefix: secret.slice(0, 12),
      tokenHash: hashToken(secret),
      scopes: parsed.scopes,
      workspaceId: input.workspaceId,
      projectId: parsed.projectId,
      createdBy: input.createdBy,
      expiresAt: parsed.expiresAt,
    },
  });
  return { token: secret, metadata: metadata({ ...record, scopes: record.scopes }) };
};

export const listCortexTokens = async (db: CortexTokenDatabase, workspaceId: string) => {
  const records = await db.cortexToken.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      projectId: true,
      createdBy: true,
      lastUsedAt: true,
      expiresAt: true,
      revokedAt: true,
    },
  });
  return records.map(metadata);
};

export const revokeCortexToken = async (db: CortexTokenDatabase, workspaceId: string, tokenId: string) => {
  const result = await db.cortexToken.updateMany({
    where: { id: tokenId, workspaceId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (result.count !== 1) throw new Error("Token not found or already revoked");
};

export const rotateCortexToken = async (
  db: CortexTokenDatabase,
  input: { workspaceId: string; tokenId: string; actorId: string }
) => {
  const old = await db.cortexToken.findFirst({
    where: { id: input.tokenId, workspaceId: input.workspaceId, revokedAt: null },
  });
  if (!old) throw new Error("Token not found or already revoked");
  await db.cortexToken.update({ where: { id: old.id }, data: { revokedAt: new Date() } });
  return createCortexToken(db, {
    workspaceId: input.workspaceId,
    createdBy: input.actorId,
    name: old.name,
    projectId: old.projectId ?? undefined,
    scopes: old.scopes as CortexScope[],
    expiresAt: old.expiresAt ?? undefined,
  });
};

export const authenticateCortexToken = async (
  db: CortexTokenDatabase,
  rawToken: string,
  requiredScope: CortexScope,
  workspaceId: string,
  projectId?: string
) => {
  const record = await db.cortexToken.findUnique({ where: { tokenHash: hashToken(rawToken) } });
  if (
    !record ||
    record.workspaceId !== workspaceId ||
    record.revokedAt ||
    (record.expiresAt && record.expiresAt <= new Date())
  )
    return null;
  if (record.projectId && record.projectId !== projectId) return null;
  if (!(record.scopes as string[]).includes(requiredScope)) return null;
  await db.cortexToken.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } });
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    projectId: record.projectId,
    scopes: record.scopes as CortexScope[],
  };
};
