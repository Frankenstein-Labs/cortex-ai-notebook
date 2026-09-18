-- Cortex Foundation: tenant-scoped projects, notebooks, files and runtimes.
-- Additive migration; existing Formbricks tables and data are untouched.

CREATE TYPE "CortexProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "CortexNotebookStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "CortexRuntimeKind" AS ENUM ('LOCAL', 'CONTAINER', 'CLOUD');
CREATE TYPE "CortexRuntimeStatus" AS ENUM ('PROVISIONING', 'READY', 'BUSY', 'STOPPED', 'ERROR');

CREATE TABLE "cortex_projects" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "CortexProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "cortex_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cortex_notebooks" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" "CortexNotebookStatus" NOT NULL DEFAULT 'DRAFT',
    CONSTRAINT "cortex_notebooks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cortex_files" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" BIGINT,
    "checksum" TEXT,
    "storage_key" TEXT NOT NULL,
    CONSTRAINT "cortex_files_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cortex_runtimes" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "kind" "CortexRuntimeKind" NOT NULL,
    "status" "CortexRuntimeStatus" NOT NULL DEFAULT 'STOPPED',
    "cpu" INTEGER,
    "memory_mb" INTEGER,
    "gpu" INTEGER,
    CONSTRAINT "cortex_runtimes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cortex_projects_workspace_id_slug_key" ON "cortex_projects"("workspace_id", "slug");
CREATE INDEX "cortex_projects_workspace_id_status_idx" ON "cortex_projects"("workspace_id", "status");
CREATE UNIQUE INDEX "cortex_notebooks_project_id_path_key" ON "cortex_notebooks"("project_id", "path");
CREATE UNIQUE INDEX "cortex_files_project_id_path_key" ON "cortex_files"("project_id", "path");
CREATE INDEX "cortex_runtimes_project_id_status_idx" ON "cortex_runtimes"("project_id", "status");

ALTER TABLE "cortex_projects" ADD CONSTRAINT "cortex_projects_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_projects" ADD CONSTRAINT "cortex_projects_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cortex_notebooks" ADD CONSTRAINT "cortex_notebooks_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "cortex_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_files" ADD CONSTRAINT "cortex_files_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "cortex_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_runtimes" ADD CONSTRAINT "cortex_runtimes_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "cortex_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
