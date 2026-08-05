FROM node:24-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
# .npmrc points the @verevoir scope at GitHub Packages, where the private
# @verevoir/editor-premium lives. npm routes registries per scope, so the
# public @verevoir packages resolve there too — CI mirrors each of them to
# GitHub Packages for that reason.
COPY package.json package-lock.json .npmrc ./
# Mounted secret rather than a build arg: an arg is recorded in the image
# history and would ship a readable credential in the published layer.
RUN --mount=type=secret,id=gh_token \
    NODE_AUTH_TOKEN="$(cat /run/secrets/gh_token)" npm ci
COPY . .
RUN NEXT_PRIVATE_WORKER_THREADS=0 npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
