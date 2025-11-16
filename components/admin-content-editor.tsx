"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { contentStore, type ContentCategory, type ContentItem } from "@/lib/content-store"

interface AdminContentEditorProps {
  category: ContentCategory
  title: string
}

export function AdminContentEditor({ category, title }: AdminContentEditorProps) {
  const [content, setContent] = useState<ContentItem[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    const items = contentStore.getContentByCategory(category)
    setContent(items)
  }, [category])

  const handleUpdate = (id: string, value: string | number) => {
    contentStore.updateContent(id, value)
    setContent((prev) => prev.map((item) => (item.id === id ? { ...item, value } : item)))
    setSaveMessage("✓ Changes saved!")
    setTimeout(() => setSaveMessage(""), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">{item.label}</label>
            {item.label.toLowerCase().includes("description") || item.label.toLowerCase().includes("subtitle") ? (
              <textarea
                value={item.value as string}
                onChange={(e) => handleUpdate(item.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-24"
              />
            ) : (
              <Input
                type="text"
                value={item.value as string}
                onChange={(e) => handleUpdate(item.id, e.target.value)}
                className="border-gray-300"
              />
            )}
            <p className="text-xs text-gray-500">Current: {String(item.value).substring(0, 60)}...</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
