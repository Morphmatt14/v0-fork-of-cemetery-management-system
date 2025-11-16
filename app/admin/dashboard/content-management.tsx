"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Save, X, Check, Plus, Trash2 } from "lucide-react"

interface ContentItem {
  id: string
  title: string
  key: string
  value: string
  category: string
  isEditing?: boolean
}

export function ContentManagement() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: "1",
      title: "Welcome Title",
      key: "welcome_title",
      value: "Welcome to Surigao Memorial Park",
      category: "homepage",
    },
    {
      id: "2",
      title: "Welcome Description",
      key: "welcome_description",
      value: "A respectful and modern way to locate graves and honor your loved ones.",
      category: "homepage",
    },
    {
      id: "3",
      title: "Services Title",
      key: "services_title",
      value: "What We Can Offer You",
      category: "services",
    },
    {
      id: "4",
      title: "Lawn Lot Description",
      key: "lawn_lot_description",
      value: "Traditional burial plots with individual markers on well-maintained lawn areas.",
      category: "services",
    },
    {
      id: "5",
      title: "Garden Lot Description",
      key: "garden_lot_description",
      value: "Beautiful garden-style lots with flat markers seamlessly integrated into landscaped areas.",
      category: "services",
    },
    {
      id: "6",
      title: "Family Estate Description",
      key: "family_state_description",
      value: "Premium family estates with private mausoleums and dedicated spaces for multiple family members.",
      category: "services",
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newItem, setNewItem] = useState({
    title: "",
    key: "",
    value: "",
    category: "homepage",
  })

  const filteredItems = contentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id)
    setEditValues({ [item.id]: item.value })
  }

  const handleSave = (id: string) => {
    const newValue = editValues[id]
    if (newValue !== undefined) {
      setContentItems(contentItems.map((item) => (item.id === id ? { ...item, value: newValue } : item)))
      setEditingId(null)
      setSaved(id)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleDelete = (id: string) => {
    setContentItems(contentItems.filter((item) => item.id !== id))
  }

  const handleAddNew = () => {
    if (newItem.title && newItem.key && newItem.value) {
      setContentItems([
        ...contentItems,
        {
          id: Date.now().toString(),
          ...newItem,
        },
      ])
      setNewItem({
        title: "",
        key: "",
        value: "",
        category: "homepage",
      })
      setIsAddingNew(false)
    }
  }

  const categories = Array.from(new Set(contentItems.map((item) => item.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Content Management</h3>
          <p className="text-gray-600">Edit website content and text</p>
        </div>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
              <DialogDescription>Add a new content item to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Content title"
                />
              </div>
              <div>
                <Label htmlFor="new-key">Key</Label>
                <Input
                  id="new-key"
                  value={newItem.key}
                  onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
                  placeholder="content_key"
                />
              </div>
              <div>
                <Label htmlFor="new-category">Category</Label>
                <select
                  id="new-category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="new-value">Content</Label>
                <Textarea
                  id="new-value"
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  placeholder="Content value"
                  className="min-h-24"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleAddNew}>
                  Add Content
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAddingNew(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filterCategory || ""}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Content Items */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {item.key}
                    </Badge>
                  </div>
                </div>
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleCancel()}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSave(item.id)}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {saved === item.id && (
                <div className="mb-3 flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Saved successfully
                </div>
              )}

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
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">{item.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No content items found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
