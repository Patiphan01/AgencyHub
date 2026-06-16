function StatCard({ label, value, detail, tone = 'primary' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}

export default StatCard
