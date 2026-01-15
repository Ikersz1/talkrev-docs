-- =============================================
-- TalkRev Docs - Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Folders table
create table if not exists folders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  parent_id uuid references folders(id) on delete cascade,
  icon text,
  "order" integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents table
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null,
  content text,
  folder_id uuid references folders(id) on delete set null,
  author_name text,
  is_published boolean default true,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Unique constraint on slug within the same folder
  unique(slug, folder_id)
);

-- =============================================
-- INDEXES
-- =============================================

create index if not exists idx_documents_folder_id on documents(folder_id);
create index if not exists idx_documents_slug on documents(slug);
create index if not exists idx_documents_created_at on documents(created_at desc);
create index if not exists idx_folders_parent_id on folders(parent_id);
create index if not exists idx_folders_slug on folders(slug);

-- Full text search index for documents
create index if not exists idx_documents_search on documents 
  using gin(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(content, '')));

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Function for full text search
create or replace function search_documents(search_query text)
returns table (
  id uuid,
  title text,
  slug text,
  folder_id uuid,
  folder_slug text,
  excerpt text,
  rank real
) as $$
begin
  return query
  select 
    d.id,
    d.title,
    d.slug,
    d.folder_id,
    f.slug as folder_slug,
    substring(d.content from 1 for 200) as excerpt,
    ts_rank(
      to_tsvector('spanish', coalesce(d.title, '') || ' ' || coalesce(d.content, '')),
      plainto_tsquery('spanish', search_query)
    ) as rank
  from documents d
  left join folders f on d.folder_id = f.id
  where 
    d.is_published = true
    and (
      to_tsvector('spanish', coalesce(d.title, '') || ' ' || coalesce(d.content, '')) 
      @@ plainto_tsquery('spanish', search_query)
      or d.title ilike '%' || search_query || '%'
      or d.content ilike '%' || search_query || '%'
    )
  order by rank desc, d.updated_at desc
  limit 20;
end;
$$ language plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for documents updated_at
drop trigger if exists update_documents_updated_at on documents;
create trigger update_documents_updated_at
  before update on documents
  for each row
  execute function update_updated_at_column();

-- Trigger for folders updated_at
drop trigger if exists update_folders_updated_at on folders;
create trigger update_folders_updated_at
  before update on folders
  for each row
  execute function update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
alter table documents enable row level security;
alter table folders enable row level security;

-- Policies for documents (allow all for now - you can restrict later)
create policy "Allow public read access to published documents"
  on documents for select
  using (is_published = true);

create policy "Allow public insert access to documents"
  on documents for insert
  with check (true);

create policy "Allow public update access to documents"
  on documents for update
  using (true);

create policy "Allow public delete access to documents"
  on documents for delete
  using (true);

-- Policies for folders (allow all)
create policy "Allow public read access to folders"
  on folders for select
  using (true);

create policy "Allow public insert access to folders"
  on folders for insert
  with check (true);

create policy "Allow public update access to folders"
  on folders for update
  using (true);

create policy "Allow public delete access to folders"
  on folders for delete
  using (true);

-- =============================================
-- SEED DATA (Optional sample folders)
-- =============================================

insert into folders (name, slug, "order") values
  ('Getting Started', 'getting-started', 1),
  ('API', 'api', 2),
  ('Guides', 'guides', 3)
on conflict (slug) do nothing;
