FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/dist ./dist
RUN pnpm install --prod --frozen-lockfile
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]