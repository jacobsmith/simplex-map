create table checkin_sessions (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    region text not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone,
    created_by text not null,
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- Add a session_id column to signal_reports
alter table signal_reports 
add column session_id uuid references checkin_sessions(id);

-- Create an index for faster lookups
create index signal_reports_session_id_idx on signal_reports(session_id); 