-- NovaTech starter schema. Apply in the Supabase SQL Editor.
create type public.app_role as enum ('employee', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'NovaTech teammate',
  role public.app_role not null default 'employee',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select on public.profiles to authenticated;

-- Users can only read their own profile. Role assignment must be trusted.
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

-- New accounts default to employee; never trust client-supplied role metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'NovaTech teammate'), 'employee');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Do not grant clients permission to update role. Promote verified accounts
-- through a trusted administrative workflow only.


-- Security audit events: write through trusted server-side code only.
create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in (
    'auth_login', 'auth_logout', 'auth_denied',
    'role_changed', 'sensitive_data_access', 'security_alert'
  )),
  outcome text not null check (outcome in ('success', 'failure', 'blocked')),
  occurred_at timestamptz not null default now(),
  request_id text,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.audit_events enable row level security;
revoke all on public.audit_events from anon, authenticated;
grant select on public.audit_events to authenticated;

-- SECURITY DEFINER helper avoids RLS recursion when checking administrator role.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Administrators can read audit events"
  on public.audit_events for select to authenticated
  using (public.is_admin());

-- No client INSERT/UPDATE/DELETE policy is intentional. Write events from a
-- trusted server-side route or database trigger, never from arbitrary browser input.
