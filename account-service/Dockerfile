FROM node:22-alpine3.19 AS base
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY . .
RUN npm run build

FROM node:22-alpine3.19 AS production
WORKDIR /app
COPY --from=base /app/package.json .
COPY --from=base /app/dist .
COPY --from=base /app/.env .
RUN npm install --omit=dev
CMD ["node", "src/app.js"]