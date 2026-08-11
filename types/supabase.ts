export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      surveys: {
        Row: {
          id: string
          admin_id: string
          title: string
          description: string | null
          is_active: boolean
          start_section_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          title: string
          description?: string | null
          is_active?: boolean
          start_section_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          title?: string
          description?: string | null
          is_active?: boolean
          start_section_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_surveys_start_section"
            columns: ["start_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          }
        ]
      }
      sections: {
        Row: {
          id: string
          survey_id: string
          title: string
          description: string | null
          position_x: number
          position_y: number
          default_next_section_id: string | null
          is_end_section: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          title: string
          description?: string | null
          position_x?: number
          position_y?: number
          default_next_section_id?: string | null
          is_end_section?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          title?: string
          description?: string | null
          position_x?: number
          position_y?: number
          default_next_section_id?: string | null
          is_end_section?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_default_next_section_id_fkey"
            columns: ["default_next_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          section_id: string
          question_text: string
          type: 'short_text' | 'long_text' | 'multiple_choice' | 'rating'
          is_required: boolean
          options: Json | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          question_text: string
          type: 'short_text' | 'long_text' | 'multiple_choice' | 'rating'
          is_required?: boolean
          options?: Json | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          question_text?: string
          type?: 'short_text' | 'long_text' | 'multiple_choice' | 'rating'
          is_required?: boolean
          options?: Json | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          }
        ]
      }
      section_logic: {
        Row: {
          id: string
          survey_id: string
          source_section_id: string
          question_id: string
          operator: 'selected' | 'filled' | 'equals' | 'not_equals' | 'greater_than' | 'less_than'
          condition_value: Json | null
          target_section_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          source_section_id: string
          question_id: string
          operator?: 'selected' | 'filled' | 'equals' | 'not_equals' | 'greater_than' | 'less_than'
          condition_value?: Json | null
          target_section_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          source_section_id?: string
          question_id?: string
          operator?: 'selected' | 'filled' | 'equals' | 'not_equals' | 'greater_than' | 'less_than'
          condition_value?: Json | null
          target_section_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_logic_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_logic_source_section_id_fkey"
            columns: ["source_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_logic_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_logic_target_section_id_fkey"
            columns: ["target_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          }
        ]
      }
      responses: {
        Row: {
          id: string
          survey_id: string
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          }
        ]
      }
      answers: {
        Row: {
          id: string
          response_id: string
          question_id: string
          answer_value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          response_id: string
          question_id: string
          answer_value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          response_id?: string
          question_id?: string
          answer_value?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
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
