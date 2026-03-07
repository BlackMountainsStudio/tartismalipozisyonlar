# 🌐 Spaceship DNS Ayarları - varodasi.com

## 🎯 Vercel için DNS Kayıtları

Spaceship'te eklemeniz gereken DNS kayıtları.

---

## 📋 Vercel'den Alınacak Değerler

### ADIM 1: Vercel'de Domain Ekle

1. Vercel dashboard → Projeniz → **"Settings"** → **"Domains"**
2. **"Add Domain"** → `varodasi.com` yazın
3. **"Add"** tıklayın
4. Vercel size DNS kayıtlarını gösterecek

**Örnek (Vercel'in gösterdiği):**
```
A Record:
@ → 76.76.21.21

CNAME:
www → cname.vercel-dns.com
```

**⚠️ ÖNEMLİ:** Vercel'in size gösterdiği **gerçek değerleri** kullanın!

---

## 📋 Spaceship'te Eklenecek Kayıtlar

### Spaceship DNS Yönetimi

1. **https://www.spaceship.com** → Giriş yapın
2. **"Domains"** → `varodasi.com` → **"Manage"**
3. **"DNS"** veya **"DNS Management"** sekmesine gidin

### Kayıt 1: Root Domain (A Record)

```
Type: A
Name: @ (veya boş bırakın)
Value: 76.76.21.21 (Vercel'in verdiği IP)
TTL: 3600 (veya otomatik)
```

**Spaceship'te nasıl eklenir:**
- **"Add Record"** veya **"Add DNS Record"** tıklayın
- **Type:** A seçin
- **Name/Host:** `@` yazın (veya boş bırakın)
- **Value/Points to:** Vercel'in verdiği IP'yi yazın
- **TTL:** 3600 (veya varsayılan)
- **Save** tıklayın

### Kayıt 2: www (CNAME)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com (Vercel'in verdiği değer)
TTL: 3600
```

**Spaceship'te nasıl eklenir:**
- **"Add Record"** tıklayın
- **Type:** CNAME seçin
- **Name/Host:** `www` yazın
- **Value/Points to:** Vercel'in verdiği CNAME değerini yazın
- **TTL:** 3600
- **Save** tıklayın

---

## ⏱️ Bekleme Süresi

DNS değişiklikleri yayılması:
- **Minimum:** 5 dakika
- **Ortalama:** 1-2 saat
- **Maksimum:** 48 saat

**Kontrol:**
- https://dnschecker.org → `varodasi.com` kontrol edin
- Tüm sunucularda yayıldı mı bakın

---

## ✅ Kontrol

### Vercel Dashboard'da

1. **"Domains"** sekmesine bakın
2. `varodasi.com` yanında:
   - ⏳ **"Pending"** - DNS yayılıyor
   - ✅ **"Valid"** - Hazır!

### Tarayıcıda

1. `https://varodasi.com` açın
2. Site açılıyor mu?
3. SSL aktif mi? (kilit ikonu)

---

## 🆘 Sorun Giderme

### DNS Yayılmıyor

**Kontrol:**
1. Spaceship'te kayıtlar doğru mu?
2. TTL değeri düşük mü? (300-600 önerilir)
3. DNS checker'da kontrol edin

**Çözüm:**
- Kayıtları silip tekrar ekleyin
- TTL değerini düşürün
- 24 saat bekleyin

### Vercel "Invalid Configuration"

**Kontrol:**
1. A Record IP'si doğru mu?
2. CNAME değeri doğru mu?
3. Yazım hatası var mı?

**Çözüm:**
- Vercel dashboard'daki değerleri tekrar kopyalayın
- Spaceship'teki kayıtları kontrol edin
- Gerekirse silip tekrar ekleyin

---

## 📝 Örnek Spaceship DNS Tablosu

Eklendikten sonra şöyle görünmeli:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |

**Not:** Vercel'in size gösterdiği gerçek değerleri kullanın!

---

## ✅ Başarı Kontrol Listesi

- [ ] Vercel'de domain eklendi
- [ ] Vercel'den DNS kayıtları kopyalandı
- [ ] Spaceship'te A Record eklendi (@ → IP)
- [ ] Spaceship'te CNAME eklendi (www → cname)
- [ ] DNS yayıldı (dnschecker.org ile kontrol)
- [ ] Vercel'de domain "Valid" durumunda
- [ ] SSL sertifikası kuruldu
- [ ] Site açılıyor

---

## 🎯 Hızlı Özet

1. ✅ Vercel → Domains → `varodasi.com` ekle
2. ✅ Vercel'in gösterdiği DNS kayıtlarını kopyala
3. ✅ Spaceship → DNS Management → Kayıtları ekle
4. ✅ Bekle (1-24 saat)
5. ✅ Site hazır! 🎉

**Toplam süre:** 5 dakika (ayarlar) + 1-24 saat (DNS yayılması)
