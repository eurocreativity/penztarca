# Recurring Transactions - Testing Checklist

**Project:** Pénztárca Personal Finance Web App
**Feature:** Recurring Transactions (v1.5)
**Test Date:** 2025-11-30
**Tester:** Agent 4 (Translation & Testing Specialist)

---

## 1. Database Tests

### Database Schema & Migration

- [ ] Migration file (`add_recurring_transactions.sql`) executes without errors in Supabase SQL editor
- [ ] Table `recurring_transactions` created with correct schema
- [ ] All 14 columns present: id, user_id, amount, category_id, description, type, frequency, start_date, end_date, next_occurrence, last_generated_date, is_active, created_at, updated_at
- [ ] PRIMARY KEY constraint on `id` (UUID)
- [ ] NOT NULL constraints enforced on required fields
- [ ] CHECK constraint on `type` field (only 'expense' or 'income')
- [ ] CHECK constraint on `frequency` field (only valid frequencies)
- [ ] DECIMAL(10,2) type for amount field allows up to 10 digits with 2 decimals
- [ ] DATE type for date fields

### Indexes

- [ ] Index `idx_recurring_user_id` created on (user_id)
- [ ] Index `idx_recurring_next_occurrence` created on (next_occurrence) filtered by is_active = true
- [ ] Index `idx_recurring_user_active` created on (user_id, is_active) composite index
- [ ] Indexes improve query performance for common operations

### Foreign Keys

- [ ] Foreign key `user_id` → `auth.users(id)` with ON DELETE CASCADE
- [ ] Foreign key `category_id` → `categories(id)` with ON DELETE RESTRICT
- [ ] User deletion cascades and removes all their recurring transactions
- [ ] Category deletion blocked if recurring transaction uses it

### Row-Level Security (RLS)

- [ ] RLS enabled on `recurring_transactions` table
- [ ] SELECT policy: Users can view only their own recurring transactions
- [ ] INSERT policy: Users can insert only their own recurring transactions
- [ ] UPDATE policy: Users can update only their own recurring transactions
- [ ] DELETE policy: Users can delete only their own recurring transactions
- [ ] Test user A cannot see test user B's recurring transactions
- [ ] Test user A cannot edit test user B's recurring transactions
- [ ] Test user A cannot delete test user B's recurring transactions
- [ ] All 4 policies use `auth.uid() = user_id` correctly

### Data Integrity

- [ ] Default values work: is_active = true, created_at = NOW(), updated_at = NOW()
- [ ] UUID is generated automatically for new records
- [ ] Timestamps are generated automatically on insert
- [ ] next_occurrence required field cannot be NULL
- [ ] amount field stores decimal values correctly (e.g., 10.50)
- [ ] description field can store long text

---

## 2. CRUD Operations Tests

### Create Recurring Transaction

- [ ] Can create daily recurring transaction (1 day)
- [ ] Can create weekly recurring transaction (7 days)
- [ ] Can create biweekly recurring transaction (14 days)
- [ ] Can create monthly recurring transaction (30 days)
- [ ] Can create quarterly recurring transaction (90 days)
- [ ] Can create semi-annual recurring transaction (180 days)
- [ ] Can create annual recurring transaction (365 days)
- [ ] Can create recurring expense transaction
- [ ] Can create recurring income transaction
- [ ] Amount field accepts decimal values (e.g., 15.99)
- [ ] Amount field accepts large values (e.g., 100000.00)
- [ ] Description field stores text correctly
- [ ] Start date is required and cannot be empty
- [ ] End date is optional and can be left empty
- [ ] Created record appears in list immediately
- [ ] Toast notification shows "Recurring transaction saved successfully"

### Read Recurring Transaction

- [ ] Can load all recurring transactions for logged-in user
- [ ] List displays active recurring transactions
- [ ] List displays paused (inactive) recurring transactions
- [ ] List separates active and paused sections
- [ ] Empty state message shows when no recurring transactions exist
- [ ] Each recurring item shows: description, amount, category, frequency, next occurrence
- [ ] Each recurring item shows status badge (Active/Paused)
- [ ] Can view details of recurring transaction
- [ ] List loads on app initialization
- [ ] List refreshes after creating new recurring
- [ ] List refreshes after editing recurring
- [ ] List refreshes after deleting recurring

### Update Recurring Transaction

- [ ] Can edit amount of recurring transaction
- [ ] Can edit category of recurring transaction
- [ ] Can edit description of recurring transaction
- [ ] Can edit frequency of recurring transaction
- [ ] Can edit start date of recurring transaction
- [ ] Can edit end date of recurring transaction
- [ ] Can toggle between expense and income types
- [ ] Form pre-fills with current values when editing
- [ ] Submit with ID updates existing record instead of creating new
- [ ] Updated record reflects changes in list immediately
- [ ] Toast notification shows "Recurring transaction saved successfully"
- [ ] Cannot edit to invalid values (amount = 0, missing category, etc.)

### Delete Recurring Transaction

- [ ] Delete button shows confirmation dialog
- [ ] Confirmation dialog asks "Biztosan törölni szeretnéd ezt az ismétlődő tranzakciót?" (HU) or "Delete this recurring transaction?" (EN)
- [ ] Clicking "OK" deletes the recurring transaction
- [ ] Clicking "Cancel" does not delete anything
- [ ] Deleted record removed from list immediately
- [ ] Toast notification shows "Recurring transaction deleted"
- [ ] Cannot recover deleted recurring transaction (no undo)
- [ ] Deleting recurring does NOT delete already-generated transactions

### Pause Recurring Transaction

- [ ] Can pause active recurring transaction
- [ ] Paused recurring stops generating new transactions
- [ ] Paused recurring moves to "Paused" section in list
- [ ] Pause button shows correct icon (pause or play)
- [ ] Toast notification shows "Recurring transaction paused"
- [ ] Previously-generated transactions remain untouched

### Resume Recurring Transaction

- [ ] Can resume paused recurring transaction
- [ ] Resumed recurring starts generating new transactions again
- [ ] Resumed recurring moves to "Active" section in list
- [ ] Resume button shows correct icon (pause or play)
- [ ] Toast notification shows "Recurring transaction resumed"
- [ ] next_occurrence updates to today if overdue (for next check)

---

## 3. Auto-Generation Tests

### Frequency Patterns

- [ ] Daily frequency generates every 1 day correctly
- [ ] Weekly frequency generates every 7 days correctly
- [ ] Biweekly frequency generates every 14 days correctly
- [ ] Monthly frequency generates every 30 days correctly
- [ ] Quarterly frequency generates every 90 days correctly
- [ ] Semi-annual frequency generates every 180 days correctly
- [ ] Annual frequency generates every 365 days correctly

### Generation Process

- [ ] Auto-generation runs on app initialization
- [ ] Auto-check interval starts immediately (first check happens right away)
- [ ] Auto-check interval runs periodically (every 6 hours)
- [ ] Only active recurring transactions are checked for generation
- [ ] Paused recurring transactions do NOT generate
- [ ] Only recurring with next_occurrence <= today generates
- [ ] Recurring with next_occurrence > today does NOT generate

### Generated Transactions

- [ ] Generated transaction appears in expense/income list immediately
- [ ] Generated transaction has correct amount (copied from recurring)
- [ ] Generated transaction has correct category (copied from recurring)
- [ ] Generated transaction has correct type (expense or income)
- [ ] Generated transaction date = old next_occurrence value
- [ ] Generated transaction description includes "[Recurring]" prefix
- [ ] Generated transaction can be edited independently
- [ ] Generated transaction can be deleted independently

### Next Occurrence Update

- [ ] next_occurrence updates to future date after generation
- [ ] next_occurrence = old next_occurrence + frequency interval
- [ ] next_occurrence format is YYYY-MM-DD
- [ ] last_generated_date updates to the generated date
- [ ] last_generated_date shows when transaction was last created

### End Date Behavior

- [ ] Recurring with no end_date continues indefinitely
- [ ] Recurring with end_date in future generates normally
- [ ] Recurring with end_date in past does NOT generate
- [ ] Final transaction generates on end_date (if it's due)
- [ ] After final generation, is_active set to false automatically
- [ ] Paused recurring appears in "Paused" section after end_date passes
- [ ] User can extend end_date by editing and resuming

### Multiple Due Transactions

- [ ] If multiple recurring are due, all generate correctly
- [ ] Generation count shows accurate number (e.g., "3 transactions auto-generated")
- [ ] Toast notification displays correct count
- [ ] No duplicates generated for same recurring
- [ ] Each due recurring generates exactly one transaction

### Generation Error Handling

- [ ] If database error occurs during generation, error logged to console
- [ ] Toast shows error message "Error generating recurring transactions"
- [ ] App continues running despite generation error
- [ ] Failed generation does NOT update next_occurrence
- [ ] Failed generation does NOT deactivate recurring

---

## 4. UI Component Tests

### Recurring Transactions List Card

- [ ] Card displays with title "Ismétlődő Tranzakciók" (HU) or "Recurring Transactions" (EN)
- [ ] Card has "New Recurring" / "Add Recurring" button
- [ ] Card uses violet/purple theme icon (fa-sync-alt)
- [ ] Card responsive on mobile (single column)
- [ ] Card responsive on tablet (maintains layout)
- [ ] Card responsive on desktop (full width)
- [ ] Dark mode styles applied correctly
- [ ] Glassmorphism effect visible (backdrop blur, semi-transparent)

### Recurring List Display

- [ ] List shows active recurring transactions first
- [ ] "Active" section has header label
- [ ] Paused recurring transactions show below
- [ ] "Paused" section has header label
- [ ] Empty state shows when no recurring transactions (icon + message)
- [ ] Empty state message: "Nincs ismétlődő tranzakció" (HU) or "No recurring transactions" (EN)
- [ ] List scrolls if more than ~5 items (max-height: 24rem)
- [ ] List items have hover effect (shadow increases)
- [ ] Active status badge shows for active recurring (emerald/green)
- [ ] Paused status badge shows for paused recurring (gray)

### Recurring Item Display

- [ ] Shows category icon from categories table
- [ ] Shows recurring description (not category name)
- [ ] Shows amount in currency format (e.g., "10,000 Ft")
- [ ] Shows income amount with up arrow (fa-arrow-up)
- [ ] Shows expense amount with down arrow (fa-arrow-down)
- [ ] Shows category name
- [ ] Shows frequency label translated (e.g., "Heti", "Monthly")
- [ ] Shows next occurrence date formatted by locale
- [ ] Shows "Vége: " (HU) or "Until: " (EN) with end date if set
- [ ] Shows "Nincs határidő" (HU) or "No end date" (EN) if no end date
- [ ] Each item has pause/play button
- [ ] Each item has edit button
- [ ] Each item has delete button

### Recurring Transaction Form

- [ ] Form appears when "Add Recurring" button clicked
- [ ] Form has close button (X icon) in header
- [ ] Form title shows "Új Ismétlődő Tranzakció" (HU) or "New Recurring Transaction" (EN)
- [ ] Form has hidden input for ID (edit mode)
- [ ] Type selector shows radio buttons for Expense/Income
- [ ] Expense radio is selected by default
- [ ] Type selector changes styling on selection
- [ ] Amount input field works and accepts numbers
- [ ] Category dropdown shows only current type's categories
- [ ] Category dropdown updates when type changes
- [ ] Description input field works
- [ ] Frequency dropdown shows all 7 options
- [ ] Frequency dropdown has correct translations
- [ ] Start date picker works
- [ ] Start date can be set to past, today, or future
- [ ] End date picker works (optional)
- [ ] End date can be left empty
- [ ] Submit button says "Mentés" (HU) or "Save" (EN)
- [ ] Cancel button says "Mégse" (HU) or "Cancel" (EN)
- [ ] Form validates before submission
- [ ] Form clears after successful submission
- [ ] Form pre-fills when editing existing recurring
- [ ] Form scrolls into view smoothly when opened

### Form Validation

- [ ] Cannot submit with empty amount
- [ ] Cannot submit with amount = 0
- [ ] Cannot submit with negative amount
- [ ] Cannot submit with empty category
- [ ] Cannot submit with empty description
- [ ] Cannot submit with empty start date
- [ ] Can submit with empty end date
- [ ] Error messages shown for validation failures
- [ ] Form prevents invalid date selections

---

## 5. Internationalization Tests

### Hungarian Language

- [ ] Section label: "Ismétlődő Tranzakciók"
- [ ] Button label: "Új Ismétlődő"
- [ ] Active section: "Aktív"
- [ ] Paused section: "Szüneteltetett"
- [ ] Empty state: "Nincs ismétlődő tranzakció"
- [ ] Frequency: "Napi", "Heti", "Kéthetente", "Havi", "Negyedéves", "Féléves", "Éves"
- [ ] Form labels: "Gyakoriság", "Kezdő dátum", "Vég dátum"
- [ ] Action buttons: "Szüneteltetés", "Folytatás", "Szerkesztés", "Törlés"
- [ ] Messages:
  - "Ismétlődő tranzakció sikeresen mentve"
  - "Ismétlődő tranzakció törölve"
  - "Ismétlődő tranzakció szüneteltetve"
  - "Ismétlődő tranzakció folytatva"
  - "{count} tranzakció automatikusan generálva"
  - Confirmation: "Biztosan törölni szeretnéd ezt az ismétlődő tranzakciót?"

### English Language

- [ ] Section label: "Recurring Transactions"
- [ ] Button label: "New Recurring"
- [ ] Active section: "Active"
- [ ] Paused section: "Paused"
- [ ] Empty state: "No recurring transactions"
- [ ] Frequency: "Daily", "Weekly", "Biweekly", "Monthly", "Quarterly", "Semi-annual", "Annual"
- [ ] Form labels: "Frequency", "Start Date", "End Date"
- [ ] Action buttons: "Pause", "Resume", "Edit", "Delete"
- [ ] Messages:
  - "Recurring transaction saved successfully"
  - "Recurring transaction deleted"
  - "Recurring transaction paused"
  - "Recurring transaction resumed"
  - "{count} transactions auto-generated"
  - Confirmation: "Delete this recurring transaction?"

### Language Switching

- [ ] Language switch button works (if implemented)
- [ ] All recurring UI updates to new language immediately
- [ ] Frequency labels translate
- [ ] Status labels translate
- [ ] Message toasts show correct language
- [ ] Form labels translate
- [ ] Category names translated (from categories table)

### Date Formatting

- [ ] Dates format correctly for Hungarian (HU) locale
- [ ] Dates format correctly for English (EN) locale
- [ ] Next occurrence date shows correct format
- [ ] End date shows correct format
- [ ] Form date pickers use correct format

---

## 6. Integration Tests

### App Initialization

- [ ] RecurringManager initialized after login
- [ ] Recurring transactions load on app start
- [ ] Auto-check starts on app initialization
- [ ] First auto-check happens immediately
- [ ] Auto-check interval (6 hours) set up correctly

### Expense List Integration

- [ ] Generated transactions appear in expense list
- [ ] Generated transactions appear in monthly totals
- [ ] Generated transactions appear in category charts
- [ ] Expense filters work with generated transactions
- [ ] Search works with generated transactions (by description)
- [ ] "[Recurring]" prefix visible in expense list

### Category System Integration

- [ ] Recurring form uses existing categories
- [ ] Category dropdown filters by type (expense/income)
- [ ] Category icons show in recurring list
- [ ] Category names show in recurring list
- [ ] Cannot delete category if recurring uses it (error toast)
- [ ] Creating category appears in recurring form immediately
- [ ] Renaming category reflects in recurring list immediately

### Toast Notifications

- [ ] Success toast shows on recurring save
- [ ] Error toast shows on save failure
- [ ] Success toast shows on recurring delete
- [ ] Error toast shows on delete failure
- [ ] Success toast shows on pause
- [ ] Success toast shows on resume
- [ ] Error toast shows on pause failure
- [ ] Error toast shows on resume failure
- [ ] Info/success toast shows generation count

### Dark Mode

- [ ] Recurring list card looks good in dark mode
- [ ] Recurring form looks good in dark mode
- [ ] Text contrast sufficient in dark mode
- [ ] Icons visible in dark mode
- [ ] Status badges visible in dark mode
- [ ] Switching to dark mode updates recurring UI
- [ ] Switching to light mode updates recurring UI

### Loading States

- [ ] Loading overlay appears while loading recurring
- [ ] Loading message shows "Betöltés..." (HU) or "Loading..." (EN)
- [ ] Buttons show loading state (spinner) while saving
- [ ] Buttons disabled while saving
- [ ] Cannot submit form twice during submission

### Logout

- [ ] Auto-check interval stops on logout
- [ ] RecurringManager cleanup happens on logout
- [ ] Recurring state cleared on logout
- [ ] No errors in console on logout
- [ ] User cannot access other user's recurring after logout+login as different user

---

## 7. Mobile Responsive Tests

### Mobile Layout (320px - 480px)

- [ ] Recurring card displays full width
- [ ] List items stack properly
- [ ] Buttons readable and clickable on mobile
- [ ] Form fits on mobile screen
- [ ] Form inputs are touch-friendly (adequate spacing)
- [ ] Category dropdown works on mobile
- [ ] Frequency dropdown works on mobile
- [ ] Date pickers work on mobile
- [ ] Icons visible and appropriately sized
- [ ] Text readable (not too small)

### Tablet Layout (768px - 1024px)

- [ ] Recurring card layout works on tablet
- [ ] List items display properly
- [ ] Form displays correctly
- [ ] No text overflow or truncation
- [ ] Buttons appropriately sized

### Desktop Layout (1024px+)

- [ ] Recurring card width appropriate
- [ ] List displays with good spacing
- [ ] Form layout clean and organized
- [ ] Adequate whitespace around elements

---

## 8. Performance Tests

### Load Performance

- [ ] App loads in < 3 seconds on 4G connection
- [ ] Recurring list loads in < 1 second for 50+ items
- [ ] Form loads instantly when button clicked

### Generation Performance

- [ ] Generating 1 transaction takes < 100ms
- [ ] Generating 5 transactions takes < 500ms
- [ ] Generating 10 transactions takes < 1 second
- [ ] Auto-check doesn't freeze UI
- [ ] No console warnings about performance

### Rendering Performance

- [ ] List re-render after action < 100ms
- [ ] Form response to input < 50ms
- [ ] Sorting/filtering < 200ms

### Memory

- [ ] No memory leaks when adding/removing recurring
- [ ] No memory leaks on language switch
- [ ] App memory usage stable over time

---

## 9. Cross-Browser Tests

### Chrome/Chromium

- [ ] All features work in Chrome latest
- [ ] No console errors
- [ ] Styling looks correct
- [ ] Date pickers work properly
- [ ] Forms submit correctly

### Firefox

- [ ] All features work in Firefox latest
- [ ] No console errors
- [ ] Styling looks correct
- [ ] Date pickers work properly
- [ ] Forms submit correctly

### Safari

- [ ] All features work in Safari latest
- [ ] No console errors
- [ ] Styling looks correct
- [ ] Date pickers work properly
- [ ] Forms submit correctly

### Edge

- [ ] All features work in Edge latest
- [ ] No console errors
- [ ] Styling looks correct
- [ ] Date pickers work properly
- [ ] Forms submit correctly

---

## 10. Edge Cases & Error Handling

### Timezone Handling

- [ ] Generated dates correct in different timezones
- [ ] next_occurrence compares correctly across timezones
- [ ] Date normalization uses 00:00:00

### Date Edge Cases

- [ ] Start date = end date generates one transaction
- [ ] Start date = today generates immediately on next check
- [ ] Start date = future doesn't generate until that date
- [ ] Recurring spanning leap year works correctly (Feb 29)
- [ ] Date math correct for all month lengths

### Frequency Edge Cases

- [ ] Monthly recurring on day 31 works (becomes 30 days later)
- [ ] Annual recurring on Feb 29 (leap year) works on non-leap years

### Multiple Devices

- [ ] Opening in 2 tabs doesn't cause double generation (by design, accepted edge case)
- [ ] Logout in one tab affects other tabs correctly

### Network Issues

- [ ] Error shown if database connection fails
- [ ] Retry possible after error
- [ ] No silent failures

### Data Validation

- [ ] Amount > 10000000 causes error
- [ ] Amount < 0.01 causes error
- [ ] Description length limit enforced (TEXT field)
- [ ] Invalid category ID causes error
- [ ] Invalid user ID causes error (RLS blocks)

---

## 11. Accessibility Tests

### Keyboard Navigation

- [ ] Tab order correct in form
- [ ] Can submit form with Enter key
- [ ] Can cancel form with Escape key
- [ ] All buttons keyboard accessible
- [ ] Delete confirmation accessible via keyboard

### Screen Reader Support

- [ ] Form labels associated with inputs
- [ ] Button purposes clear to screen reader
- [ ] Status badge text clear
- [ ] Icons have aria-labels or alt text
- [ ] Error messages announced properly

### Color Contrast

- [ ] Text meets WCAG AA contrast ratios
- [ ] Active/Paused badges distinguishable by text
- [ ] Icons visible regardless of color

---

## 12. Translation Key Verification

### Key Counts

- [ ] 27 unique translation keys added to app.js
- [ ] 27 Hungarian translations present and non-empty
- [ ] 27 English translations present and non-empty
- [ ] Total 54 translation strings (27 × 2 languages)
- [ ] No duplicate keys
- [ ] No missing translations

### Key Categories Verified

**Section Labels (5 keys):**
- recurringTransactions
- newRecurring
- activeRecurring
- pausedRecurring
- noRecurring

**Frequency Labels (7 keys):**
- daily
- weekly
- biweekly
- monthly
- quarterly
- semiannual
- annual

**Form Labels (6 keys):**
- frequency
- startDate
- endDate
- nextOccurrence
- lastGenerated
- hasEndDate

**Action Labels (4 keys):**
- pause
- resume
- editRecurring
- deleteRecurring

**Messages (5 keys):**
- recurringSaved
- recurringDeleted
- recurringPaused
- recurringResumed
- transactionsGenerated (with {count} placeholder)
- deleteRecurringConfirm
- recurringGenerationError

---

## 13. Test Scenarios

### Scenario 1: Daily Medication Cost

**Setup:**
- Create daily recurring expense
- Amount: 50 Ft
- Category: Health
- Description: "Daily vitamin"
- Start date: Today
- No end date

**Test:**
- [ ] Transaction generated today
- [ ] next_occurrence = tomorrow
- [ ] Generated transaction in expense list
- [ ] Toast shows "1 transactions auto-generated"

### Scenario 2: Weekly Grocery Shopping

**Setup:**
- Create weekly recurring expense
- Amount: 500 Ft
- Category: Food
- Description: "Weekly groceries"
- Start date: Today
- No end date

**Test:**
- [ ] First generation today
- [ ] next_occurrence = 7 days from now
- [ ] Generated transaction in list
- [ ] Can pause and resume without losing pattern

### Scenario 3: Monthly Rent Payment

**Setup:**
- Create monthly recurring expense
- Amount: 50,000 Ft
- Category: Bills
- Description: "Apartment rent"
- Start date: 2025-01-01
- End date: 2025-12-31

**Test:**
- [ ] Generates on schedule every 30 days
- [ ] Final generation by 2025-12-31
- [ ] Auto-deactivates after final generation
- [ ] Moves to "Paused" section

### Scenario 4: Quarterly Tax Payment

**Setup:**
- Create quarterly recurring expense
- Amount: 10,000 Ft
- Category: Taxes
- Description: "Quarterly tax"
- Start date: 2025-01-01
- No end date

**Test:**
- [ ] Generates every 90 days
- [ ] next_occurrence updates correctly
- [ ] 4 generations per year (approximately)

### Scenario 5: Annual Insurance

**Setup:**
- Create annual recurring expense
- Amount: 15,000 Ft
- Category: Insurance
- Description: "Car insurance"
- Start date: 2025-01-01
- No end date

**Test:**
- [ ] Generates every 365 days
- [ ] next_occurrence = 1 year later
- [ ] Can be paused/resumed

### Scenario 6: Recurring Income (Salary)

**Setup:**
- Create monthly recurring income
- Amount: 300,000 Ft
- Category: Salary
- Description: "Monthly salary"
- Start date: 2025-01-01
- No end date

**Test:**
- [ ] Income type selected (not expense)
- [ ] Shows up arrow icon (not down)
- [ ] Amount formatted as income in list
- [ ] Appears in "Monthly income" stat
- [ ] Color shows emerald/green (income color)

### Scenario 7: Long Absence (2 weeks)

**Setup:**
- Create weekly recurring
- Last generation: 14 days ago
- next_occurrence: 7 days ago (overdue)

**Test:**
- [ ] On app open, auto-generation runs
- [ ] Only ONE transaction generated (not multiple)
- [ ] next_occurrence updates to next week
- [ ] Toast shows "1 transactions auto-generated"

### Scenario 8: Edit Frequency

**Setup:**
- Create monthly recurring (already exists)
- Edit to change to quarterly

**Test:**
- [ ] Form pre-fills with existing data
- [ ] Can change frequency dropdown
- [ ] Submit updates database
- [ ] next_occurrence recalculated if needed
- [ ] Toast shows "Recurring transaction saved successfully"

### Scenario 9: Toggle Pause/Resume Multiple Times

**Setup:**
- Create active recurring

**Test:**
- [ ] Click pause: moves to "Paused" section
- [ ] Click resume: moves back to "Active" section
- [ ] No transactions generated while paused
- [ ] Transactions generate again after resume

### Scenario 10: Delete During Active Period

**Setup:**
- Create daily recurring (in active state)
- Already generated 5 transactions

**Test:**
- [ ] Already-generated transactions remain
- [ ] Can view them in expense list
- [ ] Only the recurring pattern deleted
- [ ] No future transactions generated
- [ ] Toast shows "Recurring transaction deleted"

---

## 14. Known Limitations & Acceptable Behaviors

### By Design

1. **Single Generation Per Check:** Only generates one transaction per recurring pattern per check cycle. If user absent for 2 weeks, weekly recurring only generates 1 transaction (not 2). Rationale: Prevents flooding user with backlog. Can be enhanced in v2.

2. **Fixed-Day Intervals:** Uses fixed day counts (30, 90, 180, 365) not calendar-based recurring. Monthly rent on Jan 1 generates: Jan 31, Mar 2, Apr 1 (dates drift). Rationale: Simplicity. Calendar-based is future enhancement.

3. **No Duplicate Prevention:** Multiple tabs/devices can generate duplicate transactions (edge case). User can delete duplicate manually. Rationale: Simple implementation for v1. Database constraint for v2.

4. **Generated Only While App Running:** Transactions only generate when app is open (auto-check runs). No background service. Rationale: Simplicity for v1.

### Accepted Edge Cases

- Leap year dates handled by JavaScript Date object (may shift by 1 day in rare cases)
- Timezone differences may cause off-by-one day generation (always normalized to 00:00:00)
- Very large amounts (>999,999,999) may display formatting issues

---

## 15. Test Completion Summary

**Total Test Items:** 210+

### By Category

| Category | Item Count | Status |
|----------|-----------|--------|
| Database Tests | 27 | [ ] Not Started |
| CRUD Operations | 45 | [ ] Not Started |
| Auto-Generation | 27 | [ ] Not Started |
| UI Components | 48 | [ ] Not Started |
| Internationalization | 20 | [ ] Not Started |
| Integration | 28 | [ ] Not Started |
| Mobile Responsive | 14 | [ ] Not Started |
| Performance | 11 | [ ] Not Started |
| Cross-Browser | 20 | [ ] Not Started |
| Edge Cases | 17 | [ ] Not Started |
| Accessibility | 11 | [ ] Not Started |
| **TOTAL** | **210+** | **[ ] Not Started** |

---

## 16. Test Execution Notes

### Date Testing Started: _________________
### Date Testing Completed: _________________
### Tester Name: _________________________
### Test Environment:
- [ ] Local (localhost:8000)
- [ ] Staging (URL: _______________)
- [ ] Production (URL: _______________)

### Browser Used: _________________________
### Browser Version: _______________________
### Operating System: _____________________
### Device Type:
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

---

## 17. Issues Found

### Issue #1
**Severity:** [Critical / High / Medium / Low]
**Category:** [Bug / Design / Performance / Usability]
**Description:** _________________________________
**Steps to Reproduce:** _________________________________
**Expected Result:** _________________________________
**Actual Result:** _________________________________
**Status:** [ ] Open [ ] Fixed [ ] Deferred

---

### Issue #2
**Severity:** [Critical / High / Medium / Low]
**Category:** [Bug / Design / Performance / Usability]
**Description:** _________________________________
**Steps to Reproduce:** _________________________________
**Expected Result:** _________________________________
**Actual Result:** _________________________________
**Status:** [ ] Open [ ] Fixed [ ] Deferred

---

## 18. Sign-Off

**All Critical Tests Passed:** [ ] Yes [ ] No
**All High Priority Tests Passed:** [ ] Yes [ ] No
**Minor Issues Deferred to v1.1:** [ ] Yes [ ] No

**Tester Signature:** ____________________________
**Date:** ____________________________

**QA Manager Approval:** ____________________________
**Date:** ____________________________

---

**END OF TESTING CHECKLIST**

**Document Version:** 1.0
**Created:** 2025-11-30
**Last Updated:** 2025-11-30
**Status:** READY FOR TESTING
