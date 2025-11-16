"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, AlertCircle } from "lucide-react"
import { type NewsItem, getNews, addNews, deleteNews } from "@/lib/news-store"

export function NewsManager() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "news" as const,
  })

  useEffect(() => {
    setNews(getNews())
  }, [])

  const handleAddNews = () => {
    if (!newItem.title.trim() || !newItem.content.trim()) {
      alert("Please fill in all fields")
      return
    }

    const added = addNews({
      title: newItem.title,
      content: newItem.content,
      category: newItem.category,
      date: new Date().toISOString().split("T")[0],
    })

    setNews(getNews())
    setNewItem({ title: "", content: "", category: "news" })
    setIsAddOpen(false)
    setSuccessMessage("News item added successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this news item?")) {
      deleteNews(id)
      setNews(getNews())
      setSuccessMessage("News item deleted successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">News & Updates</h3>
        <Button onClick={() => setIsAddOpen(!isAddOpen)} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add News
        </Button>
      </div>

      {isAddOpen && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle>Add New Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Enter news title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                placeholder="Enter news content"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select
                value={newItem.category}
                onValueChange={(value: any) => setNewItem({ ...newItem, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddNews} className="bg-teal-600 hover:bg-teal-700 text-white flex-1">
                Save News
              </Button>
              <Button onClick={() => setIsAddOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {news.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No news items yet. Add your first update!</p>
          </div>
        ) : (
          news.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.category === "announcement"
                            ? "bg-red-100 text-red-700"
                            : item.category === "update"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.content}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
