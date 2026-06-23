// Database types for the Supabase `public` schema.
//
// Mirrors `supabase gen types typescript` output for the live `leads` table (Phase
// 1.05 migration) and the `assessment_scores` table (Phase 3.06 migration —
// Store A of the v2 two-store model). Hand-authored + verified column-by-column
// against each migration; `leads` is proven by the passing live round-trip test
// (scripts/test-insert.ts) and `assessment_scores` by scripts/test-anonymous-score.ts.
// `supabase gen types` itself was not run from the build environment because the
// Postgres port is not reachable from the sandbox; regenerate with `npm run db:types`
// (after `supabase login && supabase link`) when the schema changes, which overwrites
// this file with the canonical generated version.

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
      leads: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          child_first_name: string;
          child_age: number;
          band: string;
          top_strengths: Json;
          locale: string;
          consent: boolean;
          consent_at: string;
          consent_version: string;
          marketing_opt_in: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          child_first_name: string;
          child_age: number;
          band: string;
          top_strengths: Json;
          locale: string;
          consent: boolean;
          consent_at?: string;
          consent_version: string;
          marketing_opt_in?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          child_first_name?: string;
          child_age?: number;
          band?: string;
          top_strengths?: Json;
          locale?: string;
          consent?: boolean;
          consent_at?: string;
          consent_version?: string;
          marketing_opt_in?: boolean;
        };
        Relationships: [];
      };
      assessment_scores: {
        Row: {
          id: string;
          age: number;
          gender: string | null;
          city: string;
          language: string;
          signal_gf: number;
          signal_gv: number;
          signal_gsm: number;
          signal_gs: number;
          signal_attention: number;
          signal_ef: number;
          signal_glr: number;
          signal_ct: number;
          index_logical: number;
          index_spatial: number;
          index_memory_focus: number;
          index_planning_speed: number;
          index_learning_stem: number;
          validity: string;
          norms_version: string;
          created_date: string;
        };
        Insert: {
          id?: string;
          age: number;
          gender?: string | null;
          city: string;
          language: string;
          signal_gf: number;
          signal_gv: number;
          signal_gsm: number;
          signal_gs: number;
          signal_attention: number;
          signal_ef: number;
          signal_glr: number;
          signal_ct: number;
          index_logical: number;
          index_spatial: number;
          index_memory_focus: number;
          index_planning_speed: number;
          index_learning_stem: number;
          validity: string;
          norms_version: string;
          created_date?: string;
        };
        Update: {
          id?: string;
          age?: number;
          gender?: string | null;
          city?: string;
          language?: string;
          signal_gf?: number;
          signal_gv?: number;
          signal_gsm?: number;
          signal_gs?: number;
          signal_attention?: number;
          signal_ef?: number;
          signal_glr?: number;
          signal_ct?: number;
          index_logical?: number;
          index_spatial?: number;
          index_memory_focus?: number;
          index_planning_speed?: number;
          index_learning_stem?: number;
          validity?: string;
          norms_version?: string;
          created_date?: string;
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
};
