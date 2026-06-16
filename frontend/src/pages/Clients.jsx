import Badge from '../components/Badge'

const clients = [
  { id: 'cl-1', name: 'GlowHaus Beauty', owner: 'คุณมินนี่', status: 'Retainer' },
  { id: 'cl-2', name: 'UrbanBite', owner: 'คุณต้น', status: 'Project' },
  { id: 'cl-3', name: 'FitLoop', owner: 'คุณแพรว', status: 'Pipeline' },
]

function Clients() {
  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h2>ลูกค้า</h2>
          <p>ข้อมูลบัญชีลูกค้าและผู้ติดต่อหลักของแต่ละแบรนด์</p>
        </div>
      </div>
      <div className="card-grid">
        {clients.map((client) => (
          <article className="info-card" key={client.id}>
            <div className="card-title-row">
              <h3>{client.name}</h3>
              <Badge variant="neutral">{client.status}</Badge>
            </div>
            <p>ผู้ติดต่อ: {client.owner}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Clients
