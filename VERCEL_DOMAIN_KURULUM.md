# 🌐 Vercel'de Domain Tanımlama Rehberi

## 🎯 Domain: varodasi.com (Spaceship)

Vercel'de custom domain ekleme adımları.

---

## 📋 Adım Adım Kurulum

### ADIM 1: Vercel Dashboard'a Git

1. **https://vercel.com** adresine gidin
2. Giriş yapın
3. Projenize gidin: `football-ai-platform`

### ADIM 2: Domain Ekle

1. Projenize tıklayın
2. **"Settings"** sekmesine gidin
3. **"Domains"** sekmesine tıklayın
4. **"Add Domain"** butonuna tıklayın
5. Domain'inizi yazın: `varodasi.com`
6. **"Add"** butonuna tıklayın

### ADIM 3: DNS Kayıtlarını Al

Vercel size DNS kayıtlarını gösterecek. Şunları göreceksiniz:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (www için):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**VEYA sadece CNAME:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Not:** Vercel'in size gösterdiği değerleri kullanın!

---

## 📋 ADIM 4: Spaceship'te DNS Ayarları

### Spaceship DNS Yönetimi

1. **https://www.spaceship.com** adresine gidin
2. Giriş yapın
3. **"Domains"** → `varodasi.com` → **"Manage"**
4. **"DNS Management"** veya **"DNS Settings"** sekmesine gidin

### DNS Kayıtlarını Ekle

Vercel'den aldığınız kayıtları Spaceship'e ekleyin:

#### Seçenek 1: A Record (Önerilen)

**Kayıt 1:**
```
Type: A
Name: @ (veya boş bırakın)
Value: 76.76.21.21 (Vercel'in verdiği IP)
TTL: 3600 (veya otomatik)
```

**Kayıt 2 (www için):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com (Vercel'in verdiği değer)
TTL: 3600
```

#### Seçenek 2: Sadece CNAME (Daha Kolay)

Eğer Spaceship CNAME root domain'e izin veriyorsa:

**Kayıt 1:**
```
Type: CNAME
Name: @ (veya boş)
Value: cname.vercel-dns.com
TTL: 3600
```

**Kayıt 2:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## ⏱️ ADIM 5: DNS Yayılmasını Bekle

DNS değişiklikleri **5 dakika - 48 saat** arasında yayılabilir.

**Kontrol:**
1. Vercel dashboard → **"Domains"** sekmesine bakın
2. Domain'in yanında durum gösterilir:
   - ⏳ **"Pending"** - Bekleniyor
   - ✅ **"Valid"** - Hazır!

---

## 🔒 ADIM 6: SSL Sertifikası (Otomatik)

Vercel otomatik olarak SSL sertifikası verir:
- ✅ HTTPS aktif olur
- ✅ Let's Encrypt sertifikası
- ✅ Otomatik yenilenir

**Bekleyin:** DNS yayıldıktan sonra SSL otomatik kurulur (5-10 dakika).

---

## ✅ Kontrol

### Domain Çalışıyor mu?

1. Tarayıcıda açın: `https://varodasi.com`
2. Site açılıyor mu kontrol edin
3. SSL aktif mi kontrol edin (kilit ikonu)

### Vercel Dashboard'da Kontrol

1. **"Domains"** sekmesine bakın
2. Domain'in yanında **"Valid"** yazıyor mu?
3. SSL durumu: **"Valid Certificate"**

---

## 🆘 Sorun Giderme

### Domain "Pending" Durumunda Kalıyor

**Kontrol:**
1. Spaceship'te DNS kayıtları doğru mu?
2. TTL değeri düşük mü? (3600 veya daha düşük)
3. DNS propagation kontrol edin: https://dnschecker.org

**Çözüm:**
- DNS kayıtlarını tekrar kontrol edin
- TTL değerini düşürün (300-600)
- 24 saat bekleyin

### SSL Sertifikası Kurulmuyor

**Kontrol:**
1. DNS yayıldı mı? (`dnschecker.org` ile kontrol)
2. Domain Vercel'de "Valid" durumunda mı?

**Çözüm:**
- DNS'in tamamen yayılmasını bekleyin
- Vercel dashboard'da **"Refresh"** butonuna tıklayın
- 1-2 saat bekleyin

### www Çalışmıyor

**Kontrol:**
1. `www.varodasi.com` açılıyor mu?
2. CNAME kaydı eklendi mi?

**Çözüm:**
- Spaceship'te `www` için CNAME ekleyin
- Vercel'de `www.varodasi.com` domain'ini de ekleyin

---

## 📝 Spaceship DNS Ayarları (Detaylı)

### Spaceship'te Nasıl Ekle?

1. **Spaceship Dashboard** → **"Domains"**
2. `varodasi.com` → **"Manage"**
3. **"DNS"** veya **"DNS Management"** sekmesi
4. **"Add Record"** veya **"Add DNS Record"** tıklayın

### Eklenecek Kayıtlar:

**1. Root Domain (A Record):**
```
Type: A
Host: @ (veya boş)
Points to: 76.76.21.21
TTL: 3600
```

**2. www (CNAME):**
```
Type: CNAME
Host: www
Points to: cname.vercel-dns.com
TTL: 3600
```

**Not:** Vercel dashboard'da size gösterilen tam değerleri kullanın!

---

## ✅ Başarı Kontrol Listesi

- [ ] Vercel'de domain eklendi
- [ ] Spaceship'te DNS kayıtları eklendi
- [ ] DNS yayıldı (dnschecker.org ile kontrol)
- [ ] Domain Vercel'de "Valid" durumunda
- [ ] SSL sertifikası kuruldu
- [ ] `https://varodasi.com` açılıyor
- [ ] `https://www.varodasi.com` açılıyor

---

## 🎯 Özet

1. ✅ Vercel → Settings → Domains → Add Domain
2. ✅ Domain: `varodasi.com` ekle
3. ✅ Vercel'in gösterdiği DNS kayıtlarını kopyala
4. ✅ Spaceship → DNS Management → Kayıtları ekle
5. ✅ Bekle (5 dakika - 24 saat)
6. ✅ SSL otomatik kurulur
7. ✅ Site hazır! 🎉

---

## 📞 Yardım

Sorun olursa:
1. Vercel dashboard → **"Domains"** → Domain'e tıklayın
2. **"Configuration"** sekmesinde DNS kayıtlarını kontrol edin
3. Spaceship'teki kayıtların aynı olduğundan emin olun

**En yaygın sorun:** DNS kayıtlarında yazım hatası. Dikkatli kontrol edin!
