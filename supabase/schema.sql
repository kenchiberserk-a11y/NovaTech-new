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
