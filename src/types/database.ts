export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          currency: string;
          monthly_income: number;
          fixed_costs_percentage: number;
          investments_percentage: number;
          savings_percentage: number;
          guilt_free_percentage: number;
          buffer_percentage: number;
          has_completed_onboarding: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          currency?: string;
          monthly_income?: number;
          fixed_costs_percentage?: number;
          investments_percentage?: number;
          savings_percentage?: number;
          guilt_free_percentage?: number;
          buffer_percentage?: number;
          has_completed_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          currency?: string;
          monthly_income?: number;
          fixed_costs_percentage?: number;
          investments_percentage?: number;
          savings_percentage?: number;
          guilt_free_percentage?: number;
          buffer_percentage?: number;
          has_completed_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          transaction_type: string;
          transaction_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          transaction_type: string;
          transaction_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          category?: string;
          transaction_type?: string;
          transaction_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          monthly_contribution: number;
          target_date: string | null;
          priority: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          monthly_contribution?: number;
          target_date?: string | null;
          priority?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          monthly_contribution?: number;
          target_date?: string | null;
          priority?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_checks: {
        Row: {
          id: string;
          user_id: string;
          item_name: string;
          price: number;
          reason: string | null;
          decision: string;
          decision_message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_name: string;
          price: number;
          reason?: string | null;
          decision: string;
          decision_message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_name?: string;
          price?: number;
          reason?: string | null;
          decision?: string;
          decision_message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      monthly_reviews: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          what_went_well: string | null;
          wasteful_spending_notes: string | null;
          next_month_focus: string | null;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          what_went_well?: string | null;
          wasteful_spending_notes?: string | null;
          next_month_focus?: string | null;
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          what_went_well?: string | null;
          wasteful_spending_notes?: string | null;
          next_month_focus?: string | null;
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
