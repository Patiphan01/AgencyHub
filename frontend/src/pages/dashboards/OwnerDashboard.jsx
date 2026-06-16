import { useState } from 'react'
import ActivityTimeline from '../../components/ActivityTimeline'
import CampaignCard from '../../components/CampaignCard'
import StatCard from '../../components/StatCard'
import { useLanguage } from '../../context/LanguageContext'
import { activities, brands, campaigns, influencers, notifications } from '../../mock/agencyData'

function OwnerDashboard() {
  const { t } = useLanguage()
  const [toast, setToast] = useState('')
  const totals = campaigns.reduce(
    (summary, campaign) => ({
      confirmed: summary.confirmed + campaign.confirmedInfluencers,
      posted: summary.posted + campaign.postedContent,
      pending: summary.pending + campaign.pendingReview,
    }),
    { confirmed: 0, posted: 0, pending: 0 },
  )
  const ownerNotifications = notifications.filter((notification) => notification.role === 'Owner')

  function handleExport() {
    setToast('Export Excel สำเร็จ (Mockup)')
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <section className="stack">
      {toast && <div className="toast">{toast}</div>}
      <div className="hero-panel">
        <div>
          <p className="eyebrow">{t.owner.eyebrow}</p>
          <h2>{t.owner.title}</h2>
          <p>{t.owner.description}</p>
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={handleExport} type="button">Export Excel</button>
          <button className="primary-button" type="button">{t.owner.action}</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label={t.owner.totalCampaigns} value={campaigns.length} detail={t.owner.totalCampaignsDetail} />
        <StatCard label="Brands" value={brands.length} detail={t.owner.brandsDetail} tone="blue" />
        <StatCard label="Influencers" value={influencers.length} detail={t.owner.influencersDetail} tone="green" />
        <StatCard label={t.owner.pendingReview} value={totals.pending} detail={t.owner.pendingReviewDetail} tone="orange" />
      </div>

      <div className="card-grid">
        <article className="info-card">
          <p className="eyebrow">All Brands</p>
          <h3>ภาพรวมทุกแบรนด์</h3>
          <p>{brands.map((brand) => brand.name).join(' / ')}</p>
          <strong>{brands.reduce((sum, brand) => sum + brand.activeCampaigns, 0)} active campaigns</strong>
        </article>
        <article className="info-card">
          <p className="eyebrow">Notification Summary</p>
          <h3>{ownerNotifications.length} แจ้งเตือนสำหรับ Owner</h3>
          <p>ใช้ mock data เพื่อจำลองเหตุการณ์เมื่อ Brand เลือก Influencer เสร็จ</p>
        </article>
      </div>

      <div className="card-grid">
        <article className="info-card emphasis-card">
          <p className="eyebrow">User Management</p>
          <h3>{t.owner.userManagementTitle}</h3>
          <p>{t.owner.userManagementText}</p>
        </article>
        <article className="info-card">
          <p className="eyebrow">System Health</p>
          <h3>{t.owner.systemHealthTitle}</h3>
          <p>{t.owner.systemHealthText}</p>
        </article>
      </div>

      <div className="section-heading">
        <div>
          <h2>{t.owner.latestCampaigns}</h2>
          <p>{t.owner.latestCampaignsText}</p>
        </div>
      </div>
      <div className="campaign-grid">
        {campaigns.map((campaign) => (
          <CampaignCard campaign={campaign} key={campaign.id} />
        ))}
      </div>

      <ActivityTimeline activities={activities.slice(0, 5)} title="Recent Activities" />
    </section>
  )
}

export default OwnerDashboard
