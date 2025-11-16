export type ContentCategory = "homepage" | "services" | "pricing"

export interface ContentItem {
  id: string
  category: ContentCategory
  key: string
  value: string | number
  label: string
}

export interface PricingItem {
  type: "lawn" | "garden" | "family"
  price: number
  description: string
}

// Initialize default content
const DEFAULT_CONTENT: ContentItem[] = [
  // Homepage
  { id: "1", category: "homepage", key: "title", value: "SURIGAO MEMORIAL PARK INC.", label: "Main Title" },
  {
    id: "2",
    category: "homepage",
    key: "subtitle",
    value: "A respectful and modern way to locate graves, explore memorial services, and honor your loved ones.",
    label: "Subtitle",
  },

  // Services
  { id: "3", category: "services", key: "heading", value: "What We Can Offer You", label: "Services Heading" },
  {
    id: "4",
    category: "services",
    key: "description",
    value:
      "Choose from our three distinct memorial options, each designed to honor your loved ones with dignity and respect in beautiful, well-maintained settings.",
    label: "Services Description",
  },
]

const DEFAULT_PRICING: PricingItem[] = [
  {
    type: "lawn",
    price: 75000,
    description: "Traditional burial plots with individual markers on well-maintained lawn areas.",
  },
  {
    type: "garden",
    price: 120000,
    description: "Beautiful garden-style lots with flat markers seamlessly integrated into landscaped areas.",
  },
  {
    type: "family",
    price: 500000,
    description: "Premium family estates with private mausoleums and dedicated spaces for multiple family members.",
  },
]

export const contentStore = {
  getContent: (): ContentItem[] => {
    if (typeof window === "undefined") return DEFAULT_CONTENT
    const stored = localStorage.getItem("cemetery_content")
    return stored ? JSON.parse(stored) : DEFAULT_CONTENT
  },

  saveContent: (content: ContentItem[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("cemetery_content", JSON.stringify(content))
  },

  getContentByCategory: (category: ContentCategory): ContentItem[] => {
    return contentStore.getContent().filter((item) => item.category === category)
  },

  updateContent: (id: string, value: string | number) => {
    const content = contentStore.getContent()
    const index = content.findIndex((item) => item.id === id)
    if (index !== -1) {
      content[index].value = value
      contentStore.saveContent(content)
    }
  },

  getPricing: (): PricingItem[] => {
    if (typeof window === "undefined") return DEFAULT_PRICING
    const stored = localStorage.getItem("cemetery_pricing")
    return stored ? JSON.parse(stored) : DEFAULT_PRICING
  },

  savePricing: (pricing: PricingItem[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("cemetery_pricing", JSON.stringify(pricing))
  },

  getPrice: (type: "lawn" | "garden" | "family"): number => {
    const pricing = contentStore.getPricing()
    const item = pricing.find((p) => p.type === type)
    return item?.price || 0
  },

  updatePrice: (type: "lawn" | "garden" | "family", price: number) => {
    const pricing = contentStore.getPricing()
    const index = pricing.findIndex((p) => p.type === type)
    if (index !== -1) {
      pricing[index].price = price
      contentStore.savePricing(pricing)
    }
  },
}
