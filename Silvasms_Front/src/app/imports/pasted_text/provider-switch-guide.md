● Provider Switcher — Frontend Integration Guide

  ---                                                                                                    
  Overview                                                                                                                                                                                                        
  Every user has an active provider (smsbus or herosms). Only one can be active at a time. When a user   
  tries to use a provider that isn't their active one, the API returns a 403. Admins can also disable a
  provider globally — when that happens, no user can activate or use it (API returns 503).

  Default: All new accounts start with smsbus active.




  All requests require:
  Authorization: Bearer {token}
  Content-Type: application/json

  ---
  1. Get Provider Status

  Call this on page load to know what's active and what's globally available.

  GET /provider/status

  Success Response 200:
  {
    "success": true,
    "data": {
      "active_provider": "smsbus",
      "servers": [
        {
          "id": 1,
          "key": "smsbus",
          "name": "SmsBus",
          "globally_enabled": true,
          "is_active": true
        },
        {
          "id": 2,
          "key": "herosms",
          "name": "HeroSMS",
          "globally_enabled": true,
          "is_active": false
        }
      ]
    }
  }

  When admin has disabled a provider:
  {
    "success": true,
    "data": {
      "active_provider": "smsbus",
      "servers": [
        {
          "id": 1,
          "key": "smsbus",
          "name": "SmsBus",
          "globally_enabled": true,
          "is_active": true
        },
        {
          "id": 2,
          "key": "herosms",
          "name": "HeroSMS",
          "globally_enabled": false,
          "is_active": false
        }
      ]
    }
  }

  When no provider is active (active_provider is null — edge case only):
  {
    "success": true,
    "data": {
      "active_provider": null,
      "servers": [
        {
          "id": 1,
          "key": "smsbus",
          "name": "SmsBus",
          "globally_enabled": true,
          "is_active": false
        },
        {
          "id": 2,
          "key": "herosms",
          "name": "HeroSMS",
          "globally_enabled": true,
          "is_active": false
        }
      ]
    }
  }

  ---
  2. Switch Provider

  Switches the user's active provider. Sending the same provider that's already active deactivates it    
  (sets to null). Sending the other provider switches to it.

  POST /provider/switch

  Request Body:
  {
    "provider": "herosms"
  }
  ▎ provider must be "smsbus" or "herosms".

  ---
  Success — switched to new provider 200:
  {
    "success": true,
    "message": "Switched to herosms.",
    "active_provider": "herosms"
  }

  Success — deactivated (toggled off) 200:
  {
    "success": true,
    "message": "Provider deactivated.",
    "active_provider": null
  }

  Error — provider is globally disabled by admin 503:
  {
    "success": false,
    "message": "This provider is currently disabled by the administrator."
  }

  Error — validation 422:
  {
    "message": "The selected provider is invalid.",
    "errors": {
      "provider": ["The selected provider is invalid."]
    }
  }

  ---
  3. What Happens When User Hits a Provider's Endpoints Without It Being Active

  Any request to a provider-gated endpoint (browsing services, prices, purchasing) returns these errors  
  automatically:

  User hasn't selected this provider 403:
  {
    "success": false,
    "message": "This provider is not your active server. Switch to it first.",
    "active_provider": "smsbus"
  }

  Admin disabled the provider globally 503:
  {
    "success": false,
    "message": "This provider is currently disabled by the administrator."
  }

  ▎ The frontend should not wait for these errors to discover the active provider. Always call GET       
  /provider/status first on app load and gate the UI accordingly.

  ---
  4. Protected Routes Per Provider

  SmsBus (Server 1) — requires active_provider = "smsbus"

  ┌────────┬─────────────────────────────┬────────────────────────────────────┐
  │ Method │          Endpoint           │               Gated?               │
  ├────────┼─────────────────────────────┼────────────────────────────────────┤
  │ GET    │ /smsbus/countries           │ Yes                                │
  ├────────┼─────────────────────────────┼────────────────────────────────────┤
  │ GET    │ /smsbus/services            │ Yes                                │
  ├────────┼─────────────────────────────┼────────────────────────────────────┤
  │ GET    │ /smsbus/prices?country_id=1 │ Yes                                │
  ├────────┼─────────────────────────────┼────────────────────────────────────┤
  │ POST   │ /smsbus/purchase            │ Yes                                │
  ├────────┼─────────────────────────────┼────────────────────────────────────┤
  │ GET    │ /smsbus/{id}/get-code       │ No — manage existing orders freely │
  ├────────┼─────────────────────────────┼────────────────────────────────────┤
  │ POST   │ /smsbus/{id}/complete       │ No                                 │
  ├────────┼─────────────────────────────┼────────────────────────────────────┤
  │ POST   │ /smsbus/{id}/cancel         │ No                                 │
  └────────┴─────────────────────────────┴────────────────────────────────────┘

  HeroSMS (Server 2) — requires active_provider = "herosms"

  ┌────────┬──────────────────────────────────┬────────┐
  │ Method │             Endpoint             │ Gated? │
  ├────────┼──────────────────────────────────┼────────┤
  │ GET    │ /services                        │ Yes    │
  ├────────┼──────────────────────────────────┼────────┤
  │ GET    │ /services/countries              │ Yes    │
  ├────────┼──────────────────────────────────┼────────┤
  │ GET    │ /services/by-country?country=187 │ Yes    │
  ├────────┼──────────────────────────────────┼────────┤
  │ GET    │ /services/prices                 │ Yes    │
  ├────────┼──────────────────────────────────┼────────┤
  │ POST   │ /numbers/purchase                │ Yes    │
  ├────────┼──────────────────────────────────┼────────┤
  │ GET    │ /numbers/my-numbers              │ No     │
  ├────────┼──────────────────────────────────┼────────┤
  │ GET    │ /numbers/{id}/status             │ No     │
  ├────────┼──────────────────────────────────┼────────┤
  │ POST   │ /numbers/{id}/cancel             │ No     │
  ├────────┼──────────────────────────────────┼────────┤
  │ POST   │ /numbers/{id}/complete           │ No     │
  └────────┴──────────────────────────────────┴────────┘

  ---
  5. Admin — Toggle a Provider On/Off

  POST /admin/settings/provider-toggle

  Disable SmsBus:
  {
    "provider": "smsbus",
    "enabled": false
  }

  Enable SmsBus:
  {
    "provider": "smsbus",
    "enabled": true
  }

  Success 200:
  {
    "success": true,
    "message": "Provider 'smsbus' has been disabled.",
    "data": {
      "provider": "smsbus",
      "enabled": false
    }
  }

  Error — not admin 403:
  {
    "success": false,
    "message": "Unauthorized."
  }

  ---
  6. UI Flow & States

  On App Load

  Call GET /provider/status
          │
          ├─ active_provider = "smsbus"   → show SmsBus UI as active
          ├─ active_provider = "herosms"  → show HeroSMS UI as active
          └─ active_provider = null       → show "Select a provider" prompt

  Provider Card States

  Each server card has 3 possible UI states:

  ┌───────────────┬───────────────────────────────────┬─────────────────────────────────────────────┐    
  │     State     │             Condition             │                What to show                 │    
  ├───────────────┼───────────────────────────────────┼─────────────────────────────────────────────┤    
  │ Active        │ is_active: true                   │ Highlighted card, toggle ON, "Active" badge │    
  ├───────────────┼───────────────────────────────────┼─────────────────────────────────────────────┤    
  │ Inactive      │ is_active: false AND              │ Normal card, toggle OFF, clickable          │    
  │               │ globally_enabled: true            │                                             │    
  ├───────────────┼───────────────────────────────────┼─────────────────────────────────────────────┤    
  │ Disabled by   │ globally_enabled: false           │ Greyed out, toggle hidden, "Unavailable"    │    
  │ Admin         │                                   │ label, not clickable                        │    
  └───────────────┴───────────────────────────────────┴─────────────────────────────────────────────┘    

  Switching Flow

  User taps inactive provider card
          │
          ├─ Check globally_enabled first (from /provider/status)
          │       └─ false → show "This server is currently unavailable" toast, stop
          │
          └─ Call POST /provider/switch { "provider": "herosms" }
                  │
                  ├─ 200 success → update active card UI, reload service list
                  └─ 503 error  → show "Server disabled by admin" toast

  After Switching — What to Reload

  When active_provider changes, reload:
  - Service/country list for the new provider
  - Prices for the new provider
  - Do not clear the user's existing purchased numbers list (those are provider-independent)

  ---
  7. Recommended UI Component Behaviour

  ┌─────────────────────────────────────┐
  │  Select Server                       │
  │                                     │
  │  ┌──────────────┐  ┌──────────────┐ │
  │  │  SmsBus      │  │  HeroSMS     │ │
  │  │  Server 1    │  │  Server 2    │ │
  │  │              │  │              │ │
  │  │  [●  ON ]    │  │  [○  OFF]    │ │
  │  └──────────────┘  └──────────────┘ │
  │         ▲ active                    │
  └─────────────────────────────────────┘

  When admin disables HeroSMS:
  ┌─────────────────────────────────────┐
  │  Select Server                       │
  │                                     │
  │  ┌──────────────┐  ┌──────────────┐ │
  │  │  SmsBus      │  │  HeroSMS     │ │
  │  │  Server 1    │  │  Server 2    │ │
  │  │              │  │  Unavailable │ │
  │  │  [●  ON ]    │  │  ── ──  ──   │ │  ← greyed out, no toggle
  │  └──────────────┘  └──────────────┘ │
  └─────────────────────────────────────┘

  ---
  8. Complete Integration Checklist

  - Call GET /provider/status on app load and store result in global state
  - Render two server cards using the servers array from the response
  - Disable (grey out) cards where globally_enabled: false
  - Highlight the card where is_active: true
  - On card tap: call POST /provider/switch only if globally_enabled: true
  - On switch success: update global state, re-fetch services/prices for new provider
  - On 503 from any endpoint: show "Server unavailable" message
  - On 403 from provider endpoint: prompt user to switch to the correct provider
  - Management actions (get-code, cancel, complete) work regardless of active provider — never block     
  these