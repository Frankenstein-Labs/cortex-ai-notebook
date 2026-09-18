CREATE TYPE "CortexArtifactStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TABLE "cortex_models" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "provider" TEXT NOT NULL,
  "external_id" TEXT,
  "status" "CortexArtifactStatus" NOT NULL DEFAULT 'ACTIVE',
  "workspace_id" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  CONSTRAINT "cortex_models_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_models_workspace_id_slug_key" ON "cortex_models"("workspace_id", "slug");
CREATE INDEX "cortex_models_workspace_id_status_idx" ON "cortex_models"("workspace_id", "status");
ALTER TABLE "cortex_models" ADD CONSTRAINT "cortex_models_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_models" ADD CONSTRAINT "cortex_models_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "cortex_model_versions" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "model_id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "artifact_uri" TEXT NOT NULL,
  "checksum" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "cortex_model_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_model_versions_model_id_version_key" ON "cortex_model_versions"("model_id", "version");
CREATE INDEX "cortex_model_versions_model_id_created_at_idx" ON "cortex_model_versions"("model_id", "created_at");
ALTER TABLE "cortex_model_versions" ADD CONSTRAINT "cortex_model_versions_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "cortex_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cortex_datasets" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "provider" TEXT NOT NULL,
  "external_id" TEXT,
  "status" "CortexArtifactStatus" NOT NULL DEFAULT 'ACTIVE',
  "workspace_id" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  CONSTRAINT "cortex_datasets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_datasets_workspace_id_slug_key" ON "cortex_datasets"("workspace_id", "slug");
CREATE INDEX "cortex_datasets_workspace_id_status_idx" ON "cortex_datasets"("workspace_id", "status");
ALTER TABLE "cortex_datasets" ADD CONSTRAINT "cortex_datasets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_datasets" ADD CONSTRAINT "cortex_datasets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "cortex_dataset_revisions" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataset_id" TEXT NOT NULL,
  "revision" TEXT NOT NULL,
  "artifact_uri" TEXT NOT NULL,
  "checksum" TEXT,
  "row_count" BIGINT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "cortex_dataset_revisions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_dataset_revisions_dataset_id_revision_key" ON "cortex_dataset_revisions"("dataset_id", "revision");
CREATE INDEX "cortex_dataset_revisions_dataset_id_created_at_idx" ON "cortex_dataset_revisions"("dataset_id", "created_at");
ALTER TABLE "cortex_dataset_revisions" ADD CONSTRAINT "cortex_dataset_revisions_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "cortex_datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
