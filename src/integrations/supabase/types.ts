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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      character_events: {
        Row: {
          character_id: string
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          character_id: string
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          character_id?: string
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "character_events_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_interactions: {
        Row: {
          character_a_id: string
          character_b_id: string
          content: string
          created_at: string
          id: string
          interaction_type: string
        }
        Insert: {
          character_a_id: string
          character_b_id: string
          content: string
          created_at?: string
          id?: string
          interaction_type?: string
        }
        Update: {
          character_a_id?: string
          character_b_id?: string
          content?: string
          created_at?: string
          id?: string
          interaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_interactions_character_a_id_fkey"
            columns: ["character_a_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_interactions_character_b_id_fkey"
            columns: ["character_b_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_memory: {
        Row: {
          character_id: string
          created_at: string
          id: string
          memory_key: string
          memory_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          memory_key: string
          memory_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          memory_key?: string
          memory_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_memory_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          avatar: string | null
          backstory: string | null
          color: string | null
          communication_style: string | null
          created_at: string
          creator_id: string | null
          id: string
          is_default: boolean | null
          name: string
          personality: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          backstory?: string | null
          color?: string | null
          communication_style?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          personality: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          backstory?: string | null
          color?: string | null
          communication_style?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          personality?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          character_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      galaxy_territories: {
        Row: {
          controller_character_id: string | null
          controller_user_id: string | null
          created_at: string
          defense_level: number
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          controller_character_id?: string | null
          controller_user_id?: string | null
          created_at?: string
          defense_level?: number
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          controller_character_id?: string | null
          controller_user_id?: string | null
          created_at?: string
          defense_level?: number
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galaxy_territories_controller_character_id_fkey"
            columns: ["controller_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          character_id: string
          created_at: string
          id: string
          message: string
          role: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          message: string
          role: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          message?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          faction: string | null
          id: string
          profile_photo_url: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          faction?: string | null
          id?: string
          profile_photo_url?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          faction?: string | null
          id?: string
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          character_id: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          character_id: string
          created_at: string
          id: string
          interaction_count: number
          level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          interaction_count?: number
          level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          interaction_count?: number
          level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      story_sessions: {
        Row: {
          character_id: string
          created_at: string
          genre: string
          id: string
          is_active: boolean
          story_state: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          genre?: string
          id?: string
          is_active?: boolean
          story_state?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          genre?: string
          id?: string
          is_active?: boolean
          story_state?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_sessions_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      universe_events: {
        Row: {
          affected_territory_id: string | null
          created_at: string
          description: string
          event_type: string
          expires_at: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          title: string
        }
        Insert: {
          affected_territory_id?: string | null
          created_at?: string
          description: string
          event_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          title: string
        }
        Update: {
          affected_territory_id?: string | null
          created_at?: string
          description?: string
          event_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "universe_events_affected_territory_id_fkey"
            columns: ["affected_territory_id"]
            isOneToOne: false
            referencedRelation: "galaxy_territories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          created_at: string
          faction: string | null
          id: string
          level: number
          rank: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          faction?: string | null
          id?: string
          level?: number
          rank?: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          faction?: string | null
          id?: string
          level?: number
          rank?: string
          updated_at?: string
          user_id?: string
          xp?: number
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
