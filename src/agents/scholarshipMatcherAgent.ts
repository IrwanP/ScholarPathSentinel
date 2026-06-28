import type { StudentProfile } from "../types";
import { realScholarships, type Scholarship } from "../data/scholarships";
import { calculateScholarshipScore } from "../lib/scholarshipScoring";

export interface AgentTrace {
  agent: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  status: "success" | "warning" | "error";
}

export interface ScholarshipMatch extends Scholarship {
  matchScore: number;
  fitCategory: string;
  rationale: string;
  tieBreakerScore?: number;
  rankReasons?: string[];
}

export interface ScholarshipMatcherResult {
  matches: ScholarshipMatch[];
  trace: AgentTrace;
}

export function scholarshipMatcherAgent(
  profile: StudentProfile
): ScholarshipMatcherResult {
  const matches: ScholarshipMatch[] = realScholarships
    .map((scholarship) => {
      const scoreResult = calculateScholarshipScore(scholarship, profile);

      return {
        ...scholarship,
        matchScore: scoreResult.matchScore,
        fitCategory: scoreResult.fitCategory,
        rationale: scoreResult.rationale,
        tieBreakerScore: scoreResult.tieBreakerScore,
        rankReasons: scoreResult.rankReasons,
      };
    })
    // Sort by match score descending, then by tie-breaker descending
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (b.tieBreakerScore ?? 0) - (a.tieBreakerScore ?? 0);
    });

  const trace: AgentTrace = {
    agent: "Scholarship Matcher Agent",
    tool: "realScholarships matching dataset",
    inputSummary: `Target degree: ${profile.targetDegree}. Countries: ${profile.targetCountries.join(", ")}. Fields: ${profile.fields.join(", ")}. GPA: ${profile.gpa}. English: ${profile.englishStatus} ${profile.englishScore}.`,
    outputSummary: `Ranked ${matches.length} scholarship matches from the existing ScholarPath AI dataset.`,
    status: "success",
  };

  return {
    matches,
    trace,
  };
}