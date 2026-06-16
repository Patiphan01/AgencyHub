import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import { campaigns, getStatusVariant } from '../mock/agencyData'

function Campaigns() {
  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h2>แคมเปญ</h2>
          <p>ติดตามทุกแคมเปญตั้งแต่คัดเลือกอินฟลูเอนเซอร์จนถึงโพสต์จริง</p>
        </div>
        <button className="primary-button" type="button">สร้างแคมเปญ</button>
      </div>
      <div className="panel-list">
        {campaigns.map((campaign) => (
          <Link className="campaign-row" key={campaign.id} to={`/campaigns/${campaign.id}`}>
            <div>
              <p className="eyebrow">{campaign.brandName}</p>
              <h3>{campaign.name}</h3>
              <p>{campaign.objective}</p>
            </div>
            <div className="row-side">
              <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
              <ProgressBar value={campaign.progress} label="Progress" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Campaigns
