// Database types for Round 1 (profiles + campuses only)
// Will be expanded in future rounds

export type UserRole = "student" | "teacher" | "admin";

export interface Campus {
  id: string;
  campus_name: string;
  region: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  campus_id: string | null;
  avatar_url: string | null;
  created_at: string;
  // Joined relation (optional)
  campus?: Campus;
}
