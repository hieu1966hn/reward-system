// Database types for RewardSystem
// Round 1: UserRole, Campus, Profile
// Round 2: Student, PointRule, RewardCatalog
// Round 3: PointTransaction

export type UserRole = "student" | "teacher" | "admin";

export type EnrollmentStatus = "active" | "inactive";

export type PointRuleCategory =
  | "attendance"
  | "checkpoint"
  | "homework"
  | "demo"
  | "extracurricular";

export type RewardCategory = "basic" | "standard" | "premium" | "exclusive";

export type PointTransactionSource = "rule" | "manual" | "redemption";

// ─── Round 1 ──────────────────────────────────────────────────

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

// ─── Round 2 ──────────────────────────────────────────────────

export interface Student {
  id: string; // FK → profiles.id
  student_code: string | null;
  class_name: string;
  total_points: number;
  enrollment_status: EnrollmentStatus;
  created_at: string;
}

export interface PointRule {
  id: string;
  rule_code: string;
  title: string;
  category: PointRuleCategory;
  condition_summary: string;
  points_awarded: number;
  is_active: boolean;
  created_at: string;
}

export interface RewardCatalog {
  id: string;
  reward_name: string;
  reward_slug: string;
  points_required: number;
  image_url: string | null;
  description: string | null;
  category: RewardCategory;
  is_active: boolean;
  created_at: string;
}

// ─── Round 3 ──────────────────────────────────────────────────

export interface PointTransaction {
  id: string;
  student_id: string;
  rule_id: string | null;
  points_delta: number;
  source_type: PointTransactionSource;
  event_key: string;
  note: string | null;
  created_by: string;
  created_at: string;
}
