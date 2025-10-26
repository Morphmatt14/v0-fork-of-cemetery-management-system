export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          emergency_contact: string
          emergency_phone: string
          notes: string
          status: "Active" | "Inactive" | "Suspended"
          join_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address?: string
          emergency_contact?: string
          emergency_phone?: string
          notes?: string
          status?: "Active" | "Inactive" | "Suspended"
          join_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          emergency_contact?: string
          emergency_phone?: string
          notes?: string
          status?: "Active" | "Inactive" | "Suspended"
          join_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      lots: {
        Row: {
          id: string
          section: string
          type: string
          status: "Available" | "Reserved" | "Occupied" | "Maintenance"
          price: number
          dimensions: string
          features: string
          description: string
          owner_id: string | null
          occupant_name: string | null
          date_added: string
          date_occupied: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          section: string
          type: string
          status?: "Available" | "Reserved" | "Occupied" | "Maintenance"
          price: number
          dimensions?: string
          features?: string
          description?: string
          owner_id?: string | null
          occupant_name?: string | null
          date_added?: string
          date_occupied?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section?: string
          type?: string
          status?: "Available" | "Reserved" | "Occupied" | "Maintenance"
          price?: number
          dimensions?: string
          features?: string
          description?: string
          owner_id?: string | null
          occupant_name?: string | null
          date_added?: string
          date_occupied?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          client_id: string
          lot_id: string
          date: string
          amount: number
          type: "Full Payment" | "Down Payment" | "Installment" | "Partial Payment"
          status: "Completed" | "Pending" | "Failed" | "Overdue"
          method: string
          reference: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          lot_id: string
          date?: string
          amount: number
          type: "Full Payment" | "Down Payment" | "Installment" | "Partial Payment"
          status?: "Completed" | "Pending" | "Failed" | "Overdue"
          method: string
          reference: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          lot_id?: string
          date?: string
          amount?: number
          type?: "Full Payment" | "Down Payment" | "Installment" | "Partial Payment"
          status?: "Completed" | "Pending" | "Failed" | "Overdue"
          method?: string
          reference?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          type: string
          message: string
          status: "New" | "In Progress" | "Resolved"
          priority: "low" | "normal" | "high"
          assigned_to: string | null
          date_created: string
          date_resolved: string | null
          resolved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          type: string
          message: string
          status?: "New" | "In Progress" | "Resolved"
          priority?: "low" | "normal" | "high"
          assigned_to?: string | null
          date_created?: string
          date_resolved?: string | null
          resolved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          type?: string
          message?: string
          status?: "New" | "In Progress" | "Resolved"
          priority?: "low" | "normal" | "high"
          assigned_to?: string | null
          date_created?: string
          date_resolved?: string | null
          resolved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      burials: {
        Row: {
          id: string
          name: string
          age: number
          date: string
          time: string
          lot_id: string
          family_name: string
          cause_of_death: string
          funeral_location: string
          attendees: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          date: string
          time: string
          lot_id: string
          family_name: string
          cause_of_death: string
          funeral_location: string
          attendees?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          date?: string
          time?: string
          lot_id?: string
          family_name?: string
          cause_of_death?: string
          funeral_location?: string
          attendees?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
