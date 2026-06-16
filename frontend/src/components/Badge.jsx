const variants = {
  neutral: 'badge-neutral',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  purple: 'badge-purple',
}

function Badge({ children, variant = 'neutral' }) {
  return <span className={`badge ${variants[variant] || variants.neutral}`}>{children}</span>
}

export default Badge
