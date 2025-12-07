export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          user_id: string | null;
          type: 'trend' | 'competition' | 'niche';
          input: Json;
          output: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: 'trend' | 'competition' | 'niche';
          input: Json;
          output: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: 'trend' | 'competition' | 'niche';
          input?: Json;
          output?: Json;
          created_at?: string;
        };
      };
      analysis_history: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          analyses: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          analyses: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          analyses?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          default_category: string[];
          default_period_months: number;
          exclude_clothing: boolean;
          max_volume: string;
          target_platform: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_category?: string[];
          default_period_months?: number;
          exclude_clothing?: boolean;
          max_volume?: string;
          target_platform?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_category?: string[];
          default_period_months?: number;
          exclude_clothing?: boolean;
          max_volume?: string;
          target_platform?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          keyword: string;
          category: string;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          keyword: string;
          category: string;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          keyword?: string;
          category?: string;
          memo?: string | null;
          created_at?: string;
        };
      };
      keyword_trends: {
        Row: {
          id: string;
          keyword: string;
          category: string;
          period_start: string;
          period_end: string;
          data_points: Json;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          keyword: string;
          category: string;
          period_start: string;
          period_end: string;
          data_points: Json;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          keyword?: string;
          category?: string;
          period_start?: string;
          period_end?: string;
          data_points?: Json;
          metadata?: Json;
          created_at?: string;
        };
      };
      sourcing_products: {
        Row: {
          id: string;
          user_id: string | null;
          platform: '1688' | 'taobao' | 'aliexpress' | 'coupang';
          keyword: string;
          product_id: string;
          title: string;
          title_ko: string | null;
          price: number;
          original_price: number;
          currency: string;
          moq: number | null;
          sales_count: number | null;
          rating: number | null;
          supplier_rating: string | null;
          shipping_estimate: string | null;
          image_url: string | null;
          product_url: string;
          specifications: Json | null;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          platform: '1688' | 'taobao' | 'aliexpress' | 'coupang';
          keyword: string;
          product_id: string;
          title: string;
          title_ko?: string | null;
          price: number;
          original_price: number;
          currency: string;
          moq?: number | null;
          sales_count?: number | null;
          rating?: number | null;
          supplier_rating?: string | null;
          shipping_estimate?: string | null;
          image_url?: string | null;
          product_url: string;
          specifications?: Json | null;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          platform?: '1688' | 'taobao' | 'aliexpress' | 'coupang';
          keyword?: string;
          product_id?: string;
          title?: string;
          title_ko?: string | null;
          price?: number;
          original_price?: number;
          currency?: string;
          moq?: number | null;
          sales_count?: number | null;
          rating?: number | null;
          supplier_rating?: string | null;
          shipping_estimate?: string | null;
          image_url?: string | null;
          product_url?: string;
          specifications?: Json | null;
          memo?: string | null;
          created_at?: string;
        };
      };
      niche_keywords: {
        Row: {
          id: string;
          user_id: string | null;
          main_keyword: string;
          keyword: string;
          search_volume: number;
          competition: string;
          cpc: number;
          relevance_score: number;
          recommended_title: string | null;
          reasoning: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          main_keyword: string;
          keyword: string;
          search_volume: number;
          competition: string;
          cpc: number;
          relevance_score: number;
          recommended_title?: string | null;
          reasoning?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          main_keyword?: string;
          keyword?: string;
          search_volume?: number;
          competition?: string;
          cpc?: number;
          relevance_score?: number;
          recommended_title?: string | null;
          reasoning?: string | null;
          created_at?: string;
        };
      };
      competition_analyses: {
        Row: {
          id: string;
          user_id: string | null;
          keyword: string;
          platform: string;
          total_products: number;
          avg_review_count: number;
          avg_price: number;
          price_min: number;
          price_max: number;
          rocket_delivery_ratio: number;
          competition_score: number;
          competition_level: string;
          insights: string | null;
          top_products: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          keyword: string;
          platform: string;
          total_products: number;
          avg_review_count: number;
          avg_price: number;
          price_min: number;
          price_max: number;
          rocket_delivery_ratio: number;
          competition_score: number;
          competition_level: string;
          insights?: string | null;
          top_products: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          keyword?: string;
          platform?: string;
          total_products?: number;
          avg_review_count?: number;
          avg_price?: number;
          price_min?: number;
          price_max?: number;
          rocket_delivery_ratio?: number;
          competition_score?: number;
          competition_level?: string;
          insights?: string | null;
          top_products?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      analysis_type: 'trend' | 'competition' | 'niche';
    };
  };
}

// 편의를 위한 타입 별칭
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
