# Irányelvek AI-asszisztált fejlesztéshez

Ez a dokumentum alapvető útmutatást nyújt az ezen a személyes pénzügyi nyomkövető alkalmazáson dolgozó AI-ügynökök számára. Ezen elvek megértése kulcsfontosságú a hatékony és következetes közreműködéshez.

## Architektúra áttekintése

Az alkalmazás egy többoldalas, egyoldalas alkalmazás (SPA) architektúrát követ, vanilla JavaScript és Tailwind CSS (CDN-en keresztül) használatával. Nincs buildelési folyamat.

- **`landing.html`**: A nyilvános marketing és belépési oldal.
- **`auth.html`**: A felhasználói regisztrációt és bejelentkezést kezeli. A logika az `auth.js` fájlban található.
- **`index.html`**: A fő alkalmazás-irányítópult, amely a felhasználó bejelentkezése után látható. Az összes alapvető alkalmazáslogika az `app.js` fájlban található.

A fő komponensek:
- **`AuthManager` (`auth.js`)**: Egy statikus osztály, amely a felhasználói fiókokat (regisztráció, bejelentkezés, kijelentkezés) és a felhasználói adatok `localStorage`-ban való tárolását kezeli.
- **`FinanceApp` (`app.js`)**: A fő alkalmazásosztály, amely a felhasználó bejelentkezése után inicializálódik. Kezeli a felhasználói felületet, az állapotot (kiadások, költségvetés, kategóriák) és a felhasználói interakciókat az irányítópulton belül.

## Adatmegőrzés és állapotkezelés

**Az alkalmazás teljes állapota a `localStorage`-ban van tárolva. Nincs háttéradatbázis.**

- **`penztarca_users`**: Egy JSON stringgé alakított objektum, ahol a kulcsok a felhasználói e-mail címek. Minden érték egy felhasználói objektum, amely tartalmazza a profilt, a kiadásokat, a költségvetést és az egyéni kategóriákat.
- **`penztarca_current_user`**: A jelenleg bejelentkezett felhasználó e-mail címét tárolja, munkamenet-kulcsként működve.

**Fő munkafolyamat:**
1.  Az `app.js` betöltéskor meghívja az `AuthManager.getCurrentUser()` metódust a bejelentkezett felhasználó adatainak lekéréséhez.
2.  Minden adatmódosítást (kiadások hozzáadása, költségvetés módosítása stb.) a `FinanceApp` példány kezel.
3.  A változások a `financeApp.saveUserData()` meghívásával kerülnek mentésre, amely az `AuthManager.saveUserData()` segítségével frissíti a megfelelő felhasználó adatblokkját a `penztarca_users` objektumban a `localStorage`-ban.

## Fejlesztői munkafolyamat

Az alkalmazás helyi futtatásához csupán egy egyszerű HTTP-szerverre van szükség.

```bash
# A projekt gyökeréből futtasd:
python -m http.server 8000
```

Ezután nyisd meg a `http://localhost:8000/landing.html` címet a böngésződben.

Nincsenek buildelési, fordítási vagy függőségtelepítési lépések.

## Kódbázis minták és konvenciók

- **Authentikáció**: Az alkalmazás több felhasználó számára készült. Mindig győződj meg róla, hogy az adatok csak a `currentUser`-hoz (aktuális felhasználóhoz) vannak lekérve és mentve. Használd az `AuthManager` statikus metódusait minden felhasználói adatművelethez.
- **Lokalizáció (i18n)**: Az alkalmazás támogatja a magyar (`hu`) és az angol (`en`) nyelvet.
  - A szöveges karakterláncok a `FinanceApp` osztályon belüli `languages` objektumban vannak tárolva.
  - Használd a `data-lang="kulcs"` attribútumot a HTML-ben a fordítandó elemekhez.
  - Használd a `financeApp.getText('kulcs')` metódust a JavaScriptben a lefordított szövegek lekéréséhez.
- **Dinamikus kategóriakezelés**: A felhasználók kezelhetik saját kiadási kategóriáikat.
  - A kategóriaadatok minden felhasználó saját objektumában vannak tárolva a `localStorage`-ban.
  - Kiadások hozzáadásakor vagy szerkesztésekor a kategórialistát dinamikusan kell feltölteni a felhasználó `categories` tömbjéből.
- **Felhasználói felület és stílus**:
  - A felhasználói felület Tailwind CSS osztályokkal van felépítve közvetlenül a HTML fájlokban.
  - A Tailwind konfigurációja egy `<script>` címkében van definiálva az `index.html`-ben.
  - A modális ablakokat és más dinamikus elemeket gyakran közvetlenül a JavaScript hozza létre és manipulálja (pl. `createCategoryManagerModal` az `app.js`-ben).
- **Függőségek**: Minden függőség (`Tailwind CSS`, `Chart.js`, `Font Awesome`) CDN-en keresztül van betöltve a HTML fájlok `<head>` részében. Nincs `package.json`.