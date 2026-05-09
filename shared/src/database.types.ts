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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          claimed_at: string | null
          company_id: string | null
          completed_at: string | null
          created_by_user_id: string | null
          error_message: string | null
          final_summary: string | null
          id: string
          metadata_json: Json
          mode: string
          replay_label: string | null
          signal_window_end: string | null
          signal_window_start: string | null
          started_at: string
          status: string
          user_prompt: string | null
        }
        Insert: {
          claimed_at?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_by_user_id?: string | null
          error_message?: string | null
          final_summary?: string | null
          id?: string
          metadata_json?: Json
          mode: string
          replay_label?: string | null
          signal_window_end?: string | null
          signal_window_start?: string | null
          started_at?: string
          status: string
          user_prompt?: string | null
        }
        Update: {
          claimed_at?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_by_user_id?: string | null
          error_message?: string | null
          final_summary?: string | null
          id?: string
          metadata_json?: Json
          mode?: string
          replay_label?: string | null
          signal_window_end?: string | null
          signal_window_start?: string | null
          started_at?: string
          status?: string
          user_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tool_calls: {
        Row: {
          completed_at: string | null
          error_message: string | null
          evidence_ids: string[]
          id: string
          input_json: Json | null
          output_json: Json | null
          output_summary: string | null
          run_id: string
          started_at: string
          status: string
          step_index: number
          tool_name: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          evidence_ids?: string[]
          id?: string
          input_json?: Json | null
          output_json?: Json | null
          output_summary?: string | null
          run_id: string
          started_at?: string
          status: string
          step_index: number
          tool_name: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          evidence_ids?: string[]
          id?: string
          input_json?: Json | null
          output_json?: Json | null
          output_summary?: string | null
          run_id?: string
          started_at?: string
          status?: string
          step_index?: number
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tool_calls_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_documents: {
        Row: {
          bill_uuid: string
          document_type: string
          fetched_at: string
          id: string
          parsed_json: Json
          raw_text: string | null
          source_path: string | null
          source_url: string | null
          version: string | null
        }
        Insert: {
          bill_uuid: string
          document_type: string
          fetched_at?: string
          id?: string
          parsed_json?: Json
          raw_text?: string | null
          source_path?: string | null
          source_url?: string | null
          version?: string | null
        }
        Update: {
          bill_uuid?: string
          document_type?: string
          fetched_at?: string
          id?: string
          parsed_json?: Json
          raw_text?: string | null
          source_path?: string | null
          source_url?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_documents_bill_uuid_fkey"
            columns: ["bill_uuid"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          jurisdiction: string
          last_action: string | null
          last_action_date: string | null
          raw_json: Json
          session: string
          source: string
          source_url: string | null
          sponsors: Json
          status: string | null
          subjects: Json
          title: string | null
          updated_at: string
          updated_at_source: string | null
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          jurisdiction?: string
          last_action?: string | null
          last_action_date?: string | null
          raw_json?: Json
          session: string
          source: string
          source_url?: string | null
          sponsors?: Json
          status?: string | null
          subjects?: Json
          title?: string | null
          updated_at?: string
          updated_at_source?: string | null
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          jurisdiction?: string
          last_action?: string | null
          last_action_date?: string | null
          raw_json?: Json
          session?: string
          source?: string
          source_url?: string | null
          sponsors?: Json
          status?: string | null
          subjects?: Json
          title?: string | null
          updated_at?: string
          updated_at_source?: string | null
        }
        Relationships: []
      }
      campaign_finance_records: {
        Row: {
          amount: number | null
          contributor_name: string | null
          created_at: string
          filer_name: string | null
          filer_type: string | null
          filing_date: string | null
          id: string
          normalized_json: Json
          office: string | null
          raw_record_id: string | null
          recipient_name: string | null
          source_id: string | null
          source_url: string | null
          subject_matter: string | null
          transaction_type: string | null
          year: number | null
        }
        Insert: {
          amount?: number | null
          contributor_name?: string | null
          created_at?: string
          filer_name?: string | null
          filer_type?: string | null
          filing_date?: string | null
          id?: string
          normalized_json?: Json
          office?: string | null
          raw_record_id?: string | null
          recipient_name?: string | null
          source_id?: string | null
          source_url?: string | null
          subject_matter?: string | null
          transaction_type?: string | null
          year?: number | null
        }
        Update: {
          amount?: number | null
          contributor_name?: string | null
          created_at?: string
          filer_name?: string | null
          filer_type?: string | null
          filing_date?: string | null
          id?: string
          normalized_json?: Json
          office?: string | null
          raw_record_id?: string | null
          recipient_name?: string | null
          source_id?: string | null
          source_url?: string | null
          subject_matter?: string | null
          transaction_type?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_finance_records_raw_record_id_fkey"
            columns: ["raw_record_id"]
            isOneToOne: false
            referencedRelation: "raw_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_finance_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      city_records: {
        Row: {
          category: string | null
          city: string
          created_at: string
          description: string | null
          external_id: string | null
          geo_unit_name: string | null
          geo_unit_type: string | null
          id: string
          latitude: number | null
          location_text: string | null
          longitude: number | null
          normalized_json: Json
          raw_record_id: string | null
          record_date: string | null
          record_type: string
          source_id: string | null
          square_footage: number | null
          status: string | null
          valuation: number | null
        }
        Insert: {
          category?: string | null
          city: string
          created_at?: string
          description?: string | null
          external_id?: string | null
          geo_unit_name?: string | null
          geo_unit_type?: string | null
          id?: string
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          normalized_json?: Json
          raw_record_id?: string | null
          record_date?: string | null
          record_type: string
          source_id?: string | null
          square_footage?: number | null
          status?: string | null
          valuation?: number | null
        }
        Update: {
          category?: string | null
          city?: string
          created_at?: string
          description?: string | null
          external_id?: string | null
          geo_unit_name?: string | null
          geo_unit_type?: string | null
          id?: string
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          normalized_json?: Json
          raw_record_id?: string | null
          record_date?: string | null
          record_type?: string
          source_id?: string | null
          square_footage?: number | null
          status?: string | null
          valuation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "city_records_raw_record_id_fkey"
            columns: ["raw_record_id"]
            isOneToOne: false
            referencedRelation: "raw_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_demo: boolean
          name: string
          owner_user_id: string | null
          profile_json: Json
          slug: string
          updated_at: string
          vertical: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          name: string
          owner_user_id?: string | null
          profile_json?: Json
          slug: string
          updated_at?: string
          vertical: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          owner_user_id?: string | null
          profile_json?: Json
          slug?: string
          updated_at?: string
          vertical?: string
        }
        Relationships: []
      }
      company_geo_targets: {
        Row: {
          city: string
          company_id: string
          created_at: string
          geo_unit_name: string
          geo_unit_type: string
          id: string
          notes: string | null
          priority: number
        }
        Insert: {
          city: string
          company_id: string
          created_at?: string
          geo_unit_name: string
          geo_unit_type: string
          id?: string
          notes?: string | null
          priority?: number
        }
        Update: {
          city?: string
          company_id?: string
          created_at?: string
          geo_unit_name?: string
          geo_unit_type?: string
          id?: string
          notes?: string | null
          priority?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_geo_targets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_memberships: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_paths: {
        Row: {
          company_id: string | null
          contact_name: string | null
          contact_type: string | null
          created_at: string
          id: string
          office_or_org: string | null
          policy_issue: string
          public_contact_info: Json
          role: string | null
          run_id: string | null
          source_url: string | null
          talking_points: string | null
          why_relevant: string | null
        }
        Insert: {
          company_id?: string | null
          contact_name?: string | null
          contact_type?: string | null
          created_at?: string
          id?: string
          office_or_org?: string | null
          policy_issue: string
          public_contact_info?: Json
          role?: string | null
          run_id?: string | null
          source_url?: string | null
          talking_points?: string | null
          why_relevant?: string | null
        }
        Update: {
          company_id?: string | null
          contact_name?: string | null
          contact_type?: string | null
          created_at?: string
          id?: string
          office_or_org?: string | null
          policy_issue?: string
          public_contact_info?: Json
          role?: string | null
          run_id?: string | null
          source_url?: string | null
          talking_points?: string | null
          why_relevant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_paths_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_paths_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          access_method: string
          citation_url: string | null
          city: string | null
          created_at: string
          dataset_id: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          refresh_frequency: string | null
          source_domain: string | null
          source_type: string
          updated_at: string
        }
        Insert: {
          access_method: string
          citation_url?: string | null
          city?: string | null
          created_at?: string
          dataset_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          refresh_frequency?: string | null
          source_domain?: string | null
          source_type: string
          updated_at?: string
        }
        Update: {
          access_method?: string
          citation_url?: string | null
          city?: string | null
          created_at?: string
          dataset_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          refresh_frequency?: string | null
          source_domain?: string | null
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      evidence_items: {
        Row: {
          bill_document_id: string | null
          bill_id: string | null
          campaign_finance_record_id: string | null
          city_record_id: string | null
          created_at: string
          evidence_type: string
          excerpt: string | null
          id: string
          lobby_record_id: string | null
          metadata_json: Json
          raw_record_id: string | null
          run_id: string | null
          source_id: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          bill_document_id?: string | null
          bill_id?: string | null
          campaign_finance_record_id?: string | null
          city_record_id?: string | null
          created_at?: string
          evidence_type: string
          excerpt?: string | null
          id?: string
          lobby_record_id?: string | null
          metadata_json?: Json
          raw_record_id?: string | null
          run_id?: string | null
          source_id?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          bill_document_id?: string | null
          bill_id?: string | null
          campaign_finance_record_id?: string | null
          city_record_id?: string | null
          created_at?: string
          evidence_type?: string
          excerpt?: string | null
          id?: string
          lobby_record_id?: string | null
          metadata_json?: Json
          raw_record_id?: string | null
          run_id?: string | null
          source_id?: string | null
          source_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_bill_document_id_fkey"
            columns: ["bill_document_id"]
            isOneToOne: false
            referencedRelation: "bill_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_campaign_finance_record_id_fkey"
            columns: ["campaign_finance_record_id"]
            isOneToOne: false
            referencedRelation: "campaign_finance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_city_record_id_fkey"
            columns: ["city_record_id"]
            isOneToOne: false
            referencedRelation: "city_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_lobby_record_id_fkey"
            columns: ["lobby_record_id"]
            isOneToOne: false
            referencedRelation: "lobby_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_raw_record_id_fkey"
            columns: ["raw_record_id"]
            isOneToOne: false
            referencedRelation: "raw_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_records: {
        Row: {
          activity_type: string | null
          client_name: string | null
          compensation_band: string | null
          created_at: string
          id: string
          lobbyist_name: string | null
          normalized_json: Json
          raw_record_id: string | null
          source_id: string | null
          subject_matter: string | null
          year: number
        }
        Insert: {
          activity_type?: string | null
          client_name?: string | null
          compensation_band?: string | null
          created_at?: string
          id?: string
          lobbyist_name?: string | null
          normalized_json?: Json
          raw_record_id?: string | null
          source_id?: string | null
          subject_matter?: string | null
          year: number
        }
        Update: {
          activity_type?: string | null
          client_name?: string | null
          compensation_band?: string | null
          created_at?: string
          id?: string
          lobbyist_name?: string | null
          normalized_json?: Json
          raw_record_id?: string | null
          source_id?: string | null
          subject_matter?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "lobby_records_raw_record_id_fkey"
            columns: ["raw_record_id"]
            isOneToOne: false
            referencedRelation: "raw_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobby_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_records: {
        Row: {
          external_id: string | null
          fetched_at: string
          id: string
          metadata_json: Json
          payload: Json | null
          raw_text: string | null
          record_date: string | null
          record_type: string
          source_fetch_id: string | null
          source_id: string | null
          source_url: string | null
          unique_hash: string | null
        }
        Insert: {
          external_id?: string | null
          fetched_at?: string
          id?: string
          metadata_json?: Json
          payload?: Json | null
          raw_text?: string | null
          record_date?: string | null
          record_type: string
          source_fetch_id?: string | null
          source_id?: string | null
          source_url?: string | null
          unique_hash?: string | null
        }
        Update: {
          external_id?: string | null
          fetched_at?: string
          id?: string
          metadata_json?: Json
          payload?: Json | null
          raw_text?: string | null
          record_date?: string | null
          record_type?: string
          source_fetch_id?: string | null
          source_id?: string | null
          source_url?: string | null
          unique_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_records_source_fetch_id_fkey"
            columns: ["source_fetch_id"]
            isOneToOne: false
            referencedRelation: "source_fetches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_id: string
          created_at: string
          evidence_ids: string[]
          id: string
          markdown_content: string
          report_type: string
          run_id: string | null
          summary_json: Json
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          evidence_ids?: string[]
          id?: string
          markdown_content: string
          report_type: string
          run_id?: string | null
          summary_json?: Json
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          evidence_ids?: string[]
          id?: string
          markdown_content?: string
          report_type?: string
          run_id?: string | null
          summary_json?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_scores: {
        Row: {
          city: string
          code_occupancy_risk: number
          company_id: string
          confidence: number
          created_at: string
          development_momentum: number
          evidence_ids: string[]
          geo_unit_name: string | null
          geo_unit_type: string | null
          id: string
          policy_risk: number
          reasoning_summary: string
          score_window_end: string | null
          score_window_start: string | null
          updated_by_run_id: string | null
          zoning_friction: number
        }
        Insert: {
          city: string
          code_occupancy_risk: number
          company_id: string
          confidence: number
          created_at?: string
          development_momentum: number
          evidence_ids?: string[]
          geo_unit_name?: string | null
          geo_unit_type?: string | null
          id?: string
          policy_risk: number
          reasoning_summary: string
          score_window_end?: string | null
          score_window_start?: string | null
          updated_by_run_id?: string | null
          zoning_friction: number
        }
        Update: {
          city?: string
          code_occupancy_risk?: number
          company_id?: string
          confidence?: number
          created_at?: string
          development_momentum?: number
          evidence_ids?: string[]
          geo_unit_name?: string | null
          geo_unit_type?: string | null
          id?: string
          policy_risk?: number
          reasoning_summary?: string
          score_window_end?: string | null
          score_window_start?: string | null
          updated_by_run_id?: string | null
          zoning_friction?: number
        }
        Relationships: [
          {
            foreignKeyName: "signal_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_scores_updated_by_run_id_fkey"
            columns: ["updated_by_run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      source_fetches: {
        Row: {
          completed_at: string | null
          error_message: string | null
          fetch_type: string
          id: string
          metadata_json: Json
          query_json: Json
          record_count: number
          source_id: string | null
          source_url: string | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          fetch_type: string
          id?: string
          metadata_json?: Json
          query_json?: Json
          record_count?: number
          source_id?: string | null
          source_url?: string | null
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          fetch_type?: string
          id?: string
          metadata_json?: Json
          query_json?: Json
          record_count?: number
          source_id?: string | null
          source_url?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_fetches_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          primary_company_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          primary_company_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          primary_company_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
