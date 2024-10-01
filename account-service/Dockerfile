FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist .
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000

CMD ["node", "app.js"]