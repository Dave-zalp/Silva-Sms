I have an existing GoodLuckBoostHub dashboard that already has all API integrations, data fetching, and functional logic fully working. I want to only redesign the UI/UX visually — do NOT touch, remove, or modify any API calls, state management, business logic, event handlers, or backend connections. Only change the visual layer (colors, fonts, layout, spacing, components).

🚫 DO NOT CHANGE:

Any API calls or fetch functions
Authentication logic or session handling
Any onClick, onChange, or form submission handlers
Data variables, props, or state hooks
Routing or navigation logic
Any environment variables or config files
Backend endpoints or service files


✅ ONLY CHANGE THE FOLLOWING:
🎨 Color Palette — Replace entirely with:

Primary Red: #C0001A
Dark Red (hover states): #8B0000
Black: #0A0A0A
White: #FFFFFF
Light background: #FFF5F5
Card background: #FFFFFF
Sidebar background: #FFFFFF
Active sidebar item: #C0001A background, white text
Muted text: #6B7280
Border color: #F3E8E8


🔤 Typography — Replace with:

Font family: "Plus Jakarta Sans" (import from Google Fonts)
H1/Hero numbers: 700–800 weight
Section headings: 600–700 weight
Body/labels: 400–500 weight
Letter spacing on section labels: 1.5–2px, uppercase
Line height on body text: 1.7


🗂️ Sidebar Redesign:

Background: White (#FFFFFF)
Logo: "GoodLuck" in black bold, "BoostHub" in red bold
Nav items: Dark grey text + outline icon by default
Active nav item: Red pill background (#C0001A), white icon + text, slight red left border
Hover state: Light red tint background (#FFF0F0), red text
Section label "HISTORY": Small caps, muted grey, letter-spacing 2px
Logout button: Red text + icon at bottom, no background
Keep all sidebar navigation links and their routes exactly as they are


🔝 Top Navbar Redesign:

Background: White, bottom border: 1px solid #F3E8E8
Breadcrumb text: grey → red active page name
Wallet balance: styled as a grey pill badge
Theme toggle icon: styled in red
Avatar circle: Red background (#C0001A), white initial letter
Keep all navbar data (balance display, user info) connected to existing API/state


🏠 Welcome Banner Card:

Background: Deep red gradient — linear-gradient(135deg, #8B0000 0%, #C0001A 100%)
Add a subtle dot/grid pattern texture overlay at 5% opacity for depth
"Welcome back, [username]" — keep dynamic username from existing auth, just restyle
Wallet balance (₦0.00) — keep live from existing API, just make it large, white, bold
Fund Wallet + Buy Number buttons — keep all existing handlers, just restyle to white outlined buttons with red hover fill


📊 Stats Cards Row:

White background cards, 16px border radius, soft shadow: 0 2px 12px rgba(0,0,0,0.06)
Card 1 (SMS/Orders): Blue icon square (#3B82F6) — keep existing data binding
Card 2 (Total Recharge): Green icon square (#10B981) — keep existing data binding
Card 3 (Virtual Account): Purple gradient card (#7C3AED to #9333EA) — keep click handler
Card 4 (Quick Buy/USA Numbers): Red-orange gradient (#C0001A to #EA580C) — keep click handler
Small activity line icon top-right of each white card in muted grey


📋 Recent Purchases / Orders Table:

Section title: Bold black, subtext muted grey — keep all data from existing API
"View All" link: Red (#C0001A), keep existing route
Table rows: White background, hover state light red tint (#FFF5F5)
Status badges: Green pill (Completed), Yellow pill (Pending), Red pill (Failed)
Empty state: Keep existing empty state logic, just restyle icon and button to red


🔘 Buttons — Global Restyle:

Primary button: background: #C0001A, white text, border-radius: 8px, hover: #8B0000
Secondary/outlined button: border: 1.5px solid #C0001A, red text, transparent bg, hover: red fill
All button padding: 12px 24px
Keep ALL existing onClick handlers on every button


📱 General Polish:

Page content area background: #FFF5F5
All cards: border-radius: 14–16px
Input fields: border: 1.5px solid #E5E7EB, focus border: #C0001A, border-radius: 8px
Smooth transitions on hover: transition: all 0.2s ease
Section spacing: 32–40px between major sections
Card inner padding: 24px