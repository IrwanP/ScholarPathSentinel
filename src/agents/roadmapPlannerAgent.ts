import type { StudentProfile } from "../types";
import type { ScholarshipMatch } from "./scholarshipMatcherAgent";

export type RoadmapPriority = "High" | "Medium" | "Low";

export interface RoadmapStep {
    milestone: string;
    task: string;
    targetDate: string;
    priority: RoadmapPriority;
    evidenceNeeded: string[];
}

export interface AgentTrace {
    agent: string;
    tool: string;
    inputSummary: string;
    outputSummary: string;
    status: "success" | "warning" | "blocked";
}

export interface RoadmapPlannerResult {
    roadmap: RoadmapStep[];
    trace: AgentTrace;
}

function addDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}

function getPrimaryField(profile: StudentProfile): string {
    return profile.fields?.[0] || "your target field";
}

export function roadmapPlannerAgent(
    profile: StudentProfile,
    topMatch?: ScholarshipMatch
): RoadmapPlannerResult {
    const scholarshipName = topMatch?.name || "your target scholarship";
    const primaryField = getPrimaryField(profile);

    const roadmap: RoadmapStep[] = [
        {
            milestone: "Confirm Eligibility",
            task: `Review the official requirements for ${scholarshipName} and confirm degree, country, GPA, language, and document requirements.`,
            targetDate: addDays(1),
            priority: "High",
            evidenceNeeded: ["Official scholarship page", "Eligibility checklist"]
        },
        {
            milestone: "Shortlist Target Programs",
            task: `Shortlist 3 programs related to ${primaryField} and map each program to scholarship requirements.`,
            targetDate: addDays(3),
            priority: "High",
            evidenceNeeded: ["Program links", "Admission requirements", "Application deadlines"]
        },
        {
            milestone: "Prepare Evidence Pack",
            task: "Prepare transcript, CV, certificates, leadership evidence, community impact evidence, and language test proof.",
            targetDate: addDays(7),
            priority: "High",
            evidenceNeeded: [
                "Transcript",
                "CV",
                "Certificates",
                "Leadership evidence",
                "Community impact evidence",
                "Language test score"
            ]
        },
        {
            milestone: "Contact Recommenders",
            task: "Contact 2 academic or professional recommenders and provide them with your CV, target program, and achievement summary.",
            targetDate: addDays(10),
            priority: "High",
            evidenceNeeded: ["Recommender list", "CV", "Achievement summary"]
        },
        {
            milestone: "Draft Scholarship Essay",
            task: `Draft a motivation essay connecting your background in ${primaryField}, your target study plan, and your future contribution to ${profile.origin || "your community"}.`,
            targetDate: addDays(14),
            priority: "Medium",
            evidenceNeeded: ["Essay draft", "Personal story outline", "Impact examples"]
        },
        {
            milestone: "Run Final Application Review",
            task: "Review all requirements against the official scholarship website before submission. Do not rely only on AI-generated guidance.",
            targetDate: addDays(21),
            priority: "High",
            evidenceNeeded: ["Final checklist", "Completed documents", "Official submission portal"]
        }
    ];

    return {
        roadmap,
        trace: {
            agent: "Roadmap Planner Agent",
            tool: "dated_action_plan",
            inputSummary: "Learner profile, target field, origin, and top scholarship match",
            outputSummary: `Generated ${roadmap.length} dated roadmap steps for ${scholarshipName}.`,
            status: "success"
        }
    };
}