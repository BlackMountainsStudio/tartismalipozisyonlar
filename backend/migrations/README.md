Bu klasör, VAR Odası backend için Alembic migration dosyalarını içerir.

Örnek kullanım:

```bash
cd backend
export DATABASE_URL="postgresql://user:password@localhost:5432/var_odasi"

# Yeni migration üret
alembic -c alembic.ini revision --autogenerate -m "ilk şema"

# Migration'ları uygula
alembic -c alembic.ini upgrade head
```

`env.py` dosyası `backend.database.Base` ve tüm modelleri otomatik olarak yüklenecek şekilde ayarlanmıştır.

