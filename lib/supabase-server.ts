import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ""

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing Supabase server environment variables")
}

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper functions for server-side operations
export async function getClients() {
  try {
    const { data, error } = await supabaseServer.from("clients").select("*")
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching clients:", error)
    return null
  }
}

export async function getLots() {
  try {
    const { data, error } = await supabaseServer.from("lots").select("*")
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching lots:", error)
    return null
  }
}

export async function getPayments() {
  try {
    const { data, error } = await supabaseServer.from("payments").select("*")
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching payments:", error)
    return null
  }
}

export async function getInquiries() {
  try {
    const { data, error } = await supabaseServer.from("inquiries").select("*")
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching inquiries:", error)
    return null
  }
}

export async function getBurials() {
  try {
    const { data, error } = await supabaseServer.from("burials").select("*")
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching burials:", error)
    return null
  }
}

export async function createNewClient(clientData: any) {
  try {
    const { data, error } = await supabaseServer.from("clients").insert([clientData]).select()
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error creating client:", error)
    return null
  }
}

export async function createLot(lotData: any) {
  try {
    const { data, error } = await supabaseServer.from("lots").insert([lotData]).select()
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error creating lot:", error)
    return null
  }
}

export async function createPayment(paymentData: any) {
  try {
    const { data, error } = await supabaseServer.from("payments").insert([paymentData]).select()
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error creating payment:", error)
    return null
  }
}

export async function createInquiry(inquiryData: any) {
  try {
    const { data, error } = await supabaseServer.from("inquiries").insert([inquiryData]).select()
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error creating inquiry:", error)
    return null
  }
}

export async function createBurial(burialData: any) {
  try {
    const { data, error } = await supabaseServer.from("burials").insert([burialData]).select()
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error creating burial:", error)
    return null
  }
}
