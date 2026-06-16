import Badge from '../../components/Badge'
import DataTable from '../../components/DataTable'
import ProgressBar from '../../components/ProgressBar'
import StatCard from '../../components/StatCard'
import { useLanguage } from '../../context/LanguageContext'
import { campaigns, currentStaffName, getStatusVariant, influencers, tasks, tierTargets } from '../../mock/agencyData'

function StaffDashboard() {
  const { t } = useLanguage()
  const assignedCampaigns = campaigns.filter((campaign) => campaign.status !== 'Posted')
  const columns = [
    { key: 'name', label: 'Influencer' },
    { key: 'tier', label: 'Tier' },
    { key: 'followers', label: 'Followers' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'draftStatus',
      label: 'Content',
      render: (row) => <Badge variant={getStatusVariant(row.draftStatus)}>{row.draftStatus}</Badge>,
    },
  ]

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

      <div className="card-grid">
        {assignedCampaigns.map((campaign) => (
          <article className="info-card" key={campaign.id}>
            <div className="card-title-row">
              <h3>{campaign.name}</h3>
              <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
            </div>
            <p>{campaign.brandName}</p>
            <strong>{campaign.confirmedInfluencers} {t.staff.confirmedSuffix}</strong>
          </article>
        ))}
      </div>

      <div className="card-grid">
        <article className="info-card">
          <h3>ความคืบหน้าการหา Influencer</h3>
          {tierTargets.map((target) => (
            <ProgressBar
              key={target.tier}
              label={target.tier}
              value={Math.round((target.ownerApproved / target.target) * 100)}
            />
          ))}
        </article>
        <article className="info-card">
          <h3>Deadline ที่ใกล้ถึง</h3>
          <div className="mini-list">
            {assignedCampaigns.map((campaign) => (
              <div key={campaign.id}>
                <strong>{campaign.name}</strong>
                <span>{campaign.dueDate}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="section-heading">
        <div>
          <h2>{t.staff.managementTitle}</h2>
          <p>{t.staff.managementText}</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        rowClassName={(row) => (row.addedBy !== currentStaffName ? 'readonly-row' : '')}
        rows={influencers}
      />
    </section>
  )
}

export default StaffDashboard
