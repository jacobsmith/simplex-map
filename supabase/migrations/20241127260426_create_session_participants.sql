create table session_participants (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references checkin_sessions(id) not null,
    callsign text not null,
    latitude numeric not null,
    longitude numeric not null,
    joined_at timestamp with time zone default now(),
    left_at timestamp with time zone,
    created_at timestamp with time zone default now()
);

-- Create indexes for faster lookups
create index session_participants_session_id_idx on session_participants(session_id);
create index session_participants_callsign_idx on session_participants(callsign);

-- Create a unique constraint to prevent duplicate active participants
create unique index session_participants_active_idx on session_participants(session_id, callsign) 
where left_at is null; 

-- Add the table to the publication for all operations
alter publication supabase_realtime add table session_participants; 