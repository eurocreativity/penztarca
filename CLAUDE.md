# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start local server:**
```bash
python -m http.server 8000
```

**Access application:**
http://localhost:8000

No build process required - this is a vanilla HTML/JS/CSS application served directly.

## Architecture Overview

This is a **Single Page Application** for personal finance tracking built with:
- **Vanilla JavaScript** - Single `FinanceApp` class handles all functionality
- **Tailwind CSS** - Loaded via CDN with custom warm color scheme configuration
- **Chart.js** - For data visualizations (doughnut and line charts)
- **localStorage** - Client-side data persistence

### Core Application Class

The `FinanceApp` class in `app.js` manages:
- **State**: `expenses` array, `budget` number, `currentEditId` for editing
- **Categories**: 5 predefined expense categories (food, transport, entertainment, bills, other)
- **UI Updates**: Budget display, expense lists, charts, quick stats
- **Data Persistence**: All data stored in browser localStorage

### Data Structure

**Expense Object:**
```javascript
{
    id: timestamp,
    amount: number,
    category: string, // 'food'|'transport'|'entertainment'|'bills'|'other'
    description: string,
    date: 'YYYY-MM-DD',
    timestamp: ISO string
}
```

**localStorage Keys:**
- `expenses`: Array of expense objects
- `budget`: Monthly budget amount
- `darkMode`: Boolean for theme preference

## Design System

**Custom Color Palette:**
- **Primary**: Warm amber (#f59e0b family)
- **Warm**: Red tones for expenses (#ef4444 family)
- **Accent**: Darker amber shades (#d97706 family)
- **Background**: Gradient overlays with glassmorphism effects

**Chart Colors:** Each category has assigned warm-toned colors for consistent visualization.

## Key Features

**Budget Management:**
- Monthly budget setting with visual progress bar
- Dynamic color changes based on spending percentage (green → yellow → red)
- Real-time calculation of remaining budget

**Expense Tracking:**
- CRUD operations with inline editing
- Category-based filtering and visualization
- Date-based filtering with month selector

**Data Visualization:**
- Doughnut chart: Category-based expense breakdown
- Line chart: 6-month spending trend vs budget
- Charts auto-update with theme changes (dark/light mode)

**Import/Export:**
- JSON export with timestamp
- JSON import with data validation and confirmation

## File Structure

- `index.html`: Complete UI structure with embedded Tailwind configuration
- `app.js`: Single class containing all application logic
- `project-summary.md`: Original Hungarian requirements document

## Hungarian Localization

The application is fully localized in Hungarian:
- UI labels and messages
- Category names (Élelmiszer, Közlekedés, etc.)
- Currency formatting (HUF)
- Date formatting (Hungarian locale)