begin;

alter table influencers
  add column if not exists extra_info jsonb;

commit;
