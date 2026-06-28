import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { orchestratorAgent } from "./src/agents/orchestratorAgent";
import type { StudentProfile } from "./src/types";

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const DEFAULT_PROFILE: StudentProfile = {
  name: "Irwan Prabowo",
  origin: "Indonesia",
  currentEducation: "Bachelor's",
  targetDegree: "Master's",
  targetCountries: ["UK", "USA", "Europe", "Australia", "Japan", "Singapore"],
  fields: ["AI Strategy"],
  gpa: 3.47,
  englishStatus: "IELTS",
  englishScore: "7.0",
  profilePhotoUrl: undefined,
  hasLeadership: true,
  hasResearch: true,
  hasCommunityImpact: true,
  hasWorkExperience: true,
  hasFinancialNeed: true,
  preferredIntakeYear: String(new Date().getFullYear()),
  readinessScore: 0,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function text(value: unknown, fallback = ""): string {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

function numberValue(value: unknown, fallback: number): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value ?? "").replace(",", "."));

  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    if (["true", "yes", "1"].includes(normalized)) return true;
    if (["false", "no", "0"].includes(normalized)) return false;
  }

  return fallback;
}

function stringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => text(item)).filter(Boolean);
    return cleaned.length ? cleaned : fallback;
  }

  if (typeof value === "string") {
    const cleaned = value
      .split(/[,;|]/)
      .map((item) => text(item))
      .filter(Boolean);

    return cleaned.length ? cleaned : fallback;
  }

  return fallback;
}

function normalizeEnglishStatus(value: unknown): StudentProfile["englishStatus"] {
  const cleaned = text(value);

  const validStatuses: StudentProfile["englishStatus"][] = [
    "Not Taken",
    "IELTS",
    "TOFL iBT" as StudentProfile["englishStatus"],
    "TOEFL iBT",
    "TOEFL iBT 2026",
    "Duolingo",
    "Other",
  ].filter(Boolean);

  const matched = validStatuses.find(
    (status) => status.toLowerCase() === cleaned.toLowerCase()
  );

  if (matched === ("TOFL iBT" as StudentProfile["englishStatus"])) {
    return "TOEFL iBT";
  }

  return matched || DEFAULT_PROFILE.englishStatus;
}

function normalizePreferredIntakeYear(value: unknown): string {
  const currentYear = new Date().getFullYear();
  const parsed = Number(text(value));

  if (!Number.isFinite(parsed) || parsed < currentYear) {
    return String(currentYear);
  }

  return String(parsed);
}

function extractProfileCandidate(body: unknown): Record<string, unknown> | null {
  if (!isObject(body)) return null;

  const bodyObject = body as Record<string, unknown>;

  const possibleProfile =
    bodyObject.profile ||
    bodyObject.studentProfile ||
    bodyObject.currentProfile ||
    bodyObject.userProfile ||
    bodyObject.data ||
    bodyObject;

  if (isObject(possibleProfile)) {
    return possibleProfile;
  }

  return null;
}

function normalizeStudentProfile(body: unknown): StudentProfile {
  const candidate = extractProfileCandidate(body);

  if (!candidate) {
    return DEFAULT_PROFILE;
  }

  return {
    name: text(candidate.name ?? candidate.fullName, DEFAULT_PROFILE.name),
    origin: text(
      candidate.origin ?? candidate.country ?? candidate.countryOfOrigin,
      DEFAULT_PROFILE.origin
    ),
    currentEducation: text(
      candidate.currentEducation ?? candidate.education,
      DEFAULT_PROFILE.currentEducation
    ),
    targetDegree: text(
      candidate.targetDegree ?? candidate.degree ?? candidate.degreeLevel,
      DEFAULT_PROFILE.targetDegree
    ),
    targetCountries: stringArray(
      candidate.targetCountries ?? candidate.countries,
      DEFAULT_PROFILE.targetCountries
    ),
    fields: stringArray(
      candidate.fields ?? candidate.fieldOfStudy ?? candidate.studyFields,
      DEFAULT_PROFILE.fields
    ),
    gpa: numberValue(candidate.gpa ?? candidate.grade, DEFAULT_PROFILE.gpa),
    englishStatus: normalizeEnglishStatus(
      candidate.englishStatus ??
      candidate.englishProficiency ??
      candidate.englishTest
    ),
    englishScore: text(
      candidate.englishScore ??
      candidate.ieltsScore ??
      candidate.toeflScore ??
      candidate.duolingoScore,
      DEFAULT_PROFILE.englishScore
    ),
    profilePhotoUrl:
      text(candidate.profilePhotoUrl ?? candidate.photoUrl ?? candidate.avatarUrl) ||
      undefined,
    hasLeadership: booleanValue(
      candidate.hasLeadership ?? candidate.leadership,
      DEFAULT_PROFILE.hasLeadership
    ),
    hasResearch: booleanValue(
      candidate.hasResearch ?? candidate.research,
      DEFAULT_PROFILE.hasResearch
    ),
    hasCommunityImpact: booleanValue(
      candidate.hasCommunityImpact ?? candidate.communityImpact,
      DEFAULT_PROFILE.hasCommunityImpact
    ),
    hasWorkExperience: booleanValue(
      candidate.hasWorkExperience ?? candidate.workExperience,
      DEFAULT_PROFILE.hasWorkExperience
    ),
    hasFinancialNeed: booleanValue(
      candidate.hasFinancialNeed ?? candidate.financialNeed,
      DEFAULT_PROFILE.hasFinancialNeed
    ),
    preferredIntakeYear: normalizePreferredIntakeYear(
      candidate.preferredIntakeYear ?? candidate.intakeYear
    ),
    recommenderStatus: (candidate.recommenderStatus as any) || "Not Started",
    readinessScore: numberValue(candidate.readinessScore, 0),
  };
}

function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ""
  );
}

async function addGeminiMentorNoteIfAvailable(
  profile: StudentProfile,
  result: any
): Promise<{
  result: any;
  fallbackMode: boolean;
  fallbackReason?: string;
}> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      result,
      fallbackMode: true,
      fallbackReason:
        "GEMINI_API_KEY is not configured, so Sentinel returned deterministic multi-agent results with fallback guidance.",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are ScholarPath Sentinel, a scholarship readiness mentor.

Create a concise mentor note for this student profile and Sentinel result.
Do not fabricate official eligibility.
Remind the student to verify official scholarship requirements.

Student profile:
${JSON.stringify(profile, null, 2)}

Sentinel result:
${JSON.stringify(result, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const geminiText =
      typeof (response as any).text === "function"
        ? (response as any).text()
        : (response as any).text;

    if (geminiText && typeof geminiText === "string") {
      result.mentorSummary = `${result.mentorSummary || ""}

Gemini mentor note:
${geminiText.trim()}`.trim();
    }

    return {
      result,
      fallbackMode: false,
    };
  } catch (error) {
    return {
      result,
      fallbackMode: true,
      fallbackReason:
        "Gemini API call failed, so Sentinel returned deterministic multi-agent results with fallback guidance.",
    };
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "5mb" }));

  app.get("/api/sentinel/health", (_req, res) => {
    res.json({
      ok: true,
      service: "ScholarPath Sentinel API",
      endpoint: "/api/sentinel/analyze",
    });
  });

  app.post("/api/sentinel/analyze", async (req, res) => {
    try {
      const profile = normalizeStudentProfile(req.body);

      const result = orchestratorAgent(profile);

      const enriched = await addGeminiMentorNoteIfAvailable(profile, result);

      res.json({
        ok: true,
        fallbackMode: enriched.fallbackMode,
        fallbackReason: enriched.fallbackReason,
        result: enriched.result,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Sentinel analysis error.",
      });
    }
  });

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
    },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(
      `Sentinel API health: http://localhost:${PORT}/api/sentinel/health`
    );
  });
}

startServer();