Here's the prompt:

Figma Make Prompt:

Redesign the GoldenSMS dashboard UI to match the dark navy theme of the landing page. Do NOT change any API calls, data fetching logic, or functionality — only change the visual design, colors, layout, and styling. All existing features must remain fully working.
CRITICAL RULE: Preserve all existing functionality:

All API calls stay exactly as they are
Wallet balance display stays
Fund Wallet button stays
Buy Number button stays
SMS Purchased counter stays
Total Recharge counter stays
Virtual Account card stays
USA Numbers quick buy stays
Recent Purchases table stays
Numbers History stays
Transaction History stays
All sidebar navigation links stay
Logout stays
Only change CSS/styling — zero logic changes

Global Color System (Dark Default):

Page background: #0A0F1E
Sidebar background: #0F1729
Main content background: #0A0F1E
Card backgrounds: #1E2A45
Card borders: 1px solid #2A3A5C
Primary accent blue: #3B82F6
Heading text: #F1F5F9
Body/label text: #94A3B8
Muted text: #64748B
Success green: #22C55E
Dividers: #1E2A45

Sidebar:

Background: #0F1729
Right border: 1px solid #1E2A45
Logo: "Golden" in #F1F5F9 bold, "SMS" in #3B82F6 bold
Nav items: #94A3B8 text, icon + label side by side, 44px height, 8px border radius, 12px horizontal padding
Active nav item: #1E2A45 background, #3B82F6 text and icon, 3px solid #3B82F6 left border
Hover: #1A2540 background, #F1F5F9 text
Section label "HISTORY": #64748B, 11px, uppercase, letter-spacing 0.08em
Logout: #64748B text, red icon, hover text turns #EF4444
Sidebar width: 240px, full height, fixed position

Top Navbar:

Background: #0F1729, bottom border 1px solid #1E2A45
Left: breadcrumb "Dashboard > Home" in #64748B, arrow separator in #2A3A5C
Right side: theme toggle sun icon in #94A3B8 + wallet balance pill (#1E2A45 bg, #3B82F6 text, "₦0") + user avatar circle (#3B82F6 bg, white initial letter)

Welcome Banner Card:

Replace the dark red gradient with a rich blue gradient: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #0F2B6B 100%)
Add a subtle radial glow: radial-gradient(ellipse at 80% 50%, rgba(99,179,237,0.15) 0%, transparent 60%)
"Welcome back, [username]!" — white, 20px, 600 weight, with a ✨ sparkle icon
"Wallet Balance" label — rgba(255,255,255,0.65), 13px
Balance amount "₦0.00" — white, 40px, 800 weight
Subtext below balance — rgba(255,255,255,0.55), 13px
Right side buttons stacked vertically:

"Fund Wallet →" : white background, #1D4ED8 text, 8px radius, 44px height, 160px width
"Buy Number" : rgba(255,255,255,0.15) background, white text, white border 1px solid rgba(255,255,255,0.3), same size
Both buttons keep their existing click handlers



Stats Cards Row (4 cards):

All cards: #1E2A45 background, 1px solid #2A3A5C border, 12px radius, 20px padding
Card hover: border-color: #3B82F6, box-shadow: 0 0 0 1px rgba(59,130,246,0.2)
Each card layout: icon top-left in a small #0F1729 rounded square + small chart icon top-right in #64748B
Label text: #94A3B8, 13px
Value text: #F1F5F9, 24px, 700 weight
Sublabel: #64748B, 12px
SMS Purchased card: icon background #1D4ED8, message icon in white
Total Recharge card: icon background #059669, trending-up icon in white
Virtual Account card: Replace purple gradient with linear-gradient(135deg, #6366F1 0%, #4F46E5 100%) — keep "Click to view" text and functionality, white text throughout
USA Numbers card: Replace orange gradient with linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%) — keep "Quick buy" text and functionality, white text throughout

Recent Purchases Section:

Section title "Recent Purchases": #F1F5F9, 18px, 600
Subtitle: #64748B, 13px
"View All →" link: #3B82F6, hover underline
Table/list container: #1E2A45 background, 1px solid #2A3A5C border, 12px radius
Table headers: #64748B, 12px, uppercase
Table rows: 1px solid #2A3A5C bottom border, #F1F5F9 main text, #94A3B8 secondary text
Empty state: keep the existing empty icon, change text to #64748B
Empty state icon circle: #1E2A45 border

General Dashboard Styles:

All section headings: #F1F5F9
All labels and descriptions: #94A3B8
All borders and dividers: #2A3A5C
Scrollbar: thin, #2A3A5C track, #3B82F6 thumb
Page content area left margin: 240px (sidebar width)
Content padding: 32px
All transition animations: 0.2s ease on hover states

Light Mode (toggle only):

When user clicks sun icon, swap to white #FFFFFF page bg, #F8FAFC sidebar, #0F172A text, #2563EB accents
Store preference in localStorage

Overall feel: Should look like a premium fintech dashboard — think Paystack, Flutterwave, or Linear. Dark navy depth, blue accents, clean card hierarchy, professional typography. Not flat, not bright — layered and polished.