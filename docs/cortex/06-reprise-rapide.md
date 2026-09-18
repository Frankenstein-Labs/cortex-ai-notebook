# CORTEX AI Notebook — Présentation de reprise

## Ce qui existe déjà

Cortex possède une interface notebook, des projets et runtimes tenant-scoped, un adapter JupyterHub, une configuration Docker officielle, un gateway WebSocket persistant avec tickets signés, une ingress Caddy prévue pour HTTPS, des tokens et permissions, ainsi qu’un Model Registry et un Dataset Registry persistants.

## Ce qui a été vérifié

Les contrats et services ont été testés. Prisma a été formaté et généré. Les routes Cortex ajoutées ont été lintées. La configuration Compose a été vérifiée. Les commits poussés sont `7ae469a01` pour le gateway/landing et `0a2ea9eff` pour les registries.

## Où l’on s’est arrêté

La tranche suivante concerne Experiments, Evaluations et Deployments. Les modèles, la migration, les contrats et les premières routes ont été écrits localement mais doivent encore être validés et poussés. Aucun worker réel de training, fine-tuning, evaluation ou deployment n’est encore disponible.

## Prochaine étape

Commencer par la validation Prisma et les tests d’isolation de la tranche Experiments/Deployments. Ensuite seulement, implémenter les connecteurs GitHub/Hugging Face, les runtimes vLLM/GPU et les workers réels. La fiche complète de contexte est [`05-handoff-20260918.md`](./05-handoff-20260918.md).
