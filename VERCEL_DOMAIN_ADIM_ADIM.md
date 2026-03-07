# 🌐 Vercel'de Domain Ekleme - Adım Adım (Görsel Rehber)

## 🎯 Domain: varodasi.com

Ekran görüntünüzde "General" sekmesi açık. Domain eklemek için:

---

## 📋 ADIM 1: Domains Sekmesine Git

### Yöntem 1: Settings Menüsünden

1. Sol menüde **"Domains"** seçeneğini arayın
2. Eğer görünmüyorsa, **"General"** sekmesine tıklayın
3. General sayfasında **"Domains"** bölümünü bulun
4. Veya üstteki sekmelerden **"Domains"** sekmesine tıklayın

### Yöntem 2: Direkt URL

1. Tarayıcıda şu URL'yi açın:
   ```
   https://vercel.com/[your-team]/[your-project]/settings/domains
   ```
2. Veya Settings sayfasında URL'yi kontrol edin

### Yöntem 3: Proje Ana Sayfasından

1. Vercel dashboard'da projenize gidin
2. Üst menüde **"Settings"** yerine direkt **"Domains"** sekmesi olabilir
3. Veya proje ana sayfasında **"Domains"** kartına tıklayın

---

## 📋 ADIM 2: Domain Ekle

1. **"Add Domain"** veya **"Add"** butonuna tıklayın
2. Domain'inizi yazın: `varodasi.com`
3. **"Add"** veya **"Continue"** tıklayın

---

## 📋 ADIM 3: DNS Kayıtlarını Kopyala

Vercel size DNS kayıtlarını gösterecek. Şunları göreceksiniz:

### Örnek (Vercel'in gösterdiği):

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**⚠️ ÖNEMLİ:** Vercel'in size gösterdiği **gerçek değerleri** kopyalayın!

---

## 📋 ADIM 4: Spaceship'te DNS Ekle

1. **https://www.spaceship.com** → Giriş yapın
2. **"Domains"** → `varodasi.com` → **"Manage"**
3. **"DNS"** veya **"DNS Management"** sekmesine gidin
4. **"Add Record"** tıklayın

### Eklenecek Kayıtlar:

**Kayıt 1:**
```
Type: A
Name: @ (veya boş)
Value: [Vercel'in verdiği IP] (örnek: 76.76.21.21)
TTL: 3600
```

**Kayıt 2:**
```
Type: CNAME
Name: www
Value: [Vercel'in verdiği CNAME] (örnek: cname.vercel-dns.com)
TTL: 3600
```

---

## ⏱️ ADIM 5: Bekle

DNS yayılması: **5 dakika - 24 saat**

**Kontrol:**
- Vercel dashboard → Domains → Durum kontrolü
- https://dnschecker.org → `varodasi.com` kontrol edin

---

## ✅ Başarı

Domain hazır olduğunda:
- ✅ Vercel'de "Valid" durumunda
- ✅ SSL otomatik kurulur
- ✅ `https://varodasi.com` açılır

---

## 🆘 Domains Sekmesi Bulunamıyor?

**Alternatif Yollar:**

1. **Proje Ana Sayfası:**
   - Vercel dashboard → Projeniz
   - Üstteki sekmelerde **"Domains"** olabilir

2. **Settings Altında:**
   - Settings → **"General"** → Aşağı kaydırın
   - **"Domains"** bölümü olabilir

3. **URL ile:**
   ```
   https://vercel.com/[team]/football-ai-platform/settings/domains
   ```

4. **Arama:**
   - Vercel dashboard'da üstteki arama çubuğuna "domains" yazın

---

## 📞 Yardım

Eğer Domains sekmesini bulamıyorsanız:
1. Vercel dashboard'ın ana sayfasına gidin
2. Projenize tıklayın
3. Üst menüdeki sekmeleri kontrol edin

**Not:** Bazen Domains sekmesi Settings'in dışında, proje ana sayfasında olabilir.
