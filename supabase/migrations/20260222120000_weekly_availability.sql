-- Replace date-based availability with recurring weekly availability

drop table if exists availability;

create table availability (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid not null references contacts(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  start_time time not null,
  end_time time not null
);

-- Seed weekly recurring availability for all demo contacts
do $$
declare
  alice_id uuid; bob_id uuid; cara_id uuid; dan_id uuid;
  eve_id uuid; finn_id uuid; grace_id uuid; harry_id uuid;
begin
  select id into alice_id from contacts where user_id = 'demo-user' and name = 'Alice';
  select id into bob_id   from contacts where user_id = 'demo-user' and name = 'Bob';
  select id into cara_id  from contacts where user_id = 'demo-user' and name = 'Cara';
  select id into dan_id   from contacts where user_id = 'demo-user' and name = 'Dan';
  select id into eve_id   from contacts where user_id = 'demo-user' and name = 'Eve';
  select id into finn_id  from contacts where user_id = 'demo-user' and name = 'Finn';
  select id into grace_id from contacts where user_id = 'demo-user' and name = 'Grace';
  select id into harry_id from contacts where user_id = 'demo-user' and name = 'Harry';

  -- Alice (🐝 Bee — organised): Tues + Wed evenings, Sat afternoon
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (alice_id, 'tuesday',   '18:00', '22:00'),
    (alice_id, 'wednesday', '18:00', '22:00'),
    (alice_id, 'saturday',  '14:00', '20:00');

  -- Bob (⚓ Captain — organised but flaky): Mon + Wed evenings
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (bob_id, 'monday',    '18:00', '21:00'),
    (bob_id, 'wednesday', '18:00', '21:30');

  -- Cara (🐶 Golden Retriever — reliable, laid-back): Wed + Fri evenings, Sat afternoon
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (cara_id, 'wednesday', '18:00', '21:00'),
    (cara_id, 'friday',    '18:00', '22:00'),
    (cara_id, 'saturday',  '13:00', '19:00');

  -- Dan (🪰 Fruit Fly — spontaneous): most evenings, available late
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (dan_id, 'wednesday', '17:00', '23:00'),
    (dan_id, 'thursday',  '18:00', '23:00'),
    (dan_id, 'friday',    '18:00', '23:00'),
    (dan_id, 'saturday',  '15:00', '23:00');

  -- Eve (🐶 Golden Retriever): Tues + Thurs evenings, Sat afternoon
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (eve_id, 'tuesday',   '18:00', '22:00'),
    (eve_id, 'thursday',  '18:00', '22:00'),
    (eve_id, 'saturday',  '14:00', '20:00');

  -- Finn (⚓ Captain): Wed + Thurs evenings
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (finn_id, 'wednesday', '18:00', '22:00'),
    (finn_id, 'thursday',  '18:00', '21:30');

  -- Grace (🐝 Bee): Thurs evenings, Sun afternoons
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (grace_id, 'thursday', '18:00', '22:00'),
    (grace_id, 'sunday',   '13:00', '18:00');

  -- Harry (🪰 Fruit Fly): Thurs + Fri + Sat + Sun, wide windows
  insert into availability (contact_id, day_of_week, start_time, end_time) values
    (harry_id, 'thursday', '17:00', '23:00'),
    (harry_id, 'friday',   '18:00', '23:00'),
    (harry_id, 'saturday', '15:00', '23:00'),
    (harry_id, 'sunday',   '12:00', '20:00');
end $$;

-- Overlapping windows by day for reference:
-- Wednesday: Alice(18-22) Bob(18-21:30) Cara(18-21) Dan(17-23) Finn(18-22) → all 5 overlap 18:00-21:00
-- Thursday:  Dan(18-23) Eve(18-22) Finn(18-21:30) Grace(18-22) Harry(17-23) → all 5 overlap 18:00-21:30
-- Friday:    Cara(18-22) Dan(18-23) Harry(18-23) → overlap 18:00-22:00
-- Saturday:  Alice(14-20) Cara(13-19) Dan(15-23) Eve(14-20) Harry(15-23) → Alice+Cara+Eve overlap 14:00-19:00
-- Tuesday:   Alice(18-22) Eve(18-22) → overlap 18:00-22:00
