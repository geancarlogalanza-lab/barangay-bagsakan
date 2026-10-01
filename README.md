# Barangay Bagsakan

A food donation reporting system for the barangay. Donors register and report
surplus food; barangay admins review each donation, record what happens to it,
and produce reports.

Live site: https://geancarlogalanza-lab.github.io/barangay-bagsakan/

## Accounts

At registration a user chooses an account type:

- **Donor**: reports donations (food, quantity, expiration, pickup location,
  optional photo) and follows each one's status.
- **Admin**: sees every donation, updates statuses, builds reports, and sees the
  list of users.

## Donation statuses

```
Pending -> Accepted -> To Be Delivered -> Distributed
   any open status -> Rejected (reason required) or Expired
```

Every status change is saved in `donation_status_history` with who made it and
when. The database enforces these transitions, so they can't be skipped.

## Pages

| Page | Who | Purpose |
|------|-----|---------|
| `/` | Everyone | What the system is, how a donation moves |
| `/register`, `/login` | Everyone | Create an account / sign in |
| `/dashboard` | Signed in | Donations by status, items needing attention |
| `/donations/new` | Donor | Report a donation (gets a reference number like `BB-2026-0042`) |
| `/donations` | Signed in | Donors: their own donations. Admins: all donations, with filters |
| `/donations/:id` | Signed in | Details, photo, status history; admins update the status here |
| `/reports` | Admin | Summaries by status, category and barangay for any period; print or export CSV |
| `/users` | Admin | Registered donors and admins |

## Development

```bash
npm install
npm run dev      # http://localhost:5173/barangay-bagsakan/
npm run lint
npm run build
npm run deploy   # builds and publishes to the gh-pages branch
```

The Supabase project URL and publishable key are in `src/services/supabase.js`.

## Database

Schema changes live in `supabase/migrations/`, applied in filename order:

- `20260930120000_fix_rls_and_timestamps.sql`: restricts data to signed-in users,
  converts timestamps to `timestamptz`.
- `20261001090000_reporting_system.sql`: profiles created at sign-up, donation
  report fields, statuses and reference numbers, status history, role-based
  row level security, and the `donation-photos` storage bucket.

The old `beneficiaries`, `allocations` and `transactions` tables from the earlier
redistribution version are kept but no longer used (admins only).

Free Supabase projects pause after about a week without activity. If the site
can't load data, restore the project from the Supabase dashboard.

The barangay list in `src/lib/constants.js` is for Pasig City; edit it if the
project serves a different city.
