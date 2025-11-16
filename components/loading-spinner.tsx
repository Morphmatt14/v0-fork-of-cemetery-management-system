"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  message?: string
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClass[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-teal-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-600 animate-spin"></div>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  )
}
