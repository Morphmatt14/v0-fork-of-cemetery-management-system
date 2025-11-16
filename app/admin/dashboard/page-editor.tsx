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
import { Edit, Save, X, Check, Plus, Eye, EyeOff, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react"

interface PageSection {
  id: string
  title: string
  type: "hero" | "content" | "gallery" | "features" | "cta" | "testimonial"
  content: Record<string, string>
  isVisible: boolean
  displayOrder: number
  isEditing?: boolean
}

const DEFAULT_SECTIONS: PageSection[] = [
  {
    id: "hero-1",
    title: "Hero Section",
    type: "hero",
    content: {
      heading: "Welcome to Surigao Memorial Park",
      subheading: "A respectful and modern way to honor your loved ones",
      image: "/images/surigao-memorial-bg.jpg",
      buttonText: "Explore Services",
    },
    isVisible: true,
    displayOrder: 0,
  },
  {
    id: "services-intro",
    title: "Services Introduction",
    type: "content",
    content: {
      heading: "What We Can Offer You",
      description:
        "Choose from our three distinct memorial options, each designed to honor your loved ones with dignity and respect.",
      alignment: "center",
    },
    isVisible: true,
    displayOrder: 1,
  },
  {
    id: "lot-cards",
    title: "Lot Options",
    type: "gallery",
    content: {
      showLawns: "true",
      showGardens: "true",
      showFamily: "true",
      cardsPerRow: "3",
    },
    isVisible: true,
    displayOrder: 2,
  },
  {
    id: "features",
    title: "Features & Benefits",
    type: "features",
    content: {
      feature1: "24/7 Security",
      feature2: "Professional Care",
      feature3: "Perpetual Maintenance",
      feature4: "Family Support",
    },
    isVisible: true,
    displayOrder: 3,
  },
  {
    id: "cta-footer",
    title: "Call to Action",
    type: "cta",
    content: {
      heading: "Ready to Get Started?",
      description: "Contact us today for more information or to make an appointment",
      buttonText: "Contact Us",
      buttonLink: "/contact",
    },
    isVisible: true,
    displayOrder: 4,
  },
]

interface PageEditorProps {
  pageName: "homepage" | "services"
  pageTitle: string
}

export function PageEditor({ pageName, pageTitle }: PageEditorProps) {
  const [sections, setSections] = useState<PageSection[]>(DEFAULT_SECTIONS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionType, setNewSectionType] = useState<PageSection["type"]>("content")

  const handleEditSection = (section: PageSection) => {
    setEditingId(section.id)
    setEditValues(section.content)
  }

  const handleSaveSection = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, content: editValues } : s)))
    setEditingId(null)
    setSaved(id)
    setTimeout(() => setSaved(null), 2000)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id))
  }

  const handleToggleVisibility = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)))
  }

  const handleMoveUp = (id: string) => {
    const idx = sections.findIndex((s) => s.id === id)
    if (idx > 0) {
      const newSections = [...sections]
      ;[newSections[idx - 1].displayOrder, newSections[idx].displayOrder] = [
        newSections[idx].displayOrder,
        newSections[idx - 1].displayOrder,
      ]
      newSections.sort((a, b) => a.displayOrder - b.displayOrder)
      setSections(newSections)
    }
  }

  const handleMoveDown = (id: string) => {
    const idx = sections.findIndex((s) => s.id === id)
    if (idx < sections.length - 1) {
      const newSections = [...sections]
      ;[newSections[idx + 1].displayOrder, newSections[idx].displayOrder] = [
        newSections[idx].displayOrder,
        newSections[idx + 1].displayOrder,
      ]
      newSections.sort((a, b) => a.displayOrder - b.displayOrder)
      setSections(newSections)
    }
  }

  const handleAddSection = () => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      title: `New ${newSectionType} Section`,
      type: newSectionType,
      content: {},
      isVisible: true,
      displayOrder: sections.length,
    }
    setSections([...sections, newSection])
    setIsAddingSection(false)
  }

  const handleDuplicateSection = (section: PageSection) => {
    const newSection: PageSection = {
      ...section,
      id: `section-${Date.now()}`,
      title: `${section.title} (Copy)`,
      displayOrder: sections.length,
    }
    setSections([...sections, newSection])
  }

  const renderSectionPreview = (section: PageSection) => {
    const content = editingId === section.id ? editValues : section.content

    switch (section.type) {
      case "hero":
        return (
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-2">{content.heading}</h2>
            <p className="text-lg opacity-90">{content.subheading}</p>
          </div>
        )
      case "content":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{content.heading}</h2>
            <p className="text-gray-600">{content.description}</p>
          </div>
        )
      case "features":
        return (
          <div className="grid grid-cols-2 gap-4">
            {Object.values(content).map((feature, idx) => (
              <div key={idx} className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="font-medium text-gray-900">{feature}</p>
              </div>
            ))}
          </div>
        )
      case "cta":
        return (
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">{content.heading}</h3>
            <p className="text-gray-600 mb-4">{content.description}</p>
            <Button className="bg-blue-600 hover:bg-blue-700">{content.buttonText}</Button>
          </div>
        )
      case "gallery":
        return (
          <div className="grid grid-cols-3 gap-4">
            {content.showLawns === "true" && (
              <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">Lawn Lot</div>
            )}
            {content.showGardens === "true" && (
              <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">Garden Lot</div>
            )}
            {content.showFamily === "true" && (
              <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">Family Estate</div>
            )}
          </div>
        )
      default:
        return <p className="text-gray-600">Section preview</p>
    }
  }

  const renderEditForm = (section: PageSection) => {
    const content = editValues

    return (
      <div className="space-y-4">
        {section.type === "hero" && (
          <>
            <div>
              <Label>Heading</Label>
              <Input
                value={content.heading || ""}
                onChange={(e) => setEditValues({ ...content, heading: e.target.value })}
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={content.subheading || ""}
                onChange={(e) => setEditValues({ ...content, subheading: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={content.image || ""}
                onChange={(e) => setEditValues({ ...content, image: e.target.value })}
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={content.buttonText || ""}
                onChange={(e) => setEditValues({ ...content, buttonText: e.target.value })}
              />
            </div>
          </>
        )}

        {section.type === "content" && (
          <>
            <div>
              <Label>Heading</Label>
              <Input
                value={content.heading || ""}
                onChange={(e) => setEditValues({ ...content, heading: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={content.description || ""}
                onChange={(e) => setEditValues({ ...content, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Alignment</Label>
              <select
                value={content.alignment || "left"}
                onChange={(e) => setEditValues({ ...content, alignment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {section.type === "features" && (
          <>
            {Object.keys(content).map((key) => (
              <div key={key}>
                <Label>{key.replace(/_/g, " ")}</Label>
                <Input
                  value={content[key] || ""}
                  onChange={(e) => setEditValues({ ...content, [key]: e.target.value })}
                />
              </div>
            ))}
          </>
        )}

        {section.type === "cta" && (
          <>
            <div>
              <Label>Heading</Label>
              <Input
                value={content.heading || ""}
                onChange={(e) => setEditValues({ ...content, heading: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={content.description || ""}
                onChange={(e) => setEditValues({ ...content, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={content.buttonText || ""}
                onChange={(e) => setEditValues({ ...content, buttonText: e.target.value })}
              />
            </div>
            <div>
              <Label>Button Link</Label>
              <Input
                value={content.buttonLink || ""}
                onChange={(e) => setEditValues({ ...content, buttonLink: e.target.value })}
              />
            </div>
          </>
        )}

        {section.type === "gallery" && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={content.showLawns === "true"}
                  onChange={(e) =>
                    setEditValues({
                      ...content,
                      showLawns: e.target.checked ? "true" : "false",
                    })
                  }
                />
                Show Lawn Lots
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={content.showGardens === "true"}
                  onChange={(e) =>
                    setEditValues({
                      ...content,
                      showGardens: e.target.checked ? "true" : "false",
                    })
                  }
                />
                Show Garden Lots
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={content.showFamily === "true"}
                  onChange={(e) =>
                    setEditValues({
                      ...content,
                      showFamily: e.target.checked ? "true" : "false",
                    })
                  }
                />
                Show Family Estates
              </Label>
            </div>
            <div>
              <Label>Cards Per Row</Label>
              <select
                value={content.cardsPerRow || "3"}
                onChange={(e) => setEditValues({ ...content, cardsPerRow: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </>
        )}
      </div>
    )
  }

  const sortedSections = [...sections].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{pageTitle} Editor</h3>
          <p className="text-gray-600">Manage sections and content for your {pageName}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Page Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-8 py-4">
                {sortedSections
                  .filter((s) => s.isVisible)
                  .map((section) => (
                    <div key={section.id}>{renderSectionPreview(section)}</div>
                  ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingSection} onOpenChange={setIsAddingSection}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Section</DialogTitle>
                <DialogDescription>Choose a section type to add to your page</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Section Type</Label>
                  <select
                    value={newSectionType}
                    onChange={(e) => setNewSectionType(e.target.value as PageSection["type"])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="hero">Hero</option>
                    <option value="content">Content</option>
                    <option value="gallery">Gallery</option>
                    <option value="features">Features</option>
                    <option value="cta">Call to Action</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleAddSection}>
                    Add Section
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAddingSection(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sortedSections.map((section, idx) => (
          <Card key={section.id}>
            <CardContent className="p-4">
              {/* Section Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {section.type}
                    </Badge>
                    {!section.isVisible && (
                      <Badge variant="secondary" className="text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  {editingId !== section.id && (
                    <div className="text-sm text-gray-600 mb-3">{renderSectionPreview(section)}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  {editingId === section.id ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleCancel()} title="Cancel">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleSaveSection(section.id)}
                        title="Save"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEditSection(section)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVisibility(section.id)}
                        title="Toggle visibility"
                      >
                        {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveUp(section.id)}
                        disabled={idx === 0}
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveDown(section.id)}
                        disabled={idx === sortedSections.length - 1}
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateSection(section)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteSection(section.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Saved Indicator */}
              {saved === section.id && (
                <div className="mb-3 flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Saved successfully
                </div>
              )}

              {/* Edit Form */}
              {editingId === section.id && <div className="border-t pt-4">{renderEditForm(section)}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedSections.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">No sections yet</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
