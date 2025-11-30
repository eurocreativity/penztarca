# Design Agent - Modern UI/UX Fejlesztés

## Célkitűzés
A Munkalap App modern, letisztult és vizuálisan vonzó designjának biztosítása. Kerekített elemek, élénk és harmoniikus színpaletta, és gyönyörű visual hierarchy.

## Fő feladatok

### 1. Modern Design Rendszer Meghatározása
- **Szín paletta**: Élénk, modern, harmony-alapú
  - Primary: Dinamikus lila-kék gradient (#667eea → #764ba2)
  - Secondary: Friss zöld (#10b981)
  - Accent: Narancssárga energikus (#f59e0b)
  - Neutral: Tiszta fehér (#ffffff) és szürke skalák (#f3f4f6, #e5e7eb)
  - Status: Success (zöld), Warning (sárga), Danger (piros), Info (kék)

- **Tipográfia**: Modern, clean fonts
  - Heading: Bold, széles spacing
  - Body: Könnyű olvashatóság, 1.5-1.6 line-height
  - Font-family: Inter, Segoe UI, vagy system fonts

- **Spacing & Grid**: Konzisztens 8px-es rács alapú rendszer
  - Padding/Margin: 8px, 16px, 24px, 32px, 48px
  - Border-radius: 8px (kicsi elemek), 12px (kártyák), 16px (hero sections)
  - Gap: 16px, 24px standard

### 2. Design Komponensek

#### A. Buttons (Gombok)
- Modern shadow és hover effect
- Border-radius: 8px
- Padding: 10px 20px (kicsi), 12px 24px (normál), 14px 32px (nagy)
- Transition: all 0.3s ease
- Hover: Shadow grow + Color shift
- Active: Scale 0.98 (ujj-nyomás hatás)
- Disabled: Opacity 0.5, cursor not-allowed

#### B. Cards (Kártyák)
- Border-radius: 12px
- Shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.08) hover-on
- Padding: 24px
- Background: Pure white (#ffffff)
- Hover effect: translateY(-4px), shadow grow
- Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

#### C. Input Fields
- Border-radius: 8px
- Border: 1px solid #e5e7eb
- Focus: Border-color → primary (#667eea), outline: none, shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)
- Padding: 10px 16px
- Font-size: 1rem (16px)
- Transition: all 0.2s ease

#### D. Tables (Táblázatok)
- Thead: Subtle gradient background (rgba primary 0.05)
- Tbody row hover: rgba(102, 126, 234, 0.03) background
- Border: Subtle dividers (border-top/bottom #e5e7eb)
- Padding: 12px 16px
- Border-radius: 8px (ha szükséges)

#### E. Badges & Tags
- Border-radius: 6px (kicsi) / 8px (normál)
- Padding: 4px 12px (kicsi) / 6px 16px (normál)
- Font-size: 0.875rem (14px)
- Font-weight: 600
- Status alapú színezés (success, warning, danger, info)

#### F. Modals
- Border-radius: 12px
- Shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)
- Backdrop: rgba(0, 0, 0, 0.5)
- Smooth fade-in: opacity 0 → 1, duration 0.3s

#### G. Navigation (Navbar)
- Height: 64px (desktop)
- Gradient background (primary gradient)
- Color: White text (#ffffff)
- Logo: Bold, 18px, uppercase
- Spacing: 24px horizontal padding
- Shadow: 0 2px 8px rgba(0,0,0,0.1)

#### H. Sidebar/Menu (ha szükséges)
- Width: 280px (desktop), 100% (mobile)
- Border-radius: 12px (cards inside)
- Spacing: 16px
- Active state: Subtle highlight (#667eea20)
- Hover: #667eea10 background

### 3. Color System (Élénk, Modern)

```
PRIMARY GRADIENT:
  Start: #667eea (szép lila-kék)
  End: #764ba2 (mély lila)
  Usage: Navbar, Primary buttons, Highlights

SUCCESS: #10b981 (friss zöld)
  Light: #d1fae5
  Dark: #047857

WARNING: #f59e0b (élénk narancssárga)
  Light: #fef3c7
  Dark: #d97706

DANGER: #ef4444 (élénk piros)
  Light: #fee2e2
  Dark: #991b1b

INFO: #06b6d4 (cián/sötét turkiz)
  Light: #cffafe
  Dark: #0e7490

NEUTRAL:
  White: #ffffff
  Light Gray: #f3f4f6
  Medium Gray: #e5e7eb
  Dark Gray: #6b7280
  Text: #1f2937
```

### 4. Visual Effects

#### Shadows (Árnyékok)
```
Subtle:    0 1px 2px rgba(0,0,0,0.05)
Small:     0 4px 6px rgba(0,0,0,0.07)
Medium:    0 10px 15px rgba(0,0,0,0.1)
Large:     0 20px 25px rgba(0,0,0,0.15)
XL:        0 25px 50px rgba(0,0,0,0.25)
```

#### Gradients
```
Primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Success: linear-gradient(135deg, #10b981 0%, #059669 100%)
Warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%)
```

#### Transitions
```
Smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
Quick: all 0.2s ease
Slow: all 0.5s ease
```

### 5. Responsive Design

**Desktop-first / Mobile-optimized:**
- Desktop: 1920px+
- Tablet: 768px - 1919px
- Mobile: 320px - 767px

**Breakpoints:**
```css
@media (max-width: 1920px) { /* Large Desktop */ }
@media (max-width: 1200px) { /* Desktop */ }
@media (max-width: 992px)  { /* Tablet */ }
@media (max-width: 768px)  { /* Small Tablet */ }
@media (max-width: 576px)  { /* Mobile */ }
@media (max-width: 425px)  { /* Small Mobile */ }
```

### 6. Accessibility (A11y) Standards

- Color contrast: WCAG AA minimum (4.5:1 text/background)
- Focus states: Visible, distinctive (3px outline or shadow)
- Font-size: Minimum 16px body text (mobile)
- Line-height: 1.5+ readability
- Tap targets: Minimum 44x44px (mobile)
- ARIA labels és semantic HTML

### 7. Fehéren tervezés (Whitespace)

- Bőséges whitespace az oldalak között
- Nem zsúfolt, tiszta megjelenés
- Maximum line-length: 70-80 karakteres sorok
- Cards közötti gap: 24px vagy több

## Eszközök & Technológiák

- **Bootstrap 5.3.0**: Base framework
- **Custom CSS**: Modern effects (gradients, shadows, transitions)
- **CSS Variables**: Konsisztens color és spacing management
- **Tailwind-szerű approach**: Utility-first ahol szükséges
- **Playwright**: Visual regression testing

## Design Implementáció

Az agent a Design System-et implementálja az alábbi módokon:

1. **Global CSS variables** létrehozása
2. **Custom component classes** definiálása
3. **Meglévő fájlok UI modernizálása**
4. **Konzisztencia biztosítása** az összes oldalon
5. **Visual testing** a Design System-hez

## Fájlok, amit módosít/létrehoz

- `css/design-system.css` (új) - Teljes design rendszer
- `css/variables.css` (új) - CSS variables
- `css/custom.css` (módosítás) - Meglévő custom stílusok
- `dashboard.php` (módosítás) - Modern design alkalmazása
- `worksheets/view.php` (módosítás) - Modern design alkalmazása
- `worksheets/list.php` (módosítás) - Modern design alkalmazása
- Egyéb fájlok szükség szerint

## Output

- ✅ Teljes Design System dokumentáció
- ✅ CSS fájlok (design-system.css, variables.css)
- ✅ Implementált modern design az oldalakon
- ✅ Visual consistency audit
- ✅ Accessibility compliance report
- ✅ Git commits (development branch-be)

## Végzettségi Feltételek

- Összes CSS fájl létrehozva
- Összes megadott komponens stílusa implementálva
- Visual testing (Playwright): 0 regression
- Accessibility audit: WCAG AA pass
- Design System dokumentáció: teljes
