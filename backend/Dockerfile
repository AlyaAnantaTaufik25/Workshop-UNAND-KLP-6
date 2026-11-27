# Backend API — SIM Workshop UNAND
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Dependensi produksi saja (layer di-cache selama package*.json tidak berubah)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY database ./database
COPY assets ./assets

# Berkas unggahan disimpan di volume agar tidak hilang saat container diganti
RUN mkdir -p /app/uploads && chown -R node:node /app
ENV UPLOAD_DIR=/app/uploads
VOLUME ["/app/uploads"]

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/v1/health >/dev/null || exit 1

# Terapkan migrasi baru (data lama aman), isi demo bila kosong (SEED_DEMO=true), lalu jalankan server
CMD ["sh", "-c", "node database/bootstrap.js && node src/server.js"]
