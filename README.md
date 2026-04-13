# Sklad tiskovin

Interní webová aplikace pro evidenci tiskových materiálů mezi marketingem a recepcí.

## Spuštění přes Docker (doporučeno)

```bash
docker compose up --build
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

Pro naplnění testovacími daty:

```bash
docker compose exec app npx tsx prisma/seed.ts
```

## Lokální vývoj

Vyžaduje Node.js 20+.

```bash
# Instalace závislostí
npm install

# Vytvoření databáze a migrace
npx prisma migrate deploy

# Naplnění seed daty
npx tsx prisma/seed.ts

# Spuštění dev serveru
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

## Testy

```bash
npm test
```

## Technologie

- Next.js 14 (App Router)
- TypeScript
- Prisma + SQLite
- Tailwind CSS

## Nasazení na interní server

1. Nainstalujte Docker a Docker Compose na server.
2. Naklonujte repozitář.
3. Spusťte `docker compose up -d --build`.
4. Naplňte seed daty: `docker compose exec app npx tsx prisma/seed.ts`.
5. Aplikace bude dostupná na portu 3000. Nakonfigurujte reverse proxy (nginx/Caddy) pro přístup z interní sítě.

Data (SQLite soubor) jsou uložena v Docker volume `db-data` a přežijí restart kontejneru.
