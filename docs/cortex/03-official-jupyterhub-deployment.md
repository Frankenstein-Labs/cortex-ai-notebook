# Official JupyterHub/JupyterLab execution plane

## What is now integrated

Cortex now includes a deployable official JupyterHub image and DockerSpawner configuration. The user-facing notebook interface is **not a Cortex imitation** when a runtime is ready: the iframe is served by the single-user Jupyter server and renders the real JupyterLab application from the configured official Jupyter Docker Stack image.

Files:

- `docker/jupyterhub/Dockerfile` builds `jupyterhub/jupyterhub:5.4.5` with DockerSpawner.
- `docker/jupyterhub/jupyterhub_config.py` configures the Hub, service token, scoped role and isolated single-user servers.
- `docker-compose.cortex-jupyter.yml` runs the execution plane independently from the Formbricks control plane.
- Cortex API routes retain workspace/project/user authorization before requesting a server or proxy session.

## Configuration parameters

| Parameter | Purpose | Default |
|---|---|---|
| `CORTEX_JUPYTERHUB_API_TOKEN` | Server-side Cortex-to-Hub service token; never sent to browsers | Required |
| `JUPYTERHUB_PORT` | Published Hub/proxy port | `8000` |
| `JUPYTERHUB_SINGLEUSER_IMAGE` | Official Jupyter Docker Stack image serving JupyterLab | `quay.io/jupyter/base-notebook:2025-09-08` |
| `JUPYTERHUB_DEFAULT_CPU_LIMIT` | Default per-server CPU limit | `1` |
| `JUPYTERHUB_DEFAULT_MEMORY_LIMIT` | Default per-server memory limit | `2G` |
| `JUPYTERHUB_NETWORK` | Isolated Docker network | `cortex-jupyter` |
| `JUPYTERHUB_AUTHENTICATOR_CLASS` | Hub authenticator; replace `dummy` outside development | `dummy` |
| `JUPYTERHUB_ALLOW_ALL` | Whether the configured authenticator allows all users | `false` |
| `JUPYTERHUB_DB_URL` | Hub state database | SQLite under `/data` |
| `JUPYTERHUB_LOG_LEVEL` | Hub log level | `INFO` |

For production, use a real OAuthenticator or an authenticator that delegates identity to Cortex. The dummy authenticator is for local development only and must not be enabled on a public deployment.

## API token and permissions

The Hub token is a service credential held only by the Cortex server. The `cortex-runtime-manager` role grants the minimum lifecycle scopes needed by the adapter:

- `users:read` to inspect the user/server record;
- `users:activity` to discover readiness;
- `users:servers` to start and stop servers;
- `users:servers!user={user}` to constrain server operations to the target user.

The token must be generated with a secret manager, injected into the Hub and Cortex web process separately, rotated without committing it, and revoked on compromise. It must not be placed in notebook environment variables, browser storage, URLs or logs.

## Isolation defaults

DockerSpawner launches one server per user. Servers run with `no-new-privileges`, all Linux capabilities dropped, a read-only root filesystem, ephemeral `/tmp` and `/run`, explicit CPU/memory limits and a dedicated writable project volume. Outbound networking remains a deployment decision and should be restricted by the Docker/Kubernetes network policy for untrusted code.

The Docker socket is required by DockerSpawner and is therefore a privileged infrastructure boundary. For production multi-tenant deployments, prefer the official Zero-to-JupyterHub Kubernetes deployment with a pod spawner and network policies rather than exposing a host Docker socket.

## Cortex proxy behavior

Cortex checks the authenticated workspace, project and runtime ownership before creating a five-minute proxy session. The JupyterHub token remains server-side. Once the runtime status is `READY`, the Cortex shell displays the URL through the server proxy; before `READY`, no notebook or kernel UI is claimed to be available.

HTTP proxying is implemented in the Cortex route. WebSocket upgrades are intentionally rejected there and must be handled by the configured JupyterHub ingress, because kernels and terminals require a real WebSocket-capable proxy. A production ingress must preserve the same workspace/user authorization context and route only to the authorized single-user server.

## Startup

Create a strong token in the deployment secret store, set `CORTEX_JUPYTERHUB_API_TOKEN` for both the Hub and Cortex web process, then run:

```bash
docker compose -f docker-compose.cortex-jupyter.yml up -d --build
```

Set Cortex `HUB_API_URL` to the server-side URL reachable from the web process and `HUB_API_KEY` to the same service token. Do not use `JUPYTERHUB_ALLOW_ALL=true` in production.

## Licenses

JupyterHub, JupyterLab and the Jupyter Docker Stacks are third-party open-source components. Their copyright notices, BSD-3-Clause-style license terms and disclaimers must be retained. Cortex does not claim authorship of the Jupyter interface and does not imply endorsement by Project Jupyter.
