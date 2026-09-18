"""Cortex's official JupyterHub deployment configuration.

The Cortex API is the control plane. JupyterHub is the execution plane and
serves the unmodified JupyterLab UI from each single-user server.
"""
import os

from dockerspawner import DockerSpawner

c = get_config()  # noqa: F821

hub_bind_url = os.environ.get("JUPYTERHUB_BIND_URL", "http://:8000")
c.JupyterHub.bind_url = hub_bind_url
c.JupyterHub.hub_ip = os.environ.get("JUPYTERHUB_HUB_IP", "0.0.0.0")
c.JupyterHub.cookie_secret_file = "/data/jupyterhub_cookie_secret"
c.JupyterHub.db_url = os.environ.get("JUPYTERHUB_DB_URL", "sqlite:////data/jupyterhub.sqlite")
c.JupyterHub.authenticator_class = os.environ.get("JUPYTERHUB_AUTHENTICATOR_CLASS", "dummy")
c.Authenticator.allow_all = os.environ.get("JUPYTERHUB_ALLOW_ALL", "false").lower() == "true"

# The Cortex runtime adapter uses this service token. It is not a browser token.
c.JupyterHub.services = [
    {
        "name": "cortex-runtime-manager",
        "api_token": os.environ["CORTEX_JUPYTERHUB_API_TOKEN"],
        "admin": False,
    }
]
c.JupyterHub.load_roles = [
    {
        "name": "cortex-runtime-manager",
        "scopes": [
            "users:read",
            "users:activity",
            "users:servers",
            "users:servers!user={user}",
        ],
        "services": ["cortex-runtime-manager"],
    }
]

# DockerSpawner runs one isolated single-user server per Cortex user/project.
c.JupyterHub.spawner_class = DockerSpawner
c.DockerSpawner.image = os.environ.get("JUPYTERHUB_SINGLEUSER_IMAGE", "quay.io/jupyter/base-notebook:2025-09-08")
c.DockerSpawner.network_name = os.environ.get("JUPYTERHUB_NETWORK", "cortex-jupyter")
c.DockerSpawner.use_internal_ip = True
c.DockerSpawner.remove = True
c.DockerSpawner.debug = False
c.DockerSpawner.notebook_dir = "/home/jovyan/work"
c.DockerSpawner.volumes = {"cortex-jupyter-{username}": {"bind": "/home/jovyan/work", "mode": "rw"}}
c.DockerSpawner.extra_host_config = {
    "network_mode": os.environ.get("JUPYTERHUB_NETWORK", "cortex-jupyter"),
    "security_opt": ["no-new-privileges:true"],
    "cap_drop": ["ALL"],
    "read_only": True,
    "tmpfs": ["/tmp:size=512m", "/run:size=64m"],
}
c.DockerSpawner.cpu_limit = float(os.environ.get("JUPYTERHUB_DEFAULT_CPU_LIMIT", "1"))
c.DockerSpawner.mem_limit = os.environ.get("JUPYTERHUB_DEFAULT_MEMORY_LIMIT", "2G")
c.DockerSpawner.environment = {
    "JUPYTER_ENABLE_LAB": "yes",
    "CORTEX_RUNTIME": "true",
}

# Do not let the Hub expose its admin UI/API outside the configured proxy.
c.JupyterHub.admin_access = False
c.JupyterHub.log_level = os.environ.get("JUPYTERHUB_LOG_LEVEL", "INFO")
