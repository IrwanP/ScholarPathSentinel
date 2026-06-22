import type { StudentProfile } from "../types";
import { securityGuardAgent } from "./securityGuard";
import { readinessAgent } from "./readinessAgent";
import { scholarshipMatcherAgent } from "./scholarshipMatcherAgent";
import { roadmapPlannerAgent } from "./roadmapPlannerAgent";
import { essayCoachAgent } from "./essayCoachAgent";

export interface AgentTrace {
    agent: string;
    tool: string;
    inputSummary: string;
    outputSummary: string;
    status: "success" | "warning" | "blocked";
}

interface SecurityGuardResult {
    sanitizedProfile?: StudentProfile;
    profile?: StudentProfile;
    passed?: boolean;
    issues?: string[];
    trace?: AgentTrace;
}

export interface SentinelOrchestrationResult {
    sanitizedProfile: StudentProfile;
    securityStatus: string;
    readinessScore: number;
    readinessDimensions: unknown[];
    matches: unknown[];
    roadmap: unknown[];
    essayFeedback: unknown;
    agentTrace: AgentTrace[];
}

export function orchestratorAgent(profile: StudentProfile): SentinelOrchestrationResult {
    const security = securityGuardAgent(profile) as SecurityGuardResult;

    const sanitizedProfile =
        security.sanitizedProfile ??
        security.profile ??
        profile;

    const readiness = readinessAgent(sanitizedProfile);
    const matcher = scholarshipMatcherAgent(sanitizedProfile);
    const roadmap = roadmapPlannerAgent(sanitizedProfile, matcher.matches[0]);
    const essay = essayCoachAgent(sanitizedProfile);

    const securityStatus =
        security.passed === false
            ? `Security guard completed with issues: ${(security.issues ?? []).join(", ")}`
            : "Security guard passed. Input was checked and sanitized.";

    const agentTrace = [
        security.trace,
        readiness.trace,
        matcher.trace,
        roadmap.trace,
        essay.trace,
        {
            agent: "Orchestrator Agent",
            tool: "sequential_multi_agent_workflow",
            inputSummary: "Outputs from security, readiness, scholarship matching, roadmap, and essay agents",
            outputSummary: "Final ScholarPath Sentinel report assembled.",
            status: "success"
        }
    ].filter((trace): trace is AgentTrace => Boolean(trace));

    return {
        sanitizedProfile,
        securityStatus,
        readinessScore: readiness.readinessScore,
        readinessDimensions: readiness.readinessDimensions,
        matches: matcher.matches,
        roadmap: roadmap.roadmap,
        essayFeedback: essay.essayFeedback,
        agentTrace
    };
}