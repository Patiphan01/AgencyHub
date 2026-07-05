begin;

alter table campaigns
  add column if not exists campaign_settings jsonb;

commit;
