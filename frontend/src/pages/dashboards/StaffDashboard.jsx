import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/Badge'
import DataTable from '../../components/DataTable'
import EmptyState from '../../components/EmptyState'
import ProgressBar from '../../components/ProgressBar'
import StatCard from '../../components/StatCard'
import { useLanguage } from '../../context/LanguageContext'
import { brands, campaigns, currentStaffName, getStatusVariant, influencers, tasks, tierTargets } from '../../mock/agencyData'

function StaffDashboard() {
  const { t } = useLanguage()
  const assignedCampaigns = campaigns.filter((campaign) => campaign.status !== 'Posted')

  return (
    <section className="stack">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">{t.staff.eyebrow}</p>
          <h2>{t.staff.title}</h2>
          <p>{t.staff.description}</p>
        </div>
      </div>

      <div className="stat-grid three">
        <StatCard label={t.staff.assignedCampaigns} value={assignedCampaigns.length} detail={t.staff.assignedCampaignsDetail} />
        <StatCard label={t.staff.influencerTasks} value={influencers.length} detail={t.staff.influencerTasksDetail} tone="green" />
        <StatCard label={t.staff.openTasks} value={tasks.length} detail={t.staff.openTasksDetail} tone="orange" />
      </div>

      <div className="section-heading">
        <div>
          <h2>Brands</h2>
          <p>เลือกแบรนด์เพื่อดูแคมเปญและงาน</p>
        </div>
      </div>

      <div className="card-grid">
        {brands.map((brand) => {
          const brandCampaigns = campaigns.filter((c) => c.brandId === brand.id)
          const totalProgress = Math.round(
            brandCampaigns.reduce((sum, c) => sum + c.progress, 0) / (brandCampaigns.length || 1),
          )

          return (
            <Link className="info-card" key={brand.id} to={`/brands/${brand.id}`}>
              <div className="card-title-row">
                <h3>{brand.name}</h3>
                <Badge variant="info">{brand.activeCampaigns} campaigns</Badge>
              </div>
              <p>{brand.category}</p>
              <ProgressBar value={totalProgress} label={`Progress: ${totalProgress}%`} />
              <span className="muted">{brandCampaigns.length} แคมเปญที่ได้รับมอบหมาย</span>
            </Link>
          )
        })}
      </div>

      {assignedCampaigns.length === 0 && (
        <EmptyState
          title="ไม่มีแคมเปญที่ได้รับมอบหมาย"
          description="ติดต่อหัวหน้าเพื่อรับมอบหมายแคมเปญใหม่"
          icon="📋"
        />
      )}
    </section>
  )
}

export default StaffDashboard

