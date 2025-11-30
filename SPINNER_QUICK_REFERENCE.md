# Loading Spinner - Quick Reference Guide

## Quick Start

### Show Full-Page Overlay
```javascript
window.financeApp.showLoading('overlay', 'overlay', 'Loading...');
```

### Hide Overlay
```javascript
window.financeApp.hideLoading('overlay');
```

### Button Loading State
```javascript
const btn = document.getElementById('myButton');
window.financeApp.setButtonLoading(btn, true);    // Show spinner
window.financeApp.setButtonLoading(btn, false);   // Hide spinner
```

## CSS Classes Available

### Spinner Sizes
- `.spinner-inline` - 16px (for buttons)
- `.spinner-small` - 16px (compact)
- `.spinner-medium` - 32px (cards)
- `.spinner-large` - 48px (overlays)

### Container Classes
- `.loading-overlay` - Full-page overlay with backdrop
- `.loading-spinner` - White container with spinner
- `.card-loading` - Card loading state
- `.loading-text` - Pulsing text animation

## Helper Functions Reference

### app.js
```javascript
// Show spinner on element
showLoading(elementId, type, message)
// Types: 'overlay', 'card', 'inline'

// Hide spinner
hideLoading(elementId, minDisplayTime)

// Set button loading
setButtonLoading(buttonElement, loading, loadingText)

// With animation
showLoadingWithAnimation(elementId)
hideLoadingWithAnimation(elementId, minDisplayTime)
```

### auth.js
```javascript
// Show overlay
showLoadingOverlay(message, minDisplayTime)

// Hide overlay
hideLoadingOverlay(minDisplayTime)

// Button state
setButtonLoading(button, isLoading, originalText)

// Multiple buttons
setButtonGroupLoading(selector, isLoading)
```

## Real-World Examples

### Form Submit
```javascript
const form = document.getElementById('myForm');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    window.financeApp.setButtonLoading(submitBtn, true);
    
    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            body: new FormData(form)
        });
        // Handle response
    } finally {
        window.financeApp.setButtonLoading(submitBtn, false);
    }
});
```

### Async Data Load
```javascript
async function loadData() {
    window.financeApp.showLoading('overlay', 'overlay', 'Adatok betöltése...');
    
    try {
        const data = await fetch('/api/data').then(r => r.json());
        // Use data
    } finally {
        window.financeApp.hideLoading('overlay');
    }
}
```

### Multiple Operations
```javascript
// Disable all action buttons
window.financeApp.setButtonGroupLoading('button.action-btn', true);

// Do work...

// Re-enable
window.financeApp.setButtonGroupLoading('button.action-btn', false);
```

## Styling Notes

### Light Mode
- Spinner color: Blue (rgb(59, 130, 246))
- Overlay: Semi-transparent dark
- Container: White background

### Dark Mode (Automatic)
- Spinner color: Light blue
- Overlay: Darker with blur
- Container: Dark slate background

## Important Behavior

### Minimum Display Time
- Default: 300ms
- Prevents flickering on fast operations
- Customizable per call

### Button States
- Disabled while loading
- Text hidden (shows spinner only)
- Original text restored on completion
- Data attribute: `data-loading="true"`

### Auto-Theme Support
- Light/dark mode automatic
- No manual theme switching needed
- CSS handles all variations

## Troubleshooting

### Spinner not showing
- Check element ID exists
- Verify `.hidden` class not applied elsewhere
- Check z-index conflicts

### Theme not switching
- Verify `.dark` class on html/body
- Check CSS is loaded
- Inspect color values

### Button text not restoring
- Ensure button doesn't get refreshed
- Check data attribute not removed
- Store text before setting loading

## Files to Check
- CSS Styles: index.html (lines 308-500)
- Overlay Template: index.html (line 912)
- app.js Functions: app.js (lines 2230+)
- auth.js Functions: auth.js (lines 254+)

## Performance Tips
- Use appropriate spinner type (overlay vs inline)
- Set minimum display time reasonably
- Avoid excessive spinner toggling
- Close overlays properly to prevent z-index issues
