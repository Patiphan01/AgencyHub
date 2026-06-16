import { useState } from 'react'
import { useParams } from 'react-router-dom'
import CampaignCard from '../components/CampaignCard'
import Dialog from '../components/Dialog'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { brands, campaigns } from '../mock/agencyData'

function BrandDetail() {
  const { brandId } = useParams()
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState('')
  const brand = brands.find((item) => item.id === brandId) || brands[0]
  const brandCampaigns = campaigns.filter((campaign) => campaign.brandId === brand.id)
  const [form, setForm] = useState({
    name: '',
    objective: '',
    budget: '',
    influencerTarget: '',
  })

  function showToast(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function handleCreateCampaign(event) {
    event.preventDefault()
    showToast('สร้างแคมเปญสำเร็จ (Mockup)')
    setShowCreateCampaign(false)
    setForm({ name: '', objective: '', budget: '', influencerTarget: '' })
  }

  function handleDeleteBrand() {
    showToast('ลบแบรนด์สำเร็จ (Mockup)')
    setShowDeleteConfirm(false)
  }

  return (
    <section className="stack">
      {toast && <div className="toast">{toast}</div>}
      <div className="hero-panel compact">
        <div>
          <p className="eyebrow">{brand.category}</p>
          <h2>{brand.name}</h2>
          <p>ผู้ติดต่อหลัก: {brand.contact}</p>
        </div>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() => setShowDeleteConfirm(true)}
            type="button"
          >
            ลบแบรนด์
          </button>
          <button className="primary-button" onClick={() => setShowCreateCampaign(true)} type="button">
            + สร้างแคมเปญใหม่
          </button>
        </div>
      </div>

      <div className="stat-grid three">
        <StatCard label="Active campaigns" value={brand.activeCampaigns} detail="แคมเปญที่กำลังดำเนินการ" />
        <StatCard label="Brand health" value={brand.health} detail="สถานะความสัมพันธ์" tone="green" />
        <StatCard label="Next review" value="สัปดาห์นี้" detail="รอบอัปเดตถัดไป" tone="orange" />
      </div>

      <div className="section-heading">
        <div>
          <h2>Campaigns ({brandCampaigns.length})</h2>
          <p>แคมเปญทั้งหมดของแบรนด์นี้</p>
        </div>
      </div>

      {brandCampaigns.length > 0 ? (
        <div className="campaign-grid">
          {brandCampaigns.map((campaign) => (
            <CampaignCard campaign={campaign} key={campaign.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="ไม่มีแคมเปญ"
          description="สร้างแคมเปญใหม่เพื่อเริ่มการดำเนินการ"
          icon="🎬"
          action={() => setShowCreateCampaign(true)}
          actionLabel="+ สร้างแคมเปญ"
        />
      )}

      <Modal
        isOpen={showCreateCampaign}
        onClose={() => setShowCreateCampaign(false)}
        title="สร้างแคมเปญใหม่"
      >
        <form className="mock-form" onSubmit={handleCreateCampaign}>
          <label>
            ชื่อแคมเปญ
            <input
              placeholder="เช่น Summer Collection 2024"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            วัตถุประสงค์
            <input
              placeholder="เช่น Awareness + Conversion"
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              required
            />
          </label>
          <label>
            งบประมาณ (บาท)
            <input
              placeholder="เช่น 500000"
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              required
            />
          </label>
          <label>
            จำนวน Influencer เป้าหมาย
            <input
              placeholder="เช่น 50"
              type="number"
              value={form.influencerTarget}
              onChange={(e) => setForm({ ...form, influencerTarget: e.target.value })}
              required
            />
          </label>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => setShowCreateCampaign(false)}
              type="button"
            >
              ยกเลิก
            </button>
            <button className="primary-button" type="submit">
              สร้างแคมเปญ
            </button>
          </div>
        </form>
      </Modal>

      <Dialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteBrand}
        title="ยืนยันการลบแบรนด์"
        message={`คุณแน่ใจหรือว่าต้องการลบแบรนด์ "${brand.name}"? การกระทำนี้ไม่สามารถเลิกทำได้`}
        confirmText="ลบแบรนด์"
        isDanger
      />
    </section>
  )
}

export default BrandDetail

