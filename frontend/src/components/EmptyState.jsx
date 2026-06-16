function EmptyState({ title, description, icon = '📭', action, actionLabel }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="primary-button" onClick={action} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
