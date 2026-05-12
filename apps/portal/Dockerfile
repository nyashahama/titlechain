FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/portal/package.json apps/portal/package.json
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG TITLECHAIN_API_BASE_URL=http://localhost:8080
ENV TITLECHAIN_API_BASE_URL=$TITLECHAIN_API_BASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace @titlechain/portal

FROM node:22-alpine
WORKDIR /app
ARG TITLECHAIN_API_BASE_URL=http://localhost:8080
ENV NODE_ENV=production
ENV TITLECHAIN_API_BASE_URL=$TITLECHAIN_API_BASE_URL
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@titlechain/portal"]
