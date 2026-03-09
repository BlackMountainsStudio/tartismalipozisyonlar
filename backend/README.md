VAR Odası Backend
==================

Bu klasör, VAR Odası projesinin Python backend bileşenlerini içerir.

Ana teknoloji yığını:

-   FastAPI (API katmanı)
-   PostgreSQL (veritabanı)
-   SQLAlchemy & Alembic (ORM ve migration)
-   Scrapy + Playwright + BeautifulSoup (crawler)
-   sentence-transformers + Qdrant (vektör arama ve metin temelli analiz)

Klasör yapısı:

-   api/: FastAPI uygulaması ve HTTP endpoint'leri
-   database/: SQLAlchemy modelleri, bağlantı ve migration'lar
-   crawler/: Scrapy/Playwright tabanlı crawler kodları
-   ai/: Hakem kararlarını tespit eden AI bileşenleri
-   scripts/: Yardımcı CLI script'leri ve batch işler
-   docs/: Backend'e özgü teknik dokümantasyon

Geliştirme ortamını başlatmak için:

1. Python ortamını oluştur ve bağımlılıkları yükle:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Windows için: .venv\\Scripts\\activate
   pip install -r requirements.txt
   ```

2. API geliştirme sunucusunu (ileride) şu komutla çalıştırabileceksin:

   ```bash
   uvicorn api.main:app --reload
   ```

Bu README, blueprint'teki "PROJECT SETUP PROMPT" adımına karşılık gelir.
