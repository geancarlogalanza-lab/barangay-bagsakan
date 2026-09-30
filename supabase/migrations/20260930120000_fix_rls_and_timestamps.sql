-- Fix RLS policies and timestamp types for Barangay Bagsakan.
-- Applied to project numrunpdjtytjybipzog on 2026-09-30.

-- 1. Data tables: the policies are named "Enable all for authenticated users"
--    but were attached to the PUBLIC role, so anyone holding the publishable
--    key (it ships in the frontend bundle) could read, edit and delete every
--    row without logging in. Every page that touches these tables is behind
--    login, so restrict them to signed-in users as the policy name intended.
alter policy "Enable all for authenticated users" on public.allocations   to authenticated;
alter policy "Enable all for authenticated users" on public.beneficiaries to authenticated;
alter policy "Enable all for authenticated users" on public.donations     to authenticated;
alter policy "Enable all for authenticated users" on public.donors        to authenticated;
alter policy "Enable all for authenticated users" on public.transactions  to authenticated;

-- 2. users: there was no INSERT policy, so the app's first-login profile
--    insert (AuthContext) always failed with 42501 and roles were never saved.
--    Allow a user to create only their own row, and only as a donor; admin and
--    volunteer rows are assigned by an administrator in the database.
--    The "update own data" policy let any user promote themselves to admin
--    (update users set role = 'admin'); the app never updates this table, so
--    it is removed. auth.uid() is wrapped in a SELECT so it is evaluated once
--    per query instead of once per row (Supabase advisor 0003).
drop policy "Users can update own data" on public.users;
drop policy "Users can read own data" on public.users;

create policy "Users can read own data" on public.users
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create own donor profile" on public.users
  for insert to authenticated
  with check ((select auth.uid()) = id and role = 'donor');

-- 3. Timestamps were "timestamp without time zone". PostgREST returns them
--    without an offset, so browsers parse them as local time and every
--    displayed time (e.g. Recent Transactions) was 8 hours early in PH time.
--    The stored values are UTC (database TimeZone = UTC, default now()), so
--    convert them to timestamptz, interpreting existing values as UTC.
alter table public.donors        alter column created_at     type timestamptz using created_at     at time zone 'UTC';
alter table public.donations     alter column created_at     type timestamptz using created_at     at time zone 'UTC';
alter table public.beneficiaries alter column created_at     type timestamptz using created_at     at time zone 'UTC';
alter table public.allocations   alter column distributed_at type timestamptz using distributed_at at time zone 'UTC';
alter table public.transactions  alter column claimed_at     type timestamptz using claimed_at     at time zone 'UTC';
alter table public.users         alter column created_at     type timestamptz using created_at     at time zone 'UTC';
