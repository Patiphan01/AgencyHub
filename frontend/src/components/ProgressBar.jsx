function ProgressBar({ value, label }) {
  return (
    <div className="progress-group">
      <div className="progress-label">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
