// Domain types. The `Database` type is a placeholder that matches the schema
// in supabase/migrations/0001_init.sql; once a Supabase project is linked,
// regenerate this via `supabase gen types typescript --linked > lib/db.types.ts`
// and re-export from here.

export type AccountType = "individual" | "company";
export type VisibilityLevel = "public" | "registered_only" | "private";
export type QualificationLevel =
  | "high_school" | "diploma" | "degree" | "postgraduate_diploma"
  | "masters" | "phd" | "certificate";
export type VerificationTargetType =
  | "experience" | "education" | "project" | "certification";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type PaymentStatus = "unpaid" | "paid" | "waived";

export interface Profile {
  id: string;
  account_type: AccountType;
  is_admin: boolean;
  created_at: string;
  display_name: string | null;
  section_visibility: Partial<Record<string, VisibilityLevel>> | null;
}

// Minimal placeholder so Supabase client typings compile. Replace with
// generated types after first migration is applied.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Profile>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      account_type: AccountType;
      visibility_level: VisibilityLevel;
      qualification_level: QualificationLevel;
      verification_target_type: VerificationTargetType;
      verification_status: VerificationStatus;
      payment_status: PaymentStatus;
    };
  };
}
