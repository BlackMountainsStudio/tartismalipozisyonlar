# 2025-26 Sezon Verisi

## Pozisyon / incident kaynakları

**beIN SPORTS pozisyon linkleri** mümkün olduğunca eklenmeli; tek maç/tek pozisyon sayfaları hem kaynak hem de `videoUrl` için idealdir.

- **URL kalıbı:**  
  `https://beinsports.com.tr/mac-ozetleri-goller/super-lig/pozisyonlar/2025-2026/{hafta}/{ev-sahibi-slug}-{deplasman-slug}/{pozisyon-slug}-{id}`

- **Örnek:**  
  Hafta 5, Fenerbahçe–Trabzonspor, "Onuachu'nun golü VAR'a takıldı":  
  `https://beinsports.com.tr/mac-ozetleri-goller/super-lig/pozisyonlar/2025-2026/5/fenerbahce-trabzonspor/onuachunun-golu-vara-takildi-37534`

- **Kullanım:**  
  - İlgili incident’in `sources` dizisine bu linki ekle (tercihen ilk sırada).  
  - İzlenebilir pozisyon sayfası ise aynı linki `videoUrl` alanına da yaz.

Takım slug’ları genelde küçük harf, tire ile: `fenerbahce`, `galatasaray`, `besiktas`, `trabzonspor` vb.
