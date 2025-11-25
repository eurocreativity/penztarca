Készíts egy személyes pénzügyi nyilvántartó webalkalmazást az alábbi funkciókkal:

ALAPFUNKCIÓK:
1. Havi költségvetés kezelése
   - Havi keret beállítása
   - Maradék összeg követése
   - Vizuális progress bar a felhasznált/maradék összegről

2. Kiadások követése
   - Új kiadás hozzáadása:
     - Összeg
     - Kategória (Élelmiszer, Közlekedés, Szórakozás, Számlák, Egyéb)
     - Leírás
     - Dátum
   - Kiadások szerkesztése és törlése
   - Összes kiadás listázása szűrési lehetőséggel

3. Vizuális statisztikák
   - Kördiagram a kiadások kategóriánként
   - Havi költési trend vonaldiagram
   - Tervezett vs tényleges költségvetés összehasonlítás

4. Adatok tárolása
   - LocalStorage használata adattárolásra
   - Nincs szükség backend szerverre egyelőre
   - Adatok exportálása/importálása JSON formátumban

5. Felhasználói felület
   - Modern, reszponzív dizájn
   - Tailwind CSS használata
   - Mobilbarát megjelenés
   - Sötét mód támogatása

6. Technológiai stack
   - Vanilla JavaScript (egyszerűség kedvéért framework nélkül)
   - Chart.js a vizualizációkhoz
   - Tailwind CSS CDN-ről
   - Single Page Application

ÚJ FEJLESZTÉSI KÖVETELMÉNYEK:

7. Authentikációs rendszer
   - Felhasználói regisztráció
   - Belépés/kilépés funkció
   - Minden felhasználó csak a saját adatait látja
   - Biztonságos adatkezelés (LocalStorage-ban felhasználó alapon elkülönítve)

8. Dinamikus kategória kezelés
   - Egyedi kategóriák létrehozása
   - Kategóriák szerkesztése (név, szín, ikon)
   - Kategóriák törlése (használat ellenőrzéssel)
   - Alapértelmezett kategóriák mellett egyedi kategóriák
   - CRUD műveletek kategóriákhoz

9. Landing page
   - Szolgáltatás bemutató oldal
   - Funkciók áttekintése
   - Modern, vonzó design
   - Call-to-action gombok
   - Belépés gomb a jobb felső sarokban
   - Regisztráció/belépés hivatkozások

10. Navigáció és felhasználói élmény
    - Multi-page architektúra (Landing → Auth → Dashboard)
    - Smooth átmenetek oldalak között
    - Responsive design minden oldalon
    - Egységes design language
    - Felhasználóbarát hibaüzenetek

Kérlek hozd létre az összes szükséges fájlt és implementáld a funkciókat.