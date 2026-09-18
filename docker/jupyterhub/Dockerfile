FROM jupyterhub/jupyterhub:5.4.5

# Official JupyterHub deployment image. DockerSpawner launches the official
# Jupyter Docker Stack single-user image, which serves the real JupyterLab UI.
RUN python -m pip install --no-cache-dir dockerspawner==14.0.0

COPY jupyterhub_config.py /srv/jupyterhub/jupyterhub_config.py

CMD ["jupyterhub", "-f", "/srv/jupyterhub/jupyterhub_config.py"]
