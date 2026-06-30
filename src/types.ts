export type ProfileMode = "demo" | "custom" | "empty";

export interface StudentProfile {
  name: string;
  origin: string;
  currentEducation: string;
  targetDegree: string;
  targetCountries: string[];
  fields: string[];
  gpa: number;
  englishStatus:
  | "Not Taken"
  | "IELTS"
  | "TOEFL iBT"
  | "TOEFL iBT 2026"
  | "Duolingo"
  | "Other";
  englishScore: string;
  profilePhotoUrl?: string;
  hasLeadership: boolean;
  hasResearch: boolean;
  hasCommunityImpact: boolean;
  hasWorkExperience: boolean;
  hasFinancialNeed: boolean;
  preferredIntakeYear: string;
  readinessScore: number;
  recommenderStatus?: "Not Started" | "Requested" | "Confirmed" | "Submitted" | "Uploaded" | "Received";
  deadlineTimelineStatus?: "not_started" | "in_progress" | "confirmed";
  deadlineMilestonesConfirmed?: boolean;
  complianceScanStatus?: "not_started" | "running" | "completed";
  complianceScanCompleted?: boolean;
  automatedComplianceChecksPassed?: boolean;
  finalReviewStatus?: "not_started" | "in_progress" | "completed";
  finalHumanReviewCompleted?: boolean;
  finalHumanReviewDate?: string | null;
  finalHumanReviewerType?: "Mentor" | "Teacher" | "Advisor" | "Peer Reviewer" | "Other" | null;
  finalHumanReviewerName?: string | null;
  finalComplianceCheckCompleted?: boolean;
  finalComplianceCheckCompletedAt?: string | null;
  finalHumanReviewChecklist?: {
    scholarshipFitReviewed: boolean;
    essayReviewed: boolean;
    requiredDocumentsReviewed: boolean;
    recommendationLettersReviewed: boolean;
    deadlinePlanReviewed: boolean;
    finalApplicationPackageReviewed: boolean;
  };
}

export interface AppState {
  mode: ProfileMode;
  profile: StudentProfile | null;
  savedScholarshipIds: string[];
  activeScholarshipId: string | null;
}