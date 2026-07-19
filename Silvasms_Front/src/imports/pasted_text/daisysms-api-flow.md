 Step 1 — Fetch Available Services

  ▎ User searches/browses services on this screen. Show a searchable list with service name and price.

  GET /auth/daisysms/services
  Headers: Authorization: Bearer {token}

  Response:
  {
    "success": true,
    "data": [
      {
        "key": "wa",
        "name": "WhatsApp",
        "price": 150.00,
        "currency": "NGN"
      },
      {
        "key": "tg",
        "name": "Telegram",
        "price": 120.00,
        "currency": "NGN"
      },
      {
        "key": "fb",
        "name": "Facebook",
        "price": 100.00,
        "currency": "NGN"
      }
    ]
  }

  UI Notes:
  - Show a search bar to filter by service name
  - Display price prominently beside each service
  - On select, show a confirmation modal before proceeding to rent

  ---
  Step 2 — Rent a Number

  ▎ User confirms the service and clicks "Get Number". Call this once, store the returned id.

  POST /auth/daisysms/rent
  Headers: Authorization: Bearer {token}

  Request:
  {
    "service": "wa"
  }

  Success Response (201):
  {
    "success": true,
    "message": "Number rented successfully",
    "data": {
      "rented_number": {
        "id": 47,
        "activation_id": "88291045",
        "phone_number": "+12025550187",
        "service": "wa",
        "cost": 150.00,
        "status": "waiting",
        "expires_at": "2026-06-23 14:35:00",
        "provider": "daisysms"
      },
      "balance": {
        "current": 4850.00
      }
    }
  }

  Failure — Insufficient Balance (400):
  {
    "success": false,
    "message": "Insufficient balance",
    "required": 150.00,
    "available": 80.00
  }

  Failure — Service Unavailable (400):
  {
    "success": false,
    "message": "Failed to rent number",
    "error": "No numbers available"
  }

  UI Notes:
  - Save data.rented_number.id — this is your {id} for all subsequent calls
  - Display the phone number +12025550187 to the user (they enter it into the app they want to verify)
  - Show a countdown timer using expires_at (20 minutes)
  - Show a "Cancel" button (calls Step 4 below)

  ---
  Step 3 — Poll for the OTP Code

  ▎ After the number is displayed, poll this endpoint every 5–10 seconds until status is received or the rental expires.

  GET /auth/daisysms/{id}/get-code
  Headers: Authorization: Bearer {token}

  While waiting — No SMS yet (still polls the upstream, returns error until code arrives):
  {
    "success": false,
    "message": "Failed to get status",
    "error": "No SMS received yet"
  }

  Code received (200):
  {
    "success": true,
    "data": {
      "status": "received",
      "otp_code": "847291",
      "sms_text": "Your WhatsApp code: 847291. Do not share this code.",
      "received_at": "2026-06-23 14:22:45"
    }
  }

  Expired (400):
  {
    "success": false,
    "message": "Activation expired",
    "status": "expired"
  }

  Already cancelled/completed (400):
  {
    "success": false,
    "message": "Activation is no longer active",
    "status": "cancelled"
  }

  UI Notes:
  - Poll every 5 seconds while success === false and error === "No SMS received yet"
  - Stop polling when success === true (code arrived) OR when status is expired/cancelled/completed
  - When code arrives: display otp_code prominently (large, copyable text)
  - If the countdown timer hits zero, show "Number expired — your balance has been refunded"

  ---
  Step 4 — Mark as Done

  ▎ User has used the OTP. Call this to finalize. Only works when status is received.

  POST /auth/daisysms/{id}/mark-done
  Headers: Authorization: Bearer {token}

  Success Response (200):
  {
    "success": true,
    "message": "Activation Completed"
  }

  Failure — OTP not received yet (400):
  {
    "success": false,
    "message": "Can only complete activations with received OTP"
  }

  UI Notes:
  - Show "Done" button only after OTP is received
  - After success, navigate user back to dashboard or service list
  - Update displayed balance

  ---
  Step 4 (alt) — Cancel Rental

  ▎ User wants to give up before receiving the SMS. Only works while status is waiting. Balance is refunded
  ▎ automatically.

  POST /auth/daisysms/{id}/cancel
  Headers: Authorization: Bearer {token}

  Success Response (200):
  {
    "success": true,
    "message": "Activation cancelled and balance refunded",
    "data": {
      "refunded_amount": 150.00,
      "current_balance": 5000.00
    }
  }

  Failure — Already expired (400):
  {
    "success": false,
    "message": "Number is expired, Order has been refunded"
  }

  Failure — Not in waiting state (400):
  {
    "success": false,
    "message": "Can only cancel waiting activations"
  }

  ---
  Full Flow State Machine

  [Search Services]
         ↓ select service
  [Confirm & Rent]  → POST /daisysms/rent
         ↓ save id, show phone number
  [Waiting for SMS] → GET /daisysms/{id}/get-code  (poll every 5s)
         ↓                              ↓
    [OTP Received]              [Cancel button]
         ↓                              ↓
    show otp_code          POST /daisysms/{id}/cancel
    show [Done] btn              → refund shown
         ↓
    POST /daisysms/{id}/mark-done
         ↓
    [Completed — back to dashboard]

  ---
  Error Handling Summary

  ┌─────────────┬────────────────────────────────────────────────┬────────────────────────────────────────┐
  │ HTTP Status │                    Meaning                     │               UI Action                │
  ├─────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
  │ 400         │ Bad input / insufficient balance / wrong state │ Show error message                     │
  ├─────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
  │ 401         │ Not authenticated                              │ Redirect to login                      │
  ├─────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
  │ 404         │ Number not found                               │ Show "not found"                       │
  ├─────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
  │ 500         │ Server error                                   │ Show "something went wrong, try again" │
  └─────────────┴────────────────────────────────────────────────┴────────────────────────────────────────┘

  ---