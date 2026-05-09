import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Mentor
  app.post("/api/mentor-chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(403).json({ reply: "Gemini API key is missing. Using rule-based fallback." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        You are a PhD Scholarship Mentor. You help students navigate their scholarship journey.
        Your tone is professional, encouraging, and concise.
        
        STUDENT PROFILE:
        Name: ${context.profile?.name || "Alya Putri"}
        Degree: ${context.profile?.targetDegree}
        GPA: ${context.profile?.gpa}
        English: ${context.profile?.englishStatus}
        Readiness: ${context.readinessScore}%
        Active Scholarship: ${context.activeScholarship?.name || "None"}
        
        CONTEXT:
        The student is using ScholarPath AI. They are looking for actionable guidance.
        - Don't invent deadlines. Tell them to verify official sources.
        - Encourage them to use the app sections: Scholarships, Roadmap, Documents, Essay Coach, Interview Coach.
        - Focus on evidence gaps.
        
        CHAT HISTORY:
        ${context.history?.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
        
        USER MESSAGE:
        ${message}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
