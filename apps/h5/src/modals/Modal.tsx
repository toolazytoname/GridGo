import type { ReactNode } from 'react'

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <div className="gg-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`gg-modal ${wide ? 'gg-modal-wide' : ''}`}>{children}</div>
    </div>
  )
}
