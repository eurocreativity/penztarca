# Database Migrations

Ez a mappa tartalmazza az adatbázis migrációs scripteket a Supabase adatbázis frissítéséhez.

## Migrációs scriptek futtatása

### 1. Nyisd meg a Supabase projektedet

Látogass el a Supabase Dashboard-ra:
https://supabase.com/dashboard/project/oavxilimosjrodillmea

### 2. Navigálj a SQL Editor-hoz

1. Kattints a bal oldali menüben a **SQL Editor** gombra
2. Kattints a **+ New query** gombra

### 3. Futtasd a migrációs scriptet

1. Nyisd meg a `add_type_to_categories.sql` fájlt
2. Másold ki a teljes tartalmat
3. Illeszd be a Supabase SQL Editor-ba
4. Kattints a **Run** gombra (vagy nyomj Ctrl+Enter / Cmd+Enter)

### 4. Ellenőrizd az eredményt

A script automatikusan:
- Hozzáadja a `type` mezőt a `categories` táblához (ha még nem létezik)
- Beállítja az alapértelmezett értéket `'expense'`-re
- Hozzáad egy CHECK constraintet, hogy csak `'expense'` vagy `'income'` értékek lehetnek
- Frissíti a meglévő kategóriákat, hogy `type = 'expense'` legyen
- Megjeleníti az összes kategóriát típus szerint rendezve

## Megjegyzések

- A script biztonságos, többször is futtatható anélkül, hogy hibát okozna
- Ha a `type` mező már létezik, a script kihagyja annak létrehozását
- A meglévő kategóriákat automatikusan `'expense'` típusúra állítja be

## Következő lépések a migrációs script futtatása után

A migrációs script futtatása után az alkalmazás automatikusan:
1. Új felhasználók esetén létrehozza mind a kiadási, mind a bevételi kategóriákat a helyes típusokkal
2. A kategória kezelőben lehet új bevételi kategóriákat hozzáadni
3. Bevétel hozzáadásakor csak a bevételi kategóriák jelennek meg
4. Kiadás hozzáadásakor csak a kiadási kategóriák jelennek meg
