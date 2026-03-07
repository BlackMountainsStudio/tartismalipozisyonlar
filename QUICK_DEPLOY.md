# ⚡ Hızlı Deployment Rehberi

## 🎯 En Hızlı Yol: Railway/Render (5 dakika)

### Railway ile Deploy

1. **Railway'a Git**: https://railway.app
2. **"New Project" → "Deploy from GitHub repo"**
3. **Repository seç**: `football-ai-platform`
4. **Environment Variables ekle**:
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=...
   ADMIN_SECRET=...
   ```
5. **Deploy!** ✅

Railway otomatik olarak:
- ✅ Build alır
- ✅ SSL sertifikası verir
- ✅ Domain verir (veya kendi domain'inizi bağlayabilirsiniz)

### Render ile Deploy

1. **Render'a Git**: https://render.com
2. **"New" → "Web Service"**
3. **GitHub repo bağla**
4. **Build Command**: `npm run build`
5. **Start Command**: `npm start`
6. **Environment Variables ekle**
7. **Deploy!** ✅

## 🖥️ VPS ile Deploy (15 dakika)

### 1. Sunucu Hazırla

```bash
# SSH ile bağlan
ssh root@your-server-ip

# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kur
sudo npm install -g pm2

# Nginx kur
sudo apt install nginx
```

### 2. Projeyi Yükle

```bash
cd /var/www
git clone https://github.com/yourusername/football-ai-platform.git
cd football-ai-platform
npm install
```

### 3. Environment Variables

```bash
nano .env
# Tüm değişkenleri ekle
```

### 4. Build ve Başlat

```bash
npm run build
pm2 start npm --name "football-ai" -- start
pm2 save
```

### 5. Nginx Ayarla

```bash
sudo nano /etc/nginx/sites-available/football-ai
# nginx.conf.example içeriğini kopyala

sudo ln -s /etc/nginx/sites-available/football-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL (Domain hazır olduğunda)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 🐳 Docker ile Deploy (10 dakika)

### 1. Dockerfile ve docker-compose.yml hazır ✅

### 2. Deploy

```bash
# Build ve başlat
docker-compose up -d --build

# Logları kontrol et
docker-compose logs -f app
```

### 3. Nginx Reverse Proxy

Yukarıdaki Nginx konfigürasyonunu kullanın.

## 📋 Checklist

- [ ] Environment variables hazır
- [ ] Database migration çalıştırıldı
- [ ] Build başarılı
- [ ] PM2/Docker çalışıyor
- [ ] Nginx konfigürasyonu doğru
- [ ] SSL sertifikası kurulu
- [ ] Domain DNS ayarları yapıldı
- [ ] Firewall açık (80, 443, 22)

## 🔄 Güncelleme

### PM2 ile

```bash
cd /var/www/football-ai-platform
./deploy.sh
```

### Docker ile

```bash
docker-compose pull
docker-compose up -d --build
```

## 🆘 Sorun Giderme

### Port 3000 kullanımda

```bash
# Hangi process kullanıyor?
sudo lsof -i :3000

# PM2'yi durdur
pm2 stop football-ai
```

### Build hatası

```bash
# Node modules temizle
rm -rf node_modules package-lock.json
npm install
```

### Database bağlantı hatası

```bash
# Connection string kontrol et
echo $DATABASE_URL

# Test et
npx prisma db pull
```

## 📞 Yardım

Detaylı rehber için: `HOSTING_MIGRATION.md`
