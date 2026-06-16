import { createContext, useContext, useMemo, useState } from 'react'

const translations = {
  th: {
    appSubtitle: 'ระบบจัดการแคมเปญอินฟลูเอนเซอร์',
    username: 'Username',
    password: 'Password',
    login: 'เข้าสู่ระบบ',
    demoRole: 'Demo role',
    logout: 'ออกจากระบบ',
    languageLabel: 'เปลี่ยนภาษา',
    view: 'View',
    nav: {
      dashboard: 'Dashboard',
      brands: 'Brands',
      campaigns: 'Campaigns',
      assignedCampaigns: 'Assigned Campaigns',
      campaignProgress: 'Campaign Progress',
      influencerSelection: 'Influencer Selection',
      influencers: 'Influencers',
      clients: 'Clients',
      projects: 'Projects',
      tasks: 'Tasks',
      contentStatus: 'Content Status',
      invoices: 'Invoices',
      users: 'Users',
      settings: 'Settings',
    },
    pages: {
      dashboard: 'ภาพรวมแคมเปญ',
      brands: 'แบรนด์',
      campaigns: 'แคมเปญ',
      influencers: 'อินฟลูเอนเซอร์',
      clients: 'ลูกค้า',
      projects: 'โปรเจกต์',
      tasks: 'งานและคอนเทนต์',
      invoices: 'ใบแจ้งหนี้',
      settings: 'ตั้งค่า',
      users: 'จัดการผู้ใช้',
    },
    owner: {
      eyebrow: 'Owner Dashboard',
      title: 'ภาพรวมระบบ AgencyHub',
      description: 'ดูภาพรวมแคมเปญ แบรนด์ ทีมงาน อินฟลูเอนเซอร์ และงานที่รออนุมัติในที่เดียว',
      action: 'สร้างแคมเปญ',
      totalCampaigns: 'Total campaigns',
      totalCampaignsDetail: 'แคมเปญทั้งหมด',
      brandsDetail: 'แบรนด์ที่ดูแล',
      influencersDetail: 'รายชื่อในระบบ',
      pendingReview: 'Pending review',
      pendingReviewDetail: 'รอ Owner ตรวจ',
      userManagementTitle: 'จัดการผู้ใช้',
      userManagementText: 'Placeholder สำหรับสร้างบัญชี Brand, Staff และ Admin ในอนาคต ยังไม่มีการสร้างผู้ใช้จริงในเวอร์ชัน mockup',
      systemHealthTitle: 'งานที่ต้องติดตาม',
      systemHealthText: 'ตรวจรายชื่ออินฟลูเอนเซอร์ อนุมัติดราฟต์ และดูสถานะโพสต์ที่ใกล้กำหนด',
      latestCampaigns: 'แคมเปญล่าสุด',
      latestCampaignsText: 'สถานะและความคืบหน้าของแคมเปญหลัก',
    },
    staff: {
      eyebrow: 'Staff Dashboard',
      title: 'แคมเปญที่ได้รับมอบหมาย',
      description: 'โฟกัสงานประจำวัน การจัดการอินฟลูเอนเซอร์ และการติดตามดราฟต์คอนเทนต์',
      assignedCampaigns: 'Assigned campaigns',
      assignedCampaignsDetail: 'แคมเปญที่ต้องดูแล',
      influencerTasks: 'Influencer tasks',
      influencerTasksDetail: 'รายชื่อที่ต้องติดตาม',
      openTasks: 'Open tasks',
      openTasksDetail: 'งานค้างในทีม',
      confirmedSuffix: 'คนยืนยันแล้ว',
      managementTitle: 'Influencer management',
      managementText: 'ตารางสรุปสถานะอินฟลูเอนเซอร์ที่ทีมต้องติดตาม',
    },
    brand: {
      eyebrow: 'Brand Dashboard',
      description: 'ดูความคืบหน้าแคมเปญ เลือกอินฟลูเอนเซอร์ และตรวจสถานะคอนเทนต์',
      campaignProgress: 'Campaign progress',
      campaignProgressDetail: 'ความคืบหน้ารวม',
      selected: 'Influencers selected',
      selectedDetail: 'รายชื่อที่ยืนยันแล้ว',
      posted: 'Content posted',
      postedDetail: 'โพสต์เผยแพร่แล้ว',
      progressTitle: 'Campaign progress',
      overview: 'ภาพรวมแคมเปญ',
      selection: 'Influencer selection',
      contentStatus: 'Content status',
      tableTitle: 'Influencer selection & content status',
      tableText: 'รายการสำหรับ Brand ตรวจเลือกและติดตามสถานะคอนเทนต์',
    },
  },
  en: {
    appSubtitle: 'Influencer campaign management system',
    username: 'Username',
    password: 'Password',
    login: 'Log in',
    demoRole: 'Demo role',
    logout: 'Logout',
    languageLabel: 'Change language',
    view: 'View',
    nav: {
      dashboard: 'Dashboard',
      brands: 'Brands',
      campaigns: 'Campaigns',
      assignedCampaigns: 'Assigned Campaigns',
      campaignProgress: 'Campaign Progress',
      influencerSelection: 'Influencer Selection',
      influencers: 'Influencers',
      clients: 'Clients',
      projects: 'Projects',
      tasks: 'Tasks',
      contentStatus: 'Content Status',
      invoices: 'Invoices',
      users: 'Users',
      settings: 'Settings',
    },
    pages: {
      dashboard: 'Campaign Overview',
      brands: 'Brands',
      campaigns: 'Campaigns',
      influencers: 'Influencers',
      clients: 'Clients',
      projects: 'Projects',
      tasks: 'Tasks & Content',
      invoices: 'Invoices',
      settings: 'Settings',
      users: 'User Management',
    },
    owner: {
      eyebrow: 'Owner Dashboard',
      title: 'AgencyHub System Overview',
      description: 'Monitor campaigns, brands, team activity, influencers, and pending approvals in one place.',
      action: 'Create campaign',
      totalCampaigns: 'Total campaigns',
      totalCampaignsDetail: 'All active campaigns',
      brandsDetail: 'Managed brands',
      influencersDetail: 'Influencers in the system',
      pendingReview: 'Pending review',
      pendingReviewDetail: 'Waiting for Owner review',
      userManagementTitle: 'User management',
      userManagementText: 'Placeholder for future Brand, Staff, and Admin accounts. No real user creation exists in this mockup.',
      systemHealthTitle: 'Items to follow up',
      systemHealthText: 'Review influencer lists, approve drafts, and track upcoming post deadlines.',
      latestCampaigns: 'Latest campaigns',
      latestCampaignsText: 'Status and progress for core campaigns',
    },
    staff: {
      eyebrow: 'Staff Dashboard',
      title: 'Assigned Campaigns',
      description: 'Focus on daily execution, influencer coordination, and content draft tracking.',
      assignedCampaigns: 'Assigned campaigns',
      assignedCampaignsDetail: 'Campaigns to manage',
      influencerTasks: 'Influencer tasks',
      influencerTasksDetail: 'Influencers to follow up',
      openTasks: 'Open tasks',
      openTasksDetail: 'Team tasks pending',
      confirmedSuffix: 'confirmed',
      managementTitle: 'Influencer management',
      managementText: 'A summary table for influencer and draft follow-up.',
    },
    brand: {
      eyebrow: 'Brand Dashboard',
      description: 'Track campaign progress, review influencer selections, and monitor content status.',
      campaignProgress: 'Campaign progress',
      campaignProgressDetail: 'Overall progress',
      selected: 'Influencers selected',
      selectedDetail: 'Confirmed influencers',
      posted: 'Content posted',
      postedDetail: 'Published posts',
      progressTitle: 'Campaign progress',
      overview: 'Campaign overview',
      selection: 'Influencer selection',
      contentStatus: 'Content status',
      tableTitle: 'Influencer selection & content status',
      tableText: 'Review proposed influencers and content status from the brand view.',
    },
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('agencyhub-language') || 'th')

  function toggleLanguage() {
    setLanguage((current) => {
      const next = current === 'th' ? 'en' : 'th'
      localStorage.setItem('agencyhub-language', next)
      return next
    })
  }

  const value = useMemo(
    () => ({
      language,
      toggleLanguage,
      t: translations[language],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
