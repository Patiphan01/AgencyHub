import { useState } from 'react'
import { Link } from 'react-router-dom'
import ActivityTimeline from '../../components/ActivityTimeline'
import CampaignCard from '../../components/CampaignCard'
import EmptyState from '../../components/EmptyState'
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
  const pendingSelections = campaigns.reduce(
    (sum, campaign) => sum + (campaign.waitingBrandSelection || 0),
    0,
  )

  function showToast(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function handleExport() {
    showToast('Export Excel สำเร็จ (Mockup)')
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
          <button className="secondary-button" onClick={handleExport} type="button">
            Export Excel
          </button>
          <Link className="primary-button" to="/brands" style={{ textDecoration: 'none' }}>
            {t.owner.action}
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label={t.owner.totalCampaigns} value={campaigns.length} detail={t.owner.totalCampaignsDetail} />
        <StatCard label="Brands" value={brands.length} detail={t.owner.brandsDetail} tone="blue" />
        <StatCard label="Influencers" value={influencers.length} detail={t.owner.influencersDetail} tone="green" />
        <StatCard label={t.owner.pendingReview} value={pendingSelections} detail="รอบรรจุให้แบรนด์เลือก" tone="orange" />
      </div>

      <div className="card-grid">
        <article className="info-card">
          <p className="eyebrow">Summary</p>
          <h3>ภาพรวมการดำเนินการทั้งหมด</h3>
          <div className="mini-list">
            <div>
              <strong>ยืนยันแล้ว</strong>
              <span>{totals.confirmed} Influencers</span>
            </div>
            <div>
              <strong>ลงคลิปแล้ว</strong>
              <span>{totals.posted} posts</span>
            </div>
            <div>
              <strong>รอตรวจ</strong>
              <span>{totals.pending} items</span>
            </div>
          </div>
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
          <h2>Brands Overview</h2>
          <p>ภาพรวมทุกแบรนด์และแคมเปญของพวกเขา</p>
        </div>
        <Link className="primary-button" to="/brands" style={{ textDecoration: 'none' }}>
          ดูทั้งหมด →
        </Link>
      </div>

      <div className="card-grid">
        {brands.slice(0, 4).map((brand) => {
          const brandCampaigns = campaigns.filter((c) => c.brandId === brand.id)
          return (
            <Link className="info-card" key={brand.id} to={`/brands/${brand.id}`} style={{ textDecoration: 'none' }}>
              <div className="card-title-row">
                <h3>{brand.name}</h3>
              </div>
              <p>{brand.category}</p>
              <strong>{brandCampaigns.length} campaigns</strong>
            </Link>
          )
        })}
      </div>

      <div className="section-heading">
        <div>
          <h2>{t.owner.latestCampaigns}</h2>
          <p>{t.owner.latestCampaignsText}</p>
        </div>
        <Link className="primary-button" to="/campaigns" style={{ textDecoration: 'none' }}>
          ดูทั้งหมด →
        </Link>
      </div>
      <div className="campaign-grid">
        {campaigns.slice(0, 4).map((campaign) => (
          <CampaignCard campaign={campaign} key={campaign.id} />
        ))}
      </div>

      {campaigns.length > 0 && <ActivityTimeline activities={activities.slice(0, 5)} title="Recent Activities" />}
      {campaigns.length === 0 && (
        <EmptyState
          title="ไม่มีแคมเปญ"
          description="ไปที่หน้า Brands เพื่อสร้างแคมเปญใหม่"
          icon="🚀"
          action={() => window.location.href = '/brands'}
          actionLabel="ไปสร้างแคมเปญ"
        />
      )}
    </section>
  )
}

export default OwnerDashboard

