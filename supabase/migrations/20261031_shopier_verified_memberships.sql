-- Olympionlab / Shopier verified 30-day access
-- Apply with Supabase SQL Editor BEFORE configuring the Shopier webhook.
-- No anonymous/authenticated role may call the payment-fulfilment functions.
create table if not exists public.shopier_membership_baselines (
  user_id uuid primary key references auth.users(id) on delete cascade,
  original_plan public.plan_type not null,
  created_at timestamptz not null default now()
);
create table if not exists public.shopier_verified_orders (
  order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  plan public.plan_type not null check (plan in ('plus', 'pro')),
  amount_cents integer not null,
  currency text not null default 'TRY' check (currency = 'TRY'),
  buyer_email text not null,
  paid_at timestamptz not null,
  fulfilled_at timestamptz not null default now(),
  unique(order_id, user_id)
);
create table if not exists public.shopier_claim_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index if not exists shopier_claim_attempts_lookup_idx
  on public.shopier_claim_attempts (user_id, attempted_at desc);
create unique index if not exists subscriptions_shopier_order_unique
  on public.subscriptions (provider, provider_customer_id)
  where provider = 'shopier' and provider_customer_id is not null;

alter table public.shopier_membership_baselines enable row level security;
alter table public.shopier_verified_orders enable row level security;
alter table public.shopier_claim_attempts enable row level security;
-- Buyers can see their own verified order, never insert/update it.
drop policy if exists shopier_verified_orders_read_own on public.shopier_verified_orders;
create policy shopier_verified_orders_read_own
  on public.shopier_verified_orders for select to authenticated
  using (user_id = auth.uid());

-- Existing profiles_update_own policy must not allow users to give themselves paid plans.
create or replace function public.guard_paid_profile_columns()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin')
     and (new.plan is distinct from old.plan
          or new.role is distinct from old.role
          or new.email is distinct from old.email) then
    raise exception 'Paid plan, role and account email are server-managed';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_paid_profile_columns_trigger on public.profiles;
create trigger guard_paid_profile_columns_trigger
  before update on public.profiles for each row
  execute function public.guard_paid_profile_columns();

create or replace function public.shopier_recalculate_plan(p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_original public.plan_type;
declare v_active public.plan_type;
declare v_role public.user_role;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'Forbidden';
  end if;
  select b.original_plan into v_original
    from public.shopier_membership_baselines b where b.user_id = p_user_id;
  if v_original is null then return; end if;
  select role into v_role from public.profiles where id = p_user_id;
  if v_role = 'admin' then return; end if;

  select case
    when exists(select 1 from public.subscriptions s where s.user_id=p_user_id
       and s.status='active' and (s.expires_at is null or s.expires_at>now())
       and s.plan='mentor') then 'mentor'::public.plan_type
    when exists(select 1 from public.subscriptions s where s.user_id=p_user_id
       and s.status='active' and (s.expires_at is null or s.expires_at>now())
       and s.plan='pro') then 'pro'::public.plan_type
    when exists(select 1 from public.subscriptions s where s.user_id=p_user_id
       and s.status='active' and (s.expires_at is null or s.expires_at>now())
       and s.plan='plus') then 'plus'::public.plan_type
    else 'free'::public.plan_type
  end into v_active;

  update public.profiles
    set plan = case
      when v_original = 'mentor' or v_active = 'mentor' then 'mentor'::public.plan_type
      when v_original = 'pro' or v_active = 'pro' then 'pro'::public.plan_type
      when v_original = 'plus' or v_active = 'plus' then 'plus'::public.plan_type
      else 'free'::public.plan_type
    end
  where id = p_user_id;
end;
$$;

create or replace function public.shopier_apply_verified_order(
  p_order_id text, p_product_id text, p_buyer_email text,
  p_amount_cents integer, p_paid_at timestamptz,
  p_expected_user_id uuid default null
)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_user_id uuid;
declare v_plan public.plan_type;
declare v_start timestamptz;
declare v_inserted text;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'Forbidden';
  end if;
  if p_order_id !~ '^[A-Za-z0-9_-]{4,64}$'
     or p_buyer_email is null or p_paid_at is null
     or p_paid_at < '2026-10-31 00:00:00+03'::timestamptz
     or p_paid_at > now() + interval '5 minutes' then
    raise exception 'Invalid order metadata';
  end if;

  if p_product_id = '52427384' and p_amount_cents = 34900 then
    v_plan := 'plus';
  elsif p_product_id = '52427721' and p_amount_cents = 64900 then
    v_plan := 'pro';
  else
    return 'unsupported_product_or_amount';
  end if;

  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = lower(trim(p_buyer_email))
    and u.email_confirmed_at is not null
    and (p_expected_user_id is null or u.id = p_expected_user_id)
  limit 1;
  if v_user_id is null then return 'no_matching_verified_user'; end if;

  -- Lock the user's fulfilment queue before deciding the new expiration.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text, 0));

  insert into public.shopier_membership_baselines(user_id, original_plan)
  select v_user_id, p.plan from public.profiles p where p.id = v_user_id
  on conflict (user_id) do nothing;

  insert into public.shopier_verified_orders
    (order_id,user_id,product_id,plan,amount_cents,buyer_email,paid_at)
  values
    (p_order_id,v_user_id,p_product_id,v_plan,p_amount_cents,lower(trim(p_buyer_email)),p_paid_at)
  on conflict (order_id) do nothing
  returning order_id into v_inserted;
  if v_inserted is null then return 'already_processed'; end if;

  select greatest(now(),coalesce(max(s.expires_at),now()))
    into v_start from public.subscriptions s
  where s.user_id=v_user_id and s.provider='shopier'
    and s.status='active' and s.expires_at>now();

  insert into public.subscriptions(user_id,plan,status,provider,provider_customer_id,started_at,expires_at)
  values (v_user_id,v_plan,'active','shopier',p_order_id,v_start,v_start + interval '30 days');
  perform public.shopier_recalculate_plan(v_user_id);
  return 'activated';
end;
$$;

create or replace function public.shopier_expire_memberships()
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_user uuid; v_count integer := 0;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'Forbidden';
  end if;
  for v_user in
    select distinct s.user_id from public.subscriptions s
    where s.provider='shopier' and s.status='active' and s.expires_at<=now()
  loop
    update public.subscriptions
       set status='expired'
     where provider='shopier' and user_id=v_user
       and status='active' and expires_at<=now();
    perform public.shopier_recalculate_plan(v_user);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.shopier_limit_claims(p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_count integer;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'Forbidden';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 1));
  select count(*) into v_count from public.shopier_claim_attempts
    where user_id=p_user_id and attempted_at > now()-interval '15 minutes';
  if v_count >= 5 then raise exception 'Rate limit exceeded'; end if;
  insert into public.shopier_claim_attempts(user_id) values(p_user_id);
end;
$$;

revoke all on function public.shopier_recalculate_plan(uuid) from public, anon, authenticated;
revoke all on function public.shopier_apply_verified_order(text,text,text,integer,timestamptz,uuid) from public, anon, authenticated;
revoke all on function public.shopier_expire_memberships() from public, anon, authenticated;
revoke all on function public.shopier_limit_claims(uuid) from public, anon, authenticated;
grant execute on function public.shopier_recalculate_plan(uuid) to service_role;
grant execute on function public.shopier_apply_verified_order(text,text,text,integer,timestamptz,uuid) to service_role;
grant execute on function public.shopier_expire_memberships() to service_role;
grant execute on function public.shopier_limit_claims(uuid) to service_role;
