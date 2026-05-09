export type ProfileMode = "demo" | "custom" | "empty";

export interface StudentProfile {
  name: string;
  origin: string;
  currentEducation: string;
  targetDegree: string;
  targetCountries: string[];
  fields: string[];
  gpa: number;
  englishStatus: "Not Taken" | "IELTS" | "TOEFL" | "Duolingo" | "Other";
  englishScore: string;
  hasLeadership: boolean;
  hasResearch: boolean;
  hasCommunityImpact: boolean;
  hasWorkExperience: boolean;
  hasFinancialNeed: boolean;
  preferredIntakeYear: string;
  readinessScore: number;
}

export interface AppState {
  mode: ProfileMode;
  profile: StudentProfile | null;
  savedScholarshipIds: string[];
  activeScholarshipId: string | null;
}
