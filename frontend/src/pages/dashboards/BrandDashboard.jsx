import Badge from '../../components/Badge'
import CampaignCard from '../../components/CampaignCard'
import DataTable from '../../components/DataTable'
import ProgressBar from '../../components/ProgressBar'
import StatCard from '../../components/StatCard'
import { useLanguage } from '../../context/LanguageContext'
import { campaigns, getStatusVariant, influencers } from '../../mock/agencyData'

function BrandDashboard() {
  const { t } = useLanguage()
  const campaign = campaigns[0]
  const totals = campaigns.reduce(
    (summary, item) => ({
      confirmed: summary.confirmed + item.confirmedInfluencers,
      posted: summary.posted + item.postedContent,
      waiting: summary.waiting + item.waitingBrandSelection,
    }),
    { confirmed: 0, posted: 0, waiting: 0 },
  )
  const columns = [
    { key: 'name', label: 'Influencer' },
    { key: 'tier', label: 'Tier' },
    { key: 'followers', label: 'Followers' },
    {
      key: 'status',
      label: 'Selection',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'draftStatus',
      label: 'Content status',
      render: (row) => <Badge variant={getStatusVariant(row.draftStatus)}>{row.draftStatus}</Badge>,
    },
    { key: 'postDate', label: 'Post date' },
  ]

  return (
    <section className="stack">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">{t.brand.eyebrow}</p>
          <h2>{campaign.name}</h2>
          <p>{t.brand.description}</p>
        </div>
        <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
      </div>

      <div className="stat-grid three">
        <StatCard label="Campaign ทั้งหมด" value={campaigns.length} detail="แคมเปญของแบรนด์" />
        <StatCard label={t.brand.selected} value={totals.confirmed} detail={t.brand.selectedDetail} tone="green" />
        <StatCard label={t.brand.posted} value={totals.posted} detail={t.brand.postedDetail} tone="blue" />
      </div>

      <div className="stat-grid three">
        <StatCard label="รอเลือก" value={totals.waiting} detail="รายการที่รอ Brand เลือก" tone="orange" />
        <StatCard label={t.brand.campaignProgress} value={`${campaign.progress}%`} detail={t.brand.campaignProgressDetail} />
        <StatCard label="Content status" value={`${campaign.postedContent}/${campaign.confirmedInfluencers}`} detail="ลงคลิปแล้ว / ยืนยันแล้ว" tone="blue" />
      </div>

      <div className="campaign-grid">
        {campaigns.map((item) => (
          <div className="campaign-card-shell" key={item.id}>
            {item.waitingBrandSelection > 0 && <Badge variant="warning">มีรายชื่อรอเลือก</Badge>}
            <CampaignCard campaign={item} />
            <div className="card-metrics">
              <span>ยืนยันแล้ว {item.confirmedInfluencers}/{item.influencerTarget}</span>
              <span>ลงคลิปแล้ว {item.postedContent}/{item.confirmedInfluencers}</span>
            </div>
          </div>
        ))}
      </div>

      <article className="info-card">
        <h3>{t.brand.progressTitle}</h3>
        <ProgressBar value={campaign.progress} label={t.brand.overview} />
        <ProgressBar value={62} label={t.brand.selection} />
        <ProgressBar value={54} label={t.brand.contentStatus} />
      </article>

      <div className="section-heading">
        <div>
          <h2>{t.brand.tableTitle}</h2>
          <p>{t.brand.tableText}</p>
        </div>
      </div>
      <DataTable columns={columns} rows={influencers} />
    </section>
  )
}

export default BrandDashboard
