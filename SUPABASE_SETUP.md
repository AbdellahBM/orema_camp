# Supabase Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Database Setup

### 1. Create the `registrations` table

```sql
create table public.registrations (
  id            bigserial primary key,
  name          text not null,
  email         text not null,
  phone         text,
  photo_url     text,
  extra_info    text,
  status        text default 'pending', -- pending/approved/declined
  created_at    timestamp with time zone default timezone('utc'::text, now()),
  updated_at    timestamp with time zone default timezone('utc'::text, now())
);

-- Optional: Auto-update updated_at on edit
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language 'plpgsql';

drop trigger if exists set_timestamp on public.registrations;

create trigger set_timestamp
before update on public.registrations
for each row
execute procedure update_updated_at_column();
```

### 2. Create the Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `registration-photos`
3. Set the bucket to be public (or configure appropriate policies)

### 3. Set up Storage Policies (if needed)

If your bucket is not public, you may need to create policies for upload and read access.

## Getting Started

1. Copy your Supabase project URL and anon key from the Supabase dashboard
2. Add them to your `.env.local` file
3. Set up the database table and storage bucket as described above
4. Run your Next.js application with `npm run dev`
5. Navigate to `/register` to test the form

The registration form is now ready to use at `/register`! 