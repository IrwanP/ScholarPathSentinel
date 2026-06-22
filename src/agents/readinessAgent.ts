import type { StudentProfile } from "../types";

export type ReadinessStatus = "Strong" | "Moderate" | "Needs Attention";

export interface ReadinessDimension {
    name: string;
    score: number;
    status: ReadinessStatus;
    rationale: string;
}

export interface AgentTrace {
    agent: string;
    tool: string;
    inputSummary: string;
    outputSummary: string;
    status: "success" | "warning" | "blocked";
}

export interface ReadinessAgentResult {
    readinessScore: number;
    readinessDimensions: ReadinessDimension[];
    trace: AgentTrace;
}

export function calculateReadiness(profile: StudentProfile): number {
    let score = 0;

    if (profile.gpa >= 3.7) score += 20;
    else if (profile.gpa >= 3.3) score += 15;
    else if (profile.gpa >= 3.0) score += 10;

    if (profile.englishStatus !== "Not Taken" && profile.englishScore) score += 20;

    if (profile.hasLeadership) score += 15;
    if (profile.hasResearch) score += 10;
    if (profile.hasCommunityImpact) score += 10;

    if (profile.targetDegree && profile.targetCountries.length > 0) score += 15;

    return Math.min(score, 100);
}

function statusFromScore(score: number): ReadinessStatus {
    if (score >= 80) return "Strong";
    if (score >= 55) return "Moderate";
    return "Needs Attention";
}

export function readinessAgent(profile: StudentProfile): ReadinessAgentResult {
    const readinessScore = calculateReadiness(profile);

    const academicScore =
        profile.gpa >= 3.7 ? 90 :
            profile.gpa >= 3.3 ? 78 :
                profile.gpa >= 3.0 ? 62 :
                    40;

    const englishScore =
        profile.englishStatus !== "Not Taken" && profile.englishScore ? 85 : 25;

    const evidenceScore =
        [
            profile.hasLeadership,
            profile.hasResearch,
            profile.hasCommunityImpact,
            profile.hasWorkExperience
        ].filter(Boolean).length * 22;

    const planningScore =
        profile.targetDegree && profile.targetCountries.length > 0 ? 80 : 35;

    const financialScore =
        profile.hasFinancialNeed ? 75 : 60;

    const readinessDimensions: ReadinessDimension[] = [
        {
            name: "Academic Fit",
            score: academicScore,
            status: statusFromScore(academicScore),
            rationale: `GPA is ${profile.gpa || "not provided"}.`
        },
        {
            name: "Language Readiness",
            score: englishScore,
            status: statusFromScore(englishScore),
            rationale:
                profile.englishStatus !== "Not Taken"
                    ? `${profile.englishStatus} score is available: ${profile.englishScore}.`
                    : "Language test evidence is not available yet."
        },
        {
            name: "Evidence Strength",
            score: Math.min(evidenceScore, 100),
            status: statusFromScore(Math.min(evidenceScore, 100)),
            rationale: "Evidence is assessed from leadership, research, community impact, and work experience."
        },
        {
            name: "Application Planning",
            score: planningScore,
            status: statusFromScore(planningScore),
            rationale:
                profile.targetDegree && profile.targetCountries.length > 0
                    ? `Target degree and countries are defined.`
                    : "Target degree or target countries need to be clarified."
        },
        {
            name: "Funding Narrative",
            score: financialScore,
            status: statusFromScore(financialScore),
            rationale:
                profile.hasFinancialNeed
                    ? "Financial need can support a clearer funding narrative."
                    : "Funding narrative should focus more on merit, impact, and future contribution."
        }
    ];

    return {
        readinessScore,
        readinessDimensions,
        trace: {
            agent: "Readiness Analyst Agent",
            tool: "calculateReadiness",
            inputSummary: "GPA, English readiness, evidence, target degree, and target countries",
            outputSummary: `Readiness score calculated as ${readinessScore}%.`,
            status: "success"
        }
    };
}