-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Mirror auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ORGANIZATIONS
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORGANIZATION MEMBERS
create type public.app_role as enum ('owner', 'admin', 'staff');

create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  role app_role default 'staff' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- 4. INVITES
create type public.invite_status as enum ('pending', 'accepted', 'expired');

create table public.invites (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  email text not null,
  token uuid default uuid_generate_v4() not null,
  role app_role default 'staff' not null,
  status invite_status default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PROPERTIES
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  name text not null,
  address text,
  color_code text default '#3B82F6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. BOOKINGS
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  property_id uuid references public.properties on delete cascade not null,
  guest_name text not null,
  start_date date not null,
  end_date date not null,
  total_amount numeric(10,2) default 0,
  status booking_status default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TRANSACTIONS
create type public.transaction_type as enum ('income', 'expense');
create type public.transaction_status as enum ('pending', 'paid');

create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  description text not null,
  amount numeric(10,2) not null,
  type transaction_type not null,
  due_date date not null,
  status transaction_status default 'pending' not null,
  recurrence_group_id uuid, -- For installments
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES -----------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.invites enable row level security;
alter table public.properties enable row level security;
alter table public.bookings enable row level security;
alter table public.transactions enable row level security;

-- Helper function to check member access
create or replace function public.is_org_member(org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.organization_members
    where organization_id = org_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- PROFILES Policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- ORGANIZATIONS Policies
create policy "Members can view their organizations" on public.organizations
  for select using (public.is_org_member(id));

create policy "Owners can update their organizations" on public.organizations
  for update using (
    exists (
      select 1 from public.organization_members
      where organization_id = organizations.id
      and user_id = auth.uid()
      and role = 'owner'
    )
  );

create policy "Users can insert organizations (onboarding)" on public.organizations
  for insert with check (true); 
  -- Ideally, restricted via backend function, but kept open for simplicity, 
  -- constrained by membership logic which must be created simultaneously.

-- MEMBERS Policies
create policy "Members can view members of their orgs" on public.organization_members
  for select using (public.is_org_member(organization_id));

create policy "Admins/Owners can manage members" on public.organization_members
  for all using (
    exists (
      select 1 from public.organization_members
      where organization_id = organization_members.organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- PROPERTIES Policies
create policy "View properties of my orgs" on public.properties
  for select using (public.is_org_member(organization_id));

create policy "Manage properties of my orgs" on public.properties
  for all using (public.is_org_member(organization_id));

-- BOOKINGS Policies
create policy "View bookings of my orgs" on public.bookings
  for select using (public.is_org_member(organization_id));

create policy "Manage bookings of my orgs" on public.bookings
  for all using (public.is_org_member(organization_id));

-- TRANSACTIONS Policies
create policy "View transactions of my orgs" on public.transactions
  for select using (public.is_org_member(organization_id));

create policy "Manage transactions of my orgs" on public.transactions
  for all using (public.is_org_member(organization_id));

-- INVITES Policies
create policy "Admins can view/create invites" on public.invites
  for all using (
    exists (
      select 1 from public.organization_members
      where organization_id = invites.organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- TRIGGER for New Users -> Profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
