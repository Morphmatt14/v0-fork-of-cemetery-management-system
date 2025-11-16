export interface NewsItem {
  id: string
  title: string
  content: string
  date: string
  category: "news" | "update" | "announcement"
}

const DEFAULT_NEWS = [
  {
    id: "news-1",
    title: "New Garden Section Opened",
    content:
      "We are proud to announce the opening of our new Garden Lot section with enhanced landscaping and improved accessibility.",
    date: new Date().toISOString().split("T")[0],
    category: "announcement" as const,
  },
  {
    id: "news-2",
    title: "Extended Payment Plans Available",
    content: "Now offering flexible 12-month and 24-month payment plans for all lot types.",
    date: new Date().toISOString().split("T")[0],
    category: "update" as const,
  },
]

export function getNews(): NewsItem[] {
  const existing = localStorage.getItem("news_store")
  if (!existing) {
    localStorage.setItem("news_store", JSON.stringify(DEFAULT_NEWS))
    return DEFAULT_NEWS
  }
  return JSON.parse(existing)
}

export function addNews(news: Omit<NewsItem, "id">): NewsItem {
  const newItem: NewsItem = {
    ...news,
    id: `news-${Date.now()}`,
  }
  const current = getNews()
  localStorage.setItem("news_store", JSON.stringify([newItem, ...current]))
  return newItem
}

export function deleteNews(id: string): void {
  const current = getNews()
  localStorage.setItem("news_store", JSON.stringify(current.filter((item) => item.id !== id)))
}

export function updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
  const current = getNews()
  const index = current.findIndex((item) => item.id === id)
  if (index === -1) return null
  current[index] = { ...current[index], ...updates }
  localStorage.setItem("news_store", JSON.stringify(current))
  return current[index]
}
