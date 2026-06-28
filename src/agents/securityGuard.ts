import type { StudentProfile } from "../types";

export interface AgentTrace {
  agent: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  status: "success" | "warning" | "error";
}

export interface SecurityGuardResult {
  sanitizedProfile: StudentProfile;
  passed: boolean;
  issues: string[];
  trace: AgentTrace;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .map((item) => normalizeText(item))
        .filter(Boolean)
    )
  );
}

function normalizeEnglishScore(value: unknown): string {
  return normalizeText(value).replace(",", ".");
}

function normalizeIntakeYear(value: unknown): string {
  const currentYear = new Date().getFullYear();
  const raw = normalizeText(value);
  const year = Number(raw);

  if (!Number.isFinite(year) || year < currentYear) {
    return String(currentYear);
  }

  return String(year);
}

function clampGpa(value: unknown): number {
  const raw =
    typeof value === "number"
      ? value
      : Number(String(value ?? "").replace(",", "."));

  if (!Number.isFinite(raw)) return 0;
  if (raw < 0) return 0;
  if (raw > 4) return 4;
  return Number(raw.toFixed(2));
}

export function securityGuardAgent(
  profile: StudentProfile
): SecurityGuardResult {
  const sanitizedProfile: StudentProfile = {
    name: normalizeText(profile?.name),
    origin: normalizeText(profile?.origin),
    currentEducation: normalizeText(profile?.currentEducation),
    targetDegree: normalizeText(profile?.targetDegree),
    targetCountries: normalizeArray(profile?.targetCountries),
    fields: normalizeArray(profile?.fields),
    gpa: clampGpa(profile?.gpa),
    englishStatus: (normalizeText(profile?.englishStatus) ||
      "Not Taken") as StudentProfile["englishStatus"],
    englishScore: normalizeEnglishScore(profile?.englishScore),
    profilePhotoUrl: normalizeText(profile?.profilePhotoUrl) || undefined,
    hasLeadership: Boolean(profile?.hasLeadership),
    hasResearch: Boolean(profile?.hasResearch),
    hasCommunityImpact: Boolean(profile?.hasCommunityImpact),
    hasWorkExperience: Boolean(profile?.hasWorkExperience),
    hasFinancialNeed: Boolean(profile?.hasFinancialNeed),
    preferredIntakeYear: normalizeIntakeYear(profile?.preferredIntakeYear),
    readinessScore: Number(profile?.readinessScore ?? 0),
    recommenderStatus: profile?.recommenderStatus,
    deadlineTimelineStatus: profile?.deadlineTimelineStatus,
    deadlineMilestonesConfirmed: profile?.deadlineMilestonesConfirmed !== undefined ? Boolean(profile.deadlineMilestonesConfirmed) : undefined,
  };

  const issues: string[] = [];

  if (!sanitizedProfile.name) {
    issues.push("Full name is missing.");
  }

  if (!sanitizedProfile.origin) {
    issues.push("Country of origin is missing.");
  }

  if (!sanitizedProfile.targetDegree) {
    issues.push("Target degree level is missing.");
  }

  if (!sanitizedProfile.targetCountries.length) {
    issues.push("At least one target country should be selected.");
  }

  if (!sanitizedProfile.fields.length) {
    issues.push("At least one field of study should be provided.");
  }

  if (sanitizedProfile.gpa <= 0) {
    issues.push("GPA appears missing or invalid.");
  }

  const severeIssues = issues.filter((issue) =>
    [
      "Full name is missing.",
      "Country of origin is missing.",
      "Target degree level is missing.",
      "At least one target country should be selected.",
      "At least one field of study should be provided.",
    ].includes(issue)
  );

  const passed = severeIssues.length === 0;

  const trace: AgentTrace = {
    agent: "Security Guard Agent",
    tool: "sanitize_profile",
    inputSummary: `Validated profile input for ${sanitizedProfile.name || "student"} targeting ${sanitizedProfile.targetDegree || "a degree"} in ${sanitizedProfile.targetCountries.join(", ") || "selected countries"}.`,
    outputSummary:
      issues.length === 0
        ? "Profile sanitized successfully. No input issues detected."
        : `Profile sanitized successfully with ${issues.length} flagged issue(s): ${issues.join(" ")}`,
    status: passed ? "success" : "warning",
  };

  return {
    sanitizedProfile,
    passed,
    issues,
    trace,
  };
}