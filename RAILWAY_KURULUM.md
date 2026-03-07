# 🚂 Railway Kurulum Rehberi (Görsel Adımlar)

## 🎯 Railway Nedir?

Railway, kodunuzu otomatik olarak internete yayınlayan bir platformdur. **Tamamen ücretsiz** ve **kodlama bilgisi gerektirmez**.

---

## 📸 Adım Adım (Ekran Görüntüleri ile)

### ADIM 1: Railway'a Giriş

1. Tarayıcınızda **https://railway.app** açın
2. Sağ üstte **"Login"** butonuna tıklayın
3. **"Login with GitHub"** seçin
4. GitHub hesabınızla giriş yapın

**GitHub hesabınız yoksa:**
- https://github.com adresine gidin
- "Sign up" ile ücretsiz hesap açın

---

### ADIM 2: Proje Oluştur

1. Railway dashboard'da **"New Project"** butonuna tıklayın
2. **"Deploy from GitHub repo"** seçeneğini seçin
3. GitHub'dan `football-ai-platform` projenizi seçin
4. **"Deploy Now"** butonuna tıklayın

**Not:** Eğer projeniz GitHub'da görünmüyorsa:
- GitHub'da projenizi public yapın, veya
- Railway'a GitHub repo erişimi verin

---

### ADIM 3: PostgreSQL Database Ekle (Ücretsiz)

Railway size ücretsiz PostgreSQL veritabanı verir:

1. Projenize tıklayın
2. **"New"** butonuna tıklayın
3. **"Database"** → **"Add PostgreSQL"** seçin
4. Railway otomatik olarak database oluşturur ve `DATABASE_URL` ekler ✅

**Bekleyin:** Database oluşturulması 1-2 dakika sürebilir.

---

### ADIM 4: Environment Variables Ekle

1. Projenize gidin
2. **"Variables"** sekmesine tıklayın
3. Şu değişkenleri ekleyin:

#### Değişken 1: OPENAI_API_KEY

```
Name: OPENAI_API_KEY
Value: sk-proj-xxxxxxxxxxxxx (OpenAI'dan alın)
```

**OpenAI API Key nasıl alınır:**
1. https://platform.openai.com → Giriş yapın
2. "API Keys" → "Create new secret key"
3. Key'i kopyalayın

#### Değişken 2: ADMIN_SECRET

```
Name: ADMIN_SECRET
Value: güçlü-bir-şifre-seçin-en-az-20-karakter
```

**Örnek:** `my-super-secret-admin-password-2024-football`

#### Değişken 3: QDRANT_URL (Opsiyonel)

```
Name: QDRANT_URL
Value: http://localhost:6333
```

**Not:** Eğer Qdrant kullanmıyorsanız bu değişkeni eklemeyin.

---

### ADIM 5: Build Ayarları (Otomatik)

Railway otomatik olarak şunları yapar:
- ✅ `npm install` çalıştırır
- ✅ `npm run build` çalıştırır
- ✅ `npm start` ile başlatır

**Hiçbir şey yapmanıza gerek yok!** Railway otomatik algılar.

---

### ADIM 6: Domain Ayarlama

Railway size ücretsiz domain verir:

1. Projenize gidin
2. **"Settings"** sekmesine tıklayın
3. **"Generate Domain"** butonuna tıklayın
4. Size verilen domain: `your-project.up.railway.app`

**Kendi domain'inizi bağlamak için:**
1. **"Custom Domain"** bölümüne gidin
2. Domain'inizi yazın: `yourdomain.com`
3. Railway size DNS ayarlarını gösterir
4. Domain sağlayıcınızda (Namecheap, GoDaddy, vs.) bu ayarları yapın

---

### ADIM 7: İlk Deploy

Railway otomatik olarak deploy başlatır:

1. **"Deployments"** sekmesine gidin
2. İlerlemeyi takip edin
3. **"Building"** → **"Deploying"** → **"Active"** ✅

**İlk deploy 3-5 dakika sürebilir.** Bekleyin!

---

### ADIM 8: Siteyi Test Edin

Deploy tamamlandıktan sonra:

1. **"Settings"** sekmesine gidin
2. Domain'inizi kopyalayın
3. Tarayıcıda açın: `https://your-project.up.railway.app`
4. Site açılıyor mu kontrol edin ✅

---

## 🔄 Güncelleme Nasıl Yapılır?

Kodunuzu güncellediğinizde:

1. GitHub'a push yapın (GitHub Desktop kullanabilirsiniz)
2. Railway otomatik olarak yeni deploy başlatır
3. 2-3 dakika içinde site güncellenir

**Kodlama bilgisi gerektirmez!**

---

## 🆘 Sorun Giderme

### Site açılmıyor?

1. Railway dashboard → Projeniz → **"Deployments"**
2. Son deployment'a tıklayın
3. **"Logs"** sekmesine bakın
4. Hata var mı kontrol edin

**Yaygın hatalar:**

**"DATABASE_URL not found"**
- ✅ PostgreSQL database eklediniz mi?
- ✅ Variables sekmesinde `DATABASE_URL` var mı?

**"OPENAI_API_KEY not found"**
- ✅ Variables sekmesinde `OPENAI_API_KEY` eklediniz mi?

**"Build failed"**
- ✅ Logs sekmesinde hata mesajını okuyun
- ✅ Genellikle eksik environment variable'dır

### Database migration hatası?

1. Railway dashboard → Projeniz
2. **"Deployments"** → Son deployment → **"Logs"**
3. Migration hatası görüyorsanız:
   - Railway terminal açın (deployment'a tıklayın → "View Logs")
   - Veya local'de: `npx prisma migrate deploy`

---

## 💰 Maliyet: TAMAMEN ÜCRETSİZ!

Railway ücretsiz tier:
- ✅ 500 saat/ay compute (küçük projeler için yeterli)
- ✅ $5 kredi/ay (küçük projeler için yeterli)
- ✅ Ücretsiz PostgreSQL database
- ✅ Ücretsiz SSL sertifikası
- ✅ Ücretsiz domain

**Kredi kartı gerektirmez!**

---

## ✅ Başarı Kontrol Listesi

- [ ] Railway hesabı açıldı
- [ ] GitHub repo bağlandı
- [ ] PostgreSQL database eklendi
- [ ] OPENAI_API_KEY eklendi
- [ ] ADMIN_SECRET eklendi
- [ ] Deploy başarılı oldu
- [ ] Site açılıyor
- [ ] Domain çalışıyor

---

## 📞 Yardım

Herhangi bir adımda takılırsanız:
1. Railway dashboard'daki **"Logs"** sekmesine bakın
2. Hata mesajını okuyun
3. Environment variables'ları kontrol edin

**En yaygın sorun:** Eksik environment variable. Tüm değişkenlerin eklendiğinden emin olun!
