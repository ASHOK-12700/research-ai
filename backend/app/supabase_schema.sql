create extension if not exists pgcrypto;

create table if not exists public.papers (
    id text primary key,
    title text not null,
    filename text not null,
    storage_path text not null,
    original_filename text,
    uploaded_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    page_count integer not null default 0,
    project_id text,
    user_id uuid references auth.users(id) on delete cascade,
    file_size_bytes bigint not null default 0,
    metadata jsonb not null default '{}'::jsonb,
    sections jsonb not null default '[]'::jsonb,
    full_text text not null default '',
    extracted_text text
);

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    topic text not null default 'General Research',
    description text not null default '',
    tags jsonb not null default '[]'::jsonb,
    status text not null default 'active' check (status in ('active', 'archived', 'draft')),
    progress integer not null default 0 check (progress >= 0 and progress <= 100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.papers add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Existing paper rows are intentionally left nullable to avoid breaking historical data.
-- Any legacy rows without a user_id remain inaccessible to authenticated users until they are backfilled manually.
-- Backfill is intentionally not forced here because the correct owner cannot be inferred safely for old rows.

create table if not exists public.summaries (
    id uuid primary key default gen_random_uuid(),
    paper_id text not null references public.papers(id) on delete cascade,
    paper_title text not null,
    research_problem text not null default 'Not specified',
    objectives text not null default 'Not specified',
    methodology text not null default 'Not specified',
    dataset_data_used text not null default 'Not specified',
    proposed_approach_model text not null default 'Not specified',
    key_results text not null default 'Not specified',
    evaluation_metrics text not null default 'Not specified',
    main_contributions text not null default 'Not specified',
    limitations text not null default 'Not specified',
    future_work text not null default 'Not specified',
    key_takeaways text not null default 'Not specified',
    generated_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_papers_project_id on public.papers(project_id);
create index if not exists idx_papers_user_id on public.papers(user_id);
create index if not exists idx_papers_uploaded_at on public.papers(uploaded_at desc);
create index if not exists idx_summaries_paper_id on public.summaries(paper_id);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_created_at on public.projects(created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger papers_set_updated_at
before update on public.papers
for each row
execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger summaries_set_updated_at
before update on public.summaries
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy "Papers visible only to owner"
on public.papers for select
using (auth.uid() = user_id);

create policy "Papers insert only for owner"
on public.papers for insert
with check (auth.uid() = user_id);

create policy "Papers update only by owner"
on public.papers for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Papers delete only by owner"
on public.papers for delete
using (auth.uid() = user_id);

create policy "Profiles visible only to owner"
on public.profiles for select
using (auth.uid() = id);

create policy "Profiles insert only for owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Profiles update only by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Profiles delete only by owner"
on public.profiles for delete
using (auth.uid() = id);

create policy "Projects visible only to owner"
on public.projects for select
using (auth.uid() = user_id);

create policy "Projects insert only for owner"
on public.projects for insert
with check (auth.uid() = user_id);

create policy "Projects update only by owner"
on public.projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Projects delete only by owner"
on public.projects for delete
using (auth.uid() = user_id);

create policy "Allow authenticated read access to summaries"
on public.summaries for select
using (auth.role() = 'authenticated');

create policy "Allow authenticated insert access to summaries"
on public.summaries for insert
with check (auth.role() = 'authenticated');

create policy "Allow authenticated update access to summaries"
on public.summaries for update
using (auth.role() = 'authenticated');

create policy "Allow authenticated delete access to summaries"
on public.summaries for delete
using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('research-papers', 'research-papers', false)
on conflict (id) do nothing;

create policy "research-papers-read-authenticated"
on storage.objects for select
using (bucket_id = 'research-papers' and auth.role() = 'authenticated');

create policy "research-papers-insert-authenticated"
on storage.objects for insert
with check (bucket_id = 'research-papers' and auth.role() = 'authenticated');

create policy "research-papers-update-authenticated"
on storage.objects for update
using (bucket_id = 'research-papers' and auth.role() = 'authenticated')
with check (bucket_id = 'research-papers' and auth.role() = 'authenticated');

create policy "research-papers-delete-authenticated"
on storage.objects for delete
using (bucket_id = 'research-papers' and auth.role() = 'authenticated');
