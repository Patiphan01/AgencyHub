import Badge from './Badge'
import ProgressBar from './ProgressBar'
import { getStatusVariant } from '../mock/agencyData'

function CampaignCard({ campaign }) {
  return (
    <article className="campaign-card">
      <div className="campaign-card-header">
        <div>
          <p className="eyebrow">{campaign.brandName}</p>
          <h3>{campaign.name}</h3>
        </div>
        <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
      </div>
      <p className="muted">{campaign.objective}</p>
      <ProgressBar value={campaign.progress} label="ความคืบหน้าแคมเปญ" />
      <div className="campaign-meta">
        <span>{campaign.confirmedInfluencers} อินฟลูเอนเซอร์</span>
        <span>{campaign.postedContent} โพสต์แล้ว</span>
        <span>{campaign.dueDate}</span>
      </div>
    </article>
  )
}

export default CampaignCard
