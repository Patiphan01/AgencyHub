function ActivityTimeline({ activities, title = 'Activity Log' }) {
  return (
    <article className="info-card">
      <div className="section-heading small">
        <div>
          <h3>{title}</h3>
          <p>Mock timeline สำหรับจำลองประวัติการทำงานของระบบ</p>
        </div>
      </div>
      <div className="activity-list">
        {activities.map((activity) => (
          <div className="activity-item" key={activity.id}>
            <div className="activity-dot" />
            <div>
              <strong>{activity.user}</strong>
              <p>{activity.action}</p>
              <span>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default ActivityTimeline
