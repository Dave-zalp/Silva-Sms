● Here's the full frontend integration spec for the updated SmsBus flow:

  ---
  SmsBus Integration Guide

  Flow Overview

  1. Load Countries  →  2. User selects country
  3. Load Prices (by country)  →  4. User selects service
  5. Purchase Number  →  6. Poll for OTP  →  7. Complete / Cancel

  ---
  1. Get Countries

  GET /api/auth/smsbus/countries

  Call this on page load to populate the country dropdown.

  Response:
  {
    "success": true,
    "total": 2,
    "data": [
      { "id": 1, "code": "us", "title": "Unite State of America" },
      { "id": 2, "code": "ru", "title": "Russia" }
    ]
  }

  ---
  2. Get Prices (Services for a Country)

  GET /api/auth/smsbus/prices?country_id={id}

  Call this when the user selects a country. Displays available services + costs.

  Request:
  GET /api/auth/smsbus/prices?country_id=1

  Response:
  {
    "success": true,
    "total": 3,
    "data": [
      {
        "project_id": 5,
        "country_id": 1,
        "title": "WhatsApp",
        "code": "wa",
        "cost": 0.85,
        "total_count": 312
      }
    ]
  }

  ▎ total_count = numbers available. Show this to the user. If 0, disable that service row.

  ---
  3. Purchase a Number

  POST /api/auth/smsbus/purchase

  Called when user clicks "Buy" on a service.

  Request body:
  {
    "project_id": 5,
    "country_id": 1
  }

  Success Response (201):
  {
    "success": true,
    "message": "Number purchased successfully",
    "data": {
      "purchased_number": {
        "id": 42,
        "request_id": "abc123",
        "phone_number": "+14155552671",
        "service": "WhatsApp",
        "service_code": "wa",
        "cost": 0.85,
        "status": "waiting",
        "expires_at": "2026-04-08 14:35:00",
        "provider": "smsbus"
      },
      "balance": {
        "current": 9.15
      }
    }
  }

  Error Responses:
  { "success": false, "message": "Insufficient balance", "required": 0.85, "available": 0.50 }
  { "success": false, "message": "Service not available for the selected country" }
  { "success": false, "message": "Validation failed", "errors": { "country_id": ["..."] } }

  ---
  4. Poll for OTP Code

  GET /api/auth/smsbus/{id}/get-code

  Poll every 5 seconds after purchase until status is received or the number expires.

  Waiting:
  {
    "success": true,
    "data": {
      "status": "waiting",
      "message": "Waiting for OTP code",
      "expires_at": "2026-04-08 14:35:00"
    }
  }

  Received:
  {
    "success": true,
    "data": {
      "status": "received",
      "otp_code": "394821",
      "received_at": "2026-04-08 14:32:10"
    }
  }

  Expired / Cancelled (stop polling):
  { "success": false, "message": "Activation expired", "status": "expired" }

  ▎ Stop polling when status is received, expired, cancelled, or completed.

  ---
  5. Complete an Activation

  POST /api/auth/smsbus/{id}/complete

  Call after the user confirms they've used the OTP.

  { "success": true, "message": "Activation completed" }

  ---
  6. Cancel a Number

  POST /api/auth/smsbus/{id}/cancel

  Only works when status is waiting. Refunds the user automatically.

  {
    "success": true,
    "message": "Activation cancelled and balance refunded",
    "data": {
      "refunded_amount": 0.85,
      "current_balance": 10.00
    }
  }

  ---
  UI State Machine

  [Select Country]
        ↓
  [Select Service + see price/count]
        ↓
  [Click Buy] → loading...
        ↓
  [Show phone number + countdown timer]
        ↓ poll every 5s
  [Waiting...] ──── [Cancel] → refund + back to service list
        ↓ OTP arrives
  [Show OTP code]
        ↓
  [Mark as Done] → completed

  ---
  Key UI Notes for the Designer

  ┌──────────────────────┬───────────────────────────────────────────────────────────────────────┐       
  │        State         │                             What to show                              │       
  ├──────────────────────┼───────────────────────────────────────────────────────────────────────┤       
  │ total_count === 0    │ Grey out / disable the service row                                    │       
  ├──────────────────────┼───────────────────────────────────────────────────────────────────────┤       
  │ waiting              │ Phone number, spinning loader, countdown to expires_at, Cancel button │       
  ├──────────────────────┼───────────────────────────────────────────────────────────────────────┤       
  │ received             │ OTP code (large, copyable), "Mark as Done" button                     │       
  ├──────────────────────┼───────────────────────────────────────────────────────────────────────┤       
  │ expired              │ "Expired — refund issued" toast, go back                              │       
  ├──────────────────────┼───────────────────────────────────────────────────────────────────────┤       
  │ cancelled            │ "Cancelled — refunded X" toast, go back                               │       
  ├──────────────────────┼───────────────────────────────────────────────────────────────────────┤       
  │ Insufficient balance │ Link to top-up page                                                   │       
  └──────────────────────┴───────────────────────────────────────────────────────────────────────┘       
