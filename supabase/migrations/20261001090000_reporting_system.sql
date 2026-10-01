-- Barangay Bagsakan: turn the redistribution system into a donation reporting system.
--   1. Roles and profiles (registration picks Donor or Admin)
--   2. Donation report fields, statuses and reference numbers
--   3. Status history (who changed what, and when)
--   4. Role-based row level security
--   5. Storage bucket for donation photos
-- The old beneficiaries / allocations / transactions tables are kept, unused.

-- ===== 1. Roles and profiles =====

alter table public.users
  add column full_name text,
  add column contact_number text,
  add column organization text;

alter table public.donors add column organization text;

-- Every existing account gets a profile row; accounts without one were donors
insert into public.users (id, email, role, full_name, contact_number)
select a.id, a.email, 'donor', d.name, d.phone
from auth.users a
left join public.users u on u.id = a.id
left join public.donors d on d.id = a.id
where u.id is null;

update public.users u
set full_name = d.name,
    contact_number = coalesce(u.contact_number, d.phone)
from public.donors d
where d.id = u.id and u.full_name is null;

update public.users set full_name = split_part(email, '@', 1) where full_name is null;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Creates the profile rows for a new account from its sign-up metadata
-- (full_name, role, contact_number, organization sent by the Register page)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text := case when meta->>'role' in ('donor', 'admin') then meta->>'role' else 'donor' end;
  v_name text := coalesce(nullif(btrim(meta->>'full_name'), ''), split_part(new.email, '@', 1));
  v_phone text := nullif(btrim(meta->>'contact_number'), '');
  v_org text := nullif(btrim(meta->>'organization'), '');
begin
  insert into public.users (id, email, role, full_name, contact_number, organization)
  values (new.id, new.email, v_role, v_name, v_phone, v_org)
  on conflict (id) do nothing;

  if v_role = 'donor' then
    insert into public.donors (id, name, email, phone, organization)
    values (new.id, v_name, new.email, v_phone, v_org)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== 2. Donation report fields and statuses =====

alter table public.donations
  add column reference_no text,
  add column category text,
  add column category_other text,
  add column description text,
  add column date_prepared date,
  add column expires_at timestamptz,
  add column preferred_pickup_at timestamptz,
  add column pickup_address text,
  add column barangay text,
  add column city text,
  add column landmark text,
  add column status_note text,
  add column status_updated_at timestamptz,
  add column status_updated_by uuid references public.users (id) on delete set null;

-- Expiration is now a date chosen by the donor; keep the old hours column for history
alter table public.donations alter column expiry_hours drop not null;
update public.donations
set expires_at = created_at + make_interval(hours => expiry_hours)
where expires_at is null and expiry_hours is not null;

-- Old statuses: available -> accepted, claimed -> distributed
alter table public.donations drop constraint donations_status_check;
update public.donations
set status = case status when 'available' then 'accepted' when 'claimed' then 'distributed' else coalesce(status, 'pending') end;
alter table public.donations
  alter column status set default 'pending',
  alter column status set not null,
  add constraint donations_status_check
    check (status in ('pending', 'accepted', 'rejected', 'to_be_delivered', 'distributed', 'expired'));

-- When each existing donation reached its current status
update public.donations d
set status_updated_at = coalesce(
  (select max(a.distributed_at) from public.allocations a where a.donation_id = d.id),
  d.created_at
);

-- Reference numbers: BB-<year>-<number>, numbered in the order donations were reported
create sequence public.donation_ref_seq;

with numbered as (
  select id, created_at, row_number() over (order by created_at, id) as n
  from public.donations
)
update public.donations d
set reference_no = 'BB-' || to_char(numbered.created_at at time zone 'Asia/Manila', 'YYYY') || '-'
  || case when numbered.n < 10000 then lpad(numbered.n::text, 4, '0') else numbered.n::text end
from numbered
where numbered.id = d.id;

select setval(
  'public.donation_ref_seq',
  greatest((select count(*) from public.donations), 1),
  (select count(*) > 0 from public.donations)
);

alter table public.donations
  add constraint donations_reference_no_key unique (reference_no),
  add constraint donations_quantity_positive check (quantity > 0),
  add constraint donations_food_type_length check (char_length(btrim(food_type)) between 2 and 100),
  add constraint donations_unit_valid check (unit in ('kg', 'g', 'pcs', 'packs', 'servings', 'liters')),
  add constraint donations_category_valid check (
    category is null or category in (
      'Cooked Meals', 'Fruits & Vegetables', 'Bread & Pastries', 'Rice & Grains',
      'Canned & Packaged Goods', 'Dairy & Eggs', 'Meat & Seafood', 'Other'
    )
  ),
  add constraint donations_category_other check (
    category is distinct from 'Other' or char_length(btrim(coalesce(category_other, ''))) between 1 and 50
  ),
  add constraint donations_description_length check (
    description is null or char_length(btrim(description)) between 10 and 500
  ),
  add constraint donations_pickup_address_length check (
    pickup_address is null or char_length(btrim(pickup_address)) between 10 and 200
  ),
  add constraint donations_landmark_length check (landmark is null or char_length(landmark) <= 100),
  add constraint donations_dates_order check (
    date_prepared is null or expires_at is null
    or (expires_at at time zone 'Asia/Manila')::date >= date_prepared
  );

-- Validates new reports, assigns the reference number, and enforces the status workflow:
--   pending -> accepted | rejected | expired
--   accepted -> to_be_delivered | rejected | expired
--   to_be_delivered -> distributed | rejected | expired
create or replace function public.donations_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seq bigint;
  v_actor uuid := (select id from public.users where id = (select auth.uid()));
begin
  if tg_op = 'INSERT' then
    if new.category is null or new.description is null or new.date_prepared is null
       or new.expires_at is null or new.preferred_pickup_at is null
       or new.pickup_address is null or new.barangay is null or new.city is null then
      raise exception 'Fill in every required field before submitting the donation report.'
        using errcode = 'check_violation';
    end if;
    if new.date_prepared > (now() at time zone 'Asia/Manila')::date then
      raise exception 'Date prepared cannot be in the future.' using errcode = 'check_violation';
    end if;
    if new.expires_at < now() then
      raise exception 'This food has already expired. Expired food cannot be donated.'
        using errcode = 'check_violation';
    end if;

    v_seq := nextval('public.donation_ref_seq');
    new.reference_no := 'BB-' || to_char(now() at time zone 'Asia/Manila', 'YYYY') || '-'
      || case when v_seq < 10000 then lpad(v_seq::text, 4, '0') else v_seq::text end;
    new.status := 'pending';
    new.status_note := null;
    new.status_updated_at := now();
    new.status_updated_by := v_actor;
    new.created_at := now();
    return new;
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status = 'pending' and new.status in ('accepted', 'rejected', 'expired'))
      or (old.status = 'accepted' and new.status in ('to_be_delivered', 'rejected', 'expired'))
      or (old.status = 'to_be_delivered' and new.status in ('distributed', 'rejected', 'expired'))
    ) then
      raise exception 'Cannot change status from % to %.', old.status, new.status
        using errcode = 'check_violation';
    end if;
    if new.status = 'rejected' and coalesce(btrim(new.status_note), '') = '' then
      raise exception 'A reason is required when rejecting a donation.' using errcode = 'check_violation';
    end if;
    new.status_updated_at := now();
    new.status_updated_by := v_actor;
  else
    new.status_note := old.status_note;
    new.status_updated_at := old.status_updated_at;
    new.status_updated_by := old.status_updated_by;
  end if;

  -- Identity fields never change after submission
  new.reference_no := old.reference_no;
  new.donor_id := old.donor_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

-- ===== 3. Status history =====

create table public.donation_status_history (
  id bigint generated always as identity primary key,
  donation_id uuid not null references public.donations (id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references public.users (id) on delete set null,
  changed_at timestamptz not null default now()
);

create index donation_status_history_donation_idx
  on public.donation_status_history (donation_id, changed_at);
create index donation_status_history_changed_at_idx
  on public.donation_status_history (changed_at desc);
create index donations_status_updated_by_idx on public.donations (status_updated_by);
create index donation_status_history_changed_by_idx on public.donation_status_history (changed_by);

insert into public.donation_status_history (donation_id, from_status, to_status, note, changed_at)
select id, null, status, 'Imported from the previous version of the system.', status_updated_at
from public.donations;

create or replace function public.donations_log_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.donation_status_history (donation_id, from_status, to_status, note, changed_by)
    values (
      new.id,
      case when tg_op = 'UPDATE' then old.status end,
      new.status,
      new.status_note,
      (select id from public.users where id = (select auth.uid()))
    );
  end if;
  return null;
end;
$$;

create trigger donations_before_write
  before insert or update on public.donations
  for each row execute function public.donations_before_write();

create trigger donations_log_status
  after insert or update of status on public.donations
  for each row execute function public.donations_log_status();

-- ===== 4. Role-based row level security =====

-- users: everyone sees their own profile, admins see all. Rows are created by
-- the sign-up trigger, so clients no longer insert them.
drop policy "Users can read own data" on public.users;
drop policy "Users can create own donor profile" on public.users;
create policy "Users see own profile, admins see all" on public.users
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- donors
drop policy "Enable all for authenticated users" on public.donors;
create policy "Donors see own profile, admins see all" on public.donors
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Users create own donor profile" on public.donors
  for insert to authenticated
  with check (id = (select auth.uid()));

-- donations: donors report and see their own; only admins change status
drop policy "Enable all for authenticated users" on public.donations;
create policy "Donors see own donations, admins see all" on public.donations
  for select to authenticated
  using (donor_id = (select auth.uid()) or (select public.is_admin()));
create policy "Donors report own donations" on public.donations
  for insert to authenticated
  with check (donor_id = (select auth.uid()));
create policy "Admins update donations" on public.donations
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- history: visible to the donation's donor and to admins; written only by the trigger
alter table public.donation_status_history enable row level security;
create policy "History visible with its donation" on public.donation_status_history
  for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.donations d
      where d.id = donation_id and d.donor_id = (select auth.uid())
    )
  );

-- Old redistribution tables (kept, unused): admins only, since they hold
-- beneficiary names and addresses
drop policy "Enable all for authenticated users" on public.beneficiaries;
drop policy "Enable all for authenticated users" on public.allocations;
drop policy "Enable all for authenticated users" on public.transactions;
create policy "Admins only" on public.beneficiaries for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins only" on public.allocations for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins only" on public.transactions for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ===== 5. Donation photos =====

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('donation-photos', 'donation-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Users upload donation photos to their own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'donation-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
