"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"

export interface Toast {
  id: string
  title: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString()
    const duration = toast.duration || 4000

    setToasts((prev) => [...prev, { ...toast, id, duration }])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: () => void
}) {
  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
  }

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
    warning: "text-yellow-800",
  }

  const titleColors = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
    warning: "text-yellow-900",
  }

  return (
    <div className={`${bgColors[toast.type]} border rounded-lg p-4 shadow-lg animate-slide-in`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className={`font-semibold ${titleColors[toast.type]}`}>{toast.title}</h3>
          <p className={`text-sm mt-1 ${textColors[toast.type]}`}>{toast.message}</p>
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close toast"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
