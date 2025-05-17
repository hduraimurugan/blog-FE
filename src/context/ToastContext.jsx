import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MdClose } from "react-icons/md";

const ToastContext = createContext()

export const ToastProvider = ({ children, position = 'top-right' }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()

    const newToast = { id, message, type }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
  }, [])

  const value = {
    toasts,
    showToast,
  }

  // Position Mapping
  const positionClasses = {
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div className={`fixed z-50 space-y-3 ${positionClasses[position]} transform`}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`relative min-w-[200px] max-w-xs px-4 py-3 rounded-xl shadow-xl text-white font-medium
        ${toast.type === 'success'
                  ? 'bg-emerald-600'
                  : toast.type === 'neutral'
                    ? 'bg-neutral text-neutral-content'
                    : toast.type === 'info'
                      ? 'bg-blue-500 '
                      : toast.type === 'error'
                        ? 'bg-red-500'
                        : toast.type === 'warning'
                          ? 'bg-amber-400 text-black'
                          : 'bg-indigo-500'
                }`}
            >
              {toast.message}

              {/* Close Button */}
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="absolute p-1 top-2 right-2 text-white hover:text-white/80 text-sm font-bold cursor-pointer"
              >
                <MdClose />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
