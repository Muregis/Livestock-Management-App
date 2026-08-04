import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Database {
  public: {
    tables: {
      animals: {
        Row: {
          id: string
          ear_tag: string
          name: string | null
          gender: 'male' | 'female'
          breed: string
          sire_id: string | null
          dam_id: string | null
          birth_date: string
          status: 'active' | 'sold' | 'deceased' | 'quarantine'
          location_id: string
          location_name: string | null
          acquisition_date: string | null
          acquisition_cost: number | null
          current_weight: number | null
          expected_weight: number | null
          milk_production_today: number | null
          milk_production_lifetime: number | null
          days_in_milk: number | null
          body_condition_score: number | null
          genetic_value: number | null
          health_score: number | null
          productivity_score: number | null
          age_in_days: number | null
          age_display: string | null
          is_pregnant: boolean
          expected_calving_date: string | null
          last_milk_date: string | null
          species: 'dairy_cattle' | 'beef_cattle' | 'sheep' | 'goats' | 'poultry' | 'rabbits' | 'pigs' | 'horses' | 'buffalo' | 'camel' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          ear_tag: string
          name?: string
          gender: 'male' | 'female'
          species?: 'dairy_cattle' | 'beef_cattle' | 'sheep' | 'goats' | 'poultry' | 'rabbits' | 'pigs' | 'horses' | 'buffalo' | 'camel' | 'other'
          breed: string
          sire_id?: string
          dam_id?: string
          birth_date: string
          status?: 'active' | 'sold' | 'deceased' | 'quarantine'
          location_id: string
          location_name?: string
          acquisition_date?: string
          acquisition_cost?: number
          current_weight?: number
          expected_weight?: number
          milk_production_today?: number
          milk_production_lifetime?: number
          days_in_milk?: number
          body_condition_score?: number
          genetic_value?: number
          health_score?: number
          productivity_score?: number
          age_in_days?: number
          age_display?: string
          is_pregnant?: boolean
          expected_calving_date?: string
          last_milk_date?: string
        }
        Update: {
          ear_tag?: string
          name?: string
          gender?: 'male' | 'female'
          species?: 'dairy_cattle' | 'beef_cattle' | 'sheep' | 'goats' | 'poultry' | 'rabbits' | 'pigs' | 'horses' | 'buffalo' | 'camel' | 'other'
          breed?: string
          sire_id?: string
          dam_id?: string
          birth_date?: string
          status?: 'active' | 'sold' | 'deceased' | 'quarantine'
          location_id?: string
          location_name?: string
          acquisition_date?: string
          acquisition_cost?: number
          current_weight?: number
          expected_weight?: number
          milk_production_today?: number
          days_in_milk?: number
          body_condition_score?: number
          genetic_value?: number
          health_score?: number
          productivity_score?: number
          age_display?: string
          is_pregnant?: boolean
          expected_calving_date?: string
          last_milk_date?: string
        }
      }
      health_events: {
        Row: {
          id: string
          animal_id: string
          type: 'vaccination' | 'treatment' | 'health_check' | 'disease_outbreak' | 'parasite_check' | 'castration' | 'ewe_rapping' | 'hoof_trim' | 'dental'
          date: string
          description: string
          veterinarian_id: string | null
          veterinarian_name: string | null
          cost: number
          notes: string | null
          next_due_date: string | null
          related_event_id: string | null
        }
        Insert: {
          animal_id: string
          type: 'vaccination' | 'treatment' | 'health_check' | 'disease_outbreak' | 'parasite_check' | 'castration' | 'ewe_rapping' | 'hoof_trim' | 'dental'
          date: string
          description: string
          veterinarian_id?: string
          veterinarian_name?: string
          cost?: number
          notes?: string
          next_due_date?: string
          related_event_id?: string
        }
      }
      breeding_events: {
        Row: {
          id: string
          dam_id: string
          sire_id: string | null
          bull_name: string | null
          service_date: string
          method: 'AI' | 'Natural'
          expected_calving_date: string
          actual_calving_date: string | null
          outcome: 'pregnant' | 'not_pregnant' | 'c_section' | 'stillborn' | 'aborted' | null
          calf_id: string | null
          notes: string | null
        }
        Insert: {
          dam_id: string
          sire_id?: string
          bull_name?: string
          service_date: string
          method: 'AI' | 'Natural'
          expected_calving_date: string
          actual_calving_date?: string
          outcome?: 'pregnant' | 'not_pregnant' | 'c_section' | 'stillborn' | 'aborted'
          calf_id?: string
          notes?: string
        }
      }
      feed_consumption: {
        Row: {
          id: string
          animal_id: string
          feed_type: 'hay' | 'silage' | 'grain' | 'supplement' | 'mineral'
          quantity: number
          unit: string
          date: string
          notes: string | null
        }
        Insert: {
          animal_id: string
          feed_type: 'hay' | 'silage' | 'grain' | 'supplement' | 'mineral'
          quantity: number
          unit?: string
          date: string
          notes?: string
        }
      }
      feed_inventory: {
        Row: {
          id: string
          feed_type: 'hay' | 'silage' | 'grain' | 'supplement' | 'mineral'
          start_date: string
          end_date: string | null
          quantity_received: number
          quantity_consumed: number
          quantity_remaining: number
          cost_per_unit: number
          supplier: string
          storage_location: string
        }
        Insert: {
          feed_type: 'hay' | 'silage' | 'grain' | 'supplement' | 'mineral'
          start_date: string
          end_date?: string
          quantity_received: number
          quantity_consumed?: number
          quantity_remaining: number
          cost_per_unit: number
          supplier: string
          storage_location: string
        }
      }
      financial_records: {
        Row: {
          id: string
          type: 'birth' | 'sale' | 'veterinary' | 'feed' | 'labor' | 'other'
          date: string
          amount: number
          description: string
          related_animal_id: string | null
          related_event_id: string | null
        }
        Insert: {
          type: 'birth' | 'sale' | 'veterinary' | 'feed' | 'labor' | 'other'
          date: string
          amount: number
          description: string
          related_animal_id?: string
          related_event_id?: string
        }
      }
      vaccination_schedules: {
        Row: {
          id: string
          vaccine: string
          age_months: number
          dose: string
          route: string
          applicable_breeds: string[]
          contraindications: string[] | null
          valid_for_months: number
        }
        Insert: {
          vaccine: string
          age_months: number
          dose: string
          route: string
          applicable_breeds?: string[]
          contraindications?: string[]
          valid_for_months: number
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'done'
          priority: 'high' | 'medium' | 'low'
          category: 'feeding' | 'health' | 'maintenance' | 'milking' | 'breeding'
          assignee_name: string | null
          assignee_avatar: string | null
          due_date: string
          estimated_time: string | null
          location: string | null
          related_animal_id: string | null
          recurring: boolean | null
          recurrence_pattern: 'daily' | 'weekly' | 'monthly' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string
          status?: 'todo' | 'in-progress' | 'done'
          priority?: 'high' | 'medium' | 'low'
          category: 'feeding' | 'health' | 'maintenance' | 'milking' | 'breeding'
          assignee_name?: string
          assignee_avatar?: string
          due_date: string
          estimated_time?: string
          location?: string
          related_animal_id?: string
          recurring?: boolean
          recurrence_pattern?: 'daily' | 'weekly' | 'monthly'
        }
        Update: {
          title?: string
          description?: string
          status?: 'todo' | 'in-progress' | 'done'
          priority?: 'high' | 'medium' | 'low'
          assignee_name?: string
          assignee_avatar?: string
          due_date?: string
          estimated_time?: string
          location?: string
          related_animal_id?: string
          recurring?: boolean
          recurrence_pattern?: 'daily' | 'weekly' | 'monthly'
        }
      }
      workers: {
        Row: {
          id: string
          name: string
          role: string
          status: 'Active' | 'On Leave' | 'Off Duty'
          avatar: string | null
          phone: string
          email: string
          location: string
          start_date: string
          specialization: string | null
          current_tasks: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          role: string
          status?: 'Active' | 'On Leave' | 'Off Duty'
          avatar?: string
          phone: string
          email: string
          location: string
          start_date: string
          specialization?: string
          current_tasks?: number
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          date: string
          type: 'Production' | 'Health' | 'Inventory' | 'Breeding' | 'Maintenance' | 'Compliance' | 'Financial'
          status: 'Completed' | 'Processing'
          description: string | null
          data: string | null
        }
        Insert: {
          title: string
          date: string
          type: 'Production' | 'Health' | 'Inventory' | 'Breeding' | 'Maintenance' | 'Compliance' | 'Financial'
          status?: 'Completed' | 'Processing'
          description?: string
          data?: string
        }
      }
      breeds: {
        Row: {
          id: string
          species: 'dairy_cattle' | 'beef_cattle' | 'sheep' | 'goats' | 'poultry' | 'rabbits' | 'pigs' | 'horses' | 'buffalo' | 'camel' | 'other'
          name: string
          growth_rate: number
          lactation_capacity: number
          gestation_period: number
          description: string | null
        }
        Insert: {
          id: string
          species: 'dairy_cattle' | 'beef_cattle' | 'sheep' | 'goats' | 'poultry' | 'rabbits' | 'pigs' | 'horses' | 'buffalo' | 'camel' | 'other'
          name: string
          growth_rate?: number
          lactation_capacity?: number
          gestation_period?: number
          description?: string
        }
      }
    }
  }
}