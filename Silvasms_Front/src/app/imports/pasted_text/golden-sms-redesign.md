Redesign the current GoldenSMS page. Keep the same sections and content but completely overhaul the visual design. The current version is too dark, flat, and monotonous. Here is exactly what to change:
THE #1 RULE: This must be a LIGHT MODE design by default.

Default background: pure white #FFFFFF
The dark navy theme is only for when the user toggles dark mode ON
Right now it looks like a crypto site. It should look like a fintech/SaaS product.

Color System (Light Mode):

Page background: #FFFFFF
Alternate sections: #F1F5F9 (very light cool gray)
Primary blue: #2563EB
Deep navy (headings only): #0F172A
Body text: #475569
Borders: #E2E8F0
Blue tint backgrounds for cards: #EFF6FF

Navbar:

White background, 1px solid #E2E8F0 bottom border
Logo: "Golden" in #0F172A bold, "SMS" in #2563EB bold — no icon needed, or use a tiny blue message bubble SVG icon
Nav links in #475569, hover #2563EB
"Get Started" button: #2563EB background, white text, 6px border radius — NOT pill shaped
Theme toggle: sun/moon icon in slate gray
Navbar must be sticky and have a subtle shadow on scroll

Hero Section:

White background with a very subtle blue dot-grid pattern in the top-right corner only (CSS background-image, very faint opacity 0.04)
Left side, vertically centered:

Small label above heading: a tiny blue pill tag that says "🔒 Trusted by 10,000+ users worldwide"
H1: "Instant SMS Verification" (line break) "Without Exposing Your Number" — #0F172A, 58px, font-weight 800, line-height 1.15
Subtext: "Get virtual phone numbers from 150+ countries. Keep your real number completely private." — #475569, 18px
Two buttons side by side: "Get Started Free →" solid #2563EB, white text + "See How It Works" white bg, #0F172A border and text
Trust row: three items — green checkmark icon + "Instant Delivery", "100% Anonymous", "150+ Countries" in #64748B small text


Right side: a floating white card with box-shadow: 0 20px 60px rgba(37,99,235,0.12), 16px border radius

Inside: header row "SMS Inbox · Verification Codes" with a blue message icon
Two rows below — each row: platform name (WhatsApp, Instagram), time stamp, verification code in bold blue
Card sits slightly elevated with a blue glow shadow — NOT inside a dark navy frame



Features Section:

Background: #F1F5F9
Centered heading: "Built for Speed, Privacy & Simplicity" — #0F172A, 40px, 700
Subheading: "Professional-grade SMS verification for individuals and businesses" — #64748B
6 cards in 3×2 grid — each card: white #FFFFFF background, border: 1px solid #E2E8F0, border-radius: 12px, padding: 28px
Card hover: slight upward translate + blue left border 3px solid #2563EB
Icon: small square with #EFF6FF background, blue line-icon inside — 44x44px, 10px border radius
Title: #0F172A, 17px, 600. Description: #64748B, 14px

How It Works Section:

White background
Centered heading: "Up and Running in 60 Seconds"
3 steps in a horizontal row — each step: number in a white circle with 2px solid #2563EB border and #2563EB text, bold large (48px), title below in #0F172A, description in #64748B
Dashed blue line connector between circles: border-top: 2px dashed #BFDBFE
Remove the filled dark circle backgrounds from the current version

Stats Section:

Blue background #2563EB, white text
4 stats in a row: 150+ Countries / 145+ Platforms / 99.9% Uptime / <30s Delivery
Stat number: white, 48px, 800 weight. Label: rgba(255,255,255,0.75), 14px
Clean horizontal dividers between stats

Pricing Section:

White background
3 cards: Starter / Pro / Business
Starter and Business: white card, 1px solid #E2E8F0 border
Pro: #2563EB background, white text, border-radius: 16px, slightly taller with a white "⭐ Most Popular" badge above
Prices in Naira (₦), large bold
Feature list: checkmark icon + text, stacked vertically with 12px gap
CTA buttons: navy outlined for outer cards, white filled for Pro card

FAQ Section:

Background #F1F5F9
White accordion rows: border: 1px solid #E2E8F0, 10px radius, 20px padding
Open state: left border 3px solid #2563EB, question text turns #2563EB
Chevron: blue, rotates 180° when open

Final CTA Banner:

Background: deep navy #0F172A with a very subtle blue radial glow centered
Headline: "Ready to Verify Smarter?" — white, 40px, 800
Subtext: "No credit card needed. Start free in under 60 seconds." — #94A3B8
Button: white background, #0F172A text, 6px radius, hover: #2563EB bg, white text

Footer:

Background: #020617 (near black)
Logo top-left, nav links below or right
All text #94A3B8, hover white
Thin top border 1px solid #1E293B

Typography: Inter font. Use font-weight 800 for hero H1, 700 for section headings, 600 for card titles, 400 for body. Letter-spacing: -0.02em on large headings.
Spacing: Minimum 120px vertical padding per section. Cards need 28px internal padding. Do not crowd anything.
Dark Mode (toggle only): When toggled, swap to #0F172A page background, #1E293B card surfaces, white text, keep all blue accents unchanged.
Final vibe check: Should look like Plaid, Paystack, or Vercel. Clean, bright, professional, generous whitespace, blue accents that pop on white — not a dark crypto dashboard.
