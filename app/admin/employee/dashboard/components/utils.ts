// Shared utility functions for employee dashboard

export const formatCurrency = (value: number | null | undefined): string => {
  return value != null ? value.toLocaleString() : '0'
}

export const saveToLocalStorage = (data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("globalData", JSON.stringify(data))
  }
}

export const loadFromLocalStorage = (): any => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("globalData")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("Failed to parse stored data:", e)
        return null
      }
    }
  }
  return null
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "New":
      return "destructive"
    case "In Progress":
      return "default"
    case "Resolved":
      return "secondary"
    default:
      return "outline"
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive"
    case "normal":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}
