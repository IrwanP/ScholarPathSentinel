import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

import { orchestratorAgent } from "./src/agents/orchestratorAgent";
import type { StudentProfile } from "./src/types";

type EnglishStatus = StudentProfile["englishStatus"];

const VALID_ENGLISH_STATUS: EnglishStatus[] = [
  "Not Taken",
  "IELTS",
  "TOEFL iBT",
  "TOEFL iBT 2026",
  "Duolingo",
  "Other"
];

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.replace(",", ".").trim());
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}

function normalizeBoolean(value: unknown): boolean {
  return Boolean(value);
}

function normalizeEnglishStatus(value: unknown): EnglishStatus {
  if (value === "TOEFL") {
    return "TOEFL iBT";
  }

  if (
    typeof value === "string" &&
    VALID_ENGLISH_STATUS.includes(value as EnglishStatus)
  ) {
    return value as EnglishStatus;
  }

  return "Not Taken";
}

function normalizeProfile(input: unknown): StudentProfile {
  const profile =
    input && typeof input === "object"
      ? (input as Partial<StudentProfile>)
      : {};

  return {
    name: normalizeString(profile.name),
    origin: normalizeString(profile.origin),
    currentEducation: normalizeString(profile.currentEducation),
    targetDegree: normalizeString(profile.targetDegree),
    targetCountries: normalizeStringArray(profile.targetCountries),
    fields: normalizeStringArray(profile.fields),
    gpa: normalizeNumber(profile.gpa),
    englishStatus: normalizeEnglishStatus(profile.englishStatus),
    englishScore: normalizeString(profile.englishScore),
    profilePhotoUrl: "",
    hasLeadership: normalizeBoolean(profile.hasLeadership),
    hasResearch: normalizeBoolean(profile.hasResearch),
    hasCommunityImpact: normalizeBoolean(profile.hasCommunityImpact),
    hasWorkExperience: normalizeBoolean(profile.hasWorkExperience),
    hasFinancialNeed: normalizeBoolean(profile.hasFinancialNeed),
    preferredIntakeYear:
      normalizeString(profile.preferredIntakeYear) ||
      String(new Date().getFullYear()),
    readinessScore: normalizeNumber(profile.readinessScore)
  };
}

function createFallbackMentorSummary(result: {
  readinessScore: number;
  matches: unknown[];
  roadmap: unknown[];
}): string {
  const topMatch =
    Array.isArray(result.matches) && result.matches.length > 0
      ? (result.matches[0] as {
        name?: string;
        provider?: string;
        country?: string;
      })
      : null;

  const nextActions = Array.isArray(result.roadmap)
    ? result.roadmap
      .slice(0, 3)
      .map((step, index) => {
        const roadmapStep = step as {
          milestone?: string;
          task?: string;
        };

        return `${index + 1}. ${roadmapStep.milestone || "Next step"
          }: ${roadmapStep.task || "Review your application plan."}`;
      })
      .join("\n")
    : "1. Review your profile.\n2. Confirm scholarship eligibility.\n3. Prepare required documents.";

  return `Overall readiness: ${result.readinessScore}%.

Best scholarship direction:
${topMatch
      ? `${topMatch.name || "Top scholarship match"} from ${topMatch.provider || "the provider"
      } in ${topMatch.country || "your target country"}.`
      : "No top scholarship match was generated yet. Refine your target country, degree, and field of study."
    }

Top 3 next actions:
${nextActions}

Main risk to watch:
Always verify eligibility, deadlines, and document requirements from the official scholarship website. Do not rely only on AI-generated guidance.`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/api/sentinel/health", (_req, res) => {
    return res.json({
      ok: true,
      service: "ScholarPath Sentinel API",
      endpoint: "/api/sentinel/analyze"
    });
  });

  app.post("/api/sentinel/analyze", async (req, res) => {
    try {
      const rawProfile = req.body?.profile;

      if (!rawProfile) {
        return res.status(400).json({
          error: "Missing profile payload."
        });
      }

      const profile = normalizeProfile(rawProfile);
      const deterministicResult = orchestratorAgent(profile);

      let mentorSummary = createFallbackMentorSummary(deterministicResult);
      let mentorSummarySource = "deterministic-fallback";
      let geminiWarning = "";

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });

          const prompt = `
You are ScholarPath Sentinel, a multi-agent scholarship readiness mentor.

Use the deterministic agent outputs below.
Do not invent deadlines.
Do not fabricate achievements.
Tell the learner to verify official scholarship sources.
Give concise, practical, encouraging guidance.

PROFILE:
${JSON.stringify(deterministicResult.sanitizedProfile, null, 2)}

READINESS SCORE:
${deterministicResult.readinessScore}%

TOP SCHOLARSHIP MATCHES:
${JSON.stringify(deterministicResult.matches, null, 2)}

ROADMAP:
${JSON.stringify(deterministicResult.roadmap, null, 2)}

ESSAY FEEDBACK:
${JSON.stringify(deterministicResult.essayFeedback, null, 2)}

Write a short mentor summary with:
1. Overall readiness interpretation
2. Best scholarship direction
3. Top 3 next actions
4. Main risk to watch
`;

          const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            contents: prompt
          });

          mentorSummary = response.text || mentorSummary;
          mentorSummarySource = "gemini";
        } catch (geminiError) {
          console.warn("Gemini mentor summary fallback used:", geminiError);
          geminiWarning =
            "Gemini mentor summary failed, so Sentinel returned deterministic multi-agent results with fallback guidance.";
        }
      } else {
        geminiWarning =
          "GEMINI_API_KEY is not configured, so Sentinel returned deterministic multi-agent results with fallback guidance.";
      }

      return res.json({
        ...deterministicResult,
        mentorSummary,
        mentorSummarySource,
        geminiWarning
      });
    } catch (error) {
      console.error("Sentinel analysis error:", error);

      return res.status(500).json({
        error: "Sentinel analysis failed on the backend.",
        details:
          error instanceof Error ? error.message : "Unknown backend error."
      });
    }
  });

  app.post("/api/mentor-chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          reply:
            "Gemini API key is missing. Using rule-based fallback. Please verify official scholarship sources before submission."
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are a scholarship mentor.
You help students navigate their scholarship journey.
Your tone is professional, encouraging, and concise.

STUDENT PROFILE:
Name: ${context?.profile?.name || "Student"}
Degree: ${context?.profile?.targetDegree || "Not specified"}
GPA: ${context?.profile?.gpa || "Not specified"}
English: ${context?.profile?.englishStatus || "Not specified"}
Readiness: ${context?.readinessScore || "Not calculated"}%

ACTIVE SCHOLARSHIP:
${context?.activeScholarship?.name || "None"}

CONTEXT:
The student is using ScholarPath Sentinel.
- Do not invent deadlines.
- Tell them to verify official sources.
- Focus on evidence gaps and next actions.

CHAT HISTORY:
${context?.history
          ?.map(
            (m: { role: string; content: string }) =>
              `${m.role.toUpperCase()}: ${m.content}`
          )
          .join("\n") || ""
        }

USER MESSAGE:
${message}
`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: prompt
      });

      return res.json({
        reply:
          response.text ||
          "I could not generate a response. Please verify official scholarship sources and try again."
      });
    } catch (error) {
      console.error("Gemini API Error:", error);

      return res.json({
        reply:
          "The AI mentor is temporarily unavailable. You can still continue by reviewing scholarship eligibility, required documents, and official deadlines."
      });
    }
  });

  app.use("/api", (req, res) => {
    return res.status(404).json({
      error: "API route not found.",
      method: req.method,
      path: req.originalUrl,
      availableRoutes: [
        "GET /api/sentinel/health",
        "POST /api/sentinel/analyze",
        "POST /api/mentor-chat"
      ]
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: "spa"
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Sentinel API health: http://localhost:${PORT}/api/sentinel/health`);
  });
}

startServer();