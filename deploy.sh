#!/bin/bash

# Deployment script for VPS
# Kullanım: ./deploy.sh

set -e

echo "🚀 Deployment başlıyor..."

# Git pull
echo "📥 Kod güncelleniyor..."
git pull origin main

# Dependencies install
echo "📦 Paketler yükleniyor..."
npm install

# Prisma generate
echo "🗄️ Prisma client oluşturuluyor..."
npx prisma generate

# Migration (production)
echo "🔄 Database migration çalıştırılıyor..."
npx prisma migrate deploy

# Build
echo "🏗️ Build alınıyor..."
npm run build

# PM2 restart
echo "🔄 PM2 yeniden başlatılıyor..."
pm2 restart football-ai || pm2 start npm --name "football-ai" -- start

echo "✅ Deployment tamamlandı!"
pm2 status
