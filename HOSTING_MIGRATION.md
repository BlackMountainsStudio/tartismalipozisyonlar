# 🚀 Vercel'den Kendi Hosting'e Geçiş Rehberi

## ✅ Mevcut Yapı Uygun mu?

**EVET!** Projeniz tamamen standalone çalışabilir:
- ✅ Next.js 16.1.6 - Standalone build destekliyor
- ✅ Prisma ORM - Herhangi bir PostgreSQL ile çalışır
- ✅ Vercel-specific kod yok
- ✅ Standart Node.js uygulaması

## 🎯 Hosting Seçenekleri

### 1. **VPS (Önerilen - En Esnek)**

**Seçenekler:**
- **Hetzner** (Almanya) - €4-6/ay, çok hızlı
- **DigitalOcean** - $6/ay, kolay kurulum
- **AWS Lightsail** - $5/ay, AWS ekosistemi
- **Contabo** - €3-5/ay, ucuz

**Avantajlar:**
- Tam kontrol
- Kendi domain'inizi kullanabilirsiniz
- SSL sertifikası ücretsiz (Let's Encrypt)
- İstediğiniz yazılımı kurarsınız

### 2. **Docker Hosting**

**Seçenekler:**
- **Railway** - Ücretsiz tier var
- **Render** - Ücretsiz tier var
- **Fly.io** - Ücretsiz tier var

**Avantajlar:**
- Kolay deployment
- Otomatik SSL
- Git push ile deploy

### 3. **Node.js Hosting**

**Seçenekler:**
- **Heroku** (ücretli)
- **NodeChef**
- **PM2 ile VPS**

## 📋 Geçiş Adımları

### Adım 1: Next.js Standalone Build Hazırla

`next.config.ts` dosyasını güncelleyin:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Standalone build için
  // Diğer ayarlar...
};

export default nextConfig;
```

### Adım 2: Build Script'i Güncelle

`package.json`'da build script'i kontrol edin (zaten var):

```json
{
  "scripts": {
    "build": "prisma generate && node scripts/migrate.js && next build",
    "start": "next start"
  }
}
```

### Adım 3: Production Dependencies Kontrolü

Production'da gereken paketler:
- `next`
- `react`
- `react-dom`
- `@prisma/client`
- `pg` (PostgreSQL için)

## 🖥️ VPS Kurulumu (Detaylı)

### 1. VPS Satın Al

Örnek: Hetzner Cloud
- 2GB RAM
- 1 vCPU
- 20GB SSD
- Ubuntu 22.04

### 2. Sunucuya Bağlan

```bash
ssh root@your-server-ip
```

### 3. Node.js Kurulumu

```bash
# Node.js 20.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kontrol
node --version  # v20.x.x olmalı
npm --version
```

### 4. PostgreSQL Kurulumu (Eğer kendi DB'nizi kullanacaksanız)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database oluştur
sudo -u postgres psql
CREATE DATABASE football_ai;
CREATE USER football_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE football_ai TO football_user;
\q
```

### 5. PM2 Kurulumu (Process Manager)

```bash
sudo npm install -g pm2

# PM2'yi başlangıçta başlat
pm2 startup
# Çıkan komutu çalıştırın
```

### 6. Nginx Kurulumu (Reverse Proxy)

```bash
sudo apt install nginx

# Nginx başlat
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7. SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al (domain'iniz hazır olduğunda)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8. Projeyi Sunucuya Yükle

**Seçenek A: Git ile**

```bash
# Sunucuda
cd /var/www
git clone https://github.com/yourusername/football-ai-platform.git
cd football-ai-platform
npm install
```

**Seçenek B: FTP/SFTP ile**

```bash
# Local'de build al
npm run build

# .next klasörünü ve gerekli dosyaları sunucuya yükle
```

### 9. Environment Variables Ayarla

```bash
cd /var/www/football-ai-platform
nano .env
```

`.env` dosyasına ekleyin:

```env
NODE_ENV=production
DATABASE_URL=postgresql://football_user:password@localhost:5432/football_ai
OPENAI_API_KEY=your-key
QDRANT_URL=http://localhost:6333
ADMIN_SECRET=your-secret
# Diğer değişkenler...
```

### 10. Migration Çalıştır

```bash
npx prisma migrate deploy
npx prisma generate
```

### 11. Build ve Başlat

```bash
npm run build
pm2 start npm --name "football-ai" -- start
pm2 save
```

### 12. Nginx Konfigürasyonu

```bash
sudo nano /etc/nginx/sites-available/football-ai
```

İçeriği:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/football-ai /etc/nginx/sites-enabled/

# Test ve reload
sudo nginx -t
sudo systemctl reload nginx
```

### 13. Firewall Ayarları

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 🐳 Docker ile Deployment (Alternatif)

### Dockerfile Oluştur

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      # Diğer env değişkenleri...
    restart: unless-stopped
```

## 🔄 Domain Ayarları

### 1. DNS Kayıtları

Domain sağlayıcınızda:

```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A
Name: www
Value: YOUR_SERVER_IP
```

### 2. Domain Doğrulama

DNS yayıldıktan sonra (24-48 saat):

```bash
# SSL sertifikası al
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Monitoring ve Maintenance

### PM2 Monitoring

```bash
pm2 status
pm2 logs football-ai
pm2 monit
```

### Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Otomatik Backup

```bash
# Database backup script
#!/bin/bash
pg_dump $DATABASE_URL > /backups/db-$(date +%Y%m%d).sql
find /backups -name "db-*.sql" -mtime +7 -delete
```

## 🔒 Güvenlik Checklist

- [ ] Firewall aktif (UFW)
- [ ] SSH key authentication (password yerine)
- [ ] SSL sertifikası kurulu
- [ ] Environment variables güvenli
- [ ] Database şifresi güçlü
- [ ] Admin secret güçlü
- [ ] Düzenli backup
- [ ] PM2 auto-restart aktif

## 💰 Maliyet Karşılaştırması

| Hosting | Aylık Maliyet | Özellikler |
|---------|--------------|------------|
| **VPS (Hetzner)** | €4-6 | Tam kontrol, kendi domain |
| **VPS (DigitalOcean)** | $6 | Kolay kurulum |
| **Railway** | Ücretsiz* | Docker, otomatik deploy |
| **Render** | Ücretsiz* | Kolay kurulum |
| **Vercel** | Ücretsiz* | Kolay ama sınırlı |

*Ücretsiz tier'lar sınırlı kaynaklara sahip

## ✅ Sonuç

Projeniz kendi hosting'inizde çalışmaya hazır! VPS önerilir çünkü:
- Tam kontrol
- Kendi domain'iniz
- Sınırsız kaynak (planınıza göre)
- Daha ucuz (uzun vadede)

Herhangi bir adımda yardıma ihtiyacınız olursa sorun!
