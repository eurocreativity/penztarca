# Supabase Email Templates

## Beállítás

1. Menj a Supabase Dashboard-ra: https://supabase.com/dashboard/project/oavxilimosjrodillmea
2. Navigate: **Authentication → Email Templates**
3. Válaszd ki a megfelelő template-et és másold be az alábbi kódot

---

## 1. Confirm Signup (Email megerősítés)

**Template neve:** Confirm signup

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6; margin: 0;">💰 Pénztárca</h1>
  </div>

  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Email megerősítés</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Köszönjük a regisztrációt a Pénztárca alkalmazásban!
    </p>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Kérjük, erősítsd meg az email címedet az alábbi gomb megnyomásával:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="display: inline-block;
                padding: 14px 32px;
                background-color: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 16px;">
        Email megerősítése
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Ha a gomb nem működik, másold be ezt a linket a böngésződbe:
    </p>
    <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>Üdvözlettel,<br><strong>Pénztárca csapat</strong></p>
    <p style="font-size: 12px; margin-top: 20px;">
      Ha nem te regisztráltál, kérjük hagyd figyelmen kívül ezt az emailt.
    </p>
  </div>
</div>
```

---

## 2. Magic Link (Bejelentkezési link)

**Template neve:** Magic Link

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6; margin: 0;">💰 Pénztárca</h1>
  </div>

  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Bejelentkezési link</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Kattints az alábbi gombra a bejelentkezéshez:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="display: inline-block;
                padding: 14px 32px;
                background-color: #10b981;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 16px;">
        Bejelentkezés
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Ha a gomb nem működik, másold be ezt a linket a böngésződbe:
    </p>
    <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>Üdvözlettel,<br><strong>Pénztárca csapat</strong></p>
    <p style="font-size: 12px; margin-top: 20px;">
      Ha nem te kérted ezt a linket, kérjük hagyd figyelmen kívül ezt az emailt.
    </p>
  </div>
</div>
```

---

## 3. Reset Password (Jelszó visszaállítás)

**Template neve:** Reset Password

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6; margin: 0;">💰 Pénztárca</h1>
  </div>

  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Jelszó visszaállítás</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Jelszó-visszaállítási kérelmet kaptunk a fiókodhoz.
    </p>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Kattints az alábbi gombra az új jelszó beállításához:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="display: inline-block;
                padding: 14px 32px;
                background-color: #ef4444;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 16px;">
        Jelszó visszaállítása
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Ha a gomb nem működik, másold be ezt a linket a böngésződbe:
    </p>
    <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>Üdvözlettel,<br><strong>Pénztárca csapat</strong></p>
    <p style="font-size: 12px; margin-top: 20px;">
      Ha nem te kérted a jelszó visszaállítást, kérjük hagyd figyelmen kívül ezt az emailt.
    </p>
  </div>
</div>
```

---

## 4. Change Email Address (Email cím változtatás)

**Template neve:** Change Email Address

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6; margin: 0;">💰 Pénztárca</h1>
  </div>

  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Email cím megerősítése</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Email cím módosítási kérelmet kaptunk a fiókodhoz.
    </p>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Kattints az alábbi gombra az új email cím megerősítéséhez:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="display: inline-block;
                padding: 14px 32px;
                background-color: #8b5cf6;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 16px;">
        Email cím megerősítése
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Ha a gomb nem működik, másold be ezt a linket a böngésződbe:
    </p>
    <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>Üdvözlettel,<br><strong>Pénztárca csapat</strong></p>
    <p style="font-size: 12px; margin-top: 20px;">
      Ha nem te kérted az email cím módosítását, kérjük azonnal jelentkezz be és módosítsd a jelszavad.
    </p>
  </div>
</div>
```

---

## Telepítési útmutató

1. **Supabase Dashboard:** https://supabase.com/dashboard/project/oavxilimosjrodillmea
2. **Authentication → Email Templates**
3. Válaszd ki az adott template-et
4. Másold be a fenti HTML kódot
5. Kattints a **Save** gombra
6. Ismételd meg mindegyik template-nél

## Megjegyzések

- **Színek:**
  - Kék (#3b82f6) - Confirm signup
  - Zöld (#10b981) - Magic Link
  - Piros (#ef4444) - Reset Password
  - Lila (#8b5cf6) - Change Email

- **Változók:**
  - `{{ .ConfirmationURL }}` - Automatikusan generált link
  - Más változók: `{{ .Email }}`, `{{ .Token }}`, stb.

- **Responsive:** Az emailek mobilon is szépen néznek ki
- **Biztonság:** Mindig tartalmaz figyelmeztetést nem kért akcióknál
