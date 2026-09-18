# Cortex AI Notebook — Platform Readiness Matrix

This document records only capabilities verified in the `Frankenstein-Labs/cortex-ai-notebook` repository. A capability is marked **DONE** only when code, validation and deployment evidence exist; otherwise it remains **PARTIAL** or **ABSENT**.

| Capability | Status | Evidence | Remaining work |
|---|---|---|---|
| Tenant-scoped Cortex projects, files, notebooks and runtimes | DONE | Prisma models and migrations `20260918213000_add_cortex_foundation`; authenticated project/runtime routes | Add CRUD APIs for files and notebooks |
| Cortex token lifecycle | DONE | `packages/cortex-service/src/tokens.ts`; migration `20260918220000_add_cortex_authz`; 6 service tests | Add audit events and UI administration |
| Workspace/project permission grants | PARTIAL | `CortexPermissionGrant` model and authenticated grant routes | Enforce grants on every Cortex resource instead of only manage access |
| JupyterHub HTTP lifecycle adapter | DONE | `packages/cortex-runtime/src/jupyterhub-adapter.ts`; runtime tests | Add health/reconciliation worker |
| Official JupyterHub Docker deployment | PARTIAL | `docker/jupyterhub/*`, `docker-compose.cortex-jupyter.yml` | Deploy on a persistent Docker host with TLS, DNS, secrets and a real database |
| JupyterLab HTTP proxy | PARTIAL | Authenticated Next route hides the Hub token | Current Next route returns 426 for WebSocket upgrades |
| Jupyter kernel/terminal WebSocket | ABSENT | No upgrade-capable gateway in the repository | Add a persistent WebSocket gateway and route it in the deployment ingress |
| Git provider integration | PARTIAL | Internal provider-neutral Git contracts in `packages/cortex-git` | Implement GitHub App/OAuth, repositories, branches, commits and webhooks |
| Hugging Face integration | ABSENT | Provider-neutral model/dataset adapter interfaces only | Add scoped HF API client, credential storage and import/sync jobs |
| vLLM runtime | PARTIAL | Existing optional Qwen/vLLM Compose profile | Add model lifecycle API, health reconciliation, runtime registry and GPU policy |
| GPU runtimes | PARTIAL | vLLM Compose device reservation and runtime GPU fields | Add host capability discovery, scheduling and quota enforcement |
| Model Registry | ABSENT | No Cortex model registry schema or routes | Add tenant-scoped models, versions, artifacts, providers and promotion states |
| Dataset Registry | ABSENT | No Cortex dataset registry schema or routes | Add datasets, revisions, storage metadata, lineage and access controls |
| Experiments/Evaluations | ABSENT | No Cortex experiment/evaluation models or APIs | Add runs, metrics, evaluators, artifacts and reproducible lineage |
| Deployments | ABSENT | No Cortex deployment model or reconciler | Add deployment targets, revisions, health checks, rollback and secrets references |
| Cortex Engine/Agents | ABSENT | No engine/agent execution service | Add tool policy, jobs, event log, budgets and provider adapters |
| Fine-tuning/training | ABSENT | No training job model or worker | Add job lifecycle, dataset/model references, artifact output and runtime backend |
| Product landing page | PARTIAL | Existing app root intentionally redirects to auth/onboarding | Add a public `/cortex` product page without changing auth redirects |

## Deployment boundary

The repository contains deployment definitions but is not evidence of a live persistent deployment. A real deployment requires a Docker-capable host, TLS termination, a persistent volume, a secret manager or protected environment file, a production database, DNS, and an upgrade-capable proxy. No production secret is committed to this repository.
