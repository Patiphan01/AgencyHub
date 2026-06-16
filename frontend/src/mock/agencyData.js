export const roles = ['Brand', 'Owner', 'Staff']

export const currentStaffName = 'Staff A'

export const brands = [
  {
    id: 'glowhaus',
    name: 'GlowHaus Beauty',
    category: 'Beauty',
    contact: 'คุณมินนี่',
    activeCampaigns: 3,
    health: 'ดีมาก',
  },
  {
    id: 'urbanbite',
    name: 'UrbanBite',
    category: 'Food & Lifestyle',
    contact: 'คุณต้น',
    activeCampaigns: 2,
    health: 'กำลังติดตาม',
  },
  {
    id: 'fitloop',
    name: 'FitLoop',
    category: 'Wellness',
    contact: 'คุณแพรว',
    activeCampaigns: 1,
    health: 'ดี',
  },
]

export const tierTargets = [
  { tier: 'Nano', target: 8, ownerApproved: 5, brandSelected: 3 },
  { tier: 'Micro', target: 6, ownerApproved: 4, brandSelected: 3 },
  { tier: 'Mid', target: 4, ownerApproved: 3, brandSelected: 2 },
  { tier: 'Macro', target: 2, ownerApproved: 2, brandSelected: 1 },
  { tier: 'Mega/KOL', target: 1, ownerApproved: 1, brandSelected: 1 },
]

export const campaigns = [
  {
    id: 'glowhaus-summer',
    brandId: 'glowhaus',
    brandName: 'GlowHaus Beauty',
    name: 'Summer Glow Launch',
    objective: 'เปิดตัวเซรั่มใหม่ผ่าน TikTok และ Instagram Reels',
    status: 'Confirmed',
    progress: 72,
    confirmedInfluencers: 18,
    influencerTarget: 24,
    postedContent: 11,
    pendingReview: 5,
    waitingBrandSelection: 4,
    brandQuota: 12,
    teamSubmitted: 22,
    ownerApproved: 15,
    brandSelected: 9,
    dueDate: '30 มิ.ย. 2026',
    budget: '฿420,000',
  },
  {
    id: 'urbanbite-review',
    brandId: 'urbanbite',
    brandName: 'UrbanBite',
    name: 'City Brunch Review',
    objective: 'รีวิวเมนูบรันช์ใหม่กับครีเอเตอร์สายอาหาร',
    status: 'Draft submitted',
    progress: 48,
    confirmedInfluencers: 10,
    influencerTarget: 16,
    postedContent: 3,
    pendingReview: 7,
    waitingBrandSelection: 5,
    brandQuota: 8,
    teamSubmitted: 14,
    ownerApproved: 9,
    brandSelected: 5,
    dueDate: '12 ก.ค. 2026',
    budget: '฿190,000',
  },
  {
    id: 'fitloop-reset',
    brandId: 'fitloop',
    brandName: 'FitLoop',
    name: 'Reset Challenge',
    objective: 'สร้างแคมเปญชาเลนจ์สุขภาพ 14 วัน',
    status: 'Waiting owner review',
    progress: 26,
    confirmedInfluencers: 6,
    influencerTarget: 12,
    postedContent: 0,
    pendingReview: 9,
    waitingBrandSelection: 2,
    brandQuota: 6,
    teamSubmitted: 10,
    ownerApproved: 4,
    brandSelected: 1,
    dueDate: '25 ก.ค. 2026',
    budget: '฿260,000',
  },
]

export const influencers = [
  {
    id: 'inf-001',
    name: 'Nara Narin',
    channel: 'tiktok.com/@naranarin',
    tier: 'Macro',
    followers: '825K',
    addedBy: 'Staff A',
    dealDate: '05 มิ.ย. 2026',
    status: 'Confirmed',
    draftStatus: 'Draft approved',
    productSent: true,
    postDate: '18 มิ.ย. 2026',
    postLink: 'https://tiktok.com/@naranarin/video/001',
  },
  {
    id: 'inf-002',
    name: 'Beam Eats',
    channel: 'instagram.com/beameats',
    tier: 'Mid',
    followers: '212K',
    addedBy: 'Staff B',
    dealDate: '06 มิ.ย. 2026',
    status: 'Brand selected',
    draftStatus: 'Waiting draft',
    productSent: false,
    postDate: '22 มิ.ย. 2026',
    postLink: '-',
  },
  {
    id: 'inf-003',
    name: 'Ploy Routine',
    channel: 'youtube.com/@ployroutine',
    tier: 'Micro',
    followers: '74K',
    addedBy: 'Staff A',
    dealDate: '08 มิ.ย. 2026',
    status: 'Owner approved',
    draftStatus: 'Draft submitted',
    productSent: true,
    postDate: '24 มิ.ย. 2026',
    postLink: '-',
  },
  {
    id: 'inf-004',
    name: 'Krit Lens',
    channel: 'instagram.com/kritlens',
    tier: 'Mega/KOL',
    followers: '1.4M',
    addedBy: 'Staff B',
    dealDate: '10 มิ.ย. 2026',
    status: 'Waiting owner review',
    draftStatus: 'Waiting draft',
    productSent: false,
    postDate: '28 มิ.ย. 2026',
    postLink: '-',
  },
  {
    id: 'inf-005',
    name: 'Mild Mini',
    channel: 'tiktok.com/@mildmini',
    tier: 'Nano',
    followers: '18K',
    addedBy: 'Staff A',
    dealDate: '11 มิ.ย. 2026',
    status: 'Posted',
    draftStatus: 'Posted',
    productSent: true,
    postDate: '15 มิ.ย. 2026',
    postLink: 'https://tiktok.com/@mildmini/video/005',
  },
]

export const briefVersions = [
  { id: 'brief-v1', version: 'Brief v1', uploadedAt: '01 มิ.ย. 2026', uploadedBy: 'Owner' },
  { id: 'brief-v2', version: 'Brief v2', uploadedAt: '04 มิ.ย. 2026', uploadedBy: 'Brand' },
  { id: 'brief-v3', version: 'Brief v3', uploadedAt: '07 มิ.ย. 2026', uploadedBy: 'Owner' },
]

export const notifications = [
  {
    id: 'noti-1',
    role: 'Staff',
    title: 'Owner คัดผ่านรายชื่อแล้ว',
    message: 'Nara Narin ผ่านการคัดเลือกและพร้อมดำเนินการต่อ',
    unread: true,
    time: '10:20',
  },
  {
    id: 'noti-2',
    role: 'Staff',
    title: 'Owner คัดออกรายชื่อ',
    message: 'Krit Lens ต้องแก้ข้อมูลก่อนส่งอีกครั้ง',
    unread: true,
    time: '09:45',
  },
  {
    id: 'noti-3',
    role: 'Owner',
    title: 'Brand เลือก Influencer เสร็จแล้ว',
    message: 'GlowHaus เลือกครบ 9 จาก 12 รายชื่อ',
    unread: true,
    time: '11:05',
  },
  {
    id: 'noti-4',
    role: 'Brand',
    title: 'มีรายชื่อใหม่ให้ตรวจ',
    message: 'ทีมส่ง Influencer ใหม่ 4 รายชื่อใน Summer Glow Launch',
    unread: true,
    time: '08:30',
  },
]

export const activities = [
  { id: 'act-1', user: 'Staff A', action: 'เพิ่ม Influencer Nara Narin', time: '16 มิ.ย. 2026 09:15' },
  { id: 'act-2', user: 'Owner', action: 'อนุมัติ Influencer Ploy Routine', time: '16 มิ.ย. 2026 10:05' },
  { id: 'act-3', user: 'Owner', action: 'ปฏิเสธ Influencer Krit Lens', time: '16 มิ.ย. 2026 10:22' },
  { id: 'act-4', user: 'Brand', action: 'เลือก Influencer Beam Eats', time: '16 มิ.ย. 2026 11:05' },
  { id: 'act-5', user: 'Staff A', action: 'อัปเดตสถานะ Draft ของ Ploy Routine', time: '16 มิ.ย. 2026 13:40' },
  { id: 'act-6', user: 'Staff A', action: 'เพิ่มลิงก์คลิปของ Mild Mini', time: '16 มิ.ย. 2026 15:10' },
]

export const tasks = [
  { id: 'task-1', title: 'ตรวจรายชื่ออินฟลูเอนเซอร์รอบ Owner', owner: 'Owner', due: 'วันนี้', status: 'Waiting owner review' },
  { id: 'task-2', title: 'ส่งคอมเมนต์งานดราฟต์ให้ทีมครีเอเตอร์', owner: 'Staff A', due: 'พรุ่งนี้', status: 'Revision requested' },
  { id: 'task-3', title: 'สรุปรายงานโพสต์สำหรับแบรนด์', owner: 'Staff A', due: 'ศุกร์นี้', status: 'Draft approved' },
]

export const draftStatuses = ['Waiting draft', 'Draft submitted', 'Revision requested', 'Draft approved', 'Posted']

export function getStatusVariant(status) {
  const map = {
    'Waiting owner review': 'warning',
    'Owner approved': 'success',
    'Owner rejected': 'danger',
    'Brand selected': 'info',
    'Brand rejected': 'danger',
    Confirmed: 'success',
    'Waiting draft': 'warning',
    'Draft submitted': 'purple',
    'Revision requested': 'danger',
    'Draft approved': 'success',
    Posted: 'info',
  }

  return map[status] || 'neutral'
}
