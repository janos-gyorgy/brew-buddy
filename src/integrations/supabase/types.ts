export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          ambient_temperature_c: number | null
          batch_code: string
          created_at: string
          general_notes: string | null
          id: string
          initial_brix: number | null
          initial_ph: number | null
          recipe_id: string | null
          scoby_info: string | null
          start_date: string
          starter_source: string | null
          status: Database["public"]["Enums"]["batch_status"]
          target_ready_date_f1: string | null
          total_volume_liters: number
          updated_at: string
          user_id: string | null
          vessel_location: string | null
          vessel_type: string | null
        }
        Insert: {
          ambient_temperature_c?: number | null
          batch_code: string
          created_at?: string
          general_notes?: string | null
          id?: string
          initial_brix?: number | null
          initial_ph?: number | null
          recipe_id?: string | null
          scoby_info?: string | null
          start_date: string
          starter_source?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_ready_date_f1?: string | null
          total_volume_liters: number
          updated_at?: string
          user_id?: string | null
          vessel_location?: string | null
          vessel_type?: string | null
        }
        Update: {
          ambient_temperature_c?: number | null
          batch_code?: string
          created_at?: string
          general_notes?: string | null
          id?: string
          initial_brix?: number | null
          initial_ph?: number | null
          recipe_id?: string | null
          scoby_info?: string | null
          start_date?: string
          starter_source?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_ready_date_f1?: string | null
          total_volume_liters?: number
          updated_at?: string
          user_id?: string | null
          vessel_location?: string | null
          vessel_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      f2_variant_batches: {
        Row: {
          bottle_count: number
          bottle_size_liters: number
          created_at: string
          expected_ready_date_f2: string | null
          f2_start_date: string
          f2_status: Database["public"]["Enums"]["f2_status"]
          fruits_and_juices: string | null
          herbs_and_spices: string | null
          id: string
          name: string
          other_additives: string | null
          parent_batch_id: string
          priming_sugar_g_per_bottle: number | null
          tasting_notes: string | null
          tasting_rating: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bottle_count: number
          bottle_size_liters: number
          created_at?: string
          expected_ready_date_f2?: string | null
          f2_start_date: string
          f2_status?: Database["public"]["Enums"]["f2_status"]
          fruits_and_juices?: string | null
          herbs_and_spices?: string | null
          id?: string
          name: string
          other_additives?: string | null
          parent_batch_id: string
          priming_sugar_g_per_bottle?: number | null
          tasting_notes?: string | null
          tasting_rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bottle_count?: number
          bottle_size_liters?: number
          created_at?: string
          expected_ready_date_f2?: string | null
          f2_start_date?: string
          f2_status?: Database["public"]["Enums"]["f2_status"]
          fruits_and_juices?: string | null
          herbs_and_spices?: string | null
          id?: string
          name?: string
          other_additives?: string | null
          parent_batch_id?: string
          priming_sugar_g_per_bottle?: number | null
          tasting_notes?: string | null
          tasting_rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "f2_variant_batches_parent_batch_id_fkey"
            columns: ["parent_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      fermentation_log_entries: {
        Row: {
          actions: string | null
          batch_id: string
          brix: number | null
          created_at: string
          id: string
          issues_or_flags: string | null
          ph: number | null
          phase: Database["public"]["Enums"]["fermentation_phase"]
          smell_color_notes: string | null
          taste_notes: string | null
          temperature_c: number | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          actions?: string | null
          batch_id: string
          brix?: number | null
          created_at?: string
          id?: string
          issues_or_flags?: string | null
          ph?: number | null
          phase?: Database["public"]["Enums"]["fermentation_phase"]
          smell_color_notes?: string | null
          taste_notes?: string | null
          temperature_c?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          actions?: string | null
          batch_id?: string
          brix?: number | null
          created_at?: string
          id?: string
          issues_or_flags?: string | null
          ph?: number | null
          phase?: Database["public"]["Enums"]["fermentation_phase"]
          smell_color_notes?: string | null
          taste_notes?: string | null
          temperature_c?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fermentation_log_entries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          batch_size_liters: number | null
          botanical_amount_g: number | null
          botanical_name: string | null
          botanical_steep_minutes: number | null
          botanical_temp_c: number | null
          botanical_water_ml: number | null
          created_at: string
          description: string | null
          f2_fruit_ideas: string | null
          f2_herb_spice_ideas: string | null
          f2_sugar_or_juice_guidelines: string | null
          id: string
          intent_or_mood: string | null
          name: string
          notes: string | null
          starter_notes: string | null
          starter_percentage: number | null
          steep_temperature_c: number | null
          steep_time_minutes: number | null
          sugar_g_per_liter: number | null
          sugar_type: string | null
          target_brix_range: string | null
          target_f1_days_max: number | null
          target_f1_days_min: number | null
          target_ph_range: string | null
          tea_amount_g_per_liter: number | null
          tea_blend_description: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          batch_size_liters?: number | null
          botanical_amount_g?: number | null
          botanical_name?: string | null
          botanical_steep_minutes?: number | null
          botanical_temp_c?: number | null
          botanical_water_ml?: number | null
          created_at?: string
          description?: string | null
          f2_fruit_ideas?: string | null
          f2_herb_spice_ideas?: string | null
          f2_sugar_or_juice_guidelines?: string | null
          id?: string
          intent_or_mood?: string | null
          name: string
          notes?: string | null
          starter_notes?: string | null
          starter_percentage?: number | null
          steep_temperature_c?: number | null
          steep_time_minutes?: number | null
          sugar_g_per_liter?: number | null
          sugar_type?: string | null
          target_brix_range?: string | null
          target_f1_days_max?: number | null
          target_f1_days_min?: number | null
          target_ph_range?: string | null
          tea_amount_g_per_liter?: number | null
          tea_blend_description?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          batch_size_liters?: number | null
          botanical_amount_g?: number | null
          botanical_name?: string | null
          botanical_steep_minutes?: number | null
          botanical_temp_c?: number | null
          botanical_water_ml?: number | null
          created_at?: string
          description?: string | null
          f2_fruit_ideas?: string | null
          f2_herb_spice_ideas?: string | null
          f2_sugar_or_juice_guidelines?: string | null
          id?: string
          intent_or_mood?: string | null
          name?: string
          notes?: string | null
          starter_notes?: string | null
          starter_percentage?: number | null
          steep_temperature_c?: number | null
          steep_time_minutes?: number | null
          sugar_g_per_liter?: number | null
          sugar_type?: string | null
          target_brix_range?: string | null
          target_f1_days_max?: number | null
          target_f1_days_min?: number | null
          target_ph_range?: string | null
          tea_amount_g_per_liter?: number | null
          tea_blend_description?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      starter_log: {
        Row: {
          created_at: string
          creation_date: string
          current_ph: number | null
          id: string
          name: string
          notes: string | null
          ph_at_creation: number | null
          status: Database["public"]["Enums"]["starter_status"]
          sugar_g_per_liter: number | null
          tea_blend_description: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          creation_date: string
          current_ph?: number | null
          id?: string
          name: string
          notes?: string | null
          ph_at_creation?: number | null
          status?: Database["public"]["Enums"]["starter_status"]
          sugar_g_per_liter?: number | null
          tea_blend_description?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          creation_date?: string
          current_ph?: number | null
          id?: string
          name?: string
          notes?: string | null
          ph_at_creation?: number | null
          status?: Database["public"]["Enums"]["starter_status"]
          sugar_g_per_liter?: number | null
          tea_blend_description?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      batch_status:
        | "planned"
        | "fermenting_f1"
        | "ready_for_f2"
        | "fermenting_f2"
        | "cold_crash"
        | "bottled"
        | "finished"
        | "failed"
      f2_status: "fermenting" | "cold_crash" | "ready" | "consumed" | "failed"
      fermentation_phase: "f1" | "f2" | "cold_crash" | "storage"
      starter_status: "active" | "low_volume" | "retired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      batch_status: [
        "planned",
        "fermenting_f1",
        "ready_for_f2",
        "fermenting_f2",
        "cold_crash",
        "bottled",
        "finished",
        "failed",
      ],
      f2_status: ["fermenting", "cold_crash", "ready", "consumed", "failed"],
      fermentation_phase: ["f1", "f2", "cold_crash", "storage"],
      starter_status: ["active", "low_volume", "retired"],
    },
  },
} as const
