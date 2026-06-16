import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import { brands } from '../mock/agencyData'

function Brands() {
  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h2>แบรนด์ทั้งหมด</h2>
          <p>จัดการข้อมูลแบรนด์ ผู้ติดต่อ และแคมเปญที่เกี่ยวข้อง</p>
        </div>
        <button className="primary-button" type="button">เพิ่มแบรนด์</button>
      </div>
      <div className="card-grid">
        {brands.map((brand) => (
          <Link className="info-card" key={brand.id} to={`/brands/${brand.id}`}>
            <div className="card-title-row">
              <h3>{brand.name}</h3>
              <Badge variant="info">{brand.health}</Badge>
            </div>
            <p>{brand.category}</p>
            <span>{brand.activeCampaigns} แคมเปญที่ใช้งานอยู่</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Brands
