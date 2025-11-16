"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Check } from "lucide-react"
import { getContentByCategory, setContent } from "@/lib/content-manager"

interface ContentEditorProps {
  category: string
  title: string
}

export function ContentEditor({ category, title }: ContentEditorProps) {
  const [items, setItems] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const content = getContentByCategory(category)
    setItems(content)
  }, [category])

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setEditValues({ [item.id]: item.value })
  }

  const handleSave = (id: string) => {
    const newValue = editValues[id]
    if (newValue) {
      const item = items.find((i) => i.id === id)
      if (item) {
        setContent(item.key, newValue, category)
        setItems(items.map((i) => (i.id === id ? { ...i, value: newValue } : i)))
        setEditingId(null)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {saved && (
            <Badge className="bg-green-600">
              <Check className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Edit page content and text</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <Label className="text-sm font-medium text-gray-700">{item.key.replace(/_/g, " ")}</Label>
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleCancel()}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave(item.id)}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {editingId === item.id ? (
                item.value.length > 100 ? (
                  <Textarea
                    value={editValues[item.id] || item.value}
                    onChange={(e) => setEditValues({ ...editValues, [item.id]: e.target.value })}
                    className="min-h-24"
                  />
                ) : (
                  <Input
                    value={editValues[item.id] || item.value}
                    onChange={(e) => setEditValues({ ...editValues, [item.id]: e.target.value })}
                  />
                )
              ) : (
                <p className="text-gray-600 text-sm">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
