import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { orchestratorAgent } from "./src/agents/orchestratorAgent";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: "1mb" }));

  // ScholarPath Sentinel multi-agent endpoint
  app.post("/api/sentinel/analyze", async (req, res) => {
    try {
      const { profile } = req.body;

      if (!profile) {
        return res.status(400).json({
          error: "Missing profile payload."
        });
      }

      const deterministicResult = orchestratorAgent(profile);
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          ...deterministicResult,
          mentorSummary:
            "Gemini API key is not configured. ScholarPath Sentinel is running in deterministic multi-agent fallback mode."
        });
      }

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
        model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
        contents: prompt
      });

      res.json({
        ...deterministicResult,
        mentorSummary: response.text
      });
    } catch (error) {
      console.error("Sentinel analysis error:", error);
      res.status(500).json({
        error: "Internal Server Error"
      });
    }
  });

  // Existing ScholarPath AI mentor endpoint
  app.post("/api/mentor-chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(403).json({
          reply: "Gemini API key is missing. Using rule-based fallback."
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are a PhD Scholarship Mentor.
You help students navigate their scholarship journey.
Your tone is professional, encouraging, and concise.

STUDENT PROFILE:
Name: ${context?.profile?.name || "Alya Putri"}
Degree: ${context?.profile?.targetDegree}
GPA: ${context?.profile?.gpa}
English: ${context?.profile?.englishStatus}
Readiness: ${context?.readinessScore}%

ACTIVE SCHOLARSHIP:
${context?.activeScholarship?.name || "None"}

CONTEXT:
The student is using ScholarPath AI. They are looking for actionable guidance.
- Do not invent deadlines.
- Tell them to verify official sources.
- Encourage them to use the app sections: Scholarships, Roadmap, Documents, Essay Coach, Interview Coach.
- Focus on evidence gaps.

CHAT HISTORY:
${context?.history?.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

USER MESSAGE:
${message}
`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
        contents: prompt
      });

      res.json({
        reply: response.text
      });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: "Internal Server Error"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();