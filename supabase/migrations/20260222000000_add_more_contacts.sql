-- Add more demo contacts with overlapping availability slots

do $$
declare
  eve_id   uuid;
  finn_id  uuid;
  grace_id uuid;
  harry_id uuid;
begin
  insert into contacts (user_id, name, phone_number, archetype, cuisine_preferences, dietary_restrictions)
  values
    ('demo-user', 'Eve',   '+14155550105', 'golden_retriever', array['italian','mexican','thai'],  array[]::text[]),
    ('demo-user', 'Finn',  '+14155550106', 'captain',          array['japanese','korean'],          array['gluten-free']),
    ('demo-user', 'Grace', '+14155550107', 'bee',              array['thai','indian','italian'],    array['vegan']),
    ('demo-user', 'Harry', '+14155550108', 'fruit_fly',        array['mexican','american','korean'],array[]::text[]);

  select id into eve_id   from contacts where user_id = 'demo-user' and name = 'Eve';
  select id into finn_id  from contacts where user_id = 'demo-user' and name = 'Finn';
  select id into grace_id from contacts where user_id = 'demo-user' and name = 'Grace';
  select id into harry_id from contacts where user_id = 'demo-user' and name = 'Harry';

  -- All four overlap on 2026-02-28 18:00–20:00 (same window as existing contacts)
  insert into availability (contact_id, date, start_time, end_time) values
    (eve_id,   '2026-02-28', '17:00', '22:00'),
    (finn_id,  '2026-02-28', '18:00', '21:00'),
    (grace_id, '2026-02-28', '18:00', '20:00'),
    (harry_id, '2026-02-28', '16:00', '23:00');

  -- Eve + Grace + Harry overlap on 2026-03-07 12:00–14:00
  insert into availability (contact_id, date, start_time, end_time) values
    (eve_id,   '2026-03-07', '11:00', '15:00'),
    (grace_id, '2026-03-07', '12:00', '14:30'),
    (harry_id, '2026-03-07', '10:00', '14:00');

  -- Everyone overlaps on a new date: 2026-03-14 19:00–21:00
  insert into availability (contact_id, date, start_time, end_time) values
    (eve_id,   '2026-03-14', '19:00', '22:00'),
    (finn_id,  '2026-03-14', '18:30', '21:30'),
    (grace_id, '2026-03-14', '19:00', '21:00'),
    (harry_id, '2026-03-14', '17:00', '23:00');
end $$;
