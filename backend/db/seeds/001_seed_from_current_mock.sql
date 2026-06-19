begin;

insert into roles (id, name) values
  ('brand', 'Brand'),
  ('owner', 'Owner'),
  ('staff', 'Staff')
on conflict (id) do update set name = excluded.name;

insert into brands (id, name, category, contact, active_campaigns, health) values
  ('glowhaus', 'GlowHaus Beauty', 'Beauty', 'คุณมินนี่', 3, 'ดีมาก'),
  ('urbanbite', 'UrbanBite', 'Food & Lifestyle', 'คุณต้น', 2, 'กำลังติดตาม'),
  ('fitloop', 'FitLoop', 'Wellness', 'คุณแพรว', 1, 'ดี')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  contact = excluded.contact,
  active_campaigns = excluded.active_campaigns,
  health = excluded.health,
  updated_at = now();

insert into campaigns (
  id, brand_id, brand_name, name, objective, status, progress,
  confirmed_influencers, influencer_target, posted_content, pending_review,
  waiting_brand_selection, brand_quota, team_submitted, owner_approved,
  brand_selected, due_date, budget
) values
  ('glowhaus-summer', 'glowhaus', 'GlowHaus Beauty', 'Summer Glow Launch', 'เปิดตัวเซรั่มใหม่ผ่าน TikTok และ Instagram Reels', 'Confirmed', 72, 18, 24, 11, 5, 4, 12, 22, 15, 9, '30 มิ.ย. 2026', '฿420,000'),
  ('urbanbite-review', 'urbanbite', 'UrbanBite', 'City Brunch Review', 'รีวิวเมนูบรันช์ใหม่กับครีเอเตอร์สายอาหาร', 'Draft submitted', 48, 10, 16, 3, 7, 5, 8, 14, 9, 5, '12 ก.ค. 2026', '฿190,000'),
  ('fitloop-reset', 'fitloop', 'FitLoop', 'Reset Challenge', 'สร้างแคมเปญชาเลนจ์สุขภาพ 14 วัน', 'Waiting owner review', 26, 6, 12, 0, 9, 2, 6, 10, 4, 1, '25 ก.ค. 2026', '฿260,000')
on conflict (id) do update set
  brand_id = excluded.brand_id,
  brand_name = excluded.brand_name,
  name = excluded.name,
  objective = excluded.objective,
  status = excluded.status,
  progress = excluded.progress,
  confirmed_influencers = excluded.confirmed_influencers,
  influencer_target = excluded.influencer_target,
  posted_content = excluded.posted_content,
  pending_review = excluded.pending_review,
  waiting_brand_selection = excluded.waiting_brand_selection,
  brand_quota = excluded.brand_quota,
  team_submitted = excluded.team_submitted,
  owner_approved = excluded.owner_approved,
  brand_selected = excluded.brand_selected,
  due_date = excluded.due_date,
  budget = excluded.budget,
  updated_at = now();

insert into influencers (
  id, name, channel, tier, followers, added_by, deal_date, status,
  draft_status, product_sent, post_date, post_link
) values
  ('inf-001', 'Nara Narin', 'tiktok.com/@naranarin', 'Macro', '825K', 'Staff A', '05 มิ.ย. 2026', 'Confirmed', 'Draft approved', true, '18 มิ.ย. 2026', 'https://tiktok.com/@naranarin/video/001'),
  ('inf-002', 'Beam Eats', 'instagram.com/beameats', 'Mid', '212K', 'Staff B', '06 มิ.ย. 2026', 'Brand selected', 'Waiting draft', false, '22 มิ.ย. 2026', '-'),
  ('inf-003', 'Ploy Routine', 'youtube.com/@ployroutine', 'Micro', '74K', 'Staff A', '08 มิ.ย. 2026', 'Owner approved', 'Draft submitted', true, '24 มิ.ย. 2026', '-'),
  ('inf-004', 'Krit Lens', 'instagram.com/kritlens', 'Mega/KOL', '1.4M', 'Staff B', '10 มิ.ย. 2026', 'Waiting owner review', 'Waiting draft', false, '28 มิ.ย. 2026', '-'),
  ('inf-005', 'Mild Mini', 'tiktok.com/@mildmini', 'Nano', '18K', 'Staff A', '11 มิ.ย. 2026', 'Posted', 'Posted', true, '15 มิ.ย. 2026', 'https://tiktok.com/@mildmini/video/005')
on conflict (id) do update set
  name = excluded.name,
  channel = excluded.channel,
  tier = excluded.tier,
  followers = excluded.followers,
  added_by = excluded.added_by,
  deal_date = excluded.deal_date,
  status = excluded.status,
  draft_status = excluded.draft_status,
  product_sent = excluded.product_sent,
  post_date = excluded.post_date,
  post_link = excluded.post_link,
  updated_at = now();

insert into tier_targets (id, tier, target, owner_approved, brand_selected) values
  ('nano', 'Nano', 8, 5, 3),
  ('micro', 'Micro', 6, 4, 3),
  ('mid', 'Mid', 4, 3, 2),
  ('macro', 'Macro', 2, 2, 1),
  ('mega-kol', 'Mega/KOL', 1, 1, 1)
on conflict (id) do update set
  tier = excluded.tier,
  target = excluded.target,
  owner_approved = excluded.owner_approved,
  brand_selected = excluded.brand_selected;

insert into brief_versions (id, version, uploaded_at, uploaded_by) values
  ('brief-v1', 'Brief v1', '01 มิ.ย. 2026', 'Owner'),
  ('brief-v2', 'Brief v2', '04 มิ.ย. 2026', 'Brand'),
  ('brief-v3', 'Brief v3', '07 มิ.ย. 2026', 'Owner')
on conflict (id) do update set
  version = excluded.version,
  uploaded_at = excluded.uploaded_at,
  uploaded_by = excluded.uploaded_by;

insert into notifications (id, role, title, message, unread, time) values
  ('noti-1', 'Staff', 'Owner คัดผ่านรายชื่อแล้ว', 'Nara Narin ผ่านการคัดเลือกและพร้อมดำเนินการต่อ', true, '10:20'),
  ('noti-2', 'Staff', 'Owner คัดออกรายชื่อ', 'Krit Lens ต้องแก้ข้อมูลก่อนส่งอีกครั้ง', true, '09:45'),
  ('noti-3', 'Owner', 'Brand เลือก Influencer เสร็จแล้ว', 'GlowHaus เลือกครบ 9 จาก 12 รายชื่อ', true, '11:05'),
  ('noti-4', 'Brand', 'มีรายชื่อใหม่ให้ตรวจ', 'ทีมส่ง Influencer ใหม่ 4 รายชื่อใน Summer Glow Launch', true, '08:30')
on conflict (id) do update set
  role = excluded.role,
  title = excluded.title,
  message = excluded.message,
  unread = excluded.unread,
  time = excluded.time;

insert into activities (id, user_name, action, time) values
  ('act-1', 'Staff A', 'เพิ่ม Influencer Nara Narin', '16 มิ.ย. 2026 09:15'),
  ('act-2', 'Owner', 'อนุมัติ Influencer Ploy Routine', '16 มิ.ย. 2026 10:05'),
  ('act-3', 'Owner', 'ปฏิเสธ Influencer Krit Lens', '16 มิ.ย. 2026 10:22'),
  ('act-4', 'Brand', 'เลือก Influencer Beam Eats', '16 มิ.ย. 2026 11:05'),
  ('act-5', 'Staff A', 'อัปเดตสถานะ Draft ของ Ploy Routine', '16 มิ.ย. 2026 13:40'),
  ('act-6', 'Staff A', 'เพิ่มลิงก์คลิปของ Mild Mini', '16 มิ.ย. 2026 15:10')
on conflict (id) do update set
  user_name = excluded.user_name,
  action = excluded.action,
  time = excluded.time;

insert into tasks (id, title, owner, due, status) values
  ('task-1', 'ตรวจรายชื่ออินฟลูเอนเซอร์รอบ Owner', 'Owner', 'วันนี้', 'Waiting owner review'),
  ('task-2', 'ส่งคอมเมนต์งานดราฟต์ให้ทีมครีเอเตอร์', 'Staff A', 'พรุ่งนี้', 'Revision requested'),
  ('task-3', 'สรุปรายงานโพสต์สำหรับแบรนด์', 'Staff A', 'ศุกร์นี้', 'Draft approved')
on conflict (id) do update set
  title = excluded.title,
  owner = excluded.owner,
  due = excluded.due,
  status = excluded.status,
  updated_at = now();

insert into draft_statuses (id, name) values
  ('waiting-draft', 'Waiting draft'),
  ('draft-submitted', 'Draft submitted'),
  ('revision-requested', 'Revision requested'),
  ('draft-approved', 'Draft approved'),
  ('posted', 'Posted')
on conflict (id) do update set name = excluded.name;

commit;
