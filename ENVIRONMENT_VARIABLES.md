# 🔐 Environment Variables Rehberi

Railway veya Render'da eklemeniz gereken tüm değişkenler.

## 📋 Zorunlu Değişkenler

### 1. DATABASE_URL

**Ne işe yarar:** Veritabanı bağlantısı

**Nasıl alınır:**

**Seçenek A: Railway PostgreSQL (Önerilen - Ücretsiz)**
1. Railway dashboard → Projeniz → "New" → "Database" → "Add PostgreSQL"
2. Railway otomatik olarak `DATABASE_URL` ekler ✅

**Seçenek B: Supabase (Ücretsiz)**
1. Supabase dashboard → Settings → Database
2. Connection string'i kopyala
3. Format: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

**Seçenek C: Neon (Ücretsiz)**
1. Neon dashboard → Connection Details
2. Connection string'i kopyala

**Railway/Render'da ekle:**
```
Name: DATABASE_URL
Value: postgresql://user:password@host:5432/database
```

---

### 2. OPENAI_API_KEY

**Ne işe yarar:** AI özellikleri için

**Nasıl alınır:**
1. https://platform.openai.com adresine gidin
2. Giriş yapın
3. "API Keys" → "Create new secret key"
4. Key'i kopyalayın (bir daha gösterilmez!)

**Railway/Render'da ekle:**
```
Name: OPENAI_API_KEY
Value: sk-proj-xxxxxxxxxxxxx
```

---

### 3. ADMIN_SECRET

**Ne işe yarar:** Admin paneli girişi için

**Nasıl oluşturulur:**
- Güçlü bir şifre seçin (en az 20 karakter)
- Örnek: `my-super-secret-admin-password-2024`

**Railway/Render'da ekle:**
```
Name: ADMIN_SECRET
Value: güçlü-şifre-buraya
```

---

### 4. AUTH_SECRET

**Ne işe yarar:** NextAuth oturum şifrelemesi (zorunlu)

**Nasıl oluşturulur:**
```bash
openssl rand -base64 32
```

**Railway/Render'da ekle:**
```
Name: AUTH_SECRET
Value: üretilen-32-karakter-secret
```

---

### 5. Google OAuth (Giriş seçeneği)

**Ne işe yarar:** Google ile giriş yapma

**Google OAuth kurulumu (adım adım):**

1. **Google Cloud Console:** https://console.cloud.google.com → Giriş yapın.
2. **Proje:** Sol üstte "Select a project" → "New Project" → İsim verin (örn. Var Odası) → Create.
3. **OAuth Consent Screen (zorunlu):** Sol menü **APIs & Services** → **OAuth consent screen** → **External** → Create.
   - App name: Uygulama adı (örn. Var Odası)
   - User support email & Developer contact: Kendi e-posta
   - Save and Continue (Scopes / Test users şimdilik boş bırakılabilir).
4. **Credentials:** **APIs & Services** → **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**.
   - Application type: **Web application**
   - Name: İstediğiniz isim (örn. Web Client)
   - **Authorized redirect URIs** (birebir yazın):
     - Yerel: `http://localhost:3000/api/auth/callback/google`
     - Canlı: `https://varodasi.com/api/auth/callback/google` (veya kendi domain’iniz)
   - Create → Açılan pencerede **Client ID** ve **Client Secret**’ı hemen kopyalayın (Secret bir daha gösterilmez).
5. **.env dosyasına ekleyin:**
   ```
   AUTH_GOOGLE_ID="xxx.apps.googleusercontent.com"
   AUTH_GOOGLE_SECRET="xxx"
   ```
6. Sunucuyu yeniden başlatın: `npm run dev`

**Sık hatalar:**
- **redirect_uri_mismatch:** Redirect URI, Google Console’daki ile birebir aynı olmalı (http/https, port, sondaki `/` yok).
- **Test modu:** OAuth consent "Testing" modundaysa, giriş yapacağınız e-postayı "Test users" listesine ekleyin veya uygulamayı "Publish" edin.

**Railway/Render/Vercel'da ekle:**
```
Name: AUTH_GOOGLE_ID
Value: xxx.apps.googleusercontent.com

Name: AUTH_GOOGLE_SECRET
Value: xxx
```

**Not:** Bu değişkenler tanımlı değilse Google butonu gizlenir. E-posta ile giriş her zaman çalışır.

---

## 📋 Opsiyonel Değişkenler

### 6. QDRANT_URL

**Ne işe yarar:** Vector database (AI clustering için)

**Değer:**
```
Name: QDRANT_URL
Value: http://localhost:6333
```

**Not:** Eğer Qdrant kullanmıyorsanız bu değişkeni eklemeyin.

---

### 7. REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, etc.

**Ne işe yarar:** Reddit crawler için

**Sadece Reddit crawler kullanacaksanız ekleyin:**
```
Name: REDDIT_CLIENT_ID
Value: xxx

Name: REDDIT_CLIENT_SECRET
Value: xxx

Name: REDDIT_USERNAME
Value: xxx

Name: REDDIT_PASSWORD
Value: xxx
```

---

### 8. NODE_ENV

**Ne işe yarar:** Production modu

**Değer:**
```
Name: NODE_ENV
Value: production
```

---

### 9. LOG_LEVEL

**Ne işe yarar:** Log seviyesi

**Değer:**
```
Name: LOG_LEVEL
Value: info
```

---

## 🎯 Railway'da Nasıl Eklenir?

1. Railway dashboard → Projeniz
2. **"Variables"** sekmesine tıklayın
3. **"New Variable"** butonuna tıklayın
4. **Name** kısmına değişken adını yazın
5. **Value** kısmına değeri yapıştırın
6. **"Add"** butonuna tıklayın
7. Her değişken için tekrarlayın

## 🎯 Render'da Nasıl Eklenir?

1. Render dashboard → Web Service'iniz
2. **"Environment"** sekmesine gidin
3. **"Add Environment Variable"** tıklayın
4. **Key** kısmına değişken adını yazın
5. **Value** kısmına değeri yapıştırın
6. **"Save Changes"** tıklayın
7. Her değişken için tekrarlayın

## ✅ Minimum Gereksinimler

En az şunlar eklenmeli:
- ✅ `DATABASE_URL`
- ✅ `OPENAI_API_KEY`
- ✅ `ADMIN_SECRET`
- ✅ `AUTH_SECRET`

Google giriş için: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

Diğerleri opsiyonel!

## 🔒 Güvenlik Notları

- ⚠️ `ADMIN_SECRET` değerini kimseyle paylaşmayın
- ⚠️ `OPENAI_API_KEY` değerini kimseyle paylaşmayın
- ⚠️ Railway/Render'da değişkenler otomatik olarak şifrelenir
- ✅ Public repo'ya `.env` dosyası eklemeyin (zaten .gitignore'da)
