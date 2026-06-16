import { useState } from 'react'
import { notifications } from '../mock/agencyData'

function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const role = localStorage.getItem('agencyhub-role') || 'Owner'
  const roleNotifications = notifications.filter((notification) => notification.role === role)
  const unreadCount = roleNotifications.filter((notification) => notification.unread).length

  return (
    <div className="notification-center">
      <button
        aria-label="Notifications"
        className="icon-button notification-button"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>!</span>
        {unreadCount > 0 && <em>{unreadCount}</em>}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-header">
            <strong>Notifications</strong>
            <span>{unreadCount} unread</span>
          </div>
          {roleNotifications.map((notification) => (
            <article className="notification-item" key={notification.id}>
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
              <span>{notification.time}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
