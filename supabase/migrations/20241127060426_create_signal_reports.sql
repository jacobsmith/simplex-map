-- Create signal reports table
create table if not exists signal_reports (
  id uuid default uuid_generate_v4() primary key,
  reporting_callsign text not null,
  heard_callsign text not null,
  readability integer not null check (readability between 1 and 5),
  strength integer not null check (strength between 1 and 9),
  notes text,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
alter table signal_reports enable row level security;

-- Create policies
create policy "Enable read access for all users"
  on signal_reports for select
  using (true);

create policy "Enable insert access for all users"
  on signal_reports for insert
  with check (true);

-- Create indexes for better query performance
create index signal_reports_reporting_callsign_idx on signal_reports(reporting_callsign);
create index signal_reports_heard_callsign_idx on signal_reports(heard_callsign);
create index signal_reports_created_at_idx on signal_reports(created_at);

-- Add the table to the publication for all operations
alter publication supabase_realtime add table signal_reports; 