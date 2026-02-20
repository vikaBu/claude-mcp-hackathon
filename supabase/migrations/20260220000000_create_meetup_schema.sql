-- archetype enum
create type contact_archetype as enum ('bee', 'captain', 'golden_retriever', 'fruit_fly');

-- contacts
create table contacts (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  name text not null,
  phone_number text not null,
  archetype contact_archetype not null,
  cuisine_preferences text[] default '{}',
  dietary_restrictions text[] default '{}'
);

-- availability (one row per slot)
create table availability (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid not null references contacts(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null
);

-- meetups
create table meetups (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  restaurant_name text not null,
  restaurant_yelp_id text,
  restaurant_address text not null,
  date date not null,
  time time not null,
  status text not null default 'confirmed' check (status in ('planning', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

-- participants join table
create table meetup_participants (
  id uuid default gen_random_uuid() primary key,
  meetup_id uuid not null references meetups(id) on delete cascade,
  contact_id uuid not null references contacts(id),
  message_sent boolean default false
);

-- ============================================================
-- Seed data for demo user
-- ============================================================

do $$
declare
  alice_id uuid;
  bob_id   uuid;
  cara_id  uuid;
  dan_id   uuid;
begin
  insert into contacts (user_id, name, phone_number, archetype, cuisine_preferences, dietary_restrictions)
  values
    ('demo-user', 'Alice',   '+14155550101', 'bee',              array['italian','japanese'],   array[]::text[]),
    ('demo-user', 'Bob',     '+14155550102', 'captain',          array['mexican','american'],   array['gluten-free']),
    ('demo-user', 'Cara',    '+14155550103', 'golden_retriever', array['thai','italian'],        array['vegetarian']),
    ('demo-user', 'Dan',     '+14155550104', 'fruit_fly',        array['japanese','thai'],       array[]::text[]);

  -- fetch individual ids
  select id into alice_id from contacts where user_id = 'demo-user' and name = 'Alice';
  select id into bob_id   from contacts where user_id = 'demo-user' and name = 'Bob';
  select id into cara_id  from contacts where user_id = 'demo-user' and name = 'Cara';
  select id into dan_id   from contacts where user_id = 'demo-user' and name = 'Dan';

  -- Overlapping slots on 2026-02-28 (all four available 18:00–20:00)
  insert into availability (contact_id, date, start_time, end_time) values
    (alice_id, '2026-02-28', '18:00', '22:00'),
    (bob_id,   '2026-02-28', '17:00', '21:00'),
    (cara_id,  '2026-02-28', '18:00', '20:00'),
    (dan_id,   '2026-02-28', '16:00', '23:00');

  -- Overlapping slots on 2026-03-07 (only Alice + Bob 12:00–14:00)
  insert into availability (contact_id, date, start_time, end_time) values
    (alice_id, '2026-03-07', '12:00', '15:00'),
    (bob_id,   '2026-03-07', '11:00', '14:00');

  -- Non-overlapping (Dan only)
  insert into availability (contact_id, date, start_time, end_time) values
    (dan_id, '2026-03-10', '10:00', '12:00');
end $$;
