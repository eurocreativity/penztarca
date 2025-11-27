# Database Migrations

Ez a mappa tartalmazza az adatbázis migrációs scripteket a Supabase adatbázis frissítéséhez.

## ⚠️ FONTOS: Migrációs Sorrend

Futtasd a scripteket **ebben a sorrendben**:

1. **`add_type_to_categories.sql`** - Hozzáadja a `type` mezőt
2. **`add_income_categories_for_existing_users.sql`** - Létrehozza a bevételi kategóriákat meglévő felhasználóknak

---

## Migrációs scriptek futtatása

### 1. Nyisd meg a Supabase projektedet

Látogass el a Supabase Dashboard-ra:
https://supabase.com/dashboard/project/oavxilimosjrodillmea

### 2. Navigálj a SQL Editor-hoz

1. Kattints a bal oldali menüben a **SQL Editor** gombra
2. Kattints a **+ New query** gombra

---

## Migration 1: Add Type Field

### 3a. Futtasd az első scriptet: `add_type_to_categories.sql`

1. Nyisd meg a `add_type_to_categories.sql` fájlt
2. Másold ki a teljes tartalmat
3. Illeszd be a Supabase SQL Editor-ba
4. Kattints a **Run** gombra (vagy nyomj Ctrl+Enter / Cmd+Enter)

**Mit csinál:**
- Hozzáadja a `type` mezőt a `categories` táblához (ha még nem létezik)
- Beállítja az alapértelmezett értéket `'expense'`-re
- Hozzáad egy CHECK constraintet, hogy csak `'expense'` vagy `'income'` értékek lehetnek
- Frissíti a meglévő kategóriákat, hogy `type = 'expense'` legyen
- Megjeleníti az összes kategóriát típus szerint rendezve

---

## Migration 2: Add Income Categories for Existing Users

### 3b. Futtasd a második scriptet: `add_income_categories_for_existing_users.sql`

1. Nyisd meg a `add_income_categories_for_existing_users.sql` fájlt
2. Másold ki a teljes tartalmat
3. Illeszd be a Supabase SQL Editor-ba (új query)
4. Kattints a **Run** gombra

**Mit csinál:**
- Végigmegy az összes meglévő felhasználón
- Ellenőrzi, hogy van-e már bevételi kategóriájuk
- Ha nincs, létrehozza az alapértelmezett bevételi kategóriákat:
  - Fizetés
  - Prémium
  - Megbízás
  - Egyéb bevétel
- Megjeleníti az eredményt felhasználónként csoportosítva

---

## Megjegyzések

- Mindkét script biztonságos, többször is futtatható anélkül, hogy hibát okozna (idempotent)
- Ha a `type` mező már létezik, az első script kihagyja annak létrehozását
- Ha a felhasználónak már vannak bevételi kategóriái, a második script nem hoz létre újakat
- Az új felhasználók automatikusan kapnak minden kategóriát (nincs szükség manuális futtatásra)

---

## Ellenőrzés

A migrációk futtatása után ellenőrizd, hogy minden rendben van:

```sql
-- Nézd meg az összes kategóriát típus szerint
SELECT
    user_id,
    type,
    COUNT(*) as category_count,
    STRING_AGG(name, ', ') as categories
FROM categories
GROUP BY user_id, type
ORDER BY user_id, type;
```

Ezt látod:
- Minden felhasználónak van `expense` típusú kategóriája (5 db)
- Minden felhasználónak van `income` típusú kategóriája (4 db)

---

## Következő lépések a migrációk futtatása után

A migrációs scriptek futtatása után az alkalmazás automatikusan:
1. ✅ Új felhasználók esetén létrehozza mind a kiadási, mind a bevételi kategóriákat
2. ✅ Meglévő felhasználók is látják a bevételi kategóriákat
3. ✅ A kategória kezelőben lehet új bevételi kategóriákat hozzáadni
4. ✅ Bevétel hozzáadásakor csak a bevételi kategóriák jelennek meg
5. ✅ Kiadás hozzáadásakor csak a kiadási kategóriák jelennek meg

**Frissítsd az oldalt (F5)** a migrációk futtatása után!
