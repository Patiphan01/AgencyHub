begin;

truncate table
  activities,
  notifications,
  brief_versions,
  tier_targets,
  influencers,
  campaigns,
  brands,
  tasks
restart identity cascade;

insert into roles (id, name) values
  ('brand', 'Brand'),
  ('owner', 'Owner'),
  ('staff', 'Staff')
on conflict (id) do update set name = excluded.name;

insert into draft_statuses (id, name) values
  ('waiting-draft', 'Waiting draft'),
  ('draft-submitted', 'Draft submitted'),
  ('revision-requested', 'Revision requested'),
  ('draft-approved', 'Draft approved'),
  ('posted', 'Posted')
on conflict (id) do update set name = excluded.name;

commit;
