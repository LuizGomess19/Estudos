import { useEffect } from 'react'

export default function Modal({ open, onClose, title, icon, children }) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    if (!open) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box glass-panel" onClick={e => e.stopPropagation()}>
                <h3>{icon && <i className={icon} />} {title}</h3>
                {children}
            </div>
        </div>
    )
}
