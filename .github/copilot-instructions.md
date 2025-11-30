# GitHub Copilot Instructions - Pénztárca Project

## Project Context
Personal finance web app with Vanilla JS + Supabase + Netlify

## 🎯 IMPORTANT: Use Project Skill
The project has a custom skill with full context at:
`.claude/skills/penztarca-project/SKILL.md`

**DON'T** ask me to read large documentation files.
**DO** use the skill automatically for context.

## 📚 Modular Documentation
For specific details, check these targeted docs:
- `docs/QUICK_REF.md` - Links, commands (~300 tokens)
- `docs/ARCHITECTURE.md` - Tech stack (~800 tokens)
- `docs/DATABASE.md` - Schema, RLS (~800 tokens)
- `docs/FEATURES.md` - Feature list (~900 tokens)
- `docs/DEV_GUIDE.md` - Dev patterns (~1000 tokens)
- `docs/TROUBLESHOOTING.md` - Common issues (~1000 tokens)

**NEVER** reference `PROJECT_STATUS.md` (archived)

## 🛠 Tech Stack
- Frontend: Vanilla JavaScript (ES6+), Tailwind CSS, Chart.js
- Backend: Supabase (PostgreSQL, Auth)
- Deployment: Netlify
- No build process

## 💻 Code Style
```javascript
// ✅ USE
class FinanceApp {
    async saveExpense() {
        const { data, error } = await supabase
            .from('expenses')
            .insert(expenseData);
        
        if (error) throw error;
        this.expenses.push(data[0]);
        this.updateUI();
    }
}

// ❌ AVOID
var FinanceApp = function() { ... }
```

**Rules:**
- ES6+ only (classes, async/await, arrow functions)
- Const/let (never var)
- Tailwind utilities (not custom CSS)
- i18n: Always use `getText(key)` for UI text
- Test both languages (hu/en) and themes (light/dark)

## 🗄 Database
Tables: `profiles`, `categories`, `expenses`
All have RLS enabled - users only see their own data
Type system: `'expense'` | `'income'`

## 🔑 Key Methods (FinanceApp in app.js)
- `init()` - Session check + load data
- `saveExpense()` - Create/update transaction
- `filterExpenses()` - Apply search/filters
- `updateUI()` - Master refresh
- `getText(key)` - i18n translation

## 🌍 i18n Pattern
```javascript
this.languages = {
    hu: { welcome: 'Üdvözöljük' },
    en: { welcome: 'Welcome' }
};
```

## 📝 Git Workflow
Branch naming: `claude/feature-name-<session-id>`
Example: `claude/new-filter-01ABcd23`

## ⚡ Token Optimization (CRITICAL!)
When I ask for help:
1. **Check skill first** (auto-loaded)
2. **Read specific docs** only if needed (e.g., "check docs/DATABASE.md")
3. **Never** suggest reading entire PROJECT_STATUS.md
4. Keep responses focused and concise

## 🚨 Best Practices
1. Always check auth before DB operations
2. Update local state after DB changes
3. Call `updateUI()` after state updates
4. Use try-catch for all async functions
5. Validate input before saving

---
**Skill location:** `.claude/skills/penztarca-project/SKILL.md`
**Last updated:** 2025-11-28
