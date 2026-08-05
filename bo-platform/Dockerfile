# Frontend Dockerfile (React + Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables (baked at build time)
ARG VITE_API_BASE_URL
ARG VITE_PYTHON_ENGINE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_ADMIN_EMAIL
ARG VITE_ADMIN_PASSWORD

# Set as environment variables for the build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_PYTHON_ENGINE_URL=${VITE_PYTHON_ENGINE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_ADMIN_EMAIL=${VITE_ADMIN_EMAIL}
ENV VITE_ADMIN_PASSWORD=${VITE_ADMIN_PASSWORD}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]