import { useEffect } from 'react'

function Dialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก', isDanger = false }) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            {cancelText}
          </button>
          <button
            className={isDanger ? 'danger-button' : 'primary-button'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  )
}

export default Dialog
