import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createBrand,
  createCampaign,
  createInfluencer,
  createUser,
  deleteBrand,
  deleteCampaign,
  deleteUser,
  getDashboardData,
  getPermissions,
  getSession,
  updateBrand,
  updateCampaign,
  updateInfluencer,
  updateUser,
} from '../services/apiClient'

const TIERS = ['Nano', 'Micro', 'Mid', 'Macro', 'Mega']
const TIER_COLOR = {
  Nano: '#0EA5A6',
  Micro: '#3B82F6',
  Mid: '#F59E0B',
  Macro: '#EF4444',
  Mega: '#8B5CF6',
}
const CHANNELS = ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'lemon8']
const CH_LABEL = { instagram: 'IG', tiktok: 'TikTok', youtube: 'YT', facebook: 'FB', twitter: 'X', lemon8: 'Lemon8' }
const CH_CLASS = { instagram: 'ig', tiktok: 'tt', youtube: 'yt', facebook: 'fb', twitter: 'tw', lemon8: 'lemon8' }
const KOL_LEVELS = ['Creator Sales of 5K', 'Nano (1K+ Followers)', 'Micro (10K+ Followers)']
const CONTENT_FORMATS = ['รีวิว 1 คลิป 1 ช่องทางคือTikTok', 'รีวิว 1 คลิป 2ช่องทางขึ้นไป']
const CHANNEL_COUNTS = ['1 ช่องทาง', '2 ช่องทาง', '4 ช่องทาง']
const CLIP_COUNTS = ['1 คลิป']
const CATEGORIES = ['Beauty', 'Health', 'ไลฟ์สไตล์']
const PERIOD_OPTIONS = ['None', '7 days', '30 Days', '60 Days', '90 Days', '120 Days', '150 Days', '180 Days', '1 Year', 'Always', 'NO']
const CF_OPTIONS = ['', 'CF', 'NO']
const DELIVERY_OPTIONS = ['', 'ส่งสินค้าแล้ว', 'สินค้าถึงแล้ว']
const THAI_BANKS = ['ธ.กสิกรไทย', 'ธ.กรุงเทพ', 'ธ.ไทยพาณิชย์', 'ธ.กรุงไทย', 'ธ.ทหารไทยธนชาต', 'Promptpay']
const DEPRECATED_EXTRA_INFO_KEYS = ['sequenceNo', 'ownerName', 'recordDate', 'currentStatus', 'postedDate', 'linkPost', 'asset', 'seniorKolCf', 'brandCf']
const EXTRA_INFO_SECTIONS = [
  {
    title: 'Profile & Deal',
    fields: [
      { name: 'tiktokAccount', label: 'ชื่อ Acc.TikTok(@)' },
      { name: 'contentFormat', label: 'รูปแบบคอนเทนต์', options: CONTENT_FORMATS },
      { name: 'channelCount', label: 'จำนวนช่องทาง', options: CHANNEL_COUNTS },
      { name: 'clipCount', label: 'จำนวนคลิป', options: CLIP_COUNTS },
      { name: 'category', label: 'Category', options: CATEGORIES },
      { name: 'price', label: 'Price', placeholder: 'FREE หรือ จำนวนเงิน' },
    ],
  },
  {
    title: 'Periods & Product',
    fields: [
      { name: 'periodClip', label: 'Peroid Clip', options: PERIOD_OPTIONS },
      { name: 'periodCode', label: 'Period Code', options: PERIOD_OPTIONS },
      { name: 'periodCart', label: 'Period Cart', options: PERIOD_OPTIONS },
      { name: 'buyingAsset', label: 'Buying Asset', placeholder: 'FREE หรือ ฿ 300.00' },
      { name: 'periodAsset', label: 'Period Asset', options: PERIOD_OPTIONS },
      { name: 'products', label: 'Products', options: [''] },
    ],
  },
  {
    title: 'Shipping & Contact',
    fields: [
      { name: 'shippingName', label: 'Name' },
      { name: 'address', label: 'Address', multiline: true },
      { name: 'tel', label: 'Tel.' },
      { name: 'trackingNo', label: 'Tracking NO.' },
      { name: 'delivered', label: 'Delivered', options: DELIVERY_OPTIONS },
      { name: 'kolDeliveredDate', label: 'วันที่สินค้าถึงKOL', type: 'date' },
    ],
  },
  {
    title: 'Draft, Feedback & Posting',
    fields: [
      { name: 'draftDate', label: 'วันที่ ส่งดราฟ', type: 'date' },
      { name: 'draftLink', label: 'Draft', type: 'url' },
      { name: 'kolSpecialistFeedback', label: 'Feedback by KOL Specialist', multiline: true },
      { name: 'confirmDraftByTangkwa', label: 'Comfirm Draft by Tangkwa' },
      { name: 'brandFeedback', label: 'Brand Feedback', options: CF_OPTIONS },
      { name: 'gencode', label: 'Gencode', placeholder: '#campaign-code' },
    ],
  },
  {
    title: 'Approval, Payment & Notes',
    fields: [
      { name: 'commentKol', label: 'Comment Kol', multiline: true },
      { name: 'commentPtee', label: 'Comment PTee', multiline: true },
      { name: 'pteeCf', label: 'PTee CF', options: ['', 'CF'] },
      { name: 'idCardCopy', label: 'สำเนาบัตรประชาชน' },
      { name: 'budget', label: 'Budget', type: 'number' },
      { name: 'clearStatus', label: 'Clear', options: ['', 'นับยอด'] },
    ],
  },
]

const STATUS_MAP = {
  sourced: { label: 'ยังไม่ส่งหัวหน้า', cls: 'muted' },
  pending_owner: { label: 'รอหัวหน้าตรวจ', cls: 'warning' },
  senior_approved: { label: 'Senior อนุมัติ · รอหัวหน้า', cls: 'purple' },
  owner_approved: { label: 'หัวหน้าคัดผ่าน · รอแบรนด์เลือก', cls: 'primary' },
  owner_rejected: { label: 'หัวหน้าคัดออก', cls: 'muted' },
  brand_selected: { label: 'แบรนด์เลือกแล้ว', cls: 'success' },
  brand_rejected: { label: 'แบรนด์ไม่เลือก', cls: 'muted' },
  confirmed: { label: 'ยืนยันแล้ว · กำลังผลิตคอนเทนต์', cls: 'success' },
}

const DRAFT_MAP = {
  waiting: { label: 'รอส่งดราฟ', cls: 'muted' },
  review: { label: 'ส่งดราฟแล้ว · รอตรวจ', cls: 'warning' },
  revise: { label: 'ขอแก้ไขดราฟ', cls: 'danger' },
  approved: { label: 'ดราฟผ่านแล้ว', cls: 'primary' },
  posted: { label: 'ลงคลิปแล้ว', cls: 'success' },
}

const CURRENT_STAFF = 'แนน'

function makeStats(t) {
  return {
    target: t.target,
    sourced: t.sourced,
    ownerApproved: t.oa,
    brandSelected: t.bs,
    confirmed: t.bs,
    posted: t.posted,
  }
}

const DB = {
  brands: [
    {
      id: 'b1',
      name: 'GlowSkin Cosmetics',
      initials: 'GS',
      campaigns: [
        {
          id: 'c1',
          name: 'Hydra Glow Serum — Launch Campaign',
          status: 'กำลังคัดเลือกอินฟลู',
          startDate: '1 ก.ค. 2569',
          deadlineDate: '20 ก.ค. 2569',
          target: 300,
          brandQuota: 300,
          briefFile: 'GlowSkin_HydraGlow_Brief_v2.pdf',
          briefVersion: 'v2',
          campaignSettings: {
            products: ['Hydra Glow Serum', 'GlowSkin Toner', 'GlowSkin Moisture Gel'],
          },
          briefDate: '10 มิ.ย. 2569',
          tierStats: {
            Nano: makeStats({ target: 120, sourced: 135, oa: 125, bs: 115, posted: 58 }),
            Micro: makeStats({ target: 100, sourced: 92, oa: 88, bs: 85, posted: 48 }),
            Mid: makeStats({ target: 50, sourced: 47, oa: 44, bs: 43, posted: 19 }),
            Macro: makeStats({ target: 25, sourced: 21, oa: 19, bs: 18, posted: 7 }),
            Mega: makeStats({ target: 5, sourced: 4, oa: 3, bs: 3, posted: 1 }),
          },
          influencers: [
            { id: 1, name: 'Mai Cosmetic Diary', channels: [{ type: 'instagram', url: 'instagram.com/maicosmeticdiary' }, { type: 'tiktok', url: 'tiktok.com/@maicosmeticdiary' }], tier: 'Nano', followers: '8.4K', addedBy: 'แนน', addedByRole: 'staff', dealDate: '20 มิ.ย. 2569', status: 'confirmed', draft: 'posted', postDate: '5 ก.ค. 2569', postLink: 'instagram.com/p/abc123', assetLink: 'drive.google.com/folders/glowskin01', bank: { name: 'ธ.กสิกรไทย', account: '0123456789', holder: 'นางสาว มาย' }, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 2, name: 'Beauty by Ploy', channels: [{ type: 'tiktok', url: 'tiktok.com/@beautybyploy' }, { type: 'instagram', url: 'instagram.com/beautybyploy' }], tier: 'Micro', followers: '32K', addedBy: 'แนน', addedByRole: 'staff', dealDate: '22 มิ.ย. 2569', status: 'confirmed', draft: 'approved', postDate: '-', postLink: '', assetLink: '', bank: { name: 'ธ.กรุงเทพ', account: '9876543210', holder: 'นางสาว พลอย' }, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 3, name: 'SkinCareGuy', channels: [{ type: 'youtube', url: 'youtube.com/skincareguy' }], tier: 'Nano', followers: '6.1K', addedBy: 'ต้น', addedByRole: 'staff', dealDate: '21 มิ.ย. 2569', status: 'confirmed', draft: 'revise', postDate: '-', postLink: '', assetLink: '', bank: { name: 'ธ.ไทยพาณิชย์', account: '1111222233', holder: 'นาย ต้น' }, seniorApproval: { name: 'พี่ตั้ม', approved: false } },
            { id: 4, name: 'Fah Beauty Talk', channels: [{ type: 'instagram', url: 'instagram.com/fahbeautytalk' }, { type: 'facebook', url: 'facebook.com/fahbeautytalk' }], tier: 'Mid', followers: '88K', addedBy: 'ต้น', addedByRole: 'staff', dealDate: '23 มิ.ย. 2569', status: 'confirmed', draft: 'review', postDate: '-', postLink: '', assetLink: '', bank: { name: 'ธ.กสิกรไทย', account: '5556667778', holder: 'นางสาว ฟ้า' }, seniorApproval: null },
            { id: 5, name: 'Glow with Gam', channels: [{ type: 'tiktok', url: 'tiktok.com/@glowwithgam' }, { type: 'youtube', url: 'youtube.com/glowwithgam' }], tier: 'Macro', followers: '420K', addedBy: 'แนน', addedByRole: 'staff', dealDate: '25 มิ.ย. 2569', status: 'confirmed', draft: 'waiting', postDate: '-', postLink: '', assetLink: '', bank: { name: 'ธ.กรุงไทย', account: '9990001112', holder: 'นางสาว แกม' }, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 6, name: 'The Skin Diary', channels: [{ type: 'instagram', url: 'instagram.com/theskindiary' }, { type: 'lemon8', url: 'lemon8.com/@theskindiary' }], tier: 'Micro', followers: '45K', addedBy: 'บีม', addedByRole: 'staff', dealDate: '-', status: 'brand_selected', draft: '', postDate: '', postLink: '', assetLink: '', bank: null, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 7, name: 'Nicha Reviews', channels: [{ type: 'tiktok', url: 'tiktok.com/@nichareviews' }], tier: 'Nano', followers: '4.2K', addedBy: 'บีม', addedByRole: 'staff', dealDate: '-', status: 'owner_approved', draft: '', postDate: '', postLink: '', assetLink: '', bank: null, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 8, name: 'Cosmetic King', channels: [{ type: 'youtube', url: 'youtube.com/cosmeticking' }, { type: 'tiktok', url: 'tiktok.com/@cosmeticking' }], tier: 'Mega', followers: '1.4M', addedBy: 'หัวหน้า', addedByRole: 'owner', dealDate: '-', status: 'owner_approved', draft: '', postDate: '', postLink: '', assetLink: '', bank: null, seniorApproval: null },
            { id: 9, name: 'Sweet Skin Sara', channels: [{ type: 'instagram', url: 'instagram.com/sweetskinsara' }], tier: 'Micro', followers: '28K', addedBy: 'แนน', addedByRole: 'staff', dealDate: '-', status: 'senior_approved', draft: '', postDate: '', postLink: '', assetLink: '', bank: null, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 10, name: 'Daily Glow TH', channels: [{ type: 'tiktok', url: 'tiktok.com/@dailyglowth' }], tier: 'Nano', followers: '9.8K', addedBy: 'บีม', addedByRole: 'staff', dealDate: '-', status: 'owner_rejected', draft: '', postDate: '', postLink: '', assetLink: '', bank: null, seniorApproval: { name: 'พี่ตั้ม', approved: false } },
          ],
        },
        {
          id: 'c2',
          name: 'Sunscreen SPF50 — Always-on Campaign',
          status: 'กำลังผลิตคอนเทนต์',
          startDate: '15 พ.ค. 2569',
          deadlineDate: '30 มิ.ย. 2569',
          target: 150,
          brandQuota: 150,
          briefFile: 'GlowSkin_SPF50_Brief_v1.pdf',
          briefVersion: 'v1',
          campaignSettings: {
            products: ['SPF50 Sunscreen', 'After Sun Gel'],
          },
          briefDate: '2 พ.ค. 2569',
          tierStats: {
            Nano: makeStats({ target: 60, sourced: 60, oa: 58, bs: 55, posted: 55 }),
            Micro: makeStats({ target: 50, sourced: 50, oa: 48, bs: 47, posted: 45 }),
            Mid: makeStats({ target: 30, sourced: 29, oa: 28, bs: 27, posted: 20 }),
            Macro: makeStats({ target: 8, sourced: 8, oa: 7, bs: 7, posted: 5 }),
            Mega: makeStats({ target: 2, sourced: 2, oa: 2, bs: 2, posted: 1 }),
          },
          influencers: [
            { id: 11, name: 'Aom Sunny Day', channels: [{ type: 'instagram', url: 'instagram.com/aomsunnyday' }], tier: 'Micro', followers: '38K', addedBy: 'แนน', addedByRole: 'staff', dealDate: '5 มิ.ย. 2569', status: 'confirmed', draft: 'posted', postDate: '18 มิ.ย. 2569', postLink: 'instagram.com/p/sun001', assetLink: 'drive.google.com/folders/spf001', bank: { name: 'ธ.กสิกรไทย', account: '1234567890', holder: 'นางสาว อ้อม' }, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 12, name: 'UV Defense TH', channels: [{ type: 'tiktok', url: 'tiktok.com/@uvdefenseth' }], tier: 'Nano', followers: '7.7K', addedBy: 'ต้น', addedByRole: 'staff', dealDate: '4 มิ.ย. 2569', status: 'confirmed', draft: 'posted', postDate: '17 มิ.ย. 2569', postLink: 'tiktok.com/@uvdefenseth/video/9981', assetLink: '', bank: { name: 'ธ.กรุงเทพ', account: '9876500000', holder: 'นาย ยูวี' }, seniorApproval: null },
            { id: 13, name: 'Beach Skin Bun', channels: [{ type: 'instagram', url: 'instagram.com/beachskinbun' }, { type: 'lemon8', url: 'lemon8.com/@beachskinbun' }], tier: 'Mid', followers: '120K', addedBy: 'บีม', addedByRole: 'staff', dealDate: '6 มิ.ย. 2569', status: 'confirmed', draft: 'revise', postDate: '-', postLink: '', assetLink: '', bank: { name: 'ธ.ไทยพาณิชย์', account: '5554443332', holder: 'นางสาว บุน' }, seniorApproval: { name: 'พี่ตั้ม', approved: true } },
            { id: 14, name: 'Plern Beauty Lab', channels: [{ type: 'youtube', url: 'youtube.com/plernbeautylab' }], tier: 'Macro', followers: '310K', addedBy: 'ต้น', addedByRole: 'staff', dealDate: '7 มิ.ย. 2569', status: 'confirmed', draft: 'review', postDate: '-', postLink: '', assetLink: '', bank: { name: 'ธ.กสิกรไทย', account: '3331112220', holder: 'นางสาว เพลิน' }, seniorApproval: null },
            { id: 15, name: 'Cherry Sunscreen Diary', channel: 'tiktok.com/@cherrysunscreen', tier: 'Micro', followers: '21K', addedBy: 'แนน', dealDate: '8 มิ.ย. 2569', status: 'confirmed', draft: 'approved', postDate: '-', postLink: '' },
            { id: 16, name: 'SkinFirst Nat', channel: 'instagram.com/skinfirstnat', tier: 'Nano', followers: '5.5K', addedBy: 'บีม', dealDate: '9 มิ.ย. 2569', status: 'confirmed', draft: 'waiting', postDate: '-', postLink: '' },
          ],
        },
      ],
    },
    {
      id: 'b2',
      name: 'FitFuel Protein',
      initials: 'FF',
      campaigns: [
        {
          id: 'c3',
          name: 'Whey Protein — New Flavor Launch',
          status: 'รอบรีฟจากหัวหน้า',
          startDate: '-',
          deadlineDate: '-',
          target: 80,
          brandQuota: 80,
          briefFile: null,
          briefVersion: null,
          campaignSettings: {
            products: ['Chocolate Whey Protein', 'Matcha Whey Protein', 'Protein Shaker'],
          },
          briefDate: null,
          tierStats: {
            Nano: makeStats({ target: 30, sourced: 0, oa: 0, bs: 0, posted: 0 }),
            Micro: makeStats({ target: 30, sourced: 0, oa: 0, bs: 0, posted: 0 }),
            Mid: makeStats({ target: 15, sourced: 0, oa: 0, bs: 0, posted: 0 }),
            Macro: makeStats({ target: 5, sourced: 0, oa: 0, bs: 0, posted: 0 }),
            Mega: makeStats({ target: 0, sourced: 0, oa: 0, bs: 0, posted: 0 }),
          },
          influencers: [],
        },
      ],
    },
  ],
  seniors: [{ id: 's1', name: 'พี่ตั้ม', role: 'Senior Manager' }, { id: 's2', name: 'พี่นก', role: 'Senior Coordinator' }],
}

const DashboardDataContext = createContext(DB)
const SessionContext = createContext({ user: null, permissions: [] })
const EMPTY_DASHBOARD_DATA = { brands: [], seniors: DB.seniors }

function useDashboardData() {
  return useContext(DashboardDataContext)
}

function useSession() {
  return useContext(SessionContext)
}

function useCan(permissionKey) {
  const { permissions } = useSession()
  return permissions.includes(permissionKey)
}

function totalTier(campaign, key) {
  return TIERS.reduce((sum, tier) => sum + campaign.tierStats[tier][key], 0)
}

function Badge({ children, cls = 'muted' }) {
  return <span className={`badge ${cls}`}>{children}</span>
}

function TierBadge({ tier }) {
  return (
    <span className="badge muted" style={{ background: `${TIER_COLOR[tier]}1A`, color: TIER_COLOR[tier] }}>
      <span className="tier-dot" style={{ background: TIER_COLOR[tier] }} />
      {tier}
    </span>
  )
}

function ProgressBar({ value, max, color = '#4C5FD5' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return <div className="pbar"><div style={{ width: `${pct}%`, background: color }} /></div>
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value" style={tone ? { color: `var(--${tone})` } : undefined}>
        {value} {sub ? <small>{sub}</small> : null}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusData = STATUS_MAP[status]
  return statusData ? <Badge cls={statusData.cls}>{statusData.label}</Badge> : null
}

function DraftBadge({ draft }) {
  const draftData = DRAFT_MAP[draft]
  return draftData ? <Badge cls={draftData.cls}>{draftData.label}</Badge> : <span className="muted-text">—</span>
}

function getChannels(item) {
  if (item.channels?.length) return item.channels.filter((channel) => channel.url)
  if (!item.channel) return []
  const type = item.channel.includes('tiktok') ? 'tiktok' : item.channel.includes('youtube') ? 'youtube' : item.channel.includes('facebook') ? 'facebook' : 'instagram'
  return [{ type, url: item.channel }]
}

function normalizeExternalUrl(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value.replace(/^\/+/, '')}`
}

function getBriefDownloadUrl(briefFile) {
  const value = String(briefFile || '').trim()
  if (!value) return '#'
  if (/^https?:\/\//i.test(value) || value.includes('://')) {
    return value
  }
  if (value.startsWith('/')) {
    return value
  }
  if (value.startsWith('briefs/')) {
    return `/${value.split('/').map(encodeURIComponent).join('/')}`
  }
  if (value.includes('/')) {
    return normalizeExternalUrl(value)
  }
  return `/briefs/${encodeURIComponent(value)}`
}

function getChannelUrlsFromControls(controls, startIndex = 4, count = CHANNELS.length) {
  return controls
    .slice(startIndex, startIndex + count)
    .map((control) => normalizeExternalUrl(control?.value || ''))
    .filter(Boolean)
}

function hasDuplicateInfluencer(campaign, name, channelUrls) {
  const normalizedName = String(name || '').trim().toLowerCase()
  return campaign.influencers.some((item) => {
    const existingName = String(item.name || '').trim().toLowerCase()
    if (existingName && existingName === normalizedName) return true
    const existingChannels = getChannels(item).map((channel) => normalizeExternalUrl(channel.url))
    return channelUrls.some((url) => existingChannels.includes(url))
  })
}

function getChannelUrl(item, type) {
  return getChannels(item).find((channel) => channel.type === type)?.url || ''
}

function buildUpdatedChannels(item, values) {
  const byType = new Map(getChannels(item).map((channel) => [channel.type, channel.url]))
  Object.entries(values).forEach(([type, url]) => {
    const value = String(url || '').trim()
    if (value) byType.set(type, value)
    else byType.delete(type)
  })
  return [...byType.entries()].map(([type, url]) => ({ type, url }))
}

function getExtraInfoFromForm(formData) {
  return Object.fromEntries(
    EXTRA_INFO_SECTIONS
      .flatMap((section) => section.fields)
      .map((field) => [field.name, String(formData.get(field.name) || '').trim()])
      .filter(([, value]) => value !== ''),
  )
}

function mergeExtraInfo(current, next) {
  const merged = { ...(current || {}), ...next }
  DEPRECATED_EXTRA_INFO_KEYS.forEach((key) => {
    delete merged[key]
  })
  Object.keys(merged).forEach((key) => {
    if (merged[key] === '') delete merged[key]
  })
  return Object.keys(merged).length ? merged : null
}

function parseOptionLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getCampaignProductOptions(campaign) {
  return ['', ...(campaign?.campaignSettings?.products || [])]
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function BackButton({ onClick, label = 'ย้อนกลับ' }) {
  return <button className="btn secondary" onClick={onClick} type="button">← {label}</button>
}

function ChannelPills({ item }) {
  const channels = getChannels(item)
  if (!channels.length) return <span className="muted-text">ไม่มีข้อมูล</span>
  return (
    <div className="channel-pills">
      {channels.map((channel) => {
        const href = normalizeExternalUrl(channel.url)
        if (!href) return null
        return (
        <a className={`ch-pill ${CH_CLASS[channel.type] || ''}`} href={href} key={`${channel.type}-${channel.url}`} rel="noopener noreferrer" target="_blank">
          {CH_LABEL[channel.type] || channel.type}
        </a>
        )
      })}
    </div>
  )
}

function BankChip({ bank }) {
  if (!bank) return <span className="muted-text">ยังไม่ได้ใส่</span>
  return <span className="bank-chip">{bank.name} · {bank.account}</span>
}

function SeniorChip({ approval }) {
  if (!approval) return <span className="muted-text">—</span>
  return approval.approved ? <span className="senior-chip">✓ {approval.name}</span> : <Badge cls="muted">✗ {approval.name}</Badge>
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="card">
      <div className="empty">
        <div className="icon">{icon}</div>
        <div className="title">{title}</div>
        <div>{desc}</div>
      </div>
    </div>
  )
}

function CampaignCard({ campaign, children, badge, onClick }) {
  return (
    <button className="camp-card" onClick={onClick} type="button">
      <div className="top">
        <div>
          <h3>{campaign.name}</h3>
          <div className="meta">{campaign.meta}</div>
        </div>
        {badge}
      </div>
      {children}
    </button>
  )
}

function getInitialRole() {
  const storedRole = localStorage.getItem('agencyhub-role')
  const roleMap = {
    Brand: 'brand',
    Owner: 'owner',
    Staff: 'staff',
    brand: 'brand',
    owner: 'owner',
    staff: 'staff',
  }
  return roleMap[storedRole] || 'brand'
}

function MockupDashboard() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD_DATA)
  const [session, setSession] = useState({ user: null, permissions: [] })
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')
  const [state, setState] = useState(() => {
    const role = getInitialRole()
    return { role, view: 'dashboard', brandId: null, campaignId: null, tab: role === 'owner' ? 'review' : 'source' }
  })
  const [selectedCandidateIds, setSelectedCandidateIds] = useState(() => new Set())
  const [modal, setModal] = useState(null)
  const allCampaigns = useMemo(
    () => dashboardData.brands.flatMap((brand) => brand.campaigns.map((campaign) => ({ ...campaign, brandName: brand.name, brandId: brand.id }))),
    [dashboardData],
  )

  useEffect(() => {
    let cancelled = false

    Promise.all([getSession(), getDashboardData()])
      .then(([sessionData, data]) => {
        if (cancelled) return
        const user = sessionData?.user || null
        const permissions = sessionData?.permissions || user?.permissions || []
        setSession({ user, permissions })
        localStorage.setItem('agencyhub-permissions', JSON.stringify(permissions))
        if (user?.role) {
          const nextRole = getInitialRole()
          setState((current) => ({ ...current, role: nextRole, tab: nextRole === 'owner' ? 'review' : current.tab }))
        }
        if (data?.brands) {
          setDashboardData({ brands: data.brands || [], seniors: data.seniors || DB.seniors })
        }
        setDataError('')
      })
      .catch((error) => {
        if (!cancelled) setDataError(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function refreshDashboardData() {
    return getDashboardData().then((data) => {
      if (data?.brands) setDashboardData({ brands: data.brands || [], seniors: data.seniors || DB.seniors })
    })
  }

  function go(next) {
    setState((current) => ({ ...current, ...next }))
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  function logout() {
    localStorage.removeItem('agencyhub-role')
    localStorage.removeItem('agencyhub-user-id')
    localStorage.removeItem('agencyhub-permissions')
    navigate('/login')
  }

  function getBrand(id) {
    return dashboardData.brands.find((brand) => brand.id === id)
  }

  function getCampaign(brandId, campaignId) {
    return getBrand(brandId)?.campaigns.find((campaign) => campaign.id === campaignId)
  }

  const crumbs = getCrumbs(state)

  return (
    <SessionContext.Provider value={session}>
    <DashboardDataContext.Provider value={dashboardData}>
      <div className="agency-mockup">
        <div className="mockup-app">
        <div className="mockup-topbar">
          <div className="logo">
            <div className="logo-mark">A</div>
            <div>
              <div className="logo-text">AgencyHub</div>
              <div className="logo-sub">ระบบจัดการแคมเปญอินฟลูเอนเซอร์</div>
            </div>
          </div>
          <div className="mockup-nav">
            <button className="btn secondary" onClick={logout} type="button">ออกจากระบบ</button>
          </div>
        </div>

        <div className="mockup-breadcrumb">
          {crumbs.map((crumb, index) => (
            <span className="crumb-part" key={crumb.label}>
              {index > 0 ? <span className="sep">›</span> : null}
              <button className={index === crumbs.length - 1 ? 'current' : ''} disabled={index === crumbs.length - 1} onClick={() => crumb.action?.()} type="button">
                {crumb.label}
              </button>
            </span>
          ))}
        </div>

        {loadingData ? <div className="note-banner">กำลังโหลดข้อมูลจาก Backend API...</div> : null}
        {dataError ? <div className="note-banner">ใช้ข้อมูลสำรองในหน้า เพราะเรียก API ไม่สำเร็จ: {dataError}</div> : null}

        <main>
          {!loadingData && !dashboardData.brands.length ? (
            <EmptyState icon="ข้อมูล" title="ยังไม่มีข้อมูลในระบบ" desc="ฐานข้อมูลเชื่อมต่อแล้ว แต่ยังไม่มีแบรนด์หรือแคมเปญ กรุณาเพิ่มข้อมูลจริงก่อนเริ่มใช้งาน" />
          ) : null}

          {dashboardData.brands.length > 0 && state.role === 'brand' && (state.view === 'dashboard'
            ? <BrandDashboard go={go} />
            : <BrandCampaign campaign={getCampaign(dashboardData.brands[0].id, state.campaignId)} selectedCandidateIds={selectedCandidateIds} setSelectedCandidateIds={setSelectedCandidateIds} state={state} go={go} refreshDashboardData={refreshDashboardData} />)}

          {state.role === 'owner' && (state.view === 'dashboard'
            ? <OwnerDashboard allCampaigns={allCampaigns} go={go} openModal={setModal} refreshDashboardData={refreshDashboardData} />
            : dashboardData.brands.length > 0 && state.view === 'brand'
              ? <OwnerBrand brand={getBrand(state.brandId)} go={go} openModal={setModal} refreshDashboardData={refreshDashboardData} />
              : <OwnerCampaign brand={getBrand(state.brandId)} campaign={getCampaign(state.brandId, state.campaignId)} state={state} go={go} openModal={setModal} refreshDashboardData={refreshDashboardData} />)}

          {dashboardData.brands.length > 0 && state.role === 'staff' && (state.view === 'dashboard'
            ? <StaffDashboard allCampaigns={allCampaigns} go={go} />
            : state.view === 'brand'
              ? <StaffBrand brand={getBrand(state.brandId)} go={go} />
              : <StaffCampaign brand={getBrand(state.brandId)} campaign={getCampaign(state.brandId, state.campaignId)} state={state} go={go} refreshDashboardData={refreshDashboardData} />)}
        </main>
        {modal ? <MockupModal context={modal} onSaved={refreshDashboardData} type={typeof modal === 'string' ? modal : modal.type} onClose={() => setModal(null)} /> : null}
      </div>
    </div>
    </DashboardDataContext.Provider>
    </SessionContext.Provider>
  )

  function getCrumbs(current) {
    const dashboardLabel = current.role === 'brand' ? 'แคมเปญของฉัน' : current.role === 'owner' ? 'แบรนด์ทั้งหมด' : 'แบรนด์ของฉัน'
    const list = [{ label: dashboardLabel, action: () => go({ view: 'dashboard', brandId: null, campaignId: null }) }]
    if (current.brandId && current.role !== 'brand') {
      list.push({ label: getBrand(current.brandId).name, action: () => go({ view: 'brand', campaignId: null }) })
    }
    if (current.campaignId) {
      if (!dashboardData.brands.length) return list
      const brandId = current.brandId || dashboardData.brands[0].id
      list.push({ label: getCampaign(brandId, current.campaignId).name })
    }
    return list
  }
}

function BrandDashboard({ go }) {
  const db = useDashboardData()
  const brand = db.brands[0]
  const allTarget = brand.campaigns.reduce((sum, campaign) => sum + campaign.target, 0)
  const allSelected = brand.campaigns.reduce((sum, campaign) => sum + totalTier(campaign, 'brandSelected'), 0)
  const allPosted = brand.campaigns.reduce((sum, campaign) => sum + totalTier(campaign, 'posted'), 0)

  return (
    <>
      <h1 className="page-title">สวัสดี, {brand.name}</h1>
      <p className="page-sub">ภาพรวมทุกแคมเปญของคุณ และสถานะการคัดเลือก/ลงคอนเทนต์ของอินฟลูเอนเซอร์</p>
      <div className="grid cols-3 block-gap">
        <Stat label="แคมเปญทั้งหมด" value={brand.campaigns.length} />
        <Stat label="อินฟลูที่ยืนยันแล้ว (ทุกแคมเปญ)" value={allSelected} sub={`/ ${allTarget}`} />
        <Stat label="ลงคลิปแล้วรวม" value={allPosted} sub={`/ ${allSelected}`} />
      </div>
      <div className="section-title">แคมเปญของคุณ</div>
      <div className="grid cols-2">
        {brand.campaigns.map((campaign) => {
          const selected = totalTier(campaign, 'brandSelected')
          const posted = totalTier(campaign, 'posted')
          const pendingForBrand = totalTier(campaign, 'ownerApproved') - selected
          return (
            <CampaignCard
              campaign={{ ...campaign, meta: `เริ่มลงคลิป ${campaign.startDate} · ครบกำหนด ${campaign.deadlineDate}` }}
              badge={pendingForBrand > 0 ? <Badge cls="warning">{pendingForBrand} รายชื่อรอคุณตรวจ</Badge> : <Badge cls="primary">{campaign.status}</Badge>}
              key={campaign.id}
              onClick={() => go({ view: 'campaign', brandId: brand.id, campaignId: campaign.id, tab: 'select' })}
            >
              <ProgressMetric label="ยืนยันแล้ว" value={selected} max={campaign.target} />
              <ProgressMetric color="#1E9E5C" label="ลงคลิปแล้ว" value={posted} max={selected} />
            </CampaignCard>
          )
        })}
      </div>
    </>
  )
}

function BrandCampaign({ campaign, selectedCandidateIds, setSelectedCandidateIds, state, go, refreshDashboardData }) {
  return (
    <>
      <BackButton onClick={() => go({ view: 'dashboard', campaignId: null })} />
      <h1 className="page-title">{campaign.name}</h1>
      <p className="page-sub">
        {campaign.status} · เริ่มลงคลิป {campaign.startDate} · ครบกำหนด {campaign.deadlineDate}
        {campaign.briefFile ? <> · <a className="link" href={getBriefDownloadUrl(campaign.briefFile)} target="_blank" rel="noopener noreferrer">ดาวน์โหลดบรีฟ ({campaign.briefVersion})</a></> : null}
      </p>
      <Tabs tabs={[['select', 'คัดเลือกอินฟลูเอนเซอร์'], ['progress', 'ความคืบหน้าการลงคลิป']]} active={state.tab} onChange={(tab) => go({ tab })} />
      {state.tab === 'select'
        ? <BrandSelectTab campaign={campaign} refreshDashboardData={refreshDashboardData} selectedCandidateIds={selectedCandidateIds} setSelectedCandidateIds={setSelectedCandidateIds} />
        : <BrandProgressTab campaign={campaign} />}
    </>
  )
}

function BrandSelectTab({ campaign, refreshDashboardData, selectedCandidateIds, setSelectedCandidateIds }) {
  const canSelect = useCan('influencer.brand_select')
  const selected = totalTier(campaign, 'brandSelected')
  const submitted = totalTier(campaign, 'sourced')
  const candidates = campaign.influencers.filter((item) => item.status === 'owner_approved')
  const checkedCount = campaign.influencers.filter((item) => item.status === 'brand_selected').length + candidates.filter((item) => selectedCandidateIds.has(item.id)).length
  const remaining = Math.max(0, campaign.brandQuota - checkedCount)

  function toggleCandidate(id) {
    setSelectedCandidateIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function confirmSelectedCandidates() {
    const ids = candidates
      .filter((item) => selectedCandidateIds.has(item.id))
      .map((item) => item.id)

    if (!ids.length) {
      alert('ยังไม่มีรายชื่อใหม่ที่เลือกเพิ่ม')
      return
    }

    try {
      if (!canSelect) {
        alert('ไม่มีสิทธิ์คัดเลือกอินฟลูเอนเซอร์')
        return
      }
      await Promise.all(ids.map((id) => updateInfluencer(id, { status: 'brand_selected' })))
      setSelectedCandidateIds(new Set())
      await refreshDashboardData()
      alert('บันทึกผลการคัดเลือกลง Database แล้ว')
    } catch (error) {
      alert(`ยังบันทึกไม่ได้: ${error.message}`)
    }
  }

  return (
    <>
      <div className="note-banner">โควต้าที่คุณสามารถเลือกได้สูงสุด <b>{campaign.brandQuota} คน</b> (กำหนดโดยทีม) — ตอนนี้เลือกแล้ว <b>{checkedCount}</b> คน เหลือเลือกได้อีก <b>{remaining}</b> คน</div>
      <div className="grid cols-4 block-gap">
        <Stat label="ต้องการทั้งหมด" value={campaign.target} />
        <Stat label="ทีมส่งรายชื่อมาแล้ว" value={submitted} />
        <Stat label="หัวหน้าคัดผ่าน (รอคุณเลือก)" value={totalTier(campaign, 'ownerApproved')} />
        <Stat label="คุณคัดเลือกแล้ว" value={selected} sub={`/ ${campaign.brandQuota}`} />
      </div>
      <TierSummaryTable campaign={campaign} />
      <div className="card">
        <div className="flex-between table-heading">
          <div className="section-title no-margin">รายชื่อรอการคัดเลือก <span className="hint">ติ๊กเพื่อเลือก / ยกเลิกการเลือก</span></div>
          {canSelect ? <button className="btn primary" onClick={confirmSelectedCandidates} type="button">ยืนยันรายชื่อที่เลือก</button> : null}
        </div>
        <div className="table-wrap">
          <table>
            <tbody>
              <tr><th></th><th>ชื่อ/ช่องทาง</th><th>ระดับ</th><th>ผู้ติดตาม</th><th>สถานะ</th></tr>
              {candidates.map((item) => {
                const checked = selectedCandidateIds.has(item.id)
                return (
                  <tr key={item.id}>
                    <td><input checked={checked} disabled={!canSelect || (!checked && checkedCount >= campaign.brandQuota)} onChange={() => toggleCandidate(item.id)} type="checkbox" /></td>
                    <td><div className="cell-name">{item.name}</div><ChannelPills item={item} /></td>
                    <td><TierBadge tier={item.tier} /></td>
                    <td className="followers">{item.followers}</td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="muted-text table-note">* ตัวอย่างแสดง {candidates.length} รายชื่อ จากทั้งหมด {totalTier(campaign, 'ownerApproved')} รายชื่อที่หัวหน้าคัดผ่านแล้ว</div>
      </div>
    </>
  )
}

function BrandProgressTab({ campaign }) {
  const rows = campaign.influencers.filter((item) => item.status === 'brand_selected' || item.status === 'confirmed')
  return <InfluencerProgressTable rows={rows} />
}

function OwnerDashboard({ allCampaigns, go, openModal, refreshDashboardData }) {
  const db = useDashboardData()
  const canWriteBrand = useCan('brand.write')
  const sumTarget = allCampaigns.reduce((sum, campaign) => sum + campaign.target, 0)
  const sumConfirmed = allCampaigns.reduce((sum, campaign) => sum + totalTier(campaign, 'brandSelected'), 0)
  const pendingReview = allCampaigns.reduce((sum, campaign) => sum + campaign.influencers.filter((item) => item.status === 'pending_owner' || item.status === 'senior_approved').length, 0)

  return (
    <>
      <div className="flex-between owner-head">
        <div>
          <h1 className="page-title">ภาพรวมทั้งหมด</h1>
          <p className="page-sub no-margin">สรุปทุกแบรนด์และแคมเปญที่กำลังดำเนินการ</p>
        </div>
        {canWriteBrand ? <button className="btn primary" onClick={() => openModal('brand')} type="button">+ เพิ่มแบรนด์ใหม่</button> : null}
      </div>
      <div className="grid cols-4 block-gap owner-stats">
        <Stat label="แบรนด์ที่ดูแล" value={db.brands.length} />
        <Stat label="แคมเปญทั้งหมด" value={allCampaigns.length} />
        <Stat label="อินฟลูยืนยันแล้ว / เป้า" value={sumConfirmed} sub={`/ ${sumTarget}`} />
        <Stat label="รอหัวหน้าตรวจ" value={pendingReview} tone="warning" />
      </div>
      <SeniorReviewerPanel openModal={openModal} refreshDashboardData={refreshDashboardData} />
      <div className="section-title">รายชื่อแบรนด์</div>
      <div className="grid cols-2">
        {db.brands.map((brand) => {
          const target = brand.campaigns.reduce((sum, campaign) => sum + campaign.target, 0)
          const selected = brand.campaigns.reduce((sum, campaign) => sum + totalTier(campaign, 'brandSelected'), 0)
          const pending = brand.campaigns.reduce((sum, campaign) => sum + campaign.influencers.filter((item) => item.status === 'pending_owner' || item.status === 'senior_approved').length, 0)
          return (
            <CampaignCard
              campaign={{ ...brand, meta: `${brand.campaigns.length} แคมเปญ` }}
              badge={pending > 0 ? <Badge cls="warning">{pending} รอตรวจ</Badge> : <Badge>อัปเดตล่าสุด</Badge>}
              key={brand.id}
              onClick={() => go({ view: 'brand', brandId: brand.id })}
            >
              <ProgressMetric label="ยืนยันแล้ว" value={selected} max={target} />
            </CampaignCard>
          )
        })}
        {canWriteBrand ? <button className="add-brand-card" onClick={() => openModal('brand')} type="button"><span>+</span> เพิ่มแบรนด์ใหม่</button> : null}
      </div>
    </>
  )
}

function SeniorReviewerPanel({ openModal, refreshDashboardData }) {
  const db = useDashboardData()
  const canManageEmployees = useCan('employee.manage')
  const canManagePermissions = useCan('permission.manage')

  async function togglePermission(user, permissionKey) {
    const currentPermissions = user.permissions || []
    const permissions = currentPermissions.includes(permissionKey)
      ? currentPermissions.filter((key) => key !== permissionKey)
      : [...currentPermissions, permissionKey]

    try {
      await updateUser(user.id, { permissions })
      await refreshDashboardData?.()
    } catch (error) {
      alert(`บันทึกสิทธิ์ไม่ได้: ${error.message}`)
    }
  }

  async function disableUser(user) {
    try {
      await updateUser(user.id, { active: false })
      await refreshDashboardData?.()
    } catch (error) {
      alert(`ปิดใช้งานพนักงานไม่ได้: ${error.message}`)
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`ลบพนักงาน "${user.name}" หรือไม่?`)) return
    try {
      await deleteUser(user.id)
      await refreshDashboardData?.()
    } catch (error) {
      alert(`ลบพนักงานไม่ได้: ${error.message}`)
    }
  }

  return (
    <div className="card block-gap">
      <div className="flex-between table-heading">
        <div className="section-title no-margin">Senior Reviewer <span className="hint">ได้รับสิทธิ์ช่วยคัดเลือกก่อนถึงหัวหน้า</span></div>
        {canManageEmployees ? <button className="btn secondary sm" onClick={() => openModal('senior')} type="button">จัดการสิทธิ์</button> : null}
      </div>
      <div className="senior-list">
        {db.seniors.map((senior) => (
          <div className="senior-card" key={senior.id}>
            <div className="senior-avatar">{senior.name.slice(-1)}</div>
            <div>
              <div className="cell-name">{senior.name}</div>
              <div className="cell-sub">{senior.role}</div>
            </div>
            <Badge cls={senior.permissions?.includes('influencer.review') ? 'purple' : 'muted'}>{senior.permissions?.includes('influencer.review') ? '✓ มีสิทธิ์คัด' : 'ไม่มีสิทธิ์คัด'}</Badge>
            {canManagePermissions ? <button className="btn xs secondary" onClick={() => togglePermission(senior, 'influencer.review')} type="button">{senior.permissions?.includes('influencer.review') ? 'ถอนสิทธิ์คัด' : 'ให้สิทธิ์คัด'}</button> : null}
            {canManageEmployees && senior.id !== 'owner' ? <button className="btn xs secondary" onClick={() => disableUser(senior)} type="button">ปิดใช้งาน</button> : null}
            {canManageEmployees && senior.id !== 'owner' ? <button className="btn xs danger-btn" onClick={() => removeUser(senior)} type="button">ลบ</button> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function OwnerBrand({ brand, go, openModal, refreshDashboardData }) {
  const canWriteBrand = useCan('brand.write')
  const canDeleteBrand = useCan('brand.delete')
  const canWriteCampaign = useCan('campaign.write')

  async function handleEditBrand() {
    const name = window.prompt('ชื่อแบรนด์', brand.name)
    if (!name || name === brand.name) return

    try {
      await updateBrand(brand.id, { name })
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังแก้ไขแบรนด์ไม่ได้: ${error.message}`)
    }
  }

  async function handleDeleteBrand() {
    const confirmed = window.confirm(`ลบแบรนด์ "${brand.name}" และแคมเปญทั้งหมดของแบรนด์นี้หรือไม่?`)
    if (!confirmed) return

    try {
      await deleteBrand(brand.id)
      await refreshDashboardData()
      go({ view: 'dashboard', brandId: null, campaignId: null })
    } catch (error) {
      alert(`ยังลบแบรนด์ไม่ได้: ${error.message}`)
    }
  }

  return (
    <>
      <div className="flex-between">
        <div>
          <BackButton onClick={() => go({ view: 'dashboard', brandId: null, campaignId: null })} />
          <h1 className="page-title">{brand.name}</h1>
          <p className="page-sub">แคมเปญทั้งหมดของแบรนด์นี้</p>
        </div>
      </div>
      <div className="actions-inline block-gap">
        {canWriteBrand ? <button className="btn secondary" onClick={handleEditBrand} type="button">แก้ไขแบรนด์</button> : null}
        {canDeleteBrand ? <button className="btn danger-btn" onClick={handleDeleteBrand} type="button">ลบแบรนด์</button> : null}
        {canWriteCampaign ? <button className="btn primary" onClick={() => openModal({ type: 'campaign', brand })} type="button">+ สร้างแคมเปญใหม่</button> : null}
      </div>
      {!brand.campaigns.length ? (
        <EmptyState icon="แคมเปญ" title="ยังไม่มีแคมเปญของแบรนด์นี้" desc="กดสร้างแคมเปญใหม่เพื่อเริ่มเพิ่มข้อมูลจริงลง Database" />
      ) : null}
      <div className="grid cols-2">
        {brand.campaigns.map((campaign) => {
          const confirmed = totalTier(campaign, 'brandSelected')
          const posted = totalTier(campaign, 'posted')
          const pending = campaign.influencers.filter((item) => item.status === 'pending_owner').length
          return (
            <CampaignCard
              campaign={{ ...campaign, meta: `เริ่มลงคลิป ${campaign.startDate} · ครบกำหนด ${campaign.deadlineDate}` }}
              badge={pending > 0 ? <Badge cls="warning">{pending} รอตรวจ</Badge> : <Badge cls="primary">{campaign.status}</Badge>}
              key={campaign.id}
              onClick={() => go({ view: 'campaign', campaignId: campaign.id, tab: 'review' })}
            >
              <ProgressMetric label="ยืนยันแล้ว / เป้า" value={confirmed} max={campaign.target} />
              <ProgressMetric color="#1E9E5C" label="ลงคลิปแล้ว" value={posted} max={confirmed} />
            </CampaignCard>
          )
        })}
      </div>
    </>
  )
}

function OwnerCampaign({ brand, campaign, state, go, openModal, refreshDashboardData }) {
  const canWriteCampaign = useCan('campaign.write')

  async function handleDeleteCampaign() {
    if (!window.confirm(`ลบแคมเปญ "${campaign.name}" และรายชื่อ influencer ทั้งหมดในแคมเปญนี้?`)) return

    try {
      await deleteCampaign(campaign.id)
      await refreshDashboardData()
      go({ view: 'brand', brandId: brand.id, campaignId: null, tab: 'review' })
    } catch (error) {
      alert(`ยังลบแคมเปญไม่ได้: ${error.message}`)
    }
  }

  return (
    <>
      <div className="flex-between">
        <div>
          <BackButton onClick={() => go({ view: 'brand', brandId: brand.id, campaignId: null })} />
          <h1 className="page-title">{campaign.name}</h1>
        </div>
        {canWriteCampaign ? <button className="btn danger-btn" onClick={handleDeleteCampaign} type="button">ลบแคมเปญ</button> : null}
      </div>
      <p className="page-sub">
        {brand.name} · {campaign.status} · เริ่มลงคลิป {campaign.startDate} · ครบกำหนด {campaign.deadlineDate}
        {campaign.briefFile ? <> · <a className="link" href={getBriefDownloadUrl(campaign.briefFile)} target="_blank" rel="noopener noreferrer">ดาวน์โหลดบรีฟ ({campaign.briefVersion})</a></> : null}
      </p>
      <Tabs tabs={[['review', 'ตรวจรายชื่อจากทีม'], ['setup', 'บรีฟ & เป้าหมาย'], ['prod', 'ภาพรวมการผลิตคอนเทนต์']]} active={state.tab} onChange={(tab) => go({ tab })} />
      {state.tab === 'review' ? <OwnerReviewTab campaign={campaign} refreshDashboardData={refreshDashboardData} /> : state.tab === 'setup' ? <OwnerSetupTab campaign={campaign} openModal={openModal} refreshDashboardData={refreshDashboardData} /> : <OwnerProductionTab campaign={campaign} />}
    </>
  )
}

function OwnerReviewTab({ campaign, refreshDashboardData }) {
  const canReview = useCan('influencer.review')
  const canCreateInfluencer = useCan('influencer.create')
  const [selectedReviewIds, setSelectedReviewIds] = useState(() => new Set())
  const pending = campaign.influencers.filter((item) => item.status === 'pending_owner' || item.status === 'senior_approved')
  const approvedWaitingBrand = campaign.influencers.filter((item) => item.status === 'owner_approved')
  const selectedByBrand = campaign.influencers.filter((item) => item.status === 'brand_selected')
  const seniorApprovedCount = pending.filter((item) => item.status === 'senior_approved').length

  async function patchInfluencer(id, values, successMessage) {
    try {
      if (!canReview) {
        alert('ไม่มีสิทธิ์ตรวจรายชื่อ')
        return
      }
      await updateInfluencer(id, values)
      await refreshDashboardData()
      alert(successMessage)
    } catch (error) {
      alert(`ยังบันทึกไม่ได้: ${error.message}`)
    }
  }

  async function confirmSelectedByBrand() {
    try {
      if (!canReview) {
        alert('ไม่มีสิทธิ์ยืนยันรายชื่อ')
        return
      }
      await Promise.all(selectedByBrand.map((item) => updateInfluencer(item.id, { status: 'confirmed' })))
      await refreshDashboardData()
      alert('ยืนยันรายชื่อสุดท้ายลง Database แล้ว')
    } catch (error) {
      alert(`ยังบันทึกไม่ได้: ${error.message}`)
    }
  }

  async function approveSeniorApproved() {
    const rows = pending.filter((item) => item.status === 'senior_approved')
    if (!rows.length) return

    try {
      if (!canReview) {
        alert('ไม่มีสิทธิ์ตรวจรายชื่อ')
        return
      }
      await Promise.all(rows.map((item) => updateInfluencer(item.id, { status: 'owner_approved' })))
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังบันทึกไม่ได้: ${error.message}`)
    }
  }

  function toggleReviewSelection(id) {
    setSelectedReviewIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllReviewSelection() {
    setSelectedReviewIds((current) => {
      const selectableIds = pending.map((item) => item.id)
      const allSelected = selectableIds.length > 0 && selectableIds.every((id) => current.has(id))
      return new Set(allSelected ? [] : selectableIds)
    })
  }

  async function approveSelectedForBrand() {
    const rows = pending.filter((item) => selectedReviewIds.has(item.id))
    if (!rows.length) {
      alert('ยังไม่ได้เลือกรายชื่อ')
      return
    }

    try {
      if (!canReview) {
        alert('ไม่มีสิทธิ์ตรวจรายชื่อ')
        return
      }
      await Promise.all(rows.map((item) => updateInfluencer(item.id, { status: 'owner_approved' })))
      setSelectedReviewIds(new Set())
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังบันทึกไม่ได้: ${error.message}`)
    }
  }

  return (
    <>
      <div className="grid cols-4 block-gap">
        <Stat label="เป้าหมายรวม" value={campaign.target} />
        <Stat label="ทีมส่งมาแล้ว" value={totalTier(campaign, 'sourced')} />
        <Stat label="ส่งให้แบรนด์แล้ว" value={totalTier(campaign, 'ownerApproved')} />
        <Stat label="แบรนด์ยืนยันแล้ว" value={totalTier(campaign, 'brandSelected')} sub={`/ ${campaign.brandQuota}`} />
      </div>
      {canCreateInfluencer ? <OwnerAddInfluencerForm campaign={campaign} refreshDashboardData={refreshDashboardData} /> : null}
      {canReview ? <ReviewCard
        onApprove={(id) => patchInfluencer(id, { status: 'owner_approved' }, 'คัดผ่านและบันทึกลง Database แล้ว')}
        onReject={(id) => patchInfluencer(id, { status: 'owner_rejected' }, 'คัดออกและบันทึกลง Database แล้ว')}
        rows={pending}
        title={<>รายชื่อรอตรวจ ({pending.length}) {seniorApprovedCount ? <span className="senior-chip title-chip">✓ Senior อนุมัติแล้ว {seniorApprovedCount} คน</span> : null}</>}
        actionLabel={selectedReviewIds.size ? 'ส่งที่เลือกให้แบรนด์' : seniorApprovedCount ? 'ส่งที่อนุมัติให้แบรนด์' : ''}
        onAction={selectedReviewIds.size ? approveSelectedForBrand : approveSeniorApproved}
        selectedIds={selectedReviewIds}
        onToggleSelect={toggleReviewSelection}
        onToggleSelectAll={toggleAllReviewSelection}
        showSenior
      /> : null}
      <SimpleInfluencerCard rows={approvedWaitingBrand} title={`ส่งให้แบรนด์แล้ว — รอแบรนด์เลือก (${approvedWaitingBrand.length})`} />
      <SimpleInfluencerCard rows={selectedByBrand} title={`แบรนด์เลือกแล้ว — รอยืนยันสุดท้าย (${selectedByBrand.length})`} actionLabel={canReview && selectedByBrand.length ? 'ยืนยัน & แจ้งทีม' : ''} onAction={confirmSelectedByBrand} showBank />
    </>
  )
}

function OwnerSetupTab({ campaign, openModal, refreshDashboardData }) {
  const db = useDashboardData()
  const canWriteCampaign = useCan('campaign.write')
  const canManageEmployees = useCan('employee.manage')
  const canManagePermissions = useCan('permission.manage')
  const [savingBrief, setSavingBrief] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  async function handleBriefSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get('briefFileUpload')
    const briefUrl = String(formData.get('briefUrl') || '').trim()
    const briefFile = file?.name || briefUrl

    if (!briefFile) {
      alert('กรุณาเลือกไฟล์บรีฟ หรือใส่ Google Doc / URL')
      return
    }

    const currentVersion = Number(String(campaign.briefVersion || 'v0').replace(/\D/g, '')) || 0

    try {
      if (!canWriteCampaign) {
        alert('ไม่มีสิทธิ์แก้ไขแคมเปญ')
        return
      }
      setSavingBrief(true)
      await updateCampaign(campaign.id, {
        briefFile,
        briefVersion: `v${currentVersion + 1}`,
        briefDate: new Date().toISOString().slice(0, 10),
      })
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังบันทึกบรีฟไม่ได้: ${error.message}`)
    } finally {
      setSavingBrief(false)
    }
  }

  async function handleCampaignSettingsSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const products = parseOptionLines(formData.get('products'))

    try {
      if (!canWriteCampaign) {
        alert('ไม่มีสิทธิ์แก้ไขแคมเปญ')
        return
      }
      setSavingSettings(true)
      await updateCampaign(campaign.id, {
        campaignSettings: {
          ...(campaign.campaignSettings || {}),
          products,
        },
      })
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังบันทึกตัวเลือกของแคมเปญไม่ได้: ${error.message}`)
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <>
      <div className="card block-gap">
        <div className="section-title">บรีฟแคมเปญ</div>
        <form className="block-gap" onSubmit={handleBriefSubmit}>
          <div className="grid cols-2 block-gap">
            <div className="field">
              <label>ไฟล์บรีฟ (.txt, .doc, .docx, .pdf)</label>
              <input accept=".txt,.doc,.docx,.pdf" name="briefFileUpload" type="file" />
            </div>
            <Field label="Google Doc / URL บรีฟ" name="briefUrl" placeholder="https://docs.google.com/..." type="url" />
          </div>
          {canWriteCampaign ? <button className="btn secondary" disabled={savingBrief} type="submit">{savingBrief ? 'กำลังบันทึก...' : campaign.briefFile ? 'บันทึกบรีฟเวอร์ชันใหม่' : 'บันทึกบรีฟ'}</button> : null}
        </form>
      </div>
      <div className="card block-gap">
        <div className="section-title">ตัวเลือกให้ทีมใช้ <span className="hint">พนักงานจะเห็นเป็น dropdown ตอนกรอกข้อมูล KOL</span></div>
        <form className="block-gap" onSubmit={handleCampaignSettingsSubmit}>
          <div className="grid cols-2 block-gap">
            <div className="field">
              <label>Products</label>
              <textarea
                defaultValue={(campaign.campaignSettings?.products || []).join('\n')}
                name="products"
                placeholder="ใส่ชื่อสินค้า บรรทัดละ 1 รายการ"
                rows="5"
              />
            </div>
            <div className="note-banner no-margin">
              แนะนำให้หัวหน้ากรอกสินค้าที่ใช้จริงของแคมเปญนี้ก่อนเริ่มหา KOL ถ้าเว้นว่างไว้ ช่อง Products ฝั่งพนักงานจะไม่มีตัวเลือกให้เลือก
            </div>
          </div>
          {canWriteCampaign ? <button className="btn primary" disabled={savingSettings} type="submit">{savingSettings ? 'กำลังบันทึก...' : 'บันทึกตัวเลือก'}</button> : null}
        </form>
      </div>
      <div className="grid cols-2">
        <div className="card">
          <div className="section-title">ไฟล์บรีฟ</div>
          {campaign.briefFile ? (
            <div className="flex-between table-heading">
              <div>
                <div className="cell-name">{campaign.briefFile}</div>
                <div className="cell-sub">เวอร์ชัน {campaign.briefVersion} · อัปโหลดเมื่อ {campaign.briefDate}</div>
              </div>
              <a className="link" href={getBriefDownloadUrl(campaign.briefFile)} target="_blank" rel="noopener noreferrer">ดาวน์โหลด</a>
            </div>
          ) : <EmptyState icon="เอกสาร" title="ยังไม่มีไฟล์บรีฟ" desc="อัปโหลดบรีฟเพื่อให้ทีมเริ่มหาอินฟลูได้" />}
          <button className="btn secondary" onClick={() => alert('เปิดหน้าต่างอัปโหลดบรีฟใหม่')} type="button">{campaign.briefFile ? 'อัปโหลดบรีฟเวอร์ชันใหม่' : 'อัปโหลดบรีฟ'}</button>
        </div>
        <div className="card">
          <div className="section-title">เป้าหมาย & โควต้าการคัดเลือก</div>
          <Field label="จำนวนอินฟลูที่ต้องการทั้งหมด" type="number" value={campaign.target} />
          <Field label="โควต้าที่แบรนด์เลือกได้สูงสุด" type="number" value={campaign.brandQuota} />
          <Field label="วันเริ่มลงคลิป" type="date" />
          <Field label="วันครบกำหนด" type="date" />
          {canWriteCampaign ? <button className="btn primary" onClick={() => alert('บันทึกการตั้งค่าแล้ว')} type="button">บันทึก</button> : null}
        </div>
      </div>
      <div className="card target-card">
        <div className="section-title">เป้าหมายแยกตามระดับอินฟลูเอนเซอร์</div>
        <div className="grid cols-5">
          {TIERS.map((tier) => <Field key={tier} label={tier} type="number" value={campaign.tierStats[tier].target} />)}
        </div>
      </div>
      <div className="card target-card">
        <div className="section-title">Senior Reviewer <span className="hint">ให้สิทธิ์ช่วยคัดรายชื่อก่อนถึงหัวหน้า</span></div>
        {db.seniors.map((senior) => (
          <div className="senior-permission-row" key={senior.id}>
            <div className="senior-person">
              <div className="senior-avatar small">{senior.name.slice(-1)}</div>
              <div>
                <div className="cell-name">{senior.name}</div>
                <div className="cell-sub">{senior.role}</div>
              </div>
            </div>
            <div className="permission-actions">
              <Badge cls="purple">✓ มีสิทธิ์อยู่</Badge>
              {canManagePermissions ? <button className="btn sm danger-btn" onClick={() => updateUser(senior.id, { permissions: (senior.permissions || []).filter((key) => key !== 'influencer.review') }).then(refreshDashboardData)} type="button">ถอนสิทธิ์</button> : null}
            </div>
          </div>
        ))}
        {canManageEmployees ? <button className="btn secondary form-action" onClick={() => openModal('senior')} type="button">+ เพิ่ม Senior Reviewer</button> : null}
      </div>
    </>
  )
}

function OwnerProductionTab({ campaign }) {
  const rows = campaign.influencers.filter((item) => item.status === 'brand_selected' || item.status === 'confirmed')
  const counts = { waiting: 0, review: 0, revise: 0, approved: 0, posted: 0 }
  rows.forEach((row) => { counts[row.draft] += 1 })
  return (
    <>
      <div className="grid cols-5 block-gap">
        {Object.entries(counts).map(([key, value]) => <Stat key={key} label={DRAFT_MAP[key].label} value={value} tone={key === 'review' ? 'warning' : key === 'revise' ? 'danger' : key === 'posted' ? 'success' : undefined} />)}
      </div>
      <InfluencerProgressTable rows={rows} title="รายการอินฟลูที่กำลังผลิตคอนเทนต์" withOwner />
    </>
  )
}

function StaffDashboard({ allCampaigns, go }) {
  const db = useDashboardData()
  const sumFound = allCampaigns.reduce((sum, campaign) => sum + totalTier(campaign, 'sourced'), 0)
  const sumTarget = allCampaigns.reduce((sum, campaign) => sum + campaign.target, 0)
  return (
    <>
      <h1 className="page-title">งานของฉัน</h1>
      <p className="page-sub">เลือกแบรนด์เพื่อดูแคมเปญและบรีฟที่ต้องหาอินฟลู</p>
      <div className="grid cols-3 block-gap">
        <Stat label="แบรนด์ที่ดูแล" value={db.brands.length} />
        <Stat label="แคมเปญทั้งหมด" value={allCampaigns.length} />
        <Stat label="หาได้แล้ว / เป้ารวม" value={sumFound} sub={`/ ${sumTarget}`} />
      </div>
      <div className="grid cols-2">
        {db.brands.map((brand) => {
          const found = brand.campaigns.reduce((sum, campaign) => sum + totalTier(campaign, 'sourced'), 0)
          const target = brand.campaigns.reduce((sum, campaign) => sum + campaign.target, 0)
          return (
            <CampaignCard campaign={{ ...brand, meta: `${brand.campaigns.length} แคมเปญ / บรีฟ` }} key={brand.id} onClick={() => go({ view: 'brand', brandId: brand.id })}>
              <ProgressMetric label="หาได้แล้ว" value={found} max={target} />
            </CampaignCard>
          )
        })}
      </div>
    </>
  )
}

function StaffBrand({ brand, go }) {
  return (
    <>
      <BackButton onClick={() => go({ view: 'dashboard', brandId: null, campaignId: null })} />
      <h1 className="page-title">{brand.name}</h1>
      <p className="page-sub">บรีฟ/แคมเปญทั้งหมดของแบรนด์นี้</p>
      <div className="grid cols-2">
        {brand.campaigns.map((campaign) => (
          <CampaignCard
            campaign={{ ...campaign, meta: campaign.briefFile ? campaign.briefFile : 'ยังไม่มีไฟล์บรีฟ' }}
            badge={<Badge cls="primary">{campaign.status}</Badge>}
            key={campaign.id}
            onClick={() => go({ view: 'campaign', campaignId: campaign.id, tab: 'source' })}
          >
            <ProgressMetric label="หาได้แล้ว" value={totalTier(campaign, 'sourced')} max={campaign.target} />
          </CampaignCard>
        ))}
      </div>
    </>
  )
}

function StaffCampaign({ brand, campaign, state, go, refreshDashboardData }) {
  return (
    <>
      <BackButton onClick={() => go({ view: 'brand', brandId: brand.id, campaignId: null })} />
      <h1 className="page-title">{campaign.name}</h1>
      <p className="page-sub">{brand.name} · {campaign.status} {campaign.briefFile ? <>· <a className="link" href={getBriefDownloadUrl(campaign.briefFile)} target="_blank" rel="noopener noreferrer">ดาวน์โหลดบรีฟ ({campaign.briefVersion})</a></> : '· ยังไม่มีไฟล์บรีฟ'}</p>
      <Tabs tabs={[['source', 'หาอินฟลูเอนเซอร์'], ['track', 'ติดตามงาน / อัปเดตคอนเทนต์']]} active={state.tab} onChange={(tab) => go({ tab })} />
      {state.tab === 'source' ? <StaffSourceTab campaign={campaign} refreshDashboardData={refreshDashboardData} /> : <StaffTrackTab campaign={campaign} refreshDashboardData={refreshDashboardData} />}
    </>
  )
}

function StaffSourceTab({ campaign, refreshDashboardData }) {
  const { user } = useSession()
  const canCreateInfluencer = useCan('influencer.create')
  const [saving, setSaving] = useState(false)
  const [selectedInfluencerIds, setSelectedInfluencerIds] = useState(() => new Set())
  const [editingInfluencer, setEditingInfluencer] = useState(null)
  const lockedSourceStatuses = ['pending_owner', 'senior_approved', 'owner_approved', 'brand_selected', 'confirmed']

  function toggleInfluencerSelection(id) {
    const target = campaign.influencers.find((item) => item.id === id)
    if (!target || lockedSourceStatuses.includes(target.status)) return

    setSelectedInfluencerIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllInfluencerSelection() {
    const selectableIds = campaign.influencers
      .filter((item) => !lockedSourceStatuses.includes(item.status))
      .map((item) => item.id)
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedInfluencerIds.has(id))
    setSelectedInfluencerIds(new Set(allSelected ? [] : selectableIds))
  }

  async function sendSelectedToOwner() {
    const ids = campaign.influencers
      .filter((item) => selectedInfluencerIds.has(item.id) && !lockedSourceStatuses.includes(item.status))
      .map((item) => item.id)

    if (!ids.length) {
      alert('ยังไม่ได้เลือกรายชื่อ')
      return
    }

    try {
      if (!canCreateInfluencer) {
        alert('ไม่มีสิทธิ์ส่งรายชื่อให้หัวหน้า')
        return
      }
      await Promise.all(ids.map((id) => updateInfluencer(id, { status: 'pending_owner' })))
      setSelectedInfluencerIds(new Set())
      await refreshDashboardData()
      alert('ส่งรายชื่อให้หัวหน้าตรวจแล้ว')
    } catch (error) {
      alert(`ยังส่งให้หัวหน้าตรวจไม่ได้: ${error.message}`)
    }
  }

  async function handleAddInfluencer(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    if (!formElement || formElement.tagName !== 'FORM') {
      alert('ไม่พบฟอร์มสำหรับเพิ่มรายชื่อ')
      return
    }
    const formData = new FormData(formElement)
    const controls = Array.from(formElement.querySelectorAll('input, select, textarea'))
    const getValue = (name, index) => formData.get(name) || controls[index]?.value || ''

    try {
      if (!canCreateInfluencer) {
        alert('ไม่มีสิทธิ์เพิ่มอินฟลูเอนเซอร์')
        return
      }
      const influencerName = getValue('name', 0).trim()
      const channelUrls = getChannelUrlsFromControls(controls, 4, CHANNELS.length)
      if (hasDuplicateInfluencer(campaign, influencerName, channelUrls)) {
        alert('ไม่สามารถบันทึกได้ เนื่องจากพบอินฟลูเอนเซอร์นี้ในแคมเปญแล้ว')
        return
      }
      setSaving(true)
      await createInfluencer({
        campaignId: campaign.id,
        name: influencerName,
        tier: getValue('tier', 1),
        followers: getValue('followers', 2),
        dealDate: getValue('dealDate', 3),
        instagram: getValue('instagram', 4),
        tiktok: getValue('tiktok', 5),
        youtube: getValue('youtube', 6),
        facebook: getValue('facebook', 7),
        twitter: getValue('twitter', 8),
        lemon8: getValue('lemon8', 9),
        bankName: getValue('bankName', 10),
        bankAccount: getValue('bankAccount', 11),
        bankOwner: getValue('bankOwner', 12),
        addedBy: user?.name || 'Staff',
        addedByRole: user?.role || 'staff',
        status: 'sourced',
        draft: 'waiting',
        draftStatus: 'Waiting draft',
        extraInfo: getExtraInfoFromForm(formData),
      })
      controls.forEach((control) => {
        if (control.tagName === 'SELECT') control.selectedIndex = 0
        else control.value = ''
      })
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังเพิ่มรายชื่อไม่ได้: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (false && campaign.influencers.length === 0 && !campaign.briefFile) {
    return <EmptyState icon="เอกสาร" title="ยังไม่มีบรีฟสำหรับแคมเปญนี้" desc="รอหัวหน้าอัปโหลดไฟล์บรีฟและตั้งเป้าหมายก่อนเริ่มหาอินฟลูเอนเซอร์" />
  }

  return (
    <>
      {!campaign.briefFile ? (
        <div className="note-banner">ยังไม่มีบรีฟในแคมเปญนี้ แต่พนักงานสามารถเพิ่มรายชื่อรอหัวหน้าตรวจได้เลย</div>
      ) : null}
      <div className="card block-gap">
        <div className="section-title">เป้าหมายแยกตามระดับ <span className="hint">หาได้แล้ว / เป้าหมาย</span></div>
        <div className="grid cols-5">
          {TIERS.map((tier) => {
            const stat = campaign.tierStats[tier]
            return <ProgressMetric color={TIER_COLOR[tier]} key={tier} label={<TierBadge tier={tier} />} value={stat.sourced} max={stat.target} />
          })}
        </div>
      </div>
      {canCreateInfluencer ? <form className="card block-gap" onSubmit={handleAddInfluencer}>
        <div className="section-title">เพิ่มอินฟลูเอนเซอร์ใหม่</div>
        <div className="dup-banner">ระบบจะแจ้งเตือนหากช่องทางนี้มีคนในทีมเพิ่มไว้แล้ว เพื่อป้องกันการคัดซ้ำ</div>
        <div className="grid cols-4 block-gap">
          <Field label="ชื่ออินฟลูเอนเซอร์" name="name" placeholder="เช่น Beauty by Ploy" />
          <Field label="Level" name="tier" options={KOL_LEVELS} />
          <Field label="ผู้ติดตาม (ผลรวมทุกช่อง)" name="followers" placeholder="เช่น 45K" />
          <Field label="วันที่ดีลงานสำเร็จ" name="dealDate" type="date" value={todayDateValue()} />
        </div>
        <ChannelFields />
        <ExtraInfoFields campaign={campaign} compact />
        <BankFields />
        <button className="btn primary form-action" disabled={saving} type="submit">{saving ? 'กำลังบันทึก...' : '+ เพิ่มรายชื่อเข้าฐานข้อมูล'}</button>
      </form> : null}
      <div className="card">
        <div className="flex-between table-heading">
          <div className="section-title no-margin">รายชื่อที่ทีมหามาแล้ว ({campaign.influencers.length})</div>
        </div>
        <div className="permission-actions">
          {canCreateInfluencer ? <button className="btn primary" onClick={sendSelectedToOwner} type="button">{selectedInfluencerIds.size ? `ส่งที่เลือก (${selectedInfluencerIds.size})` : 'ส่งรายชื่อที่เลือกให้หัวหน้าตรวจ'}</button> : null}
        </div>
        <InfluencerListTable
          onEditInfluencer={setEditingInfluencer}
          onToggleSelect={toggleInfluencerSelection}
          onToggleSelectAll={toggleAllInfluencerSelection}
          refreshDashboardData={refreshDashboardData}
          rows={campaign.influencers}
          selectedIds={selectedInfluencerIds}
          staffEditable
          staffMode
        />
        <div className="muted-text table-note">* แถวสีจางคือรายชื่อที่เพื่อนในทีมเพิ่มไว้ — ดูได้อย่างเดียว แก้ไขไม่ได้ เพื่อป้องกันข้อมูลชนกัน</div>
      </div>
      {editingInfluencer ? (
        <StaffInfluencerEditModal
          influencer={editingInfluencer}
          campaign={campaign}
          onClose={() => setEditingInfluencer(null)}
          onSaved={async () => {
            setEditingInfluencer(null)
            await refreshDashboardData()
          }}
        />
      ) : null}
    </>
  )
}

function StaffTrackTab({ campaign, refreshDashboardData }) {
  const rows = campaign.influencers.filter((item) => item.status === 'brand_selected' || item.status === 'confirmed')
  if (!rows.length) return <EmptyState icon="งาน" title="ยังไม่มีรายชื่อที่ถูกยืนยัน" desc="เมื่อหัวหน้ายืนยันรายชื่อสุดท้ายจากแบรนด์ รายชื่อจะมาแสดงที่นี่เพื่อให้อัปเดตงานได้" />
  return (
    <>
      <div className="note-banner">อัปเดตสถานะของแต่ละคนทุกวันจนกว่าจะลงคลิปครบ — หัวหน้าจะเห็นการอัปเดตนี้แบบเรียลไทม์</div>
      <div className="card">
        <EditableTrackTable refreshDashboardData={refreshDashboardData} rows={rows} />
        <button className="btn primary form-action" onClick={() => alert('แก้ไขข้อมูลในตารางจะบันทึกลง Database ทันทีเมื่อเปลี่ยนค่า')} type="button">บันทึกการอัปเดต</button>
      </div>
    </>
  )
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(([key, label]) => (
        <button className={active === key ? 'active' : ''} key={key} onClick={() => onChange(key)} type="button">{label}</button>
      ))}
    </div>
  )
}

function ProgressMetric({ label, value, max, color = '#4C5FD5' }) {
  return (
    <div className="progress-metric">
      <div className="pbar-row"><span>{label}</span><span>{value} / {max}</span></div>
      <ProgressBar color={color} max={max} value={value} />
    </div>
  )
}

function ChannelFields() {
  return (
    <>
      <div className="section-title mini-title">ช่องทางลงคลิป <span className="hint">ใส่อย่างน้อย 1 ช่องทาง</span></div>
      <div className="grid cols-3 block-gap">
        {CHANNELS.map((channel) => <Field key={channel} label={CH_LABEL[channel] || channel} name={channel} placeholder={`วางลิงก์ ${CH_LABEL[channel] || channel}`} />)}
      </div>
    </>
  )
}

function BankFields() {
  return (
    <>
      <div className="section-title mini-title">ข้อมูลธนาคารสำหรับจ่ายเงิน <span className="hint">ใส่ตอนดีลเสร็จได้เลย</span></div>
      <div className="grid cols-3 block-gap">
        <Field label="ธนาคาร" name="bankName" options={['-- เลือกธนาคาร --', ...THAI_BANKS]} />
        <Field label="เลขบัญชี / Promptpay" name="bankAccount" placeholder="0123456789" />
        <Field label="ชื่อเจ้าของบัญชี" name="bankOwner" placeholder="ตามหน้าบัตรประชาชน" />
      </div>
    </>
  )
}

function ExtraInfoFields({ values = {}, compact = false, campaign }) {
  const sections = compact ? EXTRA_INFO_SECTIONS.slice(0, 3) : EXTRA_INFO_SECTIONS
  const hasCampaignProducts = Boolean(campaign?.campaignSettings?.products?.length)
  return (
    <div className="extra-info-panel">
      {sections.map((section) => (
        <div className="extra-info-section" key={section.title}>
          <div className="section-title mini-title">{section.title}</div>
          {section.fields.some((field) => field.name === 'products') && !hasCampaignProducts ? (
            <div className="note-banner no-margin">แคมเปญนี้ยังไม่ได้ตั้ง Products จากฝั่งหัวหน้า ช่อง Products จะยังไม่มีตัวเลือกให้เลือก</div>
          ) : null}
          <div className="grid cols-3 block-gap">
            {section.fields.map((field) => (
              (() => {
                const options = field.name === 'products' ? getCampaignProductOptions(campaign) : field.options
                return (
                  <Field
                    key={field.name}
                    label={field.label}
                    multiline={field.multiline}
                    name={field.name}
                    options={options}
                    placeholder={field.placeholder}
                    type={field.type || 'text'}
                    value={values[field.name] || ''}
                  />
                )
              })()
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StaffInfluencerEditModal({ influencer, campaign, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const bankOwner = influencer.bank?.owner || influencer.bank?.holder || ''

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const bankName = String(formData.get('bankName') || '').trim()
    const bankAccount = String(formData.get('bankAccount') || '').trim()
    const bankHolder = String(formData.get('bankHolder') || '').trim()
    const bank = bankName || bankAccount || bankHolder
      ? { name: bankName, account: bankAccount, owner: bankHolder, holder: bankHolder }
      : null

    try {
      setSaving(true)
      await updateInfluencer(influencer.id, {
        name: formData.get('name'),
        tier: formData.get('tier'),
        followers: formData.get('followers'),
        dealDate: formData.get('dealDate'),
        channels: buildUpdatedChannels(influencer, {
          instagram: formData.get('instagram'),
          tiktok: formData.get('tiktok'),
          youtube: formData.get('youtube'),
          facebook: formData.get('facebook'),
          twitter: formData.get('twitter'),
          lemon8: formData.get('lemon8'),
        }),
        bank,
        extraInfo: mergeExtraInfo(influencer.extraInfo, getExtraInfoFromForm(formData)),
      })
      await onSaved?.()
    } catch (error) {
      alert(`ยังแก้ไขข้อมูลอินฟลูไม่ได้: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit} role="dialog" aria-modal="true">
        <h2>แก้ไขข้อมูลอินฟลู</h2>
        <div className="modal-sub">{influencer.name}</div>
        <div className="grid cols-2">
          <Field label="ชื่ออินฟลูเอนเซอร์" name="name" required value={influencer.name} />
          <div className="field">
            <label>ระดับ</label>
            <select defaultValue={influencer.tier || KOL_LEVELS[0]} name="tier">
              {KOL_LEVELS.map((tier) => <option key={tier}>{tier}</option>)}
            </select>
          </div>
          <Field label="ผู้ติดตาม" name="followers" value={influencer.followers} />
          <Field label="วันที่ดีลงานสำเร็จ" name="dealDate" type="date" value={influencer.dealDate} />
        </div>
        <div className="section-title mini-title">ช่องทางลงคลิป</div>
        <div className="grid cols-3 block-gap">
          <Field label="IG" name="instagram" value={getChannelUrl(influencer, 'instagram')} />
          <Field label="TikTok" name="tiktok" value={getChannelUrl(influencer, 'tiktok')} />
          <Field label="YT" name="youtube" value={getChannelUrl(influencer, 'youtube')} />
          <Field label="FB" name="facebook" value={getChannelUrl(influencer, 'facebook')} />
          <Field label="X" name="twitter" value={getChannelUrl(influencer, 'twitter')} />
          <Field label="Lemon8" name="lemon8" value={getChannelUrl(influencer, 'lemon8')} />
        </div>
        <div className="section-title mini-title">ข้อมูลธนาคาร</div>
        <div className="grid cols-3 block-gap">
          <Field label="ธนาคาร" name="bankName" value={influencer.bank?.name || ''} />
          <Field label="เลขบัญชี / Promptpay" name="bankAccount" value={influencer.bank?.account || ''} />
          <Field label="ชื่อเจ้าของบัญชี" name="bankHolder" value={bankOwner} />
        </div>
        <ExtraInfoFields campaign={campaign} values={influencer.extraInfo || {}} />
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} type="button">ยกเลิก</button>
          <button className="btn primary" disabled={saving} type="submit">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  )
}

function OwnerAddInfluencerForm({ campaign, refreshDashboardData }) {
  const { user } = useSession()
  const canCreateInfluencer = useCan('influencer.create')
  const [saving, setSaving] = useState(false)

  async function handleAddOwnerInfluencer(event) {
    event.preventDefault()
    const source = event.currentTarget.closest('.card')
    const controls = Array.from(source.querySelectorAll('input, select'))

    try {
      if (!canCreateInfluencer) {
        alert('ไม่มีสิทธิ์เพิ่มอินฟลูเอนเซอร์')
        return
      }
      const influencerName = String(controls[0]?.value || '').trim()
      const channelUrls = getChannelUrlsFromControls(controls, 4, CHANNELS.length)
      if (hasDuplicateInfluencer(campaign, influencerName, channelUrls)) {
        alert('ไม่สามารถบันทึกได้ เนื่องจากพบอินฟลูเอนเซอร์นี้ในแคมเปญแล้ว')
        return
      }
      setSaving(true)
      await createInfluencer({
        campaignId: campaign.id,
        name: influencerName,
        tier: controls[1]?.value || 'Nano',
        followers: controls[2]?.value || '',
        dealDate: controls[3]?.value || '',
        instagram: controls[4]?.value || '',
        tiktok: controls[5]?.value || '',
        youtube: controls[6]?.value || '',
        facebook: controls[7]?.value || '',
        twitter: controls[8]?.value || '',
        lemon8: controls[9]?.value || '',
        addedBy: user?.name || 'Owner',
        addedByRole: user?.role || 'owner',
        status: 'owner_approved',
        draft: 'waiting',
        draftStatus: 'Waiting draft',
      })
      controls.forEach((control) => {
        if (control.tagName === 'SELECT') control.selectedIndex = 0
        else control.value = ''
      })
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังเพิ่มรายชื่อไม่ได้: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card block-gap">
      <div className="section-title">เพิ่มอินฟลูเอนเซอร์โดยหัวหน้า <span className="hint">ข้ามขั้นตอนทีม → เข้าสู่สถานะ owner_approved ทันที</span></div>
      <div className="grid cols-4 block-gap">
        <Field label="ชื่ออินฟลูเอนเซอร์" name="name" placeholder="เช่น Mega Star KOL" />
        <Field label="Level" name="tier" options={KOL_LEVELS} />
        <Field label="ผู้ติดตาม" name="followers" placeholder="เช่น 2.3M" />
        <Field label="วันที่ดีลงานสำเร็จ" name="dealDate" type="date" value={todayDateValue()} />
      </div>
      <ChannelFields />
      {canCreateInfluencer ? <button className="btn primary" disabled={saving} onClick={handleAddOwnerInfluencer} type="button">{saving ? 'กำลังบันทึก...' : '+ เพิ่มรายชื่อ (หัวหน้า)'}</button> : null}
    </div>
  )
}

function TierSummaryTable({ campaign }) {
  return (
    <div className="card block-gap">
      <div className="section-title">สัดส่วนตามระดับอินฟลูเอนเซอร์ <span className="hint">เป้าหมาย vs คัดผ่านแล้ว vs ที่คุณเลือกแล้ว</span></div>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><th>ระดับ</th><th>เป้าหมาย</th><th>หัวหน้าคัดผ่าน</th><th>คุณเลือกแล้ว</th><th>สัดส่วน</th></tr>
            {TIERS.map((tier) => {
              const stat = campaign.tierStats[tier]
              return (
                <tr key={tier}>
                  <td><TierBadge tier={tier} /></td>
                  <td>{stat.target}</td>
                  <td>{stat.ownerApproved}</td>
                  <td><b>{stat.brandSelected}</b></td>
                  <td className="wide-progress"><ProgressBar color={TIER_COLOR[tier]} max={stat.target} value={stat.brandSelected} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReviewCard({ rows, title, actionLabel, showSenior = false, onApprove, onReject, onAction, selectedIds, onToggleSelect, onToggleSelectAll }) {
  const selectable = Boolean(selectedIds && onToggleSelect)
  const allSelected = selectable && rows.length > 0 && rows.every((row) => selectedIds.has(row.id))

  return (
    <div className="card block-gap">
      <div className="flex-between table-heading">
        <div className="section-title no-margin">{title}</div>
        {actionLabel ? <button className="btn primary" onClick={onAction} type="button">{actionLabel}</button> : null}
      </div>
      {rows.length === 0 ? <EmptyState icon="เรียบร้อย" title="ไม่มีรายชื่อรอตรวจ" desc="ทีมยังไม่ส่งรายชื่อใหม่เข้ามาในขณะนี้" /> : (
        <div className="table-wrap">
          <table>
            <tbody>
              <tr>
                {selectable ? <th><input checked={allSelected} onChange={onToggleSelectAll} type="checkbox" /></th> : null}
                <th>ชื่อ / ช่องทาง</th><th>ระดับ</th><th>ผู้ติดตาม</th><th>เพิ่มโดย</th>{showSenior ? <th>Senior</th> : null}<th>การตัดสิน</th>
              </tr>
              {rows.map((item) => (
                <tr key={item.id}>
                  {selectable ? <td><input checked={selectedIds.has(item.id)} onChange={() => onToggleSelect(item.id)} type="checkbox" /></td> : null}
                  <td><div className="cell-name">{item.name}</div><ChannelPills item={item} /></td>
                  <td><TierBadge tier={item.tier} /></td>
                  <td className="followers">{item.followers}</td>
                  <td>{item.addedBy}</td>
                  {showSenior ? <td><SeniorChip approval={item.seniorApproval} /></td> : null}
                  <td className="button-cell">
                    <button className="btn sm primary" onClick={() => onApprove?.(item.id)} type="button">คัดผ่าน</button>
                    <button className="btn sm secondary" onClick={() => onReject?.(item.id)} type="button">คัดออก</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SimpleInfluencerCard({ rows, title, actionLabel, showBank = false, onAction }) {
  return (
    <div className="card block-gap">
      <div className="flex-between table-heading">
        <div className="section-title no-margin">{title}</div>
        {actionLabel ? <button className="btn primary" onClick={onAction} type="button">{actionLabel}</button> : null}
      </div>
      <InfluencerListTable rows={rows} showBank={showBank} />
    </div>
  )
}

function InfluencerListTable({ rows, staffMode = false, showBank = false, staffEditable = false, refreshDashboardData, selectedIds, onToggleSelect, onToggleSelectAll, onEditInfluencer }) {
  const canEditInfluencer = useCan('influencer.create')
  const { user } = useSession()
  const selectable = Boolean(selectedIds && onToggleSelect)
  const selectableRows = rows.filter((row) => row.status !== 'owner_approved')
  const allSelected = selectable && selectableRows.length > 0 && selectableRows.every((row) => selectedIds.has(row.id))

  return (
    <div className="table-wrap">
      <table>
        <tbody>
          <tr>
            {selectable ? <th><input checked={allSelected} onChange={onToggleSelectAll} type="checkbox" /></th> : null}
            <th>ชื่อ / ช่องทาง</th><th>ระดับ</th><th>ผู้ติดตาม</th><th>เพิ่มโดย</th>
            {staffMode ? <th>วันดีลงาน</th> : null}
            {(staffMode || showBank) ? <th>ธนาคาร</th> : null}
            {staffMode ? <th>Senior</th> : null}
            <th>สถานะ</th>
            {staffEditable ? <th>แก้ไข</th> : null}
          </tr>
          {rows.map((item) => {
            const isReviewSent = ['pending_owner', 'senior_approved', 'owner_approved', 'brand_selected', 'confirmed'].includes(item.status)
            const isMine = item.addedBy === user?.name || item.addedBy === CURRENT_STAFF
            return (
              <tr className={staffMode && isReviewSent ? 'row-muted' : ''} key={item.id}>
                {selectable ? <td><input checked={selectedIds.has(item.id)} disabled={isReviewSent} onChange={() => onToggleSelect(item.id)} type="checkbox" /></td> : null}
                <td>
                  <div className="cell-name">
                    {item.name} {item.addedByRole === 'owner' ? <Badge cls="purple">หัวหน้าเพิ่ม</Badge> : null}
                  </div>
                  <ChannelPills item={item} />
                </td>
                <td><TierBadge tier={item.tier} /></td>
                <td className="followers">{item.followers}</td>
                <td>{item.addedBy}{staffMode && isMine ? <span className="cell-sub"> (ของฉัน)</span> : null}</td>
                {staffMode ? <td>{item.dealDate}</td> : null}
                {(staffMode || showBank) ? <td><BankChip bank={item.bank} /></td> : null}
                {staffMode ? <td><SeniorChip approval={item.seniorApproval} /></td> : null}
                <td><StatusBadge status={item.status} /></td>
                {staffEditable ? <td>{canEditInfluencer && !isReviewSent ? <button className="btn xs secondary" onClick={() => onEditInfluencer?.(item)} type="button">แก้ไข</button> : null}</td> : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function InfluencerProgressTable({ rows, title = 'รายชื่อที่ยืนยันแล้ว & สถานะลงคอนเทนต์', withOwner = false }) {
  return (
    <div className="card">
      <div className="section-title">{title}</div>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr>
              <th>ชื่อ / ช่องทาง</th><th>ระดับ</th>{withOwner ? <th>ผู้ดูแล</th> : null}<th>วันดีลงาน</th><th>สถานะงาน</th><th>สถานะดราฟ/คลิป</th><th>วันที่ลง</th><th>ลิงก์คลิป</th>
              {withOwner ? <><th>Asset</th><th>ธนาคาร</th></> : null}
            </tr>
            {rows.map((item) => (
              <tr key={item.id}>
                <td><div className="cell-name">{item.name}</div><ChannelPills item={item} /></td>
                <td><TierBadge tier={item.tier} /></td>
                {withOwner ? <td>{item.addedBy}</td> : null}
                <td>{item.dealDate}</td>
                <td><StatusBadge status={item.status} /></td>
                <td><DraftBadge draft={item.draft} /></td>
                <td>{item.postDate}</td>
                <td>{item.postLink ? <a className="link" href="#">ดูคลิป</a> : <span className="muted-text">—</span>}</td>
                {withOwner ? <td>{item.assetLink ? <a className="link" href="#">ไฟล์</a> : <span className="muted-text">—</span>}</td> : null}
                {withOwner ? <td><BankChip bank={item.bank} /></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EditableTrackTable({ rows, refreshDashboardData }) {
  const canTrack = useCan('influencer.track')

  async function saveInfluencer(id, values) {
    try {
      if (!canTrack) {
        alert('ไม่มีสิทธิ์อัปเดตงาน')
        return
      }
      await updateInfluencer(id, values)
      await refreshDashboardData()
    } catch (error) {
      alert(`ยังบันทึกไม่ได้: ${error.message}`)
    }
  }

  return (
    <div className="table-wrap">
      <table>
        <tbody>
          <tr><th>ชื่อ / ช่องทาง</th><th>ระดับ</th><th>วันดีลงาน</th><th>ส่งสินค้า</th><th>สถานะดราฟ/คลิป</th><th>วันที่ลง</th><th>ลิงก์คลิป</th><th>Asset ไฟล์</th><th>ธนาคาร</th></tr>
          {rows.map((item) => (
            <tr key={item.id}>
              <td><div className="cell-name">{item.name}</div><ChannelPills item={item} /></td>
              <td><TierBadge tier={item.tier} /></td>
              <td>{item.dealDate}</td>
              <td><input defaultChecked={item.draft !== 'waiting'} type="checkbox" /></td>
              <td>
                <select className="draft-select" defaultValue={item.draft} disabled={!canTrack} onChange={(event) => saveInfluencer(item.id, { draft: event.target.value })}>
                  {Object.entries(DRAFT_MAP).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                </select>
              </td>
              <td><input className="compact-input" defaultValue={item.draft === 'posted' ? '2026-07-05' : ''} disabled={!canTrack} onBlur={(event) => saveInfluencer(item.id, { postDate: event.target.value })} type="date" /></td>
              <td><input className="link-input small" defaultValue={item.postLink} disabled={!canTrack} onBlur={(event) => saveInfluencer(item.id, { postLink: event.target.value })} placeholder="ลิงก์คลิป" type="text" /></td>
              <td><input className="link-input" defaultValue={item.assetLink} disabled={!canTrack} onBlur={(event) => saveInfluencer(item.id, { assetLink: event.target.value })} placeholder="ลิงก์ Asset (Drive/Dropbox)" type="text" /></td>
              <td>{item.bank ? <BankChip bank={item.bank} /> : <button className="btn xs secondary" onClick={() => alert('เปิดฟอร์มใส่ข้อมูลธนาคาร')} type="button">+ ใส่ธนาคาร</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Field({ label, name, options, required = false, type = 'text', value, placeholder, multiline = false }) {
  return (
    <div className="field">
      <label>{label}</label>
      {options
        ? <select defaultValue={value || options[0]} name={name} required={required}>{options.map((option) => <option key={option}>{option}</option>)}</select>
        : multiline
          ? <textarea defaultValue={value} name={name} placeholder={placeholder} required={required} rows="3" />
          : <input defaultValue={value} name={name} placeholder={placeholder} required={required} type={type} />}
    </div>
  )
}

function MockupModal({ type, context, onClose, onSaved }) {
  const isBrand = type === 'brand'
  const isCampaign = type === 'campaign'
  const isEmployee = type === 'senior'
  const [saving, setSaving] = useState(false)
  const [permissionOptions, setPermissionOptions] = useState([])

  useEffect(() => {
    if (!isEmployee) return undefined
    let cancelled = false
    getPermissions()
      .then((items) => {
        if (!cancelled) setPermissionOptions(items || [])
      })
      .catch(() => {
        if (!cancelled) setPermissionOptions([])
      })
    return () => {
      cancelled = true
    }
  }, [isEmployee])

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    try {
      setSaving(true)
      if (isCampaign) {
        const briefUpload = formData.get('briefFileUpload')
        const briefFile = briefUpload?.name || formData.get('briefFile')

        await createCampaign({
          brandId: context.brand.id,
          name: formData.get('name'),
          objective: formData.get('objective'),
          target: formData.get('target'),
          brandQuota: formData.get('brandQuota'),
          startDate: formData.get('startDate'),
          deadlineDate: formData.get('deadlineDate'),
          briefFile,
          briefDate: briefFile ? new Date().toISOString().slice(0, 10) : null,
          campaignSettings: {
            products: parseOptionLines(formData.get('products')),
          },
          tierTargets: {
            Nano: formData.get('tierNano'),
            Micro: formData.get('tierMicro'),
            Mid: formData.get('tierMid'),
            Macro: formData.get('tierMacro'),
            Mega: formData.get('tierMega'),
          },
        })
        await onSaved?.()
        onClose()
        return
      }
      if (isEmployee) {
        await createUser({
          name: formData.get('name'),
          title: formData.get('title'),
          email: formData.get('email'),
          role: 'staff',
          permissions: formData.getAll('permissions'),
        })
        await onSaved?.()
        onClose()
        return
      }
      await createBrand({
        name: formData.get('name'),
        contact: formData.get('contact'),
        category: formData.get('category'),
        health: 'ใหม่',
      })
      await onSaved?.()
      onClose()
    } catch (error) {
      alert(`ยังสร้างแบรนด์ไม่ได้: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit} role="dialog" aria-modal="true">
        <h2>{isBrand ? 'เพิ่มแบรนด์ใหม่' : isEmployee ? 'เพิ่ม Senior Reviewer' : 'เพิ่มแคมเปญใหม่'}</h2>
        <div className="modal-sub">{isBrand ? 'กรอกข้อมูลแบรนด์เพื่อเริ่มสร้างแคมเปญ' : 'Senior จะสามารถช่วยตรวจรายชื่ออินฟลูก่อนส่งถึงหัวหน้า'}</div>
        {isBrand ? (
          <>
            <div className="grid cols-2">
              <Field label="ชื่อแบรนด์" name="name" placeholder="เช่น SkinGlow Beauty" required />
              <Field label="ผู้ติดต่อ (Brand Manager)" name="contact" placeholder="ชื่อผู้ติดต่อหลัก" />
              <Field label="อีเมล" name="email" placeholder="contact@brand.com" type="email" />
              <Field label="เบอร์โทร" name="phone" placeholder="08x-xxx-xxxx" type="tel" />
            </div>
            <div className="modal-field"><Field label="หมายเหตุ / รายละเอียดเพิ่มเติม" name="category" placeholder="เช่น ประเภทสินค้า, กลุ่มเป้าหมาย" /></div>
          </>
        ) : isCampaign ? (
          <>
            <div className="grid cols-2">
              <Field label="ชื่อแคมเปญ" name="name" placeholder="เช่น Summer Launch" required />
              <Field label="เป้าหมายรวม" name="target" placeholder="เช่น 20" type="number" />
              <Field label="โควต้าแบรนด์เลือก" name="brandQuota" placeholder="เช่น 15" type="number" />
              <Field label="วัตถุประสงค์" name="objective" placeholder="เช่น Awareness / Conversion" />
              <Field label="วันเริ่มลงคลิป" name="startDate" type="date" />
              <Field label="วันครบกำหนด" name="deadlineDate" type="date" />
            </div>
            <div className="modal-field"><Field label="ชื่อไฟล์บรีฟ / URL บรีฟ" name="briefFile" placeholder="เช่น brief.pdf หรือ https://..." /></div>
            <div className="grid cols-2 block-gap">
              <div className="field">
                <label>ไฟล์บรีฟ (.txt, .doc, .docx, .pdf)</label>
                <input accept=".txt,.doc,.docx,.pdf" name="briefFileUpload" type="file" />
              </div>
              <Field label="Google Doc / URL บรีฟ" name="briefFile" placeholder="https://docs.google.com/..." type="url" />
            </div>
            <div className="modal-field">
              <div className="field">
                <label>Products สำหรับให้ทีมเลือก</label>
                <textarea name="products" placeholder="ใส่ชื่อสินค้า บรรทัดละ 1 รายการ" rows="4" />
              </div>
            </div>
            <div className="grid cols-5">
              <Field label="Nano" name="tierNano" type="number" value="0" />
              <Field label="Micro" name="tierMicro" type="number" value="0" />
              <Field label="Mid" name="tierMid" type="number" value="0" />
              <Field label="Macro" name="tierMacro" type="number" value="0" />
              <Field label="Mega" name="tierMega" type="number" value="0" />
            </div>
          </>
        ) : isEmployee ? (
          <div className="grid cols-2">
            <Field label="ชื่อพนักงาน" name="name" placeholder="ชื่อ-นามสกุล" required />
            <Field label="ตำแหน่ง" name="title" placeholder="เช่น Senior Coordinator" />
            <Field label="อีเมล" name="email" placeholder="staff@agency.com" type="email" />
            <div className="field">
              <label>สิทธิ์</label>
              <div className="permission-actions">
                {permissionOptions.map((permission) => (
                  <label className="role-chip" key={permission.key}>
                    <input defaultChecked={['brand.read', 'influencer.review'].includes(permission.key)} name="permissions" type="checkbox" value={permission.key} />
                    {permission.key}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div />
        )}
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} type="button">ยกเลิก</button>
          <button className="btn primary" disabled={saving} type="submit">{saving ? 'กำลังบันทึก...' : isBrand ? 'สร้างแบรนด์' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  )
}

export default MockupDashboard
