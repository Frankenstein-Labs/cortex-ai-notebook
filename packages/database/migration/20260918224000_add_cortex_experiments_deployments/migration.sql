CREATE TYPE "CortexExperimentStatus" AS ENUM ('DRAFT', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
CREATE TYPE "CortexDeploymentStatus" AS ENUM ('PENDING', 'PROVISIONING', 'READY', 'FAILED', 'STOPPED');

CREATE TABLE "cortex_experiments" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "CortexExperimentStatus" NOT NULL DEFAULT 'DRAFT',
  "config" JSONB NOT NULL DEFAULT '{}',
  "model_version_id" TEXT,
  "dataset_revision_id" TEXT,
  "workspace_id" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  CONSTRAINT "cortex_experiments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_experiments_workspace_id_slug_key" ON "cortex_experiments"("workspace_id", "slug");
CREATE INDEX "cortex_experiments_workspace_id_status_idx" ON "cortex_experiments"("workspace_id", "status");
ALTER TABLE "cortex_experiments" ADD CONSTRAINT "cortex_experiments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_experiments" ADD CONSTRAINT "cortex_experiments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "cortex_experiment_runs" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "started_at" TIMESTAMP(3),
  "finished_at" TIMESTAMP(3),
  "status" "CortexExperimentStatus" NOT NULL DEFAULT 'DRAFT',
  "parameters" JSONB NOT NULL DEFAULT '{}',
  "metrics" JSONB NOT NULL DEFAULT '{}',
  "artifact_uri" TEXT,
  "experiment_id" TEXT NOT NULL,
  CONSTRAINT "cortex_experiment_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cortex_experiment_runs_experiment_id_created_at_idx" ON "cortex_experiment_runs"("experiment_id", "created_at");
ALTER TABLE "cortex_experiment_runs" ADD CONSTRAINT "cortex_experiment_runs_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "cortex_experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cortex_evaluations" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "evaluator" TEXT NOT NULL,
  "status" "CortexExperimentStatus" NOT NULL DEFAULT 'DRAFT',
  "metrics" JSONB NOT NULL DEFAULT '{}',
  "report_uri" TEXT,
  "experiment_id" TEXT NOT NULL,
  CONSTRAINT "cortex_evaluations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cortex_evaluations_experiment_id_created_at_idx" ON "cortex_evaluations"("experiment_id", "created_at");
ALTER TABLE "cortex_evaluations" ADD CONSTRAINT "cortex_evaluations_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "cortex_experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cortex_deployments" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "model_version_id" TEXT NOT NULL,
  "status" "CortexDeploymentStatus" NOT NULL DEFAULT 'PENDING',
  "endpoint" TEXT,
  "config" JSONB NOT NULL DEFAULT '{}',
  "workspace_id" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  CONSTRAINT "cortex_deployments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cortex_deployments_workspace_id_name_key" ON "cortex_deployments"("workspace_id", "name");
CREATE INDEX "cortex_deployments_workspace_id_status_idx" ON "cortex_deployments"("workspace_id", "status");
ALTER TABLE "cortex_deployments" ADD CONSTRAINT "cortex_deployments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cortex_deployments" ADD CONSTRAINT "cortex_deployments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
