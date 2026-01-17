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
      sensor_data: {
        Row: {
          id: number;
          sensor_type: string;
          value: number;
          unit: string;
          created_at: string;
          device_id: string;
        };
        Insert: {
          id?: number;
          sensor_type: string;
          value: number;
          unit: string;
          created_at?: string;
          device_id?: string;
        };
        Update: {
          id?: number;
          sensor_type?: string;
          value?: number;
          unit?: string;
          created_at?: string;
          device_id?: string;
        };
        Relationships: [];
      };
      actuator_control: {
        Row: {
          id: number;
          actuator_type: string;
          action: string;
          value: number | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          actuator_type: string;
          action: string;
          value?: number | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: number;
          actuator_type?: string;
          action?: string;
          value?: number | null;
          created_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          id: number;
          setting_key: string;
          setting_value: Json;
          updated_at: string;
        };
        Insert: {
          id?: number;
          setting_key: string;
          setting_value: Json;
          updated_at?: string;
        };
        Update: {
          id?: number;
          setting_key?: string;
          setting_value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
