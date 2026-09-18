FROM node:22-bookworm-slim
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/cortex-gateway/package.json packages/cortex-gateway/package.json
COPY packages/cortex-runtime/package.json packages/cortex-runtime/package.json
COPY packages/cortex-types/package.json packages/cortex-types/package.json
RUN pnpm install --frozen-lockfile --filter @formbricks/cortex-gateway...
COPY packages/cortex-gateway packages/cortex-gateway
COPY packages/cortex-runtime packages/cortex-runtime
COPY packages/cortex-types packages/cortex-types
CMD ["pnpm", "--filter", "@formbricks/cortex-gateway", "start"]
