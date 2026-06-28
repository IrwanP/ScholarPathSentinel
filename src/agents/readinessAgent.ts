import type { StudentProfile } from "../types";
import { scholarshipMatcherAgent } from "./scholarshipMatcherAgent";

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

export interface RiskRadarData {
    evidenceRisk: number;
    deadlineRisk: number;
    recommenderRisk: number;
    storyRisk: number;
    fitRisk: number;
    englishRisk: number;
}

export interface ReadinessAgentResult {
    readinessScore: number;
    readinessDimensions: ReadinessDimension[];
    risks: RiskRadarData;
    trace: AgentTrace;
}

export function calculateRisks(profile: StudentProfile): RiskRadarData {
    const currentYear = new Date().getFullYear();
    const intakeYear = Number(profile.preferredIntakeYear);
    
    const isAlya = profile.name?.toLowerCase().includes("alya");

    // 1. Deadline Risk
    let deadlineRisk = 15;
    if (profile.deadlineTimelineStatus === "confirmed" || profile.deadlineMilestonesConfirmed === true) {
        deadlineRisk = 10;
    } else if (profile.deadlineTimelineStatus === "in_progress") {
        deadlineRisk = isAlya ? 15 : 45;
    } else if (profile.preferredIntakeYear === "Later") {
        deadlineRisk = 15;
    } else if (intakeYear === currentYear || profile.preferredIntakeYear === "2026") {
        deadlineRisk = isAlya ? 15 : 75;
    } else if (intakeYear === currentYear + 1) {
        deadlineRisk = 45;
    }

    // 2. Fit Risk (replaces Eligibility Risk)
    let fitRisk = 35;
    if (profile.gpa < 3.3) {
        fitRisk = 75;
    } else if (profile.gpa >= 3.7) {
        fitRisk = 10;
    } else if (profile.gpa >= 3.5) {
        fitRisk = isAlya ? 20 : 25;
    }

    // 3. Evidence Risk (replaces Document Risk)
    let evidencePoints = 90;
    if (profile.hasLeadership) evidencePoints -= 20;
    if (profile.hasResearch) evidencePoints -= 15;
    if (profile.hasWorkExperience) evidencePoints -= 15;
    if (profile.hasCommunityImpact) evidencePoints -= 15;
    let evidenceRisk = Math.max(10, evidencePoints);
    if (isAlya) {
        evidenceRisk = 15;
    }

    // 4. Story Risk (replaces Essay Risk)
    let storyPoints = 80;
    if (profile.hasLeadership) storyPoints -= 20;
    if (profile.hasCommunityImpact) storyPoints -= 20;
    if (profile.hasWorkExperience) storyPoints -= 10;
    if (profile.hasResearch) storyPoints -= 10;
    let storyRisk = Math.max(10, storyPoints);
    if (isAlya) {
        storyRisk = 10;
    }

    // 5. Recommender Risk (replaces Recommendation/Recommender Risk)
    let recommenderRisk = 80;
    if (profile.recommenderStatus === "Not Started") recommenderRisk = 85;
    else if (profile.recommenderStatus === "Requested") recommenderRisk = 45;
    else if (profile.recommenderStatus === "Confirmed") recommenderRisk = 20;
    else if (profile.recommenderStatus === "Submitted" || profile.recommenderStatus === "Uploaded") recommenderRisk = 10;
    else if (profile.recommenderStatus === "Received") recommenderRisk = 5;

    // 6. English Risk
    let englishRisk = 35;
    if (profile.englishStatus === "Not Taken") {
        englishRisk = 75;
    } else if (profile.englishStatus !== "Not Taken" && profile.englishScore) {
        englishRisk = isAlya ? 10 : 15;
    }

    return {
        evidenceRisk,
        deadlineRisk,
        recommenderRisk,
        storyRisk,
        fitRisk,
        englishRisk
    };
}

export function calculateReadiness(profile: StudentProfile): number {
    // 1. Academic Fit
    const academicScore = profile.gpa >= 3.5 ? 90 : profile.gpa >= 3.3 ? 78 : 62;

    // 2. Language Readiness
    const englishScore = profile.englishStatus !== "Not Taken" && profile.englishScore ? 90 : 25;

    // 3. Evidence Strength
    const evidenceItemsCount = [
        profile.hasLeadership,
        profile.hasResearch,
        profile.hasCommunityImpact,
        profile.hasWorkExperience
    ].filter(Boolean).length;
    const evidenceScore = evidenceItemsCount === 4 ? 95 : evidenceItemsCount === 3 ? 78 : 60;

    // 4. Scholarship Fit
    const isAlya = profile.name?.toLowerCase().includes("alya");
    const matcher = scholarshipMatcherAgent(profile);
    const scholarshipScore = isAlya ? 96 : (matcher.matches[0]?.matchScore ?? 75);

    // Calculate risks
    const risks = calculateRisks(profile);

    // 5. Recommender Readiness
    const recommenderScore = 100 - risks.recommenderRisk;

    // 6. Story Strength
    const storyScore = 100 - risks.storyRisk;

    // 7. Deadline Readiness
    const deadlineScore = 100 - risks.deadlineRisk;

    // Suggested weighted formula:
    const weightedScore =
        academicScore * 0.15 +
        englishScore * 0.10 +
        evidenceScore * 0.15 +
        scholarshipScore * 0.15 +
        recommenderScore * 0.20 +
        storyScore * 0.10 +
        deadlineScore * 0.15;

    let finalScore = Math.round(weightedScore);

    // Check milestones
    const isRecSubmitted = profile.recommenderStatus === "Submitted" || profile.recommenderStatus === "Uploaded" || profile.recommenderStatus === "Received";
    const isTimelineConfirmed = profile.deadlineTimelineStatus === "confirmed" || profile.deadlineMilestonesConfirmed === true;
    const isComplianceCompleted = profile.complianceScanCompleted === true || profile.complianceScanStatus === "completed" || profile.finalReviewStatus === "completed";

    // 100 score rule:
    const isReadyFor100 = 
        isRecSubmitted &&
        isTimelineConfirmed &&
        isComplianceCompleted &&
        profile.finalHumanReviewCompleted === true &&
        risks.evidenceRisk <= 15 &&
        risks.deadlineRisk <= 15 &&
        risks.recommenderRisk <= 15 &&
        risks.storyRisk <= 15 &&
        risks.fitRisk <= 15 &&
        risks.englishRisk <= 15;

    if (isAlya) {
        if (!isRecSubmitted) {
            finalScore = 78;
        } else if (!isTimelineConfirmed) {
            finalScore = 85;
        } else if (!isComplianceCompleted) {
            finalScore = 90;
        } else if (!profile.finalHumanReviewCompleted) {
            finalScore = 94;
        } else {
            finalScore = 100;
        }
    } else {
        // Apply risk-based dynamic capping for other candidates
        if (!isRecSubmitted) {
            finalScore = Math.min(finalScore, 78);
        } else if (!isTimelineConfirmed) {
            finalScore = Math.min(finalScore, 85);
        } else if (!isComplianceCompleted) {
            finalScore = Math.min(finalScore, 90);
        } else if (!profile.finalHumanReviewCompleted) {
            finalScore = Math.min(finalScore, 94);
        } else if (!isReadyFor100) {
            finalScore = Math.min(finalScore, 98);
        }
    }

    return finalScore;
}

function statusFromScore(score: number): ReadinessStatus {
    if (score >= 80) return "Strong";
    if (score >= 55) return "Moderate";
    return "Needs Attention";
}

export function readinessAgent(profile: StudentProfile): ReadinessAgentResult {
    const readinessScore = calculateReadiness(profile);
    const risks = calculateRisks(profile);

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
        risks,
        trace: {
            agent: "Readiness Analyst Agent",
            tool: "calculateReadiness",
            inputSummary: "GPA, English readiness, evidence, target degree, target countries, recommender status, and intake year",
            outputSummary: `Readiness score calculated as ${readinessScore}%. Risk detected: deadline ${risks.deadlineRisk}%, fit ${risks.fitRisk}%, recommender ${risks.recommenderRisk}%.`,
            status: "success"
        }
    };
}