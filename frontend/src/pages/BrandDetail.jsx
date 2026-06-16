import { useParams } from 'react-router-dom'
import CampaignCard from '../components/CampaignCard'
import StatCard from '../components/StatCard'
import { brands, campaigns } from '../mock/agencyData'

function BrandDetail() {
  const { brandId } = useParams()
  const brand = brands.find((item) => item.id === brandId) || brands[0]
  const brandCampaigns = campaigns.filter((campaign) => campaign.brandId === brand.id)

  return (
    <section className="stack">
      <div className="hero-panel compact">
        <div>
          <p className="eyebrow">{brand.category}</p>
          <h2>{brand.name}</h2>
          <p>ผู้ติดต่อหลัก: {brand.contact}</p>
        </div>
      </div>
      <div className="stat-grid three">
        <StatCard label="Active campaigns" value={brand.activeCampaigns} detail="แคมเปญที่กำลังดำเนินการ" />
        <StatCard label="Brand health" value={brand.health} detail="สถานะความสัมพันธ์" tone="green" />
        <StatCard label="Next review" value="สัปดาห์นี้" detail="รอบอัปเดตถัดไป" tone="orange" />
      </div>
      <div className="campaign-grid">
        {brandCampaigns.map((campaign) => (
          <CampaignCard campaign={campaign} key={campaign.id} />
        ))}
      </div>
    </section>
  )
}

export default BrandDetail
