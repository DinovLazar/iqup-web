// Database types for the Supabase `public` schema.
//
// Mirrors `supabase gen types typescript` output for the live `leads` table created
// by the Phase 1.05 migration. Verified column-by-column against the live schema and
// proven by the passing live round-trip test (scripts/test-insert.ts, which inserts +
// reads through this typed client). `supabase gen types` itself was not run from the
// build environment because the Postgres port is not reachable from the sandbox;
// regenerate with `npm run db:types` (after `supabase login && supabase link`) when
// the schema changes, which overwrites this file with the canonical generated version.

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
