import Badge from '../components/Badge'

const invoices = [
  { id: 'INV-1008', client: 'GlowHaus Beauty', amount: '฿180,000', status: 'รอชำระ' },
  { id: 'INV-1009', client: 'UrbanBite', amount: '฿95,000', status: 'ร่างเอกสาร' },
]

function Invoices() {
  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h2>ใบแจ้งหนี้</h2>
          <p>Mockup สำหรับติดตามงบแคมเปญ ใบเสนอราคา และการวางบิล</p>
        </div>
      </div>
      <div className="card-grid">
        {invoices.map((invoice) => (
          <article className="info-card" key={invoice.id}>
            <div className="card-title-row">
              <h3>{invoice.id}</h3>
              <Badge variant="warning">{invoice.status}</Badge>
            </div>
            <p>{invoice.client}</p>
            <strong>{invoice.amount}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Invoices
