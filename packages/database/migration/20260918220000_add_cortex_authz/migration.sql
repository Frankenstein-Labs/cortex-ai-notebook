-- Cortex API tokens and user permission grants.
CREATE TYPE "CortexPermissionRole" AS ENUM ('VIEWER', 'EDITOR', 'RUNNER', 'ADMIN');

CREATE TABLE "cortex_tokens" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "scopes" JSONB NOT NULL DEFAULT '[]',
  "workspace_id" TEXT NOT NULL,
  "project_id" TEXT,
  "created_by" TEXT NOT NULL,
  "last_used_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  CONSTRAINT "cortex_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_tokens_token_hash_key" ON "cortex_tokens"("token_hash");
CREATE INDEX "cortex_tokens_workspace_id_revoked_at_idx" ON "cortex_tokens"("workspace_id", "revoked_at");
CREATE INDEX "cortex_tokens_project_id_revoked_at_idx" ON "cortex_tokens"("project_id", "revoked_at");
ALTER TABLE "cortex_tokens" ADD CONSTRAINT "cortex_tokens_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_tokens" ADD CONSTRAINT "cortex_tokens_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cortex_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_tokens" ADD CONSTRAINT "cortex_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "cortex_permission_grants" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "role" "CortexPermissionRole" NOT NULL,
  "workspace_id" TEXT NOT NULL,
  "project_id" TEXT,
  "user_id" TEXT NOT NULL,
  CONSTRAINT "cortex_permission_grants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_permission_grants_workspace_id_project_id_user_id_key" ON "cortex_permission_grants"("workspace_id", "project_id", "user_id");
CREATE INDEX "cortex_permission_grants_user_id_workspace_id_idx" ON "cortex_permission_grants"("user_id", "workspace_id");
ALTER TABLE "cortex_permission_grants" ADD CONSTRAINT "cortex_permission_grants_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_permission_grants" ADD CONSTRAINT "cortex_permission_grants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cortex_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_permission_grants" ADD CONSTRAINT "cortex_permission_grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
