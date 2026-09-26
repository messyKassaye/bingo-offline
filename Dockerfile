FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 60000 \
    && npm config set maxsockets 3 \
    && npm ci

COPY . .

# The app's addresses are NOT baked in here - they are fetched from
# /config.json at boot, which the runtime stage writes on every container
# start. One image is therefore valid for every environment.
RUN npm run build


FROM nginx:alpine AS runtime
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The nginx entrypoint runs everything in /docker-entrypoint.d before starting
# nginx, so this renders config.json from the container's environment on every
# start. The sed strips CRLF (this repo is edited on Windows), which would
# otherwise break the shebang.
COPY docker/runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-runtime-config.sh \
    && chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
