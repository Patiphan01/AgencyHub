import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ActivityTimeline from '../components/ActivityTimeline'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import {
  activities,
  briefVersions,
  campaigns,
  currentStaffName,
  draftStatuses,
  getStatusVariant,
  influencers,
  tierTargets,
} from '../mock/agencyData'

const tabsByRole = {
  Owner: ['ตรวจรายชื่อจากทีม', 'บรีฟ & เป้าหมาย', 'ภาพรวมการผลิตคอนเทนต์', 'Activity Log'],
  Staff: ['หา Influencer', 'ติดตามงานและอัปเดตคอนเทนต์', 'Activity Log'],
  Brand: ['คัดเลือก Influencer', 'ความคืบหน้าการลงคลิป', 'Activity Log'],
}

function CampaignDetail() {
  const { campaignId } = useParams()
  const role = localStorage.getItem('agencyhub-role') || 'Owner'
  const tabs = tabsByRole[role] || tabsByRole.Owner
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [toast, setToast] = useState('')
  const [warning, setWarning] = useState('')
  const [selectedInfluencers, setSelectedInfluencers] = useState(
    influencers.filter((item) => item.status === 'Brand selected').map((item) => item.id),
  )
  const [form, setForm] = useState({
    name: '',
    channel: '',
    tier: 'Nano',
    dealDate: '',
  })
  const campaign = campaigns.find((item) => item.id === campaignId) || campaigns[0]
  const selectionQuota = campaign.brandQuota
  const quotaFull = selectedInfluencers.length >= selectionQuota

  const groupedInfluencers = useMemo(
    () => ({
      waiting: influencers.filter((item) => item.status === 'Waiting owner review'),
      sentToBrand: influencers.filter((item) => item.status === 'Owner approved'),
      brandSelected: influencers.filter((item) => item.status === 'Brand selected' || item.status === 'Confirmed'),
    }),
    [],
  )

  function showToast(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function handleExport() {
    showToast('Export Excel สำเร็จ (Mockup)')
  }

  function handleDuplicateCheck(event) {
    event.preventDefault()
    const duplicated = influencers.some(
      (item) => item.channel.trim().toLowerCase() === form.channel.trim().toLowerCase(),
    )

    if (duplicated) {
      setWarning('พบ Influencer รายนี้ในระบบแล้ว')
      return
    }

    setWarning('')
    showToast('เพิ่ม Influencer สำเร็จ (Mockup)')
    // TODO: เชื่อม backend ในอนาคตเพื่อบันทึก Influencer ใหม่ลงฐานข้อมูลจริง
  }

  function toggleInfluencer(id) {
    setSelectedInfluencers((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }

      if (current.length >= selectionQuota) {
        return current
      }

      return [...current, id]
    })
  }

  const baseColumns = [
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
      label: 'Status',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'draftStatus',
      label: 'Draft/content status',
      render: (row) => <Badge variant={getStatusVariant(row.draftStatus)}>{row.draftStatus}</Badge>,
    },
    { key: 'postDate', label: 'Post date' },
    { key: 'postLink', label: 'Post link' },
  ]

  const productionColumns = [
    { key: 'name', label: 'Influencer' },
    { key: 'addedBy', label: 'ผู้ดูแล' },
    {
      key: 'draftStatus',
      label: 'สถานะ',
      render: (row) => <Badge variant={getStatusVariant(row.draftStatus)}>{row.draftStatus}</Badge>,
    },
    { key: 'postDate', label: 'วันที่ลง' },
    { key: 'postLink', label: 'ลิงก์คลิป' },
  ]

  return (
    <section className="stack">
      {toast && <div className="toast">{toast}</div>}
      <div className="hero-panel compact">
        <div>
          <p className="eyebrow">{campaign.brandName}</p>
          <h2>{campaign.name}</h2>
          <p>{campaign.objective}</p>
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={handleExport} type="button">Export Excel</button>
          <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
        </div>
      </div>

      <div className="stat-grid four">
        <StatCard label="Budget" value={campaign.budget} detail="งบประมาณรวม" />
        <StatCard label="Confirmed" value={campaign.confirmedInfluencers} detail="อินฟลูเอนเซอร์" tone="green" />
        <StatCard label="Posted" value={campaign.postedContent} detail="คอนเทนต์เผยแพร่แล้ว" tone="blue" />
        <StatCard label="Pending" value={campaign.pendingReview} detail="รอตรวจ" tone="orange" />
      </div>

      <div className="tab-panel">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab ? 'tab active' : 'tab'}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {role === 'Brand' && activeTab === 'คัดเลือก Influencer' && (
          <div className="tab-content stack">
            <div className="stat-grid four">
              <StatCard label="โควต้าที่เลือกได้" value={selectionQuota} detail="รายชื่อสูงสุด" />
              <StatCard label="ทีมส่งมา" value={campaign.teamSubmitted} detail="รายชื่อทั้งหมด" tone="blue" />
              <StatCard label="หัวหน้าคัดผ่าน" value={campaign.ownerApproved} detail="พร้อมให้ Brand เลือก" tone="green" />
              <StatCard label="เลือกแล้ว" value={selectedInfluencers.length} detail="รายการที่ติ๊กเลือก" tone="orange" />
            </div>
            <DataTable
              columns={[
                { key: 'tier', label: 'Tier' },
                { key: 'target', label: 'เป้าหมาย' },
                { key: 'ownerApproved', label: 'คัดผ่าน' },
                { key: 'brandSelected', label: 'เลือกแล้ว' },
              ]}
              rows={tierTargets.map((item) => ({ ...item, id: item.tier }))}
            />
            <div className="selection-list">
              {influencers.map((item) => {
                const checked = selectedInfluencers.includes(item.id)
                const disabled = quotaFull && !checked
                return (
                  <label className={disabled ? 'selection-item disabled' : 'selection-item'} key={item.id}>
                    <input
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleInfluencer(item.id)}
                      type="checkbox"
                    />
                    <span>{item.name}</span>
                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {role === 'Brand' && activeTab === 'ความคืบหน้าการลงคลิป' && (
          <div className="tab-content">
            <DataTable
              columns={[
                { key: 'name', label: 'Influencer' },
                { key: 'dealDate', label: 'วันดีลงาน' },
                {
                  key: 'draftStatus',
                  label: 'สถานะ Draft',
                  render: (row) => <Badge variant={getStatusVariant(row.draftStatus)}>{row.draftStatus}</Badge>,
                },
                { key: 'postDate', label: 'วันที่ลงคลิป' },
                { key: 'postLink', label: 'ลิงก์คลิป' },
              ]}
              rows={influencers}
            />
          </div>
        )}

        {role === 'Owner' && activeTab === 'ตรวจรายชื่อจากทีม' && (
          <div className="tab-content stack">
            <OwnerReviewGroup title="1. รอตรวจ" rows={groupedInfluencers.waiting} actions />
            <OwnerReviewGroup title="2. ส่งให้แบรนด์แล้ว" rows={groupedInfluencers.sentToBrand} />
            <OwnerReviewGroup title="3. แบรนด์เลือกแล้ว" rows={groupedInfluencers.brandSelected} finalAction />
          </div>
        )}

        {role === 'Owner' && activeTab === 'บรีฟ & เป้าหมาย' && (
          <div className="tab-content stack">
            <div className="brief-grid">
              <article className="info-card">
                <h3>เป้าหมายรวม</h3>
                <p>สร้าง Awareness และ Conversion ผ่านคอนเทนต์วิดีโอสั้น</p>
                <strong>{campaign.influencerTarget} Influencers</strong>
              </article>
              <article className="info-card">
                <h3>โควต้าแบรนด์</h3>
                <p>จำนวนรายชื่อที่ Brand เลือกได้ในรอบนี้</p>
                <strong>{campaign.brandQuota} รายชื่อ</strong>
              </article>
            </div>
            <DataTable
              columns={[
                { key: 'tier', label: 'Tier' },
                { key: 'target', label: 'เป้าหมาย' },
                { key: 'ownerApproved', label: 'คัดผ่าน' },
                { key: 'brandSelected', label: 'เลือกแล้ว' },
              ]}
              rows={tierTargets.map((item) => ({ ...item, id: item.tier }))}
            />
            <article className="info-card">
              <div className="section-heading small">
                <div>
                  <h3>ประวัติเวอร์ชันบรีฟ</h3>
                  <p>Upload และ Download เป็น mock action สำหรับนำเสนอ flow</p>
                </div>
                <div className="button-row">
                  <button className="secondary-button" onClick={() => showToast('Upload Brief สำเร็จ (Mockup)')} type="button">Upload</button>
                  <button className="secondary-button" onClick={() => showToast('Download Brief สำเร็จ (Mockup)')} type="button">Download</button>
                </div>
              </div>
              <DataTable
                columns={[
                  { key: 'version', label: 'Version' },
                  { key: 'uploadedAt', label: 'วันที่อัปโหลด' },
                  { key: 'uploadedBy', label: 'ผู้อัปโหลด' },
                ]}
                rows={briefVersions}
              />
            </article>
          </div>
        )}

        {role === 'Owner' && activeTab === 'ภาพรวมการผลิตคอนเทนต์' && (
          <div className="tab-content stack">
            <div className="stat-grid">
              <StatCard label="รอส่ง Draft" value="7" detail="Waiting draft" />
              <StatCard label="รอตรวจ Draft" value="4" detail="Draft submitted" tone="orange" />
              <StatCard label="ขอแก้ไข" value="2" detail="Revision requested" tone="orange" />
              <StatCard label="ผ่านแล้ว" value="9" detail="Draft approved" tone="green" />
            </div>
            <StatCard label="ลงคลิปแล้ว" value={campaign.postedContent} detail="Posted content" tone="blue" />
            <DataTable columns={productionColumns} rows={influencers} />
          </div>
        )}

        {role === 'Staff' && activeTab === 'หา Influencer' && (
          <div className="tab-content stack">
            <div className="brief-grid">
              {tierTargets.map((target) => (
                <article className="info-card" key={target.tier}>
                  <h3>{target.tier}</h3>
                  <ProgressBar value={Math.round((target.ownerApproved / target.target) * 100)} label={`${target.ownerApproved}/${target.target}`} />
                </article>
              ))}
            </div>
            <form className="mock-form" onSubmit={handleDuplicateCheck}>
              <h3>เพิ่ม Influencer</h3>
              {warning && <div className="warning-message">{warning}</div>}
              <input placeholder="ชื่อ" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input placeholder="ลิงก์ช่องทาง" value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} />
              <select value={form.tier} onChange={(event) => setForm({ ...form, tier: event.target.value })}>
                {tierTargets.map((target) => <option key={target.tier}>{target.tier}</option>)}
              </select>
              <input placeholder="วันดีลงาน" value={form.dealDate} onChange={(event) => setForm({ ...form, dealDate: event.target.value })} />
              <button className="primary-button" type="submit">เพิ่มรายชื่อ</button>
            </form>
            <DataTable
              columns={[
                ...baseColumns,
                {
                  key: 'action',
                  label: 'Action',
                  render: (row) => row.addedBy === currentStaffName
                    ? <button className="small-button" onClick={() => showToast('เปิดแก้ไขรายการ (Mockup)')} type="button">แก้ไข</button>
                    : <span className="muted">Read only</span>,
                },
              ]}
              rowClassName={(row) => (row.addedBy !== currentStaffName ? 'readonly-row' : '')}
              rows={influencers}
            />
          </div>
        )}

        {role === 'Staff' && activeTab === 'ติดตามงานและอัปเดตคอนเทนต์' && (
          <div className="tab-content stack">
            <DataTable
              columns={[
                { key: 'name', label: 'Influencer' },
                {
                  key: 'productSent',
                  label: 'ส่งสินค้าแล้ว',
                  render: (row) => <input defaultChecked={row.productSent} type="checkbox" />,
                },
                {
                  key: 'draftStatus',
                  label: 'สถานะ Draft',
                  render: (row) => (
                    <select defaultValue={row.draftStatus}>
                      {draftStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  ),
                },
                { key: 'postDate', label: 'วันที่ลงคลิป', render: (row) => <input defaultValue={row.postDate} /> },
                { key: 'postLink', label: 'ลิงก์คลิป', render: (row) => <input defaultValue={row.postLink} /> },
              ]}
              rows={influencers.filter((item) => item.addedBy === currentStaffName)}
            />
            <button className="primary-button save-button" onClick={() => showToast('บันทึกข้อมูลสำเร็จ (Mockup)')} type="button">
              บันทึกการอัปเดต
            </button>
          </div>
        )}

        {activeTab === 'Activity Log' && (
          <div className="tab-content">
            <ActivityTimeline activities={activities} />
          </div>
        )}
      </div>
    </section>
  )
}

function OwnerReviewGroup({ title, rows, actions = false, finalAction = false }) {
  return (
    <article className="info-card">
      <div className="section-heading small">
        <div>
          <h3>{title}</h3>
          <p>{rows.length} รายการ</p>
        </div>
        {finalAction && <button className="primary-button" type="button">ยืนยันและเริ่มงาน</button>}
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Influencer' },
          { key: 'tier', label: 'Tier' },
          { key: 'followers', label: 'Followers' },
          { key: 'addedBy', label: 'Added by' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
          },
          ...(actions
            ? [
                {
                  key: 'actions',
                  label: 'Action',
                  render: () => (
                    <div className="button-row">
                      <button className="small-button success" type="button">คัดผ่าน</button>
                      <button className="small-button danger" type="button">คัดออก</button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
        rows={rows}
      />
    </article>
  )
}

export default CampaignDetail
