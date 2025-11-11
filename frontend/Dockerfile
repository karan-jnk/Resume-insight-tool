# ===== Build stage =====
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
# If you use a custom API base, pass it at build-time (optional):
# ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# ===== Nginx serve stage =====
FROM nginx:alpine
# Nginx config (we'll add a custom one to proxy /api to backend)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
# Copy React build
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
