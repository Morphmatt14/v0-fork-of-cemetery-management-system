import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// In-memory cache for content (fallback if Supabase is not available)
const contentCache: Record<string, any> = {
  homepage: {
    welcome_title: "Welcome to Surigao Memorial Park",
    welcome_description: "A respectful and modern way to locate graves and honor your loved ones.",
    services_title: "What We Can Offer You",
    services_description: "Choose from our three distinct memorial options",
  },
  services: {
    lawn_lot_title: "Lawn Lot",
    lawn_lot_description: "Traditional burial plots with individual markers",
    garden_lot_title: "Garden Lot",
    garden_lot_description: "Beautiful garden-style lots with flat markers",
    family_state_title: "Family Estate",
    family_state_description: "Premium family estates with private mausoleums",
  },
  pricing: {
    lawn_lot_price: "75000",
    garden_lot_price: "120000",
    family_state_price: "500000",
  },
}

async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Handle error
        }
      },
    },
  })
}

export async function getContentByCategory(category: string) {
  try {
    const supabase = await getSupabaseClient()

    // Try to fetch from database
    const { data, error } = await supabase.from("content_fields").select("id, field_key as key, field_value as value")

    if (error || !data) {
      // Fallback to cache
      const cached = contentCache[category] || {}
      return Object.entries(cached).map(([key, value], idx) => ({
        id: `${category}-${idx}`,
        key,
        value: String(value),
      }))
    }

    return data.map((item, idx) => ({
      id: `${category}-${idx}`,
      key: item.key,
      value: item.value,
    }))
  } catch (error) {
    // Fallback to cache
    const cached = contentCache[category] || {}
    return Object.entries(cached).map(([key, value], idx) => ({
      id: `${category}-${idx}`,
      key,
      value: String(value),
    }))
  }
}

export async function getContent(key: string) {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .single()

    if (error || !data) {
      // Try to find in cache
      for (const category in contentCache) {
        if (key in contentCache[category]) {
          return contentCache[category][key]
        }
      }
      return ""
    }

    return data.setting_value || ""
  } catch (error) {
    // Fallback to cache
    for (const category in contentCache) {
      if (key in contentCache[category]) {
        return contentCache[category][key]
      }
    }
    return ""
  }
}

export async function setContent(key: string, value: string, category: string) {
  try {
    const supabase = await getSupabaseClient()

    // Update cache first
    if (!contentCache[category]) {
      contentCache[category] = {}
    }
    contentCache[category][key] = value

    // Try to update database
    const { data, error } = await supabase
      .from("system_settings")
      .upsert(
        {
          setting_key: key,
          setting_value: value,
          category: category,
        },
        { onConflict: "setting_key" },
      )
      .select()

    return { success: !error, data, error }
  } catch (error) {
    console.error("Error setting content:", error)
    return { success: true, data: null, error } // Still consider cache update successful
  }
}

export async function getAllPricing() {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase.from("lot_pricing").select("*").eq("is_active", true).order("display_order")

    if (error || !data) {
      return []
    }

    return data
  } catch (error) {
    return []
  }
}

export async function updatePricing(lotType: string, price: number, description?: string) {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from("lot_pricing")
      .update({
        price,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("lot_type", lotType)
      .select()

    return { success: !error, data, error }
  } catch (error) {
    return { success: false, data: null, error }
  }
}

export function clearContentCache() {
  // Clear in-memory cache (useful for testing)
  Object.keys(contentCache).forEach((key) => {
    delete contentCache[key]
  })
}
