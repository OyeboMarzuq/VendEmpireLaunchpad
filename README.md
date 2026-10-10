# VendEmpire Launchpad

Build a pre-launch waitlist landing page for "VendEmpire" — a multi-tenant vendor marketplace platform where small vendors get their own branded shop, customers discover them through a shared marketplace, and an AI assistant helps vendors list products instantly from a photo.

Design: modern, warm, and trustworthy e-commerce feel — not corporate. Use a warm burnt-orange/terracotta accent color with a dark neutral base, clean typography, mobile-first, generous whitespace.

PUBLIC PAGE — Waitlist Landing Page (route: /)

Hero section — headline about giving every vendor their own shop and helping them get discovered, subheadline mentioning the AI-assisted product listing, a single prominent "Join the Waitlist" call-to-action

Short "How it works" section — 3 simple steps (Vendors get a shop → AI helps list products in seconds → Customers discover and buy)

Waitlist signup form with these fields:

Full name

Email address

Phone number (optional)

Role: a toggle/radio choice between "I want to sell (Vendor)" and "I want to shop (Customer)"

If Vendor is selected, show one additional field: "What do you sell?" (short text)

After submission, show a confirmation state with a live counter: "You're #[count] on the waitlist" (count = total number of signups so far)

Simple footer with a note that this is a pre-launch page

ADMIN PAGE — Waitlist Dashboard (route: /admin, password-protected)

Protect this route with a simple password/passcode gate (a single shared admin password is fine — this does not need full user accounts or roles).

Show, at the top, a row of summary metric cards:

Total signups

Total vendors

Total customers

Signups in the last 7 days

Below that, show charts:

A line/area chart of signups over time (daily count)

A pie or donut chart showing the vendor vs customer split

A bar chart of the most common "what do you sell" categories among vendor signups (group similar free-text answers where possible)

Below the charts, show a searchable, sortable table of every signup with all their details (name, email, phone, role, what they sell, date joined) — this is the detail view sitting right under the graphs, not a separate export.

Include a manual refresh button and make the metrics/charts reflect live data from the waitlist table, not static numbers.

BACKEND/DATA

Connect Supabase and create a single table called "waitlist_entries" with columns for name, email, phone, role (vendor/customer), what_they_sell, and created_at. Store every form submission there. Prevent duplicate signups by the same email address using a unique constraint on the email column (not just a frontend check). All dashboard metrics and charts should be powered by live queries against this table.

This is a small two-page app (public waitlist page + password-protected admin dashboard) — no other pages, routing, or user accounts are needed.

in greem and white and other prettier and good looking themes

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8582e33-68fe-426c-b58d-679d2160dc32).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

### Admin dashboard configuration

The `/admin` dashboard requires these server-side environment variables:

- `ADMIN_PASSWORD` — the passcode used to unlock the dashboard.
- `SESSION_SECRET` — a long, random secret used to sign the admin session cookie. This is required in production.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — used by the server to read and write waitlist entries.

For local development, put these in `.env` before starting the dev server. Configure the same variables in your deployment's server environment. The service-role key and session secret must never use a `VITE_` prefix or be exposed to browser code.
