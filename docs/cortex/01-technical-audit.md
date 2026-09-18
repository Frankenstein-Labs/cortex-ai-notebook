# Cortex AI Notebook — Technical Audit and Transformation Plan

**Repository:** `formbricks/formbricks`  
**Audit baseline:** current `main` branch at the start of the Cortex transformation  
**Status:** initial repository audit; no existing Formbricks code deleted or replaced

## Executive summary

Formbricks is a mature TypeScript monorepo with a Next.js web application, reusable domain packages, Prisma/PostgreSQL persistence, Better Auth, organization/workspace tenancy, background jobs and workflows, object storage, integrations, Docker/Helm deployment, and extensive automated testing. It is therefore a strong foundation for Cortex AI Notebook, provided the transformation is additive and staged.

The safest strategy is to preserve the existing platform foundation and introduce a separate Cortex domain layer. The first product increments should add Cortex concepts and navigation without coupling the product to a single compute, model, or notebook provider. Jupyter execution, model serving, GPU scheduling, Hugging Face and GitHub integrations should be adapters behind stable interfaces rather than embedded directly in the web UI.

## Repository map

| Area | Current location | Audit finding | Cortex disposition |
|---|---|---|---|
| Web application | `apps/web` | Next.js application with route groups, server actions, modules and UI | Reuse as the Cortex shell and authenticated control plane |
| Shared UI | `apps/web` and `packages/survey-ui` | Existing component and styling infrastructure | Reuse primitives; introduce Cortex-specific layout and tokens |
| Domain packages | `packages/*` | AI, cache, database, jobs, logger, storage, surveys, workflows and types packages already exist | Reuse infrastructure; add Cortex packages only where boundaries are clear |
| Persistence | `packages/database/schema/main.prisma`, `packages/database/migration` | Prisma schema and a large migration history; organization, workspace and user models exist | Extend with Cortex entities through additive migrations |
| Authentication | `apps/web/modules/auth` | Better Auth implementation with tests and enterprise auth paths | Preserve; use existing session and authorization gates |
| Tenancy | `Organization`, `Workspace`, organization/workspace modules | Existing tenant boundaries and authorization helpers | Cortex projects must be tenant-scoped and authorization checked |
| Jobs/workflows | `packages/jobs`, `packages/workflows`, `apps/web` workflow modules | Existing asynchronous execution infrastructure | Reuse for imports, evaluations, runs and provisioning jobs |
| Storage | `packages/storage` | Existing object-storage abstraction | Reuse for datasets, notebook artifacts, checkpoints and outputs |
| API | `apps/web/app/api`, `openapi.yml`, module APIs | Existing API and contract-test infrastructure | Add versioned Cortex APIs incrementally |
| Tests | Vitest, Playwright, integration tests and CI workflows | Broad automated test surface | Extend with Cortex unit, contract, authorization and E2E tests |
| Deployment | `docker`, `charts`, GitHub workflows, dev compose | Docker and Helm paths already exist | Add optional runtime services without changing the base deployment contract |
| Observability | Logger, Sentry/OpenTelemetry-related configuration and CI checks | Existing observability hooks | Add run, runtime and provider correlation identifiers |

## Foundation to preserve

The following components are strategically valuable and should remain the platform foundation:

- authentication, sessions, account recovery and enterprise identity providers;
- users, organizations, workspaces, roles, permissions and tenant isolation;
- Prisma database access, migration discipline and existing indexes;
- API conventions, request validation, error handling and contract testing;
- object storage and secure secret handling;
- jobs, workflows, webhooks and retry/error infrastructure;
- logging, telemetry, security checks, Docker, Helm and CI/CD;
- existing UI primitives, accessibility conventions and localization support;
- existing tests and release processes.

Formbricks survey-specific domain functionality should not be removed during the foundation phase. It can remain operational while Cortex is introduced as an additional product surface. Any eventual deprecation must be based on usage and migration evidence, not on assumptions.

## Transformation boundaries

### Preserve as-is initially

Authentication, organizations, workspaces, user management, billing, authorization, storage, background processing, observability, deployment, test tooling and the existing survey product.

### Extend incrementally

Navigation, dashboard/home experience, project/workspace concepts, database schema, API surface, secrets, jobs, storage metadata, runtime status and integrations.

### Add as new Cortex domains

Projects, notebooks, files, datasets, model registry, model versions, experiments, experiment runs, evaluations, runtimes, deployments and agent sessions.

### Defer until the control plane is stable

GPU scheduling, distributed training, fine-tuning orchestration, multi-provider autoscaling, vLLM operations and autonomous agents. These require explicit security, quota, cost and isolation controls and should not be represented as working features until their backends exist.

## Target architecture

```text
Cortex Web UI (apps/web)
        |
Cortex application services and authorization
        |
Cortex domain contracts (provider-neutral)
  |        |        |        |        |
Notebook  Models   Datasets  Runs     Deployments
adapter   adapters adapters  engine   adapters
  |        |        |        |        |
Jupyter  HF/local  S3      Jobs     vLLM/K8s/cloud
Server   providers storage  workers  provider adapters
        |
Formbricks foundation: Auth, Org/Workspace, DB, Storage, Jobs, Observability
```

The control plane should own metadata, authorization, configuration, provenance and lifecycle state. Execution planes should own notebook kernels, model inference, evaluations and training workloads. Control-plane records must never imply that a workload succeeded unless the execution adapter reports a verifiable result.

## Proposed Cortex entities

All records must be tenant-scoped through the existing organization/workspace authorization model.

| Entity | Purpose | Initial fields |
|---|---|---|
| `CortexProject` | Logical AI environment | id, workspaceId, name, slug, description, status, createdBy, timestamps |
| `CortexNotebook` | Notebook metadata and source reference | id, projectId, name, path, runtimeId, status, timestamps |
| `CortexDataset` | Dataset metadata and artifact reference | id, projectId, name, source, uri, revision, schema, size, checksum |
| `CortexModel` | Registry entry for a model | id, projectId, name, provider, repository, revision, capabilities, license |
| `CortexExperiment` | Reproducible experiment definition | id, projectId, name, objective, config, createdBy |
| `CortexRun` | One execution of an experiment/notebook/evaluation | id, experimentId, runtimeId, status, config, provenance, startedAt, finishedAt |
| `CortexEvaluation` | Evaluation definition and result reference | id, projectId, name, datasetId, metrics, status |
| `CortexRuntime` | Runtime metadata and lifecycle state | id, projectId, provider, kind, cpu, memory, gpu, status |
| `CortexDeployment` | Model serving metadata | id, projectId, modelId, provider, endpoint, status, revision |

These names are deliberately namespaced to avoid accidental collisions with existing Formbricks models. Before adding migrations, the schema must be checked against the current branch and migration tooling in a clean database.

## Provider adapter contracts

The first implementation should define interfaces, not fake integrations:

- `NotebookRuntimeAdapter`: create, start, stop, execute, inspect and destroy;
- `ModelProviderAdapter`: search, inspect, resolve revision and download/import;
- `DatasetProviderAdapter`: search, inspect, import and export;
- `ExecutionAdapter`: submit, cancel, get status, stream logs and retrieve artifacts;
- `DeploymentAdapter`: deploy, scale, inspect, update and undeploy;
- `SourceControlAdapter`: connect repository, sync, commit and export.

Adapters must return explicit capability information and failure states. A provider must not be shown as connected or a run as complete unless the adapter returns a verified result.

## Security and operational risks

| Risk | Impact | Required mitigation |
|---|---|---|
| Arbitrary notebook code execution | Critical | Isolated runtimes, deny-by-default networking, resource limits, short-lived credentials and audit logs |
| Secret leakage in notebooks/logs | Critical | Secret manager references, redaction, scoped tokens, no plaintext persistence |
| Cross-tenant artifact access | Critical | Workspace-scoped authorization at every read/write path and signed object URLs |
| Unbounded GPU/cloud cost | High | Quotas, budgets, approval policies, TTL cleanup and provider-level limits |
| Supply-chain risk from models/datasets | High | Record revisions/checksums/licenses, scan imports and require provenance |
| Non-reproducible runs | High | Immutable model/dataset revisions, config snapshots, environment metadata and seeds |
| Provider lock-in | Medium | Adapter contracts and provider-neutral database fields |
| Long-running job failure | Medium | Idempotency keys, retries, cancellation, heartbeats and durable status transitions |
| UI claims without backend support | High | Capability-driven UI and integration/contract tests; never present placeholders as operational features |

## Migration strategy

1. Keep the current schema and existing migrations untouched.
2. Add Cortex schema models in a dedicated Prisma schema section once names and authorization rules are reviewed.
3. Add one additive migration for the control-plane metadata only.
4. Add repository/service methods with authorization tests before exposing UI mutations.
5. Add seed data only behind an explicit development flag; never create fake production integrations.
6. Add execution-specific tables only when an adapter exists to produce real lifecycle state.

## Verification strategy

Every Cortex phase should include:

- unit tests for domain validation and state transitions;
- authorization tests for workspace and organization isolation;
- database migration tests on a clean database;
- API contract tests for all public endpoints;
- Playwright coverage for the primary user journey;
- failure-path tests proving that unavailable providers are shown as unavailable;
- lint, typecheck and build validation through the existing Turborepo commands.

## Recommended phases

1. **Cortex foundation:** product shell, feature flag, domain contracts, audit documentation and navigation entry point.
2. **Projects and files:** tenant-scoped project metadata and artifact organization.
3. **Notebook control plane:** notebook metadata and a Jupyter adapter with explicit runtime status.
4. **Model registry and datasets:** provider-neutral metadata with Hugging Face adapter.
5. **Experiments and evaluations:** immutable provenance, runs, metrics and artifacts.
6. **Runtime orchestration:** local/container/cloud adapters, quotas and logs.
7. **GitHub integration:** repository sync and reproducible source revisions.
8. **Deployments:** model serving adapter, health checks and rollback metadata.
9. **Agents and training:** only after isolation, quotas, secrets and auditability are production-ready.

## Initial implementation decision

The first safe code phase is the **Cortex foundation**. It should introduce the architecture and product language without modifying or deleting survey functionality. A database migration is intentionally deferred until the existing schema and authorization conventions are exercised by a minimal, tested Cortex domain contract. This keeps the first change reversible and reduces the risk of creating orphaned or insecure records.

## Audit conclusion

The repository is suitable for the requested transformation. The correct approach is not a rewrite: it is a new, provider-neutral Cortex control plane composed on top of Formbricks infrastructure, with Jupyter and external AI services integrated behind tested adapters. The next implementation changes should remain additive, small enough to review as independent PRs, and backed by real tests and runtime capability checks.
