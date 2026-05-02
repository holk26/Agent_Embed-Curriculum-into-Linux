# Etapa 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias primero para aprovechar cache
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente y construir
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar el build estático al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración custom de Nginx (SPA fallback)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
