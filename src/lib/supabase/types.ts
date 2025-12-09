/**
 * Supabase Database Types for GSOTW
 *
 * This file contains TypeScript types for your Supabase tables.
 * Update these types based on your actual database schema.
 *
 * You can auto-generate these types by running:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Example table types - Update these based on your actual schema
export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          artist: string;
          spotify_url: string | null;
          spotify_id: string | null;
          album_cover_url: string | null;
          added_by: string | null;
          votes: number;
          is_winner: boolean;
          week_number: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          artist: string;
          spotify_url?: string | null;
          spotify_id?: string | null;
          album_cover_url?: string | null;
          added_by?: string | null;
          votes?: number;
          is_winner?: boolean;
          week_number?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          artist?: string;
          spotify_url?: string | null;
          spotify_id?: string | null;
          album_cover_url?: string | null;
          added_by?: string | null;
          votes?: number;
          is_winner?: boolean;
          week_number?: number | null;
        };
      };
      // Add more tables as needed
    };
    Views: {
      // Define any views here
    };
    Functions: {
      // Define any functions here
    };
    Enums: {
      // Define any enums here
    };
  };
}
