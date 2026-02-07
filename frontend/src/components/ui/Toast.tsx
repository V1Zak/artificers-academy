'use client'

import { motion, AnimatePresence } from 'framer-motion'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastData {
  id: string
  message: string
  variant: ToastVariant
}

const variantStyles: Record<ToastVariant, { border: string; icon: string; text: string }> = {
  success: {
    border: 'border-l-4 border-luminescent',
    icon: '✦',
    text: 'text-luminescent',
  },
  error: {
    border: 'border-l-4 border-mana-red',
    icon: '✕',
    text: 'text-mana-red',
  },
  info: {
    border: 'border-l-4 border-mana-blue',
    icon: '◈',
    text: 'text-mana-blue',
  },
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const style = variantStyles[toast.variant]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`glass-card ${style.border} px-4 py-3 flex items-start gap-3 cursor-pointer`}
      onClick={() => onDismiss(toast.id)}
    >
      <span className={`${style.text} text-lg leading-none mt-0.5`}>{style.icon}</span>
      <p className="text-sm text-silver/90 flex-1">{toast.message}</p>
    </motion.div>
  )
}
