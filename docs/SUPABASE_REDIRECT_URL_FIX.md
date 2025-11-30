# Supabase Redirect URL Fix - Email Verification Issue

## Problem
When registering a new user and clicking the email verification link, the redirect goes to `http://localhost:8011/?code=...` instead of the production URL.

## Root Cause
The code in `auth.js` is correct (lines 320-324), but the **Supabase Dashboard** doesn't have the production URLs configured in the allowed redirect URLs list.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/oavxilimosjrodillmea
2. Navigate to: **Authentication** → **URL Configuration**

### Step 2: Configure URLs

#### Site URL:
```
https://penztarca.netlify.app
```

#### Redirect URLs (Add all of these):
```
https://penztarca.netlify.app/auth.html
https://penztarca.netlify.app/auth.html?verify=true
https://penztarca.netlify.app/index.html
http://localhost:8000/auth.html
http://localhost:8000/auth.html?verify=true
http://localhost:8011/auth.html
http://localhost:8011/auth.html?verify=true
```

**Important:** Add each URL on a separate line in the Supabase Dashboard!

### Step 3: Verify Email Templates (Optional)
1. Navigate to: **Authentication** → **Email Templates**
2. In the "Confirm signup" template, ensure it uses: `{{ .ConfirmationURL }}`
3. This should already be correct by default

## Code Reference
The redirect URL logic is already correctly implemented in `auth.js:320-324`:

```javascript
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const redirectUrl = isLocalhost
    ? 'https://penztarca.netlify.app/auth.html?verify=true'
    : window.location.origin + '/auth.html?verify=true';
```

## Testing
After configuring the Supabase Dashboard:

1. Register a new test user
2. Check email for verification link
3. Click the link - should redirect to: `https://penztarca.netlify.app/auth.html?verify=true`
4. Login form should appear with success message

## Date Fixed
2025-11-30

## Status
✅ Configuration documented - awaiting Supabase Dashboard update by user
