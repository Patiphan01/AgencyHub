import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import { getStatusVariant, influencers } from '../mock/agencyData'

function Influencers() {
  const role = localStorage.getItem('agencyhub-role') || 'Owner'
  const columns = [
    { key: 'name', label: 'Influencer name' },
    {
      key: 'channel',
      label: 'Channel/link',
      render: (row) => <a className="table-link" href={`https://${row.channel}`}>{row.channel}</a>,
    },
    { key: 'tier', label: 'Tier' },
    { key: 'followers', label: 'Followers' },
    { key: 'addedBy', label: 'Added by' },
    { key: 'dealDate', label: 'Deal date' },
    {
      key: 'status',
      label: role === 'Brand' ? 'Selection status' : 'Status',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'draftStatus',
      label: 'Content status',
      render: (row) => <Badge variant={getStatusVariant(row.draftStatus)}>{row.draftStatus}</Badge>,
    },
    { key: 'postDate', label: 'Post date' },
    { key: 'postLink', label: 'Post link' },
  ]

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h2>{role === 'Brand' ? 'Influencer selection' : 'Influencer management'}</h2>
          <p>
            {role === 'Brand'
              ? 'สำหรับ Brand ตรวจรายชื่อที่เสนอ เลือกอินฟลูเอนเซอร์ และดูสถานะคอนเทนต์'
              : 'สำหรับทีม Staff ติดตามดีล ดราฟต์ โพสต์ และงานที่ต้องประสานกับอินฟลูเอนเซอร์'}
          </p>
        </div>
      </div>
      <DataTable columns={columns} rows={influencers} />
    </section>
  )
}

export default Influencers
