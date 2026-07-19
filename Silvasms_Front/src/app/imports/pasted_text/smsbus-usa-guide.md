 SmsBus USA Numbers — Frontend Integration Guide                                                                                                                                                                 
  Base URL & Auth                                                                                                                                                                                                 
  Base URL:  https://yourdomain.com/api                                                                  
  Auth:      Bearer token in every protected request header

  Header:    Authorization: Bearer {token}
             Content-Type: application/json
             Accept: application/json

  The token comes from the login endpoint. All SmsBus routes sit inside the auth:sanctum middleware      
  group.

  ---
  Authentication (prerequisite)

  Login

  POST /api/auth/login
  Request:
  {
    "email": "user@example.com",
    "password": "password123"
  }
  Response:
  {
    "token": "1|abcdefghijklmnop...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "balance": "150.00"
    }
  }
  Store the token and attach it as Authorization: Bearer {token} on every subsequent call.

  ---
  Page Load Flow

  When the USA Numbers page opens, make two parallel calls:

  1. Get Available Services

  GET /api/auth/smsbus/services
  Authorization: Bearer {token}
  Response — success:
  {
    "success": true,
    "message": "Services fetched successfully",
    "total": 45,
    "data": [
      { "id": 1,  "code": "tg", "title": "Telegram" },
      { "id": 2,  "code": "pp", "title": "Paypal" },
      { "id": 5,  "code": "wa", "title": "WhatsApp" },
      { "id": 10, "code": "fb", "title": "Facebook" }
    ]
  }

  2. Get USA Prices (with markup)

  GET /api/auth/smsbus/prices
  Authorization: Bearer {token}
  Response — success:
  {
    "success": true,
    "message": "Prices fetched successfully",
    "total": 38,
    "data": [
      {
        "project_id": 1,
        "country_id": 1,
        "title": "Telegram",
        "code": "tg",
        "original_cost": 0.50,
        "cost": 850.00,
        "total_count": 1023
      },
      {
        "project_id": 2,
        "country_id": 1,
        "title": "Paypal",
        "code": "pp",
        "original_cost": 0.90,
        "cost": 1530.00,
        "total_count": 204
      }
    ]
  }
  ▎ cost is the final user-facing price (original × exchange rate × markup).
  ▎ total_count is the number of available numbers for that service.
  ▎ Not every service from /services will appear in /prices — only those available for USA.

  Merge the two lists using project_id (prices) = id (services) to display a table like:

  ┌──────────┬───────────┬───────────┐
  │ Service  │ Available │   Price   │
  ├──────────┼───────────┼───────────┤
  │ Telegram │ 1,023     │ ₦850.00   │
  ├──────────┼───────────┼───────────┤
  │ PayPal   │ 204       │ ₦1,530.00 │
  └──────────┴───────────┴───────────┘

  ---
  Purchase a Number

  User clicks "Buy" on a service row.

  POST /api/auth/smsbus/purchase
  Authorization: Bearer {token}
  Content-Type: application/json
  Request:
  {
    "project_id": 1
  }

  Response — success 201:
  {
    "success": true,
    "message": "Number purchased successfully",
    "data": {
      "purchased_number": {
        "id": 42,
        "request_id": 7839,
        "phone_number": "17548003793",
        "service": "Telegram",
        "service_code": "tg",
        "cost": 850.00,
        "status": "waiting",
        "expires_at": "2026-04-06 14:20:00",
        "provider": "smsbus"
      },
      "balance": {
        "current": 650.00
      }
    }
  }

  Response — insufficient balance 400:
  {
    "success": false,
    "message": "Insufficient balance",
    "required": 850.00,
    "available": 200.00
  }

  Response — no numbers available 400:
  {
    "success": false,
    "message": "Failed to purchase number",
    "error": "No number available"
  }

  Response — validation error 400:
  {
    "success": false,
    "message": "Validation failed",
    "errors": {
      "project_id": ["The project id field is required."]
    }
  }

  ▎ After a successful purchase, save id (your DB record ID) and phone_number locally.
  ▎ Use id for all subsequent status/cancel/complete calls — not request_id.

  ---
  Poll for the OTP Code

  After purchase, the number is in "waiting" status. Poll this endpoint every 5–10 seconds until status  
  becomes "received" or it expires.

  GET /api/auth/smsbus/{id}/get-code
  Authorization: Bearer {token}
  Replace {id} with purchased_number.id from the purchase response.

  Response — still waiting 200:
  {
    "success": true,
    "data": {
      "status": "waiting",
      "message": "Waiting for OTP code",
      "expires_at": "2026-04-06 14:20:00"
    }
  }

  Response — code received 200:
  {
    "success": true,
    "data": {
      "status": "received",
      "otp_code": "429916",
      "received_at": "2026-04-06 14:08:33"
    }
  }

  Response — expired 400:
  {
    "success": false,
    "message": "Activation expired",
    "status": "expired"
  }
  ▎ When expired, the cost is automatically refunded server-side. Show the user their updated balance.   

  Response — already in terminal state 400:
  {
    "success": false,
    "message": "Activation is no longer active",
    "status": "cancelled"
  }

  ---
  Complete an Activation

  Once the user has used the OTP code, call this to mark it done.

  POST /api/auth/smsbus/{id}/complete
  Authorization: Bearer {token}

  Response — success 200:
  {
    "success": true,
    "message": "Activation completed"
  }

  Response — wrong state 400:
  {
    "success": false,
    "message": "Can only complete activations with a received OTP"
  }

  ---
  Cancel a Number

  User can cancel while status is still "waiting". They get a full refund.

  POST /api/auth/smsbus/{id}/cancel
  Authorization: Bearer {token}

  Response — success 200:
  {
    "success": true,
    "message": "Activation cancelled and balance refunded",
    "data": {
      "refunded_amount": 850.00,
      "current_balance": 1500.00
    }
  }

  Response — can't cancel 400:
  {
    "success": false,
    "message": "Can only cancel waiting activations"
  }

  Response — already expired 400:
  {
    "success": false,
    "message": "Number has expired and has already been refunded"
  }

  ---
  Number Status Reference

  ┌───────────┬────────────────────────────────┬───────────────────────┐
  │  Status   │            Meaning             │ User action available │
  ├───────────┼────────────────────────────────┼───────────────────────┤
  │ waiting   │ Purchased, SMS not arrived yet │ Cancel                │
  ├───────────┼────────────────────────────────┼───────────────────────┤
  │ received  │ OTP code arrived               │ Complete              │
  ├───────────┼────────────────────────────────┼───────────────────────┤
  │ completed │ User marked as done            │ None                  │
  ├───────────┼────────────────────────────────┼───────────────────────┤
  │ cancelled │ User cancelled, refunded       │ None                  │
  ├───────────┼────────────────────────────────┼───────────────────────┤
  │ expired   │ 20-min timer ran out, refunded │ None                  │
  └───────────┴────────────────────────────────┴───────────────────────┘

  ---
  Full Page Flow (step by step)

  1. PAGE LOAD
     ├── GET /api/auth/smsbus/services  ─┐ run in parallel
     └── GET /api/auth/smsbus/prices    ─┘
         → Merge lists by project_id = id
         → Display service table with price + availability

  2. USER CLICKS "BUY" on a service
     └── POST /api/auth/smsbus/purchase  { project_id }
         ├── success → show phone number + countdown timer
         │             update displayed balance
         └── fail    → show error message (no balance / no numbers)

  3. WAITING FOR CODE (polling loop, every 5–10s)
     └── GET /api/auth/smsbus/{id}/get-code
         ├── status: waiting  → keep polling, show countdown
         ├── status: received → STOP polling, display OTP code
         │                      enable "Complete" button
         └── expired (400)    → STOP polling, show "Expired – refunded"
                                refresh displayed balance

  4. USER USES THE OTP CODE IN THE TARGET APP
     └── POST /api/auth/smsbus/{id}/complete
         → show "Activation completed"

  5. USER WANTS TO CANCEL (while waiting)
     └── POST /api/auth/smsbus/{id}/cancel
         → show "Refunded ₦{amount}"
         → refresh displayed balance

  ---
  Error Handling Checklist

  ┌───────────┬────────────────────────────────────┬───────────────────────────────────┐
  │ HTTP Code │              Meaning               │           What to show            │
  ├───────────┼────────────────────────────────────┼───────────────────────────────────┤
  │ 400       │ Bad request / business logic error │ Show message from response        │
  ├───────────┼────────────────────────────────────┼───────────────────────────────────┤
  │ 401       │ Token expired or missing           │ Redirect to login                 │
  ├───────────┼────────────────────────────────────┼───────────────────────────────────┤
  │ 404       │ Record not found                   │ "Order not found"                 │
  ├───────────┼────────────────────────────────────┼───────────────────────────────────┤
  │ 422       │ Validation failed                  │ Show field-level errors           │
  ├───────────┼────────────────────────────────────┼───────────────────────────────────┤
  │ 500       │ Server error                       │ "Something went wrong, try again" │
  └───────────┴────────────────────────────────────┴───────────────────────────────────┘