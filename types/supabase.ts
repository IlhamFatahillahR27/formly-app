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
      }
    }
  }
}
