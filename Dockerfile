# syntax=docker/dockerfile:1

###########################
# 1. BASE – Install deps
###########################
FROM node:20-slim AS base

WORKDIR /app

ENV NODE_ENV=production

# Install OS deps for Next.js sharp (image optimization)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

###########################
# 2. INSTALL – Install deps
###########################
FROM base AS deps

WORKDIR /app

# Copy package.json first for better layer caching
COPY package.json package-lock.json* ./

RUN npm install --production=false

###########################
# 3. BUILD – Compile Next.js
###########################
FROM deps AS build

WORKDIR /app

COPY . .

# Next.js build
RUN npm run build

###########################
# 4. RUNNER – Small runtime image
###########################
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what we need
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
