import type { StudentProfile } from "../types";

export interface EssayFeedback {
    strengths: string[];
    gaps: string[];
    suggestedOpeningDirection: string;
    revisionChecklist: string[];
}

export interface AgentTrace {
    agent: string;
    tool: string;
    inputSummary: string;
    outputSummary: string;
    status: "success" | "warning" | "blocked";
}

export interface EssayCoachResult {
    essayFeedback: EssayFeedback;
    trace: AgentTrace;
}

function getPrimaryField(profile: StudentProfile): string {
    return profile.fields?.[0] || "your target field";
}

export function essayCoachAgent(profile: StudentProfile): EssayCoachResult {
    const primaryField = getPrimaryField(profile);

    const strengths: string[] = [];

    if (profile.gpa >= 3.5) {
        strengths.push("Your academic performance can become a strong foundation for the essay.");
    } else {
        strengths.push("Your essay should clearly explain your motivation, growth, and future contribution.");
    }

    if (profile.hasLeadership) {
        strengths.push("Your leadership experience can help show initiative and ownership.");
    }

    if (profile.hasCommunityImpact) {
        strengths.push("Your community impact experience can strengthen your contribution narrative.");
    }

    if (profile.hasResearch) {
        strengths.push("Your research experience can support your academic readiness story.");
    }

    if (profile.hasWorkExperience) {
        strengths.push("Your work experience can help connect your study plan with real-world problems.");
    }

    if (strengths.length === 0) {
        strengths.push("Your profile has potential, but the essay needs stronger evidence and specific examples.");
    }

    const gaps: string[] = [];

    if (!profile.hasLeadership) {
        gaps.push("Add one example that shows leadership, ownership, or initiative.");
    }

    if (!profile.hasCommunityImpact) {
        gaps.push("Strengthen the contribution story by showing how your study plan can benefit others.");
    }

    if (!profile.hasResearch) {
        gaps.push("Add academic, project, publication, thesis, or research-related evidence if available.");
    }

    if (!profile.hasWorkExperience) {
        gaps.push("If work experience is limited, use projects, volunteering, or academic achievements as evidence.");
    }

    if (profile.englishStatus === "Not Taken") {
        gaps.push("Mention your plan to complete the required English test if the scholarship requires it.");
    }

    if (gaps.length === 0) {
        gaps.push("The main gap is not evidence quantity, but making the story specific, measurable, and authentic.");
    }

    const suggestedOpeningDirection =
        `Start with a concrete moment where your interest in ${primaryField} became connected to a real problem in ${profile.origin || "your community"}. Avoid a generic opening like "I have always been passionate about..." and begin with a specific experience instead.`;

    const revisionChecklist = [
        "State the problem you care about clearly.",
        "Show your role, not only the team's achievement.",
        "Use one or two measurable examples.",
        "Connect your past experience with your target degree.",
        "Explain why the scholarship and country fit your goals.",
        "Describe your future contribution after graduation.",
        "Avoid fabricating achievements or exaggerating impact.",
        "Check every claim against available evidence."
    ];

    return {
        essayFeedback: {
            strengths,
            gaps,
            suggestedOpeningDirection,
            revisionChecklist
        },
        trace: {
            agent: "Essay Coach Agent",
            tool: "authenticity_guided_essay_feedback",
            inputSummary: "Target field, origin, GPA, leadership, research, work experience, and community impact",
            outputSummary: "Generated essay strengths, gaps, opening direction, and revision checklist.",
            status: "success"
        }
    };
}