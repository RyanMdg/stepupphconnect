-- StepUpConnect dashboard support tables
-- Run this in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- Existing table support: keep your current data and add fields the app expects.
alter table public.admins
  add column if not exists auth_id uuid references auth.users(id) on delete cascade,
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists status text not null default 'active',
  add column if not exists last_active timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.agencies
  add column if not exists auth_id uuid references auth.users(id) on delete set null,
  add column if not exists name text,
  add column if not exists industry text,
  add column if not exists contact text,
  add column if not exists contact_person text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists specializations text[] not null default '{}',
  add column if not exists available_slots integer not null default 0,
  add column if not exists active_endorsements integer not null default 0,
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration text,
  instructor text,
  students integer not null default 0,
  completion_rate integer not null default 0 check (completion_rate between 0 and 100),
  status text not null default 'active' check (status in ('active', 'enrolling', 'completed', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo text,
  title text,
  program text,
  skills text[] not null default '{}',
  experience text,
  english_level text,
  status text not null default 'pending'
    check (status in ('job_ready', 'in_training', 'placed', 'pending')),
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  availability text,
  province text,
  email text,
  phone text,
  expected_salary text,
  preferred_work text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  contact_person text,
  email text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.endorsements (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  employer_id uuid references public.employers(id) on delete set null,
  stage text not null default 'endorsed'
    check (stage in ('endorsed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_requests (
  id uuid primary key default gen_random_uuid(),
  agency_name text not null,
  industry text,
  contact_person text,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('endorsed', 'hired', 'registered', 'request', 'completed')),
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists admins_auth_id_idx on public.admins(auth_id);
create index if not exists agencies_auth_id_idx on public.agencies(auth_id);
create index if not exists agencies_email_idx on public.agencies(email);
create index if not exists candidates_email_idx on public.candidates(email);
create index if not exists candidates_status_idx on public.candidates(status);
create index if not exists candidates_created_at_idx on public.candidates(created_at);
create index if not exists endorsements_stage_idx on public.endorsements(stage);
create index if not exists endorsements_created_at_idx on public.endorsements(created_at);
create index if not exists agency_requests_status_idx on public.agency_requests(status);

alter table public.admins enable row level security;
alter table public.agencies enable row level security;
alter table public.programs enable row level security;
alter table public.candidates enable row level security;
alter table public.employers enable row level security;
alter table public.endorsements enable row level security;
alter table public.agency_requests enable row level security;
alter table public.activity_feed enable row level security;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where auth_id = auth.uid()
    and status = 'active'
  );
$$;

grant execute on function public.is_active_admin() to authenticated;

drop policy if exists "admins can read admin profiles" on public.admins;
create policy "admins can read admin profiles"
on public.admins for select
to authenticated
using (
  auth_id = auth.uid()
  or public.is_active_admin()
);

drop policy if exists "authenticated can read agencies" on public.agencies;
create policy "authenticated can read agencies"
on public.agencies for select
to authenticated
using (true);

drop policy if exists "authenticated can read programs" on public.programs;
create policy "authenticated can read programs"
on public.programs for select
to authenticated
using (true);

drop policy if exists "authenticated can read candidates" on public.candidates;
create policy "authenticated can read candidates"
on public.candidates for select
to authenticated
using (true);

drop policy if exists "authenticated can read employers" on public.employers;
create policy "authenticated can read employers"
on public.employers for select
to authenticated
using (true);

drop policy if exists "authenticated can read endorsements" on public.endorsements;
create policy "authenticated can read endorsements"
on public.endorsements for select
to authenticated
using (true);

drop policy if exists "authenticated can read agency requests" on public.agency_requests;
create policy "authenticated can read agency requests"
on public.agency_requests for select
to authenticated
using (true);

drop policy if exists "authenticated can read activity feed" on public.activity_feed;
create policy "authenticated can read activity feed"
on public.activity_feed for select
to authenticated
using (true);

insert into public.programs (name, duration, instructor, students, completion_rate, status)
select *
from (
  values
    ('Virtual Assistant Bootcamp', '8 weeks', 'Gemma Villanueva', 24, 87, 'active'),
    ('BPO Career Ready', '6 weeks', 'Raymond Tan', 38, 91, 'active'),
    ('Customer Service Excellence', '4 weeks', 'Sheila Castillo', 19, 84, 'active')
) as seed_programs (name, duration, instructor, students, completion_rate, status)
where not exists (
  select 1
  from public.programs p
  where p.name = seed_programs.name
);

insert into public.activity_feed (type, text, created_at)
select *
from (
  values
    ('registered', 'Dashboard tables configured', now()),
    ('completed', 'Training completion tracking is ready', now() - interval '1 hour')
) as seed_activity (type, text, created_at)
where not exists (
  select 1
  from public.activity_feed a
  where a.text = seed_activity.text
);

insert into public.candidates (
  name,
  photo,
  title,
  program,
  skills,
  experience,
  english_level,
  status,
  readiness_score,
  availability,
  province,
  email,
  phone,
  expected_salary,
  preferred_work,
  created_at,
  updated_at
)
select *
from (
  values
    (
      'Maria Santos',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format',
      'Virtual Assistant',
      'Virtual Assistant Bootcamp',
      array['Google Workspace', 'CRM', 'Communication', 'English C1'],
      '2 years',
      'C1 Advanced',
      'job_ready',
      92,
      'Immediate',
      'Quezon City',
      'maria.santos@stepupph.com',
      '+63 912 345 6789',
      'PHP 25,000-30,000',
      'Remote',
      now() - interval '20 days',
      now() - interval '2 days'
    ),
    (
      'John Dela Cruz',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228d2d?w=80&h=80&fit=crop&auto=format',
      'Customer Service Representative',
      'BPO Career Ready',
      array['Customer Service', 'Zendesk', 'Communication', 'Sales'],
      '1 year',
      'B2 Upper Intermediate',
      'job_ready',
      87,
      '2 weeks',
      'Makati',
      'john.delacruz@stepupph.com',
      '+63 917 234 5678',
      'PHP 22,000-26,000',
      'On-site',
      now() - interval '18 days',
      now() - interval '4 days'
    ),
    (
      'Angela Reyes',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format',
      'Healthcare Support Specialist',
      'Healthcare Support Training',
      array['Office Administration', 'Communication', 'English C1', 'Excel'],
      '3 years',
      'C1 Advanced',
      'job_ready',
      95,
      'Immediate',
      'Pasig',
      'angela.reyes@stepupph.com',
      '+63 918 345 6789',
      'PHP 28,000-35,000',
      'Hybrid',
      now() - interval '16 days',
      now() - interval '1 day'
    ),
    (
      'Carlo Mendoza',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format',
      'Administrative Assistant',
      'Administrative Professional',
      array['Office Administration', 'Excel', 'Google Workspace', 'HubSpot'],
      '2 years',
      'B2 Upper Intermediate',
      'in_training',
      74,
      '30 days',
      'Taguig',
      'carlo.mendoza@stepupph.com',
      '+63 919 456 7890',
      'PHP 20,000-24,000',
      'On-site',
      now() - interval '15 days',
      now() - interval '8 days'
    ),
    (
      'Nicole Cruz',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format',
      'BPO Agent',
      'Customer Service Excellence',
      array['Customer Service', 'Sales', 'Zendesk', 'Communication'],
      '1 year',
      'B2 Upper Intermediate',
      'job_ready',
      83,
      '1 week',
      'Mandaluyong',
      'nicole.cruz@stepupph.com',
      '+63 920 567 8901',
      'PHP 20,000-24,000',
      'Remote',
      now() - interval '14 days',
      now() - interval '3 days'
    ),
    (
      'Jose Bautista',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format',
      'Customer Service Lead',
      'BPO Career Ready',
      array['Customer Service', 'Communication', 'CRM', 'Sales'],
      '4 years',
      'C1 Advanced',
      'placed',
      98,
      'Placed',
      'Manila',
      'jose.bautista@stepupph.com',
      '+63 921 678 9012',
      'PHP 30,000-38,000',
      'On-site',
      now() - interval '45 days',
      now() - interval '22 days'
    ),
    (
      'Carla Ferrer',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&auto=format',
      'Virtual Assistant',
      'Virtual Assistant Bootcamp',
      array['Google Workspace', 'Communication', 'Excel', 'CRM'],
      '1 year',
      'B1 Intermediate',
      'in_training',
      61,
      '45 days',
      'Cebu City',
      'carla.ferrer@stepupph.com',
      '+63 922 789 0123',
      'PHP 18,000-22,000',
      'Remote',
      now() - interval '12 days',
      now() - interval '10 days'
    ),
    (
      'Miguel Ramos',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format',
      'Administrative Assistant',
      'Administrative Professional',
      array['Office Administration', 'Excel', 'Google Workspace'],
      '2 years',
      'B2 Upper Intermediate',
      'job_ready',
      80,
      'Immediate',
      'Davao City',
      'miguel.ramos@stepupph.com',
      '+63 923 890 1234',
      'PHP 20,000-25,000',
      'On-site',
      now() - interval '10 days',
      now() - interval '5 days'
    )
) as seed_candidates (
  name,
  photo,
  title,
  program,
  skills,
  experience,
  english_level,
  status,
  readiness_score,
  availability,
  province,
  email,
  phone,
  expected_salary,
  preferred_work,
  created_at,
  updated_at
)
where not exists (
  select 1
  from public.candidates c
  where c.email = seed_candidates.email
);
