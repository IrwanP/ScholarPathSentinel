import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import type { StudentProfile } from "../../types";
import { calculateScholarshipScore } from "../../lib/scholarshipScoring";
import { calculateRisks } from "../../agents/readinessAgent";
import type { RiskRadarData } from "../../agents/readinessAgent";
import { useProfile } from "../../context/ProfileContext";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import RiskRadarChart from "../../components/RiskRadarChart";
import { getActiveAnalysis } from "../../utils/sentinelAnalysis";
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    Bot,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDashed,
    ClipboardList,
    ExternalLink,
    FileText,
    Flag,
    GraduationCap,
    Info,
    Layers,
    LineChart,
    ListChecks,
    MapPinned,
    MessageCircle,
    Radar,
    Route,
    Send,
    ShieldCheck,
    Sparkles,
    Target,
    Trophy,
    Users,
    Calendar,
    Clock,
    PenTool,
    Globe
} from "lucide-react";

type TraceStatus = "success" | "warning" | "error";

interface AgentTrace {
    agent: string;
    tool: string;
    inputSummary: string;
    outputSummary: string;
    status: TraceStatus;
}

interface ReadinessDimension {
    name: string;
    score: number;
    status: "Strong" | "Moderate" | "Needs Attention" | string;
    rationale: string;
}

interface ScholarshipMatch {
    id?: string;
    name: string;
    provider: string;
    institution?: string;
    country: string;
    region?: string;
    degreeLevels?: string[];
    fieldsOfStudy?: string[];
    coverage: string;
    benefits?: string | string[];
    eligibilitySummary?: string;
    requiredDocuments?: string[];
    matchScore: number;
    fitCategory: string;
    rationale?: string;
    rankReasons?: string[];
    tieBreakerScore?: number;
}

interface RoadmapStep {
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low" | string;
    dueDate: string;
    resources: string[];
}

interface EssayFeedback {
    strengths: string[];
    gaps: string[];
    openingDirection: string;
    revisionChecklist: string[];
}

interface SecuritySection {
    passed: boolean;
    issues: string[];
    sanitizedProfile?: StudentProfile;
}

interface NormalizedSentinelResult {
    security: SecuritySection;
    readinessScore: number;
    readinessDimensions: ReadinessDimension[];
    matches: ScholarshipMatch[];
    roadmap: RoadmapStep[];
    essayFeedback: EssayFeedback;
    mentorSummary: string;
    risks: RiskRadarData;
    agentTrace: AgentTrace[];
    fallbackMode: boolean;
}

interface CoachMessage {
    role: "assistant" | "user";
    content: string;
}

type ActiveTab =
    | "overview"
    | "gaps"
    | "roadmap"
    | "mentor"
    | "report"
    | "trace";

const PROFILE_STORAGE_KEYS = [
    "scholarpathProfile",
    "scholarPathProfile",
    "studentProfile",
    "scholarpath_student_profile",
    "scholarpath-profile",
    "profile",
    "userProfile",
    "student-profile",
    "scholarPathStudentProfile",
    "scholarpath.profile",
];

const DEFAULT_PROFILE: StudentProfile = {
    name: "Irwan Prabowo",
    origin: "Indonesia",
    currentEducation: "Bachelor’s Degree",
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

function normalizeText(value: unknown): string {
    return String(value ?? "")
        .replace(/’/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeArray(value: unknown, fallback: string[] = []): string[] {
    if (Array.isArray(value)) {
        const cleaned = value.map(normalizeText).filter(Boolean);
        return cleaned.length ? cleaned : fallback;
    }

    if (typeof value === "string") {
        const cleaned = value
            .split(/[,;|]/)
            .map(normalizeText)
            .filter(Boolean);

        return cleaned.length ? cleaned : fallback;
    }

    return fallback;
}

function normalizeNumber(value: unknown, fallback = 0): number {
    const parsed =
        typeof value === "number"
            ? value
            : Number(String(value ?? "").replace(",", "."));

    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEnglishStatus(value: unknown): StudentProfile["englishStatus"] {
    const text = normalizeText(value);

    const validStatuses: StudentProfile["englishStatus"][] = [
        "Not Taken",
        "IELTS",
        "TOEFL iBT",
        "TOEFL iBT 2026",
        "Duolingo",
        "Other",
    ];

    const matched = validStatuses.find(
        (status) => status.toLowerCase() === text.toLowerCase()
    );

    return matched ?? DEFAULT_PROFILE.englishStatus;
}

function normalizePreferredIntakeYear(value: unknown): string {
    const currentYear = new Date().getFullYear();
    const parsed = Number(normalizeText(value));

    if (!Number.isFinite(parsed) || parsed < currentYear) {
        return String(currentYear);
    }

    return String(parsed);
}

function looksLikeStudentProfile(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;

    const candidate = value as Record<string, unknown>;

    return Boolean(
        candidate.name ||
        candidate.fullName ||
        candidate.origin ||
        candidate.country ||
        candidate.targetDegree ||
        candidate.degree ||
        candidate.gpa ||
        candidate.englishStatus ||
        candidate.englishScore ||
        candidate.fields ||
        candidate.fieldOfStudy
    );
}

function toStudentProfile(value: Record<string, unknown>): StudentProfile {
    return {
        name: normalizeText(value.name ?? value.fullName) || DEFAULT_PROFILE.name,
        origin:
            normalizeText(value.origin ?? value.country ?? value.countryOfOrigin) ||
            DEFAULT_PROFILE.origin,
        currentEducation:
            normalizeText(value.currentEducation ?? value.education) ||
            DEFAULT_PROFILE.currentEducation,
        targetDegree:
            normalizeText(value.targetDegree ?? value.degree ?? value.degreeLevel) ||
            DEFAULT_PROFILE.targetDegree,
        targetCountries: normalizeArray(
            value.targetCountries ?? value.countries,
            DEFAULT_PROFILE.targetCountries
        ),
        fields: normalizeArray(
            value.fields ?? value.fieldOfStudy ?? value.studyFields,
            DEFAULT_PROFILE.fields
        ),
        gpa: normalizeNumber(value.gpa ?? value.grade, DEFAULT_PROFILE.gpa),
        englishStatus: normalizeEnglishStatus(
            value.englishStatus ?? value.englishProficiency ?? value.englishTest
        ),
        englishScore:
            normalizeText(
                value.englishScore ??
                value.ieltsScore ??
                value.toeflScore ??
                value.duolingoScore
            ) || DEFAULT_PROFILE.englishScore,
        profilePhotoUrl:
            normalizeText(value.profilePhotoUrl ?? value.photoUrl ?? value.avatarUrl) ||
            undefined,
        hasLeadership: Boolean(value.hasLeadership ?? value.leadership ?? true),
        hasResearch: Boolean(value.hasResearch ?? value.research ?? true),
        hasCommunityImpact: Boolean(
            value.hasCommunityImpact ?? value.communityImpact ?? true
        ),
        hasWorkExperience: Boolean(
            value.hasWorkExperience ?? value.workExperience ?? true
        ),
        hasFinancialNeed: Boolean(
            value.hasFinancialNeed ?? value.financialNeed ?? true
        ),
        preferredIntakeYear: normalizePreferredIntakeYear(
            value.preferredIntakeYear ?? value.intakeYear
        ),
        readinessScore: normalizeNumber(value.readinessScore, 0),
    };
}

function findProfileCandidate(
    value: unknown,
    depth = 0
): Record<string, unknown> | null {
    if (depth > 4) return null;

    if (looksLikeStudentProfile(value)) {
        return value;
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const found = findProfileCandidate(item, depth + 1);
            if (found) return found;
        }
    }

    if (value && typeof value === "object") {
        const objectValue = value as Record<string, unknown>;

        const likelyKeys = [
            "profile",
            "studentProfile",
            "currentProfile",
            "userProfile",
            "data",
            "state",
            "value",
            "student",
            "form",
        ];

        for (const key of likelyKeys) {
            if (key in objectValue) {
                const found = findProfileCandidate(objectValue[key], depth + 1);
                if (found) return found;
            }
        }

        for (const nestedValue of Object.values(objectValue)) {
            const found = findProfileCandidate(nestedValue, depth + 1);
            if (found) return found;
        }
    }

    return null;
}

function readProfileFromStorageArea(storage: Storage): StudentProfile | null {
    for (const key of PROFILE_STORAGE_KEYS) {
        try {
            const raw = storage.getItem(key);
            if (!raw) continue;

            const parsed = JSON.parse(raw);
            const candidate = findProfileCandidate(parsed);

            if (candidate) {
                return toStudentProfile(candidate);
            }
        } catch {
            // Ignore invalid storage values.
        }
    }

    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (!key) continue;

        try {
            const raw = storage.getItem(key);
            if (!raw) continue;

            const parsed = JSON.parse(raw);
            const candidate = findProfileCandidate(parsed);

            if (candidate) {
                return toStudentProfile(candidate);
            }
        } catch {
            // Ignore invalid storage values.
        }
    }

    return null;
}

function readStoredProfile(): StudentProfile | null {
    if (typeof window === "undefined") return null;

    return (
        readProfileFromStorageArea(window.localStorage) ??
        readProfileFromStorageArea(window.sessionStorage)
    );
}

function countryAliases(country: string): string[] {
    const normalized = country.toLowerCase();

    if (["usa", "us", "united states", "united states of america"].includes(normalized)) {
        return ["usa", "us", "united states", "united states of america"];
    }

    if (["uk", "united kingdom", "england", "scotland", "wales"].includes(normalized)) {
        return ["uk", "united kingdom", "england", "scotland", "wales"];
    }

    if (["europe", "european union", "multiple european countries"].includes(normalized)) {
        return [
            "europe",
            "european union",
            "multiple european countries",
            "switzerland",
            "netherlands",
            "germany",
            "france",
            "italy",
            "spain",
            "sweden",
            "finland",
            "norway",
            "denmark",
        ];
    }

    return [normalized];
}

function countryMatchesTarget(matchCountry: string, targets: string[]): boolean {
    const matchAliases = countryAliases(normalizeText(matchCountry));

    return targets.some((target) => {
        const targetAliases = countryAliases(normalizeText(target));
        return targetAliases.some((alias) => matchAliases.includes(alias));
    });
}

function textContainsAny(text: string, values: string[]): boolean {
    const normalizedText = text.toLowerCase();

    return values.some((value) => {
        const cleaned = normalizeText(value).toLowerCase();
        return cleaned && normalizedText.includes(cleaned);
    });
}

function getMatchTieBreaker(
    match: ScholarshipMatch,
    profile: StudentProfile,
    sourceIndex: number
): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const targetCountries = profile.targetCountries ?? [];
    const fields = profile.fields ?? [];
    const degree = normalizeText(profile.targetDegree).toLowerCase();
    const combinedText = [
        match.name,
        match.provider,
        match.institution,
        match.country,
        match.region,
        match.coverage,
        match.eligibilitySummary,
        match.rationale,
        ...(match.degreeLevels ?? []),
        ...(match.fieldsOfStudy ?? []),
    ]
        .join(" ")
        .toLowerCase();

    if (countryMatchesTarget(match.country, targetCountries)) {
        score += 25;
        reasons.push("Exact target-country fit");
    } else if (match.region && countryMatchesTarget(match.region, targetCountries)) {
        score += 18;
        reasons.push("Target-region fit");
    }

    if (
        match.degreeLevels?.some((level) =>
            normalizeText(level).toLowerCase().includes(degree.replace("'s", ""))
        ) ||
        combinedText.includes(degree.replace("'s", ""))
    ) {
        score += 20;
        reasons.push("Target-degree fit");
    }

    if (textContainsAny(combinedText, fields)) {
        score += 20;
        reasons.push("Field-of-study fit");
    } else if (
        fields.some((field) => {
            const normalizedField = field.toLowerCase();
            return (
                normalizedField.includes("strategy") &&
                (combinedText.includes("management") ||
                    combinedText.includes("policy") ||
                    combinedText.includes("business") ||
                    combinedText.includes("innovation"))
            );
        })
    ) {
        score += 12;
        reasons.push("Adjacent field fit");
    }

    if (combinedText.includes("full funding") || combinedText.includes("fully funded")) {
        score += 15;
        reasons.push("Stronger funding coverage");
    } else if (combinedText.includes("partial") || combinedText.includes("aid")) {
        score += 8;
        reasons.push("Funding support available");
    }

    const requiredDocumentCount = match.requiredDocuments?.length ?? 0;
    if (requiredDocumentCount > 0 && requiredDocumentCount <= 4) {
        score += 6;
        reasons.push("Lower document complexity");
    } else if (requiredDocumentCount > 4) {
        score += 3;
        reasons.push("Document requirements identified");
    }

    score += Math.max(0, 5 - sourceIndex) * 0.1;

    return {
        score,
        reasons: reasons.length
            ? reasons
            : ["Ranked by available profile fit and scholarship metadata"],
    };
}

function matchLabel(score: number): string {
    if (score >= 92) return "Excellent Match";
    if (score >= 84) return "Strong Match";
    if (score >= 75) return "Good Match";

    return "Moderate Match";
}

function normalizeMatches(
    rawMatches: ScholarshipMatch[],
    profile: StudentProfile
): ScholarshipMatch[] {
    const normalized = rawMatches.map((match, index) => {
        const scholarshipObj = {
            ...match,
            id: normalizeText(match.id) || `match-${index + 1}`,
            name: normalizeText(match.name) || `Scholarship Match ${index + 1}`,
            provider: normalizeText(match.provider) || "Scholarship Provider",
            institution: normalizeText(match.institution),
            country: normalizeText(match.country) || "Target country",
            region: normalizeText(match.region),
            degreeLevels: normalizeArray(match.degreeLevels),
            fieldsOfStudy: normalizeArray(match.fieldsOfStudy),
            coverage: normalizeText(match.coverage) || "Funding coverage varies",
            benefits: match.benefits,
            eligibilitySummary: normalizeText(match.eligibilitySummary),
            requiredDocuments: normalizeArray(match.requiredDocuments),
            tags: normalizeArray((match as any).tags),
            searchableKeywords: normalizeArray((match as any).searchableKeywords),
            difficulty: normalizeText((match as any).difficulty),
        };

        const scoreResult = calculateScholarshipScore(scholarshipObj as any, profile);

        return {
            ...scholarshipObj,
            matchScore: scoreResult.matchScore,
            fitCategory: scoreResult.fitCategory,
            rationale: scoreResult.rationale,
            tieBreakerScore: scoreResult.tieBreakerScore,
            rankReasons: scoreResult.rankReasons,
        };
    });

    return normalized.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
        }

        return (b.tieBreakerScore ?? 0) - (a.tieBreakerScore ?? 0);
    });
}

function getRawRoadmap(root: any): unknown[] {
    if (Array.isArray(root.roadmap)) return root.roadmap;
    if (Array.isArray(root.applicationRoadmap)) return root.applicationRoadmap;
    if (Array.isArray(root.roadmap?.steps)) return root.roadmap.steps;
    if (Array.isArray(root.plan)) return root.plan;
    if (Array.isArray(root.steps)) return root.steps;

    return [];
}

function getRawMatches(root: any): ScholarshipMatch[] {
    if (Array.isArray(root.matches)) return root.matches;
    if (Array.isArray(root.scholarshipMatches)) return root.scholarshipMatches;
    if (Array.isArray(root.scholarships)) return root.scholarships;

    return [];
}

function getRawDimensions(root: any): ReadinessDimension[] {
    if (Array.isArray(root.readinessDimensions)) return root.readinessDimensions;
    if (Array.isArray(root.readiness?.dimensions)) return root.readiness.dimensions;
    if (Array.isArray(root.dimensions)) return root.dimensions;

    return [];
}

function getRawTrace(root: any): Partial<AgentTrace>[] {
    if (Array.isArray(root.agentTrace)) return root.agentTrace;
    if (Array.isArray(root.trace)) return root.trace;
    if (Array.isArray(root.traces)) return root.traces;

    return [];
}

function buildFallbackRoadmap(
    profile: StudentProfile,
    topMatch?: ScholarshipMatch | null
): RoadmapStep[] {
    const targetProgram = topMatch?.name || "your target scholarship";
    const field = profile.fields?.[0] || "your target field";

    return [
        {
            title: `Review the official requirements for ${targetProgram}`,
            description:
                "Confirm country, degree level, work experience, GPA, English score, required documents, and deadline. Use the official scholarship page as the source of truth.",
            priority: "High",
            dueDate: "This week",
            resources: ["Official scholarship website", "Eligibility page", "Deadline page"],
        },
        {
            title: `Shortlist 3 programs related to ${field}`,
            description:
                "Select 3 universities or programs that match your target field. Map each program to your scholarship goals and application evidence.",
            priority: "High",
            dueDate: "Next 7 days",
            resources: ["Program pages", "Curriculum pages", "Faculty profiles"],
        },
        {
            title: "Prepare your evidence pack",
            description:
                "Prepare transcript, CV, certificates, leadership evidence, community impact proof, research or project evidence, and English test result.",
            priority: "High",
            dueDate: "Next 2 weeks",
            resources: ["CV", "Transcript", "Certificates", "Recommendation contacts"],
        },
        {
            title: "Contact recommenders",
            description:
                "Contact 2 academic or professional recommenders. Share your CV, target program, scholarship goal, and achievement summary.",
            priority: "High",
            dueDate: "Next 2 weeks",
            resources: ["Recommender brief", "CV", "Achievement summary"],
        },
        {
            title: "Draft scholarship essay",
            description:
                "Create a clear story arc: problem you care about, what you have done, why this scholarship fits, and how you will contribute after graduation.",
            priority: "Medium",
            dueDate: "Next 3 weeks",
            resources: ["Personal statement", "Leadership examples", "Impact examples"],
        },
        {
            title: "Run final application review",
            description:
                "Check every claim, document, deadline, and eligibility requirement before submission. Do not rely only on AI-generated guidance.",
            priority: "High",
            dueDate: "Before submission",
            resources: ["Submission checklist", "Official portal", "Document checklist"],
        },
    ];
}

function hasMeaningfulRoadmapContent(rawRoadmap: unknown[]): boolean {
    return rawRoadmap.some((item) => {
        if (!item || typeof item !== "object") return false;

        const step = item as Record<string, unknown>;

        return Boolean(
            normalizeText(
                step.title ??
                step.action ??
                step.task ??
                step.name ??
                step.stepTitle ??
                step.description ??
                step.details ??
                step.summary
            )
        );
    });
}

function normalizeRoadmap(
    rawRoadmap: unknown[],
    profile: StudentProfile,
    topMatch?: ScholarshipMatch | null
): RoadmapStep[] {
    const fallback = buildFallbackRoadmap(profile, topMatch);

    if (!rawRoadmap.length || !hasMeaningfulRoadmapContent(rawRoadmap)) {
        return fallback;
    }

    return rawRoadmap.map((item, index) => {
        const step =
            item && typeof item === "object" ? (item as Record<string, unknown>) : {};

        const fallbackStep = fallback[index] ?? fallback[fallback.length - 1];

        return {
            title:
                normalizeText(
                    step.title ?? step.action ?? step.task ?? step.name ?? step.stepTitle
                ) || fallbackStep.title,
            description:
                normalizeText(
                    step.description ?? step.details ?? step.rationale ?? step.summary
                ) || fallbackStep.description,
            priority:
                normalizeText(step.priority ?? step.urgency ?? step.riskLevel) ||
                fallbackStep.priority,
            dueDate:
                normalizeText(
                    step.dueDate ?? step.deadline ?? step.timeframe ?? step.timeline
                ) || fallbackStep.dueDate,
            resources: normalizeArray(
                step.resources ?? step.documents ?? step.evidence ?? step.artifacts,
                fallbackStep.resources
            ),
        };
    });
}

function buildFallbackEssayFeedback(profile: StudentProfile): EssayFeedback {
    const field = profile.fields?.[0] || "your target field";
    const targetDegree = profile.targetDegree || "your target degree";

    return {
        strengths: [
            "Strong leadership and professional experience can anchor the essay.",
            "Community impact and research evidence can support your contribution story.",
            `The target direction in ${field} connects well with a ${targetDegree} plan.`,
        ],
        gaps: [
            "Make the story more specific, measurable, and evidence based.",
            "Avoid generic motivation. Show the exact problem, your role, and your future contribution.",
        ],
        openingDirection: `Open with a concrete problem you have seen in ${field}, then connect it to your lived experience, your leadership evidence, and why the scholarship is the right bridge to your next contribution.`,
        revisionChecklist: [
            "State the problem clearly.",
            "Use one or two measurable examples.",
            "Show your role, not only the team's achievement.",
            "Connect your past experience with your target degree.",
            "Explain why the scholarship and country fit your goals.",
            "Describe your future contribution after graduation.",
        ],
    };
}

function normalizeEssayFeedback(rawEssay: any, profile: StudentProfile): EssayFeedback {
    const fallback = buildFallbackEssayFeedback(profile);

    return {
        strengths: normalizeArray(rawEssay?.strengths, fallback.strengths),
        gaps: normalizeArray(rawEssay?.gaps, fallback.gaps),
        openingDirection:
            normalizeText(rawEssay?.openingDirection ?? rawEssay?.suggestedOpening) ||
            fallback.openingDirection,
        revisionChecklist: normalizeArray(
            rawEssay?.revisionChecklist ?? rawEssay?.checklist,
            fallback.revisionChecklist
        ),
    };
}

function buildDefaultMentorSummary(
    profile: StudentProfile,
    readinessScore: number,
    topMatch?: ScholarshipMatch | null
): string {
    const scholarship = topMatch?.name || "your strongest scholarship option";

    return [
        `Overall readiness: ${readinessScore}%.`,
        `Best current direction: ${scholarship}.`,
        `Main recommendation: validate official eligibility first, then strengthen the essay with measurable leadership, research, community impact, and work evidence.`,
        "Main risk to watch: always verify eligibility, deadlines, and document requirements from the official scholarship website.",
    ].join("\n\n");
}

function normalizeTraceStatus(
    trace: Partial<AgentTrace>,
    index: number,
    result: Omit<NormalizedSentinelResult, "agentTrace">,
    fallbackMode: boolean
): TraceStatus {
    const existing = normalizeText(trace.status).toLowerCase();
    const agentName = normalizeText(trace.agent).toLowerCase();

    const isSecurity = index === 0 || agentName.includes("security");

    if (isSecurity) {
        if (result.security.passed && result.security.issues.length === 0 && result.security.sanitizedProfile) {
            return "success";
        }
        if (existing === "error" || existing === "blocked") return "error";
        if (existing === "warning") return "warning";
        if (!result.security.passed) return "error";
        if (result.security.issues.length > 0) return "warning";
        return "success";
    }

    if (existing === "error") return "error";

    if (agentName.includes("readiness")) {
        if (!result.readinessDimensions.length || result.readinessScore <= 0) {
            return "error";
        }

        if (
            result.readinessScore < 80 ||
            result.readinessDimensions.some((dimension) =>
                normalizeText(dimension.status).toLowerCase().includes("needs")
            )
        ) {
            return "warning";
        }

        return "success";
    }

    if (agentName.includes("scholarship")) {
        const topScore = result.matches[0]?.matchScore ?? 0;

        if (!result.matches.length) return "error";
        if (topScore < 84) return "warning";

        return "success";
    }

    if (agentName.includes("roadmap")) {
        if (!result.roadmap.length) return "error";

        const highPriorityCount = result.roadmap.filter(
            (step) => step.priority.toLowerCase() === "high"
        ).length;

        if (highPriorityCount >= 4) return "warning";

        return "success";
    }

    if (agentName.includes("essay")) {
        if (!result.essayFeedback.openingDirection) return "error";
        if (result.essayFeedback.gaps.length > 0) return "warning";

        return "success";
    }

    if (agentName.includes("mentor") || agentName.includes("orchestrator")) {
        if (fallbackMode) return "warning";
        return "success";
    }

    if (existing === "warning") return "warning";

    return "success";
}

function normalizeAgentTrace(
    rawTrace: Partial<AgentTrace>[],
    result: Omit<NormalizedSentinelResult, "agentTrace">,
    fallbackMode: boolean
): AgentTrace[] {
    const defaultTrace: Partial<AgentTrace>[] = [
        {
            agent: "Security Guard Agent",
            tool: "sanitize_profile",
            inputSummary: "Validated and sanitized student profile input.",
            outputSummary: result.security.passed
                ? "Profile sanitized successfully. No input issues detected."
                : `Profile has ${result.security.issues.length} issue(s) that need review.`,
        },
        {
            agent: "Readiness Analyst Agent",
            tool: "calculateReadiness",
            inputSummary:
                "Reviewed GPA, English readiness, evidence, target degree, and target countries.",
            outputSummary: `Readiness score calculated as ${result.readinessScore}%.`,
        },
        {
            agent: "Scholarship Matcher Agent",
            tool: "rankScholarships",
            inputSummary:
                "Compared profile against scholarship dataset and ranked by score plus tie-breakers.",
            outputSummary: `Generated ${result.matches.length} scholarship match(es).`,
        },
        {
            agent: "Roadmap Planner Agent",
            tool: "buildApplicationRoadmap",
            inputSummary:
                "Converted readiness gaps and scholarship requirements into next actions.",
            outputSummary: `Generated ${result.roadmap.length} roadmap step(s).`,
        },
        {
            agent: "Essay Coach Agent",
            tool: "essayFeedback",
            inputSummary:
                "Reviewed evidence, motivation, contribution, and target fit.",
            outputSummary: `Generated ${result.essayFeedback.revisionChecklist.length} essay action item(s).`,
        },
        {
            agent: "Orchestrator Agent",
            tool: "composeFinalResult",
            inputSummary: "Combined all agent outputs into one Sentinel report.",
            outputSummary: fallbackMode
                ? "Final report assembled in local deterministic mode because Gemini API key is not configured."
                : "Final Sentinel report assembled successfully.",
        },
    ];

    const source = rawTrace.length ? rawTrace : defaultTrace;

    return source.map((trace, index) => {
        const fallbackTrace =
            defaultTrace[index] ?? defaultTrace[defaultTrace.length - 1];

        const normalizedTrace: Partial<AgentTrace> = {
            agent: normalizeText(trace.agent) || normalizeText(fallbackTrace.agent),
            tool: normalizeText(trace.tool) || normalizeText(fallbackTrace.tool),
            inputSummary:
                normalizeText(trace.inputSummary) ||
                normalizeText(fallbackTrace.inputSummary),
            outputSummary:
                normalizeText(trace.outputSummary) ||
                normalizeText(fallbackTrace.outputSummary),
            status: trace.status,
        };

        return {
            agent: normalizedTrace.agent || `Agent ${index + 1}`,
            tool: normalizedTrace.tool || "workflow_step",
            inputSummary: normalizedTrace.inputSummary || "Input processed.",
            outputSummary: normalizedTrace.outputSummary || "Output generated.",
            status: normalizeTraceStatus(normalizedTrace, index, result, fallbackMode),
        };
    });
}

function normalizeApiResponse(
    payload: any,
    profile: StudentProfile
): NormalizedSentinelResult {
    const root = payload?.result ?? payload ?? {};
    const fallbackMode = Boolean(payload?.fallbackMode);

    let securityPassed = true;
    let securityIssues: string[] = [];

    if (root.security && typeof root.security === "object") {
        securityPassed = root.security.passed !== false;
        securityIssues = normalizeArray(root.security.issues);
    } else if (typeof root.securityStatus === "string") {
        const isIssues = root.securityStatus.includes("completed with issues:");
        securityPassed = !isIssues;
        securityIssues = isIssues 
            ? root.securityStatus.replace("Security guard completed with issues:", "").split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];
    }

    const security: SecuritySection = {
        passed: securityPassed,
        issues: securityIssues,
        sanitizedProfile: root.sanitizedProfile ?? profile,
    };

    const readinessScore = normalizeNumber(
        root.readinessScore ?? root.readiness?.overallScore ?? root.readiness?.score,
        0
    );

    const readinessDimensions = getRawDimensions(root).map((dimension, index) => ({
        name: normalizeText(dimension.name) || `Readiness Dimension ${index + 1}`,
        score: Math.max(0, Math.min(100, normalizeNumber(dimension.score, 0))),
        status: normalizeText(dimension.status) || "Moderate",
        rationale:
            normalizeText(dimension.rationale) || "Dimension reviewed by Sentinel.",
    }));

    const matches = normalizeMatches(getRawMatches(root), profile);
    const topMatch = matches[0] ?? null;

    const essayFeedback = normalizeEssayFeedback(
        root.essayFeedback ?? root.essayCoach ?? {},
        profile
    );

    const roadmap = normalizeRoadmap(getRawRoadmap(root), profile, topMatch);

    const mentorSummary =
        normalizeText(root.mentorSummary ?? root.summary) ||
        buildDefaultMentorSummary(profile, readinessScore, topMatch);

    const risks = root.risks || calculateRisks(profile);

    const baseResult: Omit<NormalizedSentinelResult, "agentTrace"> = {
        security,
        readinessScore,
        readinessDimensions,
        matches,
        roadmap,
        essayFeedback,
        mentorSummary,
        risks,
        fallbackMode,
    };

    return {
        ...baseResult,
        agentTrace: normalizeAgentTrace(getRawTrace(root), baseResult, fallbackMode),
    };
}

function priorityBadge(priority: string): string {
    const normalized = priority.toLowerCase();

    if (normalized === "high") {
        return "border border-red-200 bg-red-50 text-red-700";
    }

    if (normalized === "medium") {
        return "border border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
}

function traceBadge(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized === "error") {
        return "border border-red-200 bg-red-50 text-red-700";
    }

    if (normalized === "warning") {
        return "border border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
}

function readinessBadge(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized.includes("strong") || normalized.includes("excellent")) {
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalized.includes("moderate")) {
        return "border border-yellow-350 bg-yellow-50 text-yellow-600";
    }

    if (normalized.includes("developing")) {
        return "border border-amber-300 bg-amber-50 text-amber-700";
    }

    return "border border-red-200 bg-red-50 text-red-700";
}

function essayScoreLabel(score: number): string {
    if (score >= 85) return "Strong";
    if (score >= 70) return "Moderate";

    return "Needs Focus";
}

function SmallPill({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ${className}`}
        >
            {children}
        </span>
    );
}

function ActionLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    return (
        <Link
            to={href}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
            {children}
            <ArrowRight size={15} />
        </Link>
    );
}

function ActionButton({
    onClick,
    children,
}: {
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
            {children}
            <ArrowRight size={15} />
        </button>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${active
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function CollapsibleCard({
    title,
    icon,
    defaultOpen = true,
    children,
}: {
    title: string;
    icon: ReactNode;
    defaultOpen?: boolean;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="text-slate-800">{icon}</div>
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                </div>

                <div className="text-slate-500">
                    {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>

            {open ? <div className="px-6 pb-6">{children}</div> : null}
        </section>
    );
}

function getRoadmapAction(step: RoadmapStep, topMatchId?: string | null): {
    label: string;
    href?: string;
    tab?: ActiveTab;
} {
    const text = `${step.title} ${step.description}`.toLowerCase();
    
    const scholarshipsHref = topMatchId ? `/scholarships?focus=${topMatchId}` : "/scholarships";

    if (
        text.includes("eligibility") ||
        text.includes("requirement") ||
        text.includes("scholarship")
    ) {
        return { label: "Review Scholarships", href: scholarshipsHref };
    }

    if (
        text.includes("program") ||
        text.includes("university") ||
        text.includes("shortlist")
    ) {
        return { label: "Open Scholarships", href: scholarshipsHref };
    }

    if (
        text.includes("evidence") ||
        text.includes("cv") ||
        text.includes("transcript") ||
        text.includes("certificate") ||
        text.includes("recommender")
    ) {
        return { label: "Prepare Documents", href: "/preparation" };
    }

    if (
        text.includes("essay") ||
        text.includes("motivation") ||
        text.includes("story")
    ) {
        return { label: "Open Essay Coach", tab: "essay" };
    }

    if (
        text.includes("review") ||
        text.includes("submit") ||
        text.includes("compliance")
    ) {
        return { label: "Check Trust & Data", href: "/trust" };
    }

    return { label: "Continue Preparation", href: "/preparation" };
}

function getTraceAction(trace: AgentTrace): {
    label: string;
    href?: string;
    tab?: ActiveTab;
    action?: string;
} {
    const agent = trace.agent.toLowerCase();

    if (agent.includes("security")) {
        return { label: "Review Profile", href: "/" };
    }

    if (agent.includes("readiness")) {
        return { label: "Review Profile", href: "/" };
    }

    if (agent.includes("scholarship")) {
        return { label: "Review Scholarships", href: "/scholarships" };
    }

    if (agent.includes("roadmap")) {
        return { label: "Open Roadmap", href: "/preparation?tab=roadmap" };
    }

    if (agent.includes("essay")) {
        return { label: "Open Essay Coach", href: "/preparation?tab=essay" };
    }

    if (agent.includes("orchestrator")) {
        return { label: "Rerun Sentinel", action: "rerun" };
    }

    return { label: "Rerun Sentinel", action: "rerun" };
}

function generateCoachReply(
    message: string,
    profile: StudentProfile,
    result: NormalizedSentinelResult | null
): string {
    const lower = message.toLowerCase();
    const topMatch = result?.matches?.[0];
    const scholarship = topMatch?.name || "your target scholarship";
    const field = profile.fields?.[0] || "your target field";

    if (lower.includes("opening") || lower.includes("intro")) {
        return `A strong opening should start with one concrete problem in ${field}, not with a generic dream statement. Try this structure: problem observed, your role, measurable impact, then why ${scholarship} is the right bridge for your next contribution.`;
    }

    if (lower.includes("evidence") || lower.includes("validate") || lower.includes("connect")) {
        return `Let's validate your profile evidence for your essay:
1. Leadership: ${profile.hasLeadership ? "Available (strong motivators anchor)" : "Needs detail/evidence"}
2. Research: ${profile.hasResearch ? "Available (excellent for academic/MEXT/DAAD)" : "Needs detail/evidence"}
3. Community Impact: ${profile.hasCommunityImpact ? "Available (crucial for Chevening/Erasmus)" : "Needs detail/evidence"}
4. Work Experience: ${profile.hasWorkExperience ? "Available" : "Needs detail/evidence"}

Tip: Make sure each claim has a corresponding quantifiable result (e.g., number of students mentored, budget managed, publication status).`;
    }

    if (lower.includes("contribution") || lower.includes("narrative") || lower.includes("give back")) {
        return `To improve your contribution narrative for ${profile.origin || "your home country"}:
- Avoid generalities like 'I want to help my country develop'.
- Specify a target sector (e.g., public sector AI policy, agricultural data strategy).
- Define a 5-year post-graduation roadmap including target organizations or local initiatives you will join.`;
    }

    if (lower.includes("checklist") || lower.includes("missing") || lower.includes("complete") || lower.includes("recommender")) {
        return `To complete your missing application checklist items:
- Recommenders: Contact 2 referees immediately, providing them with a 1-page summary of your achievements and target program details.
- Eligibility & Programs: Click the 'Review Scholarships' button next to the eligibility action item in the checklist to view details.
- Documents: Start gathering transcripts, certified translations, and your English test score report.`;
    }

    if (lower.includes("roadmap") || lower.includes("next")) {
        return `Your next best action is to validate official eligibility for ${scholarship}, then shortlist 3 target programs. After that, build your evidence pack before writing the final essay. Do not write the essay first without evidence mapping.`;
    }

    if (lower.includes("essay") || lower.includes("story")) {
        return "Your essay should show a clear story arc: the problem you care about, what you have done, what evidence proves it, why the target degree matters, and how you will contribute after graduation.";
    }

    if (lower.includes("risk") || lower.includes("weak") || lower.includes("gap")) {
        return "The main risk is not lack of achievement. The main risk is making the story too broad. Use specific examples, numbers, named initiatives, and your direct role.";
    }

    if (
        lower.includes("ielts") ||
        lower.includes("toefl") ||
        lower.includes("english")
    ) {
        return `Your English evidence is currently ${profile.englishStatus} ${profile.englishScore}. Keep the official score report ready and verify the minimum requirement from each scholarship and university page.`;
    }

    return `I would focus on three things: first, confirm official eligibility for ${scholarship}; second, map your evidence to leadership, impact, research, and professional experience; third, turn that evidence into a specific and measurable scholarship story.`;
}

function isProfileComplete(p: StudentProfile | null): boolean {
    if (!p) return false;
    const name = String(p.name ?? "").trim();
    const origin = String(p.origin ?? "").trim();
    const targetDegree = String(p.targetDegree ?? "").trim();
    const targetCountries = p.targetCountries ?? [];
    const fields = p.fields ?? [];
    const gpa = Number(p.gpa);
    const englishStatus = String(p.englishStatus ?? "").trim();
    const englishScore = String(p.englishScore ?? "").trim();
    const preferredIntakeYear = String(p.preferredIntakeYear ?? "").trim();

    return (
        name.length > 0 &&
        origin.length > 0 &&
        targetDegree.length > 0 &&
        targetCountries.length > 0 &&
        targetCountries.some(c => String(c ?? "").trim().length > 0) &&
        fields.length > 0 &&
        fields.some(f => String(f ?? "").trim().length > 0) &&
        !isNaN(gpa) &&
        gpa > 0 &&
        englishStatus.length > 0 &&
        englishScore.length > 0 &&
        preferredIntakeYear.length > 0
    );
}

export default function SentinelPage() {
    const {
        profile: contextProfile,
        mode: contextMode,
        setDemoMode,
        setIsProfileFormOpen,
        sentinelResult,
        updateSentinelResult,
    } = useProfile();

    const location = useLocation();
    const isComplete = useMemo(() => isProfileComplete(contextProfile), [contextProfile]);

    const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
    const result = getActiveAnalysis(contextProfile, sentinelResult);
    const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

    const getRiskStatusLabel = (val: number) => {
        if (val <= 30) return "Low";
        if (val <= 60) return "Medium";
        if (val <= 80) return "High";
        return "Critical";
    };
    const [loading, setLoading] = useState(false);
    const [analysisStep, setAnalysisStep] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [usingDefaultProfile, setUsingDefaultProfile] = useState(false);
    const [coachInput, setCoachInput] = useState("");
    const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
    const coachEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (contextProfile) {
            setProfile(contextProfile);
            setUsingDefaultProfile(contextMode === "demo");
        } else {
            setProfile(DEFAULT_PROFILE);
            setUsingDefaultProfile(false);
        }
    }, [contextProfile, contextMode]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        let tab = params.get("tab");
        if (tab === "risk-radar") tab = "overview";
        if (tab && ["overview", "gaps", "roadmap", "mentor", "report", "trace"].includes(tab)) {
            setActiveTab(tab as ActiveTab);
        }
    }, [location.search]);

    useEffect(() => {
        if (result) {
            setCoachMessages([
                {
                    role: "assistant",
                    content:
                        "Hi, I am your Sentinel AI Coach. Ask me about your essay, roadmap, scholarship fit, evidence gaps, or next best action.",
                },
            ]);
        }
    }, [result]);

    useEffect(() => {
        coachEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [coachMessages]);

    const summaryProfile = useMemo(() => {
        return result?.security?.sanitizedProfile ?? profile;
    }, [profile, result]);

    const topMatch = useMemo(() => {
        return result?.matches?.[0] ?? null;
    }, [result]);

    const getStepStatus = (step: string): { label: "Ready" | "Needs detail" | "Needs evidence"; style: string } => {
        if (step === "Problem") {
            return profile.fields && profile.fields.length > 0
                ? { label: "Ready", style: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                : { label: "Needs detail", style: "bg-amber-50 text-amber-700 border-amber-200" };
        }
        if (step === "Evidence") {
            const count = [profile.hasLeadership, profile.hasResearch, profile.hasCommunityImpact, profile.hasWorkExperience].filter(Boolean).length;
            if (count >= 3) return { label: "Ready", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
            if (count > 0) return { label: "Needs detail", style: "bg-amber-50 text-amber-700 border-amber-200" };
            return { label: "Needs evidence", style: "bg-red-50 text-red-700 border-red-200" };
        }
        if (step === "Scholarship Fit") {
            const score = topMatch?.matchScore ?? 0;
            if (score >= 84) return { label: "Ready", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
            if (score >= 70) return { label: "Needs detail", style: "bg-amber-50 text-amber-700 border-amber-200" };
            return { label: "Needs evidence", style: "bg-red-50 text-red-700 border-red-200" };
        }
        return profile.hasCommunityImpact || profile.hasFinancialNeed
            ? { label: "Ready", style: "bg-emerald-50 text-emerald-700 border-emerald-200" }
            : { label: "Needs detail", style: "bg-amber-50 text-amber-700 border-amber-200" };
    };

    const alreadyAvailable = useMemo(() => {
        const list: { label: string; available: boolean }[] = [];
        if (profile.englishStatus !== "Not Taken" && profile.englishScore) {
            list.push({ label: `English score available (${profile.englishStatus}: ${profile.englishScore})`, available: true });
        }
        if (profile.hasLeadership) {
            list.push({ label: "Leadership evidence available", available: true });
        }
        if (profile.hasResearch) {
            list.push({ label: "Research evidence available", available: true });
        }
        if (profile.hasCommunityImpact) {
            list.push({ label: "Community impact evidence available", available: true });
        }
        if (profile.hasWorkExperience) {
            list.push({ label: "Work experience available", available: true });
        }
        if (profile.targetDegree && profile.targetCountries && profile.targetCountries.length > 0) {
            list.push({ label: `Target country and degree defined (${profile.targetDegree} targeting ${profile.targetCountries.join(", ")})`, available: true });
        }
        return list;
    }, [profile]);

    const essayVisualScores = useMemo(() => {
        const evidenceScore =
            (profile.hasLeadership ? 20 : 0) +
            (profile.hasResearch ? 20 : 0) +
            (profile.hasCommunityImpact ? 20 : 0) +
            (profile.hasWorkExperience ? 20 : 0) +
            (profile.englishScore ? 20 : 0);

        const clarityScore = result?.essayFeedback.openingDirection ? 82 : 68;
        const fitScore = topMatch?.matchScore ?? 75;

        return [
            {
                label: "Evidence Strength",
                score: Math.min(100, evidenceScore),
                icon: <BadgeCheck size={18} />,
            },
            {
                label: "Story Clarity",
                score: clarityScore,
                icon: <FileText size={18} />,
            },
            {
                label: "Scholarship Fit",
                score: fitScore,
                icon: <Target size={18} />,
            },
        ];
    }, [profile, result, topMatch]);

    async function runAnalysis() {
        if (!isComplete || !contextProfile) {
            setIsProfileFormOpen(true);
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setAnalysisStep("Security Guard checking profile safety and sanitizing input...");

        try {
            const steps = [
                "Security Guard checked profile safety and sanitized input.",
                "Readiness Analyst scanning GPA, IELTS, target countries, and recommender status...",
                "Scholarship Matcher matching profile to scholarship database and ranking options...",
                "Roadmap Planner scheduling Weekly Rescue Roadmap application milestones...",
                "Essay Coach evaluating story strength, evidence gaps, and suggested openings...",
                "Orchestrator assembling final Sentinel AI Risk Radar report..."
            ];

            for (let i = 0; i < steps.length; i++) {
                setAnalysisStep(steps[i]);
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            const response = await fetch("/api/sentinel/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ profile: contextProfile }),
            });

            if (!response.ok) {
                throw new Error(
                    `Sentinel analysis request failed with status ${response.status}.`
                );
            }

            const payload = await response.json();
            updateSentinelResult(payload);
            setActiveTab("overview");
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Sentinel analysis request failed."
            );
        } finally {
            setLoading(false);
            setAnalysisStep("");
        }
    }

    function sendCoachMessage(event?: FormEvent) {
        event?.preventDefault();

        const cleaned = coachInput.trim();
        if (!cleaned) return;

        const reply = generateCoachReply(cleaned, profile, result);

        setCoachMessages((previous) => [
            ...previous,
            { role: "user", content: cleaned },
            { role: "assistant", content: reply },
        ]);

        setCoachInput("");
    }

    function startCoachPrompt(prompt: string) {
        setActiveTab("essay");
        setCoachInput(prompt);
    }

    function handleCoachKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendCoachMessage();
        }
    }

    return (
        <div className="space-y-8">
            <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
                        <div>
                            <div className="mb-6 flex items-start gap-4">
                                <div className="rounded-3xl bg-blue-50 p-4 text-blue-600">
                                    <Sparkles size={34} />
                                </div>

                                <div>
                                    <h2 className="text-5xl font-bold tracking-tight text-slate-950">
                                        ScholarPath Sentinel
                                    </h2>
                                    <p className="mt-2 text-2xl text-slate-600 font-semibold">
                                        AI Risk Radar for Scholarship Readiness
                                    </p>
                                </div>
                            </div>

                            <p className="max-w-4xl text-xl leading-relaxed text-slate-700">
                                Sentinel brings the existing Scholarship, Readiness, Preparation, and Trust modules into one auditable multi-agent risk detection workflow.
                            </p>
                            <p className="mt-2 max-w-4xl text-sm text-slate-500">
                                Auditable agentic workflow execution: security guard, readiness analyst, scholarship matcher, roadmap planner, essay coach, and orchestrator.
                            </p>

                            {isComplete && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <SmallPill>{summaryProfile.name || "Student"}</SmallPill>
                                    <SmallPill>{summaryProfile.origin || "Origin not set"}</SmallPill>
                                    <SmallPill>
                                        {summaryProfile.targetDegree || "Degree not set"}
                                    </SmallPill>
                                    <SmallPill>
                                        {summaryProfile.englishStatus}{" "}
                                        {summaryProfile.englishScore || ""}
                                    </SmallPill>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center min-w-[280px]">
                            {loading ? (
                                <div className="w-full bg-blue-50/50 border border-blue-150 rounded-[28px] p-6 text-center space-y-4 shadow-sm animate-pulse">
                                    <div className="flex items-center justify-center gap-3">
                                        <CircleDashed className="h-6 w-6 text-google-blue animate-spin" />
                                        <span className="text-lg font-bold text-google-blue">Running Sentinel Risk Audit...</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 min-h-[32px] flex items-center justify-center">{analysisStep}</p>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-google-blue rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={runAnalysis}
                                    disabled={!isComplete}
                                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[28px] bg-blue-600 px-6 py-8 text-center text-2xl font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <Sparkles size={28} />
                                    <span>
                                        {!isComplete
                                            ? "Complete Profile First"
                                            : "Run Sentinel Analysis"}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {!isComplete ? (
                    <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm flex flex-col items-center text-center max-w-3xl mx-auto">
                        <div className="rounded-full bg-blue-50 p-6 text-blue-600 mb-6">
                            <Sparkles size={48} className="animate-pulse" />
                        </div>
                        
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Complete your profile to run Sentinel
                        </h2>
                        
                        <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
                            Sentinel needs your target degree, countries, field of study, GPA, English score, and evidence profile before it can generate scholarship ranking, roadmap, essay guidance, and agent trace.
                        </p>
                        
                        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5 max-w-2xl text-sm text-slate-500 leading-relaxed text-left flex items-start gap-3">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <span className="font-semibold text-slate-700">How Sentinel works:</span>{" "}
                                Sentinel is the orchestration layer that connects your Scholarship, Readiness, Preparation, Essay Coach, and Trust modules into one auditable multi-agent workflow.
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                            <button
                                type="button"
                                onClick={() => setIsProfileFormOpen(true)}
                                className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-600/15"
                            >
                                Complete My Profile
                                <ArrowRight size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={setDemoMode}
                                className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-350"
                            >
                                Try Demo Profile
                            </button>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/"
                                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                            >
                                Back to Overview
                            </Link>
                        </div>
                    </div>
                ) : usingDefaultProfile ? (
                    <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 px-6 py-5 text-blue-800">
                        <div className="flex items-start gap-3">
                            <ClipboardList className="mt-0.5" size={20} />
                            <div>
                                <p className="text-xl font-semibold">Demo profile mode</p>
                                <p className="mt-1 text-base">
                                    Sentinel did not find a saved profile, so it is using a demo
                                    profile. Save your profile first if you want personalized
                                    results.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {isComplete && errorMessage ? (
                    <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5" size={20} />
                            <div>
                                <p className="text-xl font-semibold">Sentinel analysis failed</p>
                                <p className="mt-1 text-base">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {isComplete && (result ? (
                    <>
                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <ShieldCheck
                                        className={
                                            result.security.passed ? "text-emerald-600" : "text-red-600"
                                        }
                                    />
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Security Status
                                    </h3>
                                </div>
                                <p className="text-slate-600">
                                    {result.security.passed
                                        ? "Security guard passed. Input was checked and sanitized."
                                        : "Security guard found input issues that need review."}
                                </p>

                                {!result.security.passed && result.security.issues.length ? (
                                    <div className="mt-4 space-y-2">
                                        {result.security.issues.map((issue, index) => (
                                            <p key={`${issue}-${index}`} className="text-sm text-red-700">
                                                • {issue}
                                            </p>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <LineChart className="text-blue-600" />
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Readiness Score
                                    </h3>
                                </div>
                                <div className={cn(
                                    "inline-flex rounded-3xl border px-6 py-4 text-5xl font-bold mb-4",
                                    result.readinessColor === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                    result.readinessColor === "yellow" ? "border-amber-200 bg-amber-50 text-amber-700" :
                                    result.readinessColor === "amber" ? "border-amber-100 bg-amber-50/45 text-amber-800" :
                                    "border-rose-200 bg-rose-50 text-rose-700"
                                )}>
                                    {result.readinessScore}%
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-3 mt-2">
                                    <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                                        {result.overallReadinessReasoning}
                                    </p>
                                    <div className="border-t border-slate-200/60 pt-2.5 space-y-1.5 text-[11px] font-bold leading-normal">
                                        <p className="text-blue-600">{result.improvementExplanation}</p>
                                        <p className="text-emerald-600 font-extrabold">{result.potentialImprovementCopy}</p>
                                        <p className="text-slate-400 font-semibold italic text-[10px] leading-snug">{result.howToReachGreenCopy}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <GraduationCap className="text-blue-600" />
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Top Match
                                    </h3>
                                </div>

                                {topMatch ? (
                                    <>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {topMatch.name}
                                        </p>
                                        <p className="mt-2 text-slate-600">
                                            {topMatch.provider} • {topMatch.country}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <SmallPill>{topMatch.fitCategory}</SmallPill>
                                            <span className="text-3xl font-bold text-blue-600">
                                                {topMatch.matchScore}%
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-600">
                                        No scholarship match available yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <TabButton
                                active={activeTab === "overview"}
                                onClick={() => setActiveTab("overview")}
                                icon={<LineChart size={16} />}
                                label="Risk Radar Overview"
                            />
                            <TabButton
                                active={activeTab === "gaps"}
                                onClick={() => setActiveTab("gaps")}
                                icon={<FileText size={16} />}
                                label="Evidence Gaps"
                            />
                            <TabButton
                                active={activeTab === "roadmap"}
                                onClick={() => setActiveTab("roadmap")}
                                icon={<MapPinned size={16} />}
                                label="Rescue Roadmap"
                            />
                            <TabButton
                                active={activeTab === "mentor"}
                                onClick={() => setActiveTab("mentor")}
                                icon={<Bot size={16} />}
                                label="AI Mentor"
                            />
                            <TabButton
                                active={activeTab === "report"}
                                onClick={() => setActiveTab("report")}
                                icon={<ClipboardList size={16} />}
                                label="Advisor Report"
                            />
                            <TabButton
                                active={activeTab === "trace"}
                                onClick={() => setActiveTab("trace")}
                                icon={<Sparkles size={16} />}
                                label="Agent Trace"
                            />
                        </div>

                        <div className="mt-6 space-y-6">
                            {activeTab === "overview" ? (
                                <>
                                    {/* Risk Radar Component */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Radar className="text-google-red" size={24} />
                                            <h3 className="text-xl font-bold text-slate-900">AI Risk Radar Audit</h3>
                                        </div>
                                        <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-center justify-center">
                                            <div className="mx-auto w-full max-w-[260px] bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center">
                                                <RiskRadarChart mode="detailed" risks={result.risks} className="w-full h-auto" />
                                            </div>

                                            <div className="space-y-4">
                                                {[
                                                    { name: "Evidence Risk", value: result.risks.evidenceRisk, desc: "Verification documents, leadership proofs, and academic credentials.", icon: FileText },
                                                    { name: "Deadline Risk", value: result.risks.deadlineRisk, desc: "Intake timeline pressure and submission window constraints.", icon: Clock },
                                                    { name: "Recommender Risk", value: result.risks.recommenderRisk, desc: "Reference letters and referee commitment tracking.", icon: Users },
                                                    { name: "Story Risk", value: result.risks.storyRisk, desc: "Statement of Purpose clarity, narrative flow, and uniqueness.", icon: PenTool },
                                                    { name: "Fit Risk", value: result.risks.fitRisk, desc: "Alignment between profile credentials and scholarship preferences.", icon: Target },
                                                    { name: "English Risk", value: result.risks.englishRisk, desc: "Language proficiency test status and score readiness.", icon: Globe },
                                                ].map(item => {
                                                    const val = item.value;
                                                    const isLow = val <= 30;
                                                    const isMedium = val <= 60;
                                                    const isHigh = val <= 80;
                                                    
                                                    const fillBg = isLow ? "bg-emerald-500" : isMedium ? "bg-amber-500" : isHigh ? "bg-rose-500" : "bg-red-700";
                                                    const statusText = isLow ? "Low" : isMedium ? "Medium" : isHigh ? "High" : "Critical";
                                                    const statusBg = isLow ? "bg-emerald-50 border-emerald-100 text-emerald-700" : isMedium ? "bg-amber-50 border-amber-100 text-amber-700" : isHigh ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-red-50 border-red-150 text-red-800";
                                                    
                                                    const IconComponent = item.icon;

                                                    return (
                                                        <div key={item.name} className="flex items-start gap-4 p-4 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl shadow-sm transition-all text-left">
                                                            <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-550 shrink-0">
                                                                <IconComponent className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 space-y-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                                                                    <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md shrink-0", statusBg)}>
                                                                        {statusText}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-450 font-medium leading-relaxed">
                                                                    {item.desc}
                                                                </p>
                                                                <div className="flex items-center gap-3 pt-1">
                                                                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div className={cn("h-full rounded-full transition-all duration-1000", fillBg)} style={{ width: `${val}%` }} />
                                                                    </div>
                                                                    <span className="text-xs font-black text-slate-700 w-10 text-right shrink-0">{val}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Explanation Cards below */}
                                        <div className="mt-8 border-t border-slate-100 pt-6 text-left">
                                            <h4 className="text-base font-bold text-slate-900 mb-4">Detailed Risk Explanations</h4>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {[
                                                    {
                                                        name: "Evidence Risk",
                                                        score: result.risks.evidenceRisk,
                                                        status: getRiskStatusLabel(result.risks.evidenceRisk),
                                                        trigger: "Verified GPA, leadership, community, and research achievements are logged.",
                                                        why: "Strong evidence makes you highly competitive.",
                                                        fix: "Gather and scan all official transcripts and certificates.",
                                                        cta: "Review evidence pack",
                                                        path: "/preparation?tab=documents"
                                                    },
                                                    {
                                                        name: "Deadline Risk",
                                                        score: result.risks.deadlineRisk,
                                                        status: getRiskStatusLabel(result.risks.deadlineRisk),
                                                        trigger: "Preferred intake year is 2026, leaving limited weeks for full profile building.",
                                                        why: "Late submissions are rejected. Time pressure increases risk of errors.",
                                                        fix: "Prioritize high-weight tasks first on the Rescue Roadmap.",
                                                        cta: "Build submission timeline",
                                                        path: "/preparation?tab=roadmap&focus=deadline"
                                                    },
                                                    {
                                                        name: "Recommender Risk",
                                                        score: result.risks.recommenderRisk,
                                                        status: getRiskStatusLabel(result.risks.recommenderRisk),
                                                        trigger: result.risks.recommenderRisk <= 30 ? "Recommendation letters are secured or submitted." : "Recommendation letters are requested but not fully secured.",
                                                        why: result.risks.recommenderRisk <= 30 ? "Lower recommender risk improves overall application safety." : "Recommendation letters take 2–4 weeks and can delay submission readiness.",
                                                        fix: result.risks.recommenderRisk <= 30 ? "Monitor final submissions in the portal." : "Confirm recommenders and send them the scholarship context, CV, and deadline.",
                                                        cta: result.risks.recommenderRisk <= 30 ? "View submitted recommender status" : "Create recommender request",
                                                        path: result.risks.recommenderRisk <= 30 ? "/preparation?tab=documents" : "/preparation?tab=roadmap&focus=recommender"
                                                    },
                                                    {
                                                        name: "Story Risk",
                                                        score: result.risks.storyRisk,
                                                        status: getRiskStatusLabel(result.risks.storyRisk),
                                                        trigger: "Clear academic goals and field focus are defined.",
                                                        why: "A compelling narrative connects your achievements to the scholarship objectives.",
                                                        fix: "Structure your personal statement outline using Essay Coach advice.",
                                                        cta: "Open Essay Coach",
                                                        path: "/preparation?tab=essay-coach"
                                                    },
                                                    {
                                                        name: "Fit Risk",
                                                        score: result.risks.fitRisk,
                                                        status: getRiskStatusLabel(result.risks.fitRisk),
                                                        trigger: "Course and scholarship alignment is mostly matched but needs validation.",
                                                        why: "Mismatch between goals and scholarship criteria causes immediate rejection.",
                                                        fix: "Confirm alignment of target courses with scholarship priority fields.",
                                                        cta: "View Scholarships",
                                                        path: "/scholarships"
                                                    },
                                                    {
                                                        name: "English Risk",
                                                        score: result.risks.englishRisk,
                                                        status: getRiskStatusLabel(result.risks.englishRisk),
                                                        trigger: "Official English test score is logged.",
                                                        why: "Verified language capability satisfies basic compliance.",
                                                        fix: "Keep official IELTS/TOEFL report scanned.",
                                                        cta: "View profile",
                                                        path: "/"
                                                    }
                                                ].map(card => {
                                                    const isLow = card.status === "Low";
                                                    const isMed = card.status === "Medium";
                                                    const isHigh = card.status === "High";
                                                    const badgeBg = isLow ? "bg-emerald-50 text-emerald-700 border-emerald-100" : isMed ? "bg-amber-50 text-amber-700 border-amber-250" : isHigh ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-red-50 text-red-805 border-red-200";
                                                    return (
                                                        <div key={card.name} className="flex flex-col justify-between p-5 border border-slate-200 bg-slate-50/50 rounded-2xl transition hover:shadow-md hover:border-slate-300">
                                                            <div>
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h5 className="font-bold text-slate-900 text-sm">{card.name}</h5>
                                                                    <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full border", badgeBg)}>
                                                                        {card.status} ({card.score}%)
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-2 text-xs text-slate-650 leading-relaxed mb-4">
                                                                    <p><strong>Trigger:</strong> {card.trigger}</p>
                                                                    <p><strong>Why it matters:</strong> {card.why}</p>
                                                                    <p><strong>What to fix:</strong> {card.fix}</p>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                to={card.path}
                                                                className="w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 block transition cursor-pointer"
                                                            >
                                                                {card.cta}
                                                            </Link>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <CollapsibleCard
                                        title="Readiness Dimensions"
                                        icon={<BadgeCheck size={24} />}
                                        defaultOpen
                                    >
                                        <div className="grid gap-4 lg:grid-cols-2">
                                            {result.readinessDimensions.map((dimension, index) => (
                                                <div
                                                    key={`${dimension.name}-${index}`}
                                                    className="rounded-3xl border border-slate-200 p-5 bg-white"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-slate-900">
                                                                {dimension.name}
                                                            </h3>
                                                            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
                                                                {dimension.status}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-4 py-2 text-sm font-semibold ${readinessBadge(
                                                                dimension.status
                                                            )}`}
                                                        >
                                                            {dimension.score}%
                                                        </span>
                                                    </div>

                                                    <p className="mt-4 text-slate-600">
                                                        {dimension.rationale}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleCard>
                                </>
                            ) : null}

                            {activeTab === "gaps" ? (
                                <div className="space-y-6">
                                    {/* Evidence Gaps strengths vs gaps */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-slate-900">Evidence Gap Analyzer</h3>
                                            <span className="px-3 py-1 bg-blue-50 text-google-blue text-xs font-bold rounded-full">
                                                Audited Profile: {profile.name}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-google-green text-sm uppercase tracking-wider flex items-center gap-2">
                                                    <CheckCircle2 size={16} /> Verified Assets
                                                </h4>
                                                {[
                                                    profile.gpa >= 3.3 ? `Competitive GPA (${profile.gpa.toFixed(2)})` : null,
                                                    profile.englishStatus !== "Not Taken" ? `Language verified (${profile.englishStatus}: ${profile.englishScore})` : null,
                                                    profile.hasLeadership ? "Documented Leadership experience" : null,
                                                    profile.hasResearch ? "Research/academic publication history" : null,
                                                    profile.hasCommunityImpact ? "Community impact projects logged" : null,
                                                    profile.hasWorkExperience ? "Professional work experience verified" : null,
                                                ].filter(Boolean).map((asset, idx) => (
                                                    <div key={idx} className="flex gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100">
                                                        <CheckCircle2 className="h-5 w-5 text-google-green shrink-0 mt-0.5" />
                                                        <span className="text-sm font-medium text-slate-800">{asset}</span>
                                                    </div>
                                                ))}
                                                {[
                                                    profile.gpa < 3.3 ? null : profile.gpa,
                                                    profile.englishStatus === "Not Taken" ? null : profile.englishStatus,
                                                    profile.hasLeadership ? null : "Leadership",
                                                    profile.hasResearch ? null : "Research",
                                                    profile.hasCommunityImpact ? null : "Community Impact",
                                                    profile.hasWorkExperience ? null : "Work",
                                                ].filter(x => x === null).length === 6 && (
                                                    <p className="text-sm text-slate-500 italic">No verified profile assets found yet. Update your profile form.</p>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-bold text-google-red text-sm uppercase tracking-wider flex items-center gap-2">
                                                    <AlertTriangle size={16} /> Evidence Gaps Detected
                                                </h4>
                                                {[
                                                    profile.gpa < 3.0 ? "Academic standing below typical thresholds" : null,
                                                    profile.englishStatus === "Not Taken" ? "Official English test score report missing" : null,
                                                    !profile.hasLeadership ? "Missing documented leadership achievements" : null,
                                                    !profile.hasResearch ? "Missing research papers, projects, or publications" : null,
                                                    !profile.hasCommunityImpact ? "Missing volunteer or community impact evidence" : null,
                                                    !profile.hasWorkExperience ? "Lean professional history for high-tier awards" : null,
                                                    profile.recommenderStatus === "Not Started" ? "Academic/professional recommenders not secured" : null,
                                                ].filter(Boolean).map((gap, idx) => (
                                                    <div key={idx} className="flex gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                                                        <AlertTriangle className="h-5 w-5 text-google-red shrink-0 mt-0.5" />
                                                        <span className="text-sm font-medium text-slate-800">{gap}</span>
                                                    </div>
                                                ))}
                                                {result.essayFeedback.gaps.map((gap, idx) => (
                                                    <div key={`essay-${idx}`} className="flex gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                                                        <AlertTriangle className="h-5 w-5 text-google-red shrink-0 mt-0.5" />
                                                        <span className="text-sm font-medium text-slate-800">{gap}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Essay Coach Visual Feedback inside Gaps tab */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <FileText className="text-google-blue" size={24} />
                                            <h3 className="text-xl font-bold text-slate-900">Authentic Essay Coach feedback</h3>
                                        </div>

                                        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 mb-6">
                                            <div className="mb-2 flex items-center gap-2 text-blue-700">
                                                <Sparkles size={18} />
                                                <h4 className="font-bold">Suggested Opening Direction</h4>
                                            </div>
                                            <p className="text-slate-700 leading-relaxed text-sm">
                                                {result.essayFeedback.openingDirection}
                                            </p>
                                        </div>

                                        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Suggested Essay Story Arc</h4>
                                        <div className="grid gap-6 md:grid-cols-4 relative pt-4 mb-6">
                                            <div className="absolute top-[2.5rem] left-[12%] right-[12%] hidden md:block h-0.5 bg-slate-100 -z-10" />
                                            {[
                                                { label: "Problem", text: `Define the core issue in ${profile.fields?.[0] || "your field"}.`, prompt: `How do I write a compelling essay opening about the problem of ${profile.fields?.[0] || "my target field"} in my home country?` },
                                                { label: "Evidence", text: "Connect your leadership, work, or academic achievements.", prompt: "How can I better connect my leadership, research, and work evidence in my essay?" },
                                                { label: "Scholarship Fit", text: `Explain why ${topMatch?.name || "the target scholarship"} is the best path.`, prompt: `Why is ${topMatch?.name || "the target scholarship"} the right academic and professional fit for my goals?` },
                                                { label: "Contribution", text: `Show how you will give back to ${profile.origin || "your community"}.`, prompt: `How do I structure my contribution narrative to show sustainable impact in ${profile.origin || "my home country"} after graduation?` }
                                            ].map((item, index) => {
                                                const status = getStepStatus(item.label);
                                                return (
                                                    <div key={item.label} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 pt-6 shadow-sm hover:border-blue-300 transition-all relative">
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md z-10 border-2 border-white">
                                                            {index + 1}
                                                        </div>
                                                        <div className="mt-2 text-center md:text-left">
                                                            <div className="flex items-center justify-between gap-1 flex-wrap mb-2">
                                                                <h5 className="text-sm font-bold text-slate-900">{item.label}</h5>
                                                                <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold", status.style)}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-650 leading-relaxed mb-4">{item.text}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => startCoachPrompt(item.prompt)}
                                                            className="w-full text-center rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                                                        >
                                                            Ask Coach
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Revision Checklist</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {result.essayFeedback.revisionChecklist.map((item, i) => (
                                                <div key={i} className="flex gap-3 p-3 bg-slate-50/50 rounded-xl items-center border border-slate-150">
                                                    <div className="h-5 w-5 rounded-full bg-blue-50 text-google-blue flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                                                    <span className="text-xs font-medium text-slate-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {activeTab === "roadmap" ? (
                                <CollapsibleCard
                                    title="Weekly Rescue Roadmap"
                                    icon={<MapPinned size={24} />}
                                    defaultOpen
                                >
                                    <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-amber-900 text-xs">
                                        <div className="flex items-start gap-2.5">
                                            <Info className="shrink-0 text-amber-700 mt-0.5" size={16} />
                                            <div>
                                                <span className="font-bold">About the Rescue Roadmap: </span>
                                                <span>
                                                    Sentinel schedules weekly task groups designed to address your highest risks first. Complete these sequentially to optimize readiness before deadlines.
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                                        {[
                                            { week: "Week 1: Foundations & Eligibility", steps: result.roadmap.slice(0, 2) },
                                            { week: "Week 2: Recommenders & Evidence Prep", steps: result.roadmap.slice(2, 4) },
                                            { week: "Week 3: Motivation Narrative", steps: result.roadmap.slice(4, 5) },
                                            { week: "Week 4+: Review & Compliance", steps: result.roadmap.slice(5) }
                                        ].map((weekGroup, weekIdx) => (
                                            <div key={weekIdx} className="space-y-4 relative">
                                                <div className="flex items-center gap-3 pl-12">
                                                    <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-700">
                                                        {weekGroup.week}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {weekGroup.steps.map((step, index) => {
                                                        const overallIndex = result.roadmap.indexOf(step);
                                                        const action = getRoadmapAction(step, topMatch?.id);
                                                        return (
                                                            <div
                                                                key={`${step.title}-${index}`}
                                                                className="ml-12 rounded-3xl border border-slate-200 bg-white p-5 hover:border-slate-350 transition-colors shadow-sm"
                                                            >
                                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                                    <div className="flex gap-4">
                                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-700">
                                                                            {overallIndex + 1}
                                                                        </div>

                                                                        <div>
                                                                            <h3 className="text-xl font-bold text-slate-900">
                                                                                {step.title}
                                                                            </h3>
                                                                            <p className="mt-2 text-sm text-slate-600">
                                                                                {step.description}
                                                                            </p>

                                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                                {step.resources.map((resource, resourceIndex) => (
                                                                                    <SmallPill
                                                                                        key={`${resource}-${resourceIndex}`}
                                                                                    >
                                                                                        {resource}
                                                                                    </SmallPill>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                                                                        <div className="flex flex-wrap items-center gap-3">
                                                                            <span
                                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge(
                                                                                    step.priority
                                                                                )}`}
                                                                            >
                                                                                {step.priority}
                                                                            </span>
                                                                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                                                                {step.dueDate}
                                                                            </span>
                                                                        </div>

                                                                        {action.href ? (
                                                                            <ActionLink href={action.href}>
                                                                                {action.label}
                                                                            </ActionLink>
                                                                        ) : (
                                                                            <ActionButton
                                                                                onClick={() => {
                                                                                    if (action.tab) {
                                                                                        setActiveTab(action.tab);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {action.label}
                                                                            </ActionButton>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleCard>
                            ) : null}

                            {activeTab === "mentor" ? (
                                <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                                    {/* Coach Chat Window */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-150">
                                            <MessageCircle className="text-blue-600" size={24} />
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">AI Rescue Mentor</h3>
                                                <p className="text-xs text-slate-500">Solve evidence gaps and draft your scholarship essay opening.</p>
                                            </div>
                                        </div>

                                        <div className="h-[400px] space-y-4 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-150 mb-4">
                                            {coachMessages.map((message, index) => (
                                                <div
                                                    key={`${message.role}-${index}`}
                                                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "assistant"
                                                            ? "bg-white text-slate-700 border border-slate-150 shadow-sm"
                                                            : "ml-12 bg-blue-600 text-white"
                                                        }`}
                                                >
                                                    {message.content}
                                                </div>
                                            ))}
                                            <div ref={coachEndRef} />
                                        </div>

                                        <form onSubmit={sendCoachMessage} className="flex gap-2">
                                            <textarea
                                                value={coachInput}
                                                onChange={(event) => setCoachInput(event.target.value)}
                                                onKeyDown={handleCoachKeyDown}
                                                rows={2}
                                                placeholder="Ask: How do I improve my recommendation letters?"
                                                className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                                            />
                                            <button
                                                type="submit"
                                                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-6 text-white transition hover:bg-blue-700 shrink-0"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </form>
                                    </div>

                                    {/* Sidebar Suggestions */}
                                    <div className="space-y-4">
                                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b pb-2">Quick Coaching Prompts</h4>
                                            {[
                                                { title: "Ask for essay opening", prompt: "Help me draft a strong scholarship essay opening showing a concrete problem in my field." },
                                                { title: "Validate profile evidence", prompt: "Which specific evidence in my profile is most valuable for proving fit?" },
                                                { title: "Improve narrative", prompt: "How do I improve my contribution narrative to show sustainable impact?" },
                                                { title: "Resolve recommender gaps", prompt: "How can I complete the missing checklist items in my application preparation?" }
                                            ].map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => startCoachPrompt(item.prompt)}
                                                    className="w-full cursor-pointer rounded-2xl border border-slate-150 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50 text-xs"
                                                >
                                                    <span className="font-bold text-slate-900 block mb-1">{item.title}</span>
                                                    <span className="text-slate-500 leading-normal line-clamp-2">{item.prompt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {activeTab === "report" ? (
                                <div className="space-y-6">
                                    {/* Advisor Report component (print-friendly) */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm print:shadow-none print:border-none space-y-8" id="advisor-report-print">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-150">
                                            <div>
                                                <span className="text-[10px] font-black text-google-blue uppercase tracking-widest">ScholarPath Sentinel</span>
                                                <h3 className="text-3xl font-extrabold text-slate-900 leading-tight">Scholarship Readiness Advisor Report</h3>
                                                <p className="text-xs text-slate-500">Multi-agent analysis of readiness status, profile assets, and priority risks.</p>
                                            </div>
                                            <div className="flex gap-2 print:hidden shrink-0">
                                                <button
                                                    onClick={() => {
                                                        const summary = `Student Profile: ${profile.name} (GPA ${profile.gpa.toFixed(2)}, English score ${profile.englishStatus}: ${profile.englishScore || "Not set"}). Overall Readiness score is ${result.readinessScore}%. Primary scholarship target is ${topMatch?.name || "Target Scholarship"}. Identified risks: Deadline ${result.risks.deadlineRisk}%, Evidence ${result.risks.evidenceRisk}%, Recommender ${result.risks.recommenderRisk}%. Rescue Roadmap completed.`;
                                                        navigator.clipboard.writeText(summary);
                                                        alert("Advisor summary copied to clipboard!");
                                                    }}
                                                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                                >
                                                    Copy Summary
                                                </button>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-google-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm cursor-pointer"
                                                >
                                                    Print Report
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {/* Report Details Column 1: Profile & Gauge */}
                                            <div className="space-y-6">
                                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 space-y-4">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile Summary</h4>
                                                    <div className="space-y-2.5 text-sm">
                                                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                                                            <span className="text-slate-500">Name</span>
                                                            <span className="font-bold text-slate-800">{profile.name}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                                                            <span className="text-slate-500">Origin</span>
                                                            <span className="font-bold text-slate-800">{profile.origin}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                                                            <span className="text-slate-500">GPA</span>
                                                            <span className="font-bold text-slate-800">{profile.gpa.toFixed(2)} / 4.0</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                                                            <span className="text-slate-500">English Status</span>
                                                            <span className="font-bold text-slate-800">{profile.englishStatus} ({profile.englishScore || "N/A"})</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                                                            <span className="text-slate-500">Target Degree</span>
                                                            <span className="font-bold text-slate-800">{profile.targetDegree}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">Intake Year</span>
                                                            <span className="font-bold text-slate-800">{profile.preferredIntakeYear}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 text-center flex flex-col items-center">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Readiness DNA Score</h4>
                                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="64" cy="64" r="54" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                                                            <circle
                                                                cx="64"
                                                                cy="64"
                                                                r="54"
                                                                stroke={result.readinessScore >= 80 ? "#34A853" : result.readinessScore >= 70 ? "#FBBC04" : result.readinessScore >= 50 ? "#D97706" : "#EA4335"}
                                                                strokeWidth="8"
                                                                fill="none"
                                                                strokeDasharray="339.29"
                                                                strokeDashoffset={339.29 * (1 - result.readinessScore / 100)}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-3xl font-black text-slate-900">{result.readinessScore}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Report Details Column 2: Risk Radar SVG */}
                                            <div className="md:col-span-2 space-y-6">
                                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Radar Plot</h4>
                                                    <div className="w-full max-w-[200px] flex items-center justify-center">
                                                        <RiskRadarChart mode="detailed" risks={result.risks} className="w-full h-auto" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150">
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Scholarship</h5>
                                                        <p className="text-sm font-bold text-slate-900 leading-tight">{topMatch?.name || "Chevening Scholarship"}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1">{topMatch?.provider}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150">
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Match Status</h5>
                                                        <p className="text-sm font-black text-google-blue">{topMatch?.matchScore}% Match</p>
                                                        <p className="text-[10px] text-google-green font-bold mt-1">{topMatch?.fitCategory}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-150">
                                            <div className="space-y-3">
                                                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                                    <CheckCircle2 size={16} className="text-google-green" /> Competitive Strengths
                                                </h4>
                                                <ul className="space-y-2 text-xs">
                                                    {profile.gpa >= 3.5 && <li className="flex items-center gap-2 text-slate-650">• Strong academic foundation (GPA {profile.gpa.toFixed(2)})</li>}
                                                    {profile.englishStatus !== "Not Taken" && <li className="flex items-center gap-2 text-slate-650">• Confirmed English status ({profile.englishStatus}: {profile.englishScore})</li>}
                                                    {profile.hasLeadership && <li className="flex items-center gap-2 text-slate-650">• Active leadership experience</li>}
                                                    {profile.hasCommunityImpact && <li className="flex items-center gap-2 text-slate-650">• Verified community impact engagement</li>}
                                                    {profile.hasResearch && <li className="flex items-center gap-2 text-slate-650">• Scientific research experience available</li>}
                                                    <li className="flex items-center gap-2 text-slate-650">• Specific study field goals mapped: {profile.fields.join(", ")}</li>
                                                </ul>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                                    <AlertTriangle size={16} className="text-google-red" /> Core Gaps & Risks
                                                </h4>
                                                <ul className="space-y-2 text-xs">
                                                    {result.needsAttentionNew.map((gap, i) => (
                                                        <li key={i} className="flex items-start gap-1.5 text-slate-650">
                                                            <span className="font-semibold text-google-red">• {gap.name}:</span>
                                                            <span>{gap.reason} (Risk: {gap.riskValue}%)</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-150">
                                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Recommended Next Rescue Actions</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {result.roadmap.slice(0, 4).map((step, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 border rounded-2xl flex items-start gap-3 border-slate-150">
                                                        <div className="h-6 w-6 rounded-full bg-blue-50 text-google-blue flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                                                        <div>
                                                            <h5 className="font-bold text-slate-900 text-xs leading-normal">{step.title}</h5>
                                                            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{step.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Advisor Notes Section */}
                                        <div className="pt-4 border-t border-slate-150">
                                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Advisor Notes & Narrative</h4>
                                            <p className="text-slate-600 text-xs leading-relaxed italic bg-slate-50/50 p-4 rounded-xl border border-slate-150/60">
                                                {`Sentinel Multi-Agent scan evaluated readiness risks for ${profile.name}. Academic and English language statuses are structured, but recommender outreach must remain top priority (Recommender Risk ${result.risks.recommenderRisk}%). Recommend starting immediate recommender outreach and evidence organization using the Rescue Roadmap.`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {activeTab === "trace" ? (
                                <>
                                    <div className="mb-5 grid gap-3 md:grid-cols-3">
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                            <strong>Success:</strong> The agent completed its task cleanly.
                                        </div>
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                            <strong>Warning:</strong> The result is usable but needs attention (e.g. data quality warning or local fallback mode).
                                        </div>
                                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                            <strong>Error:</strong> A required output is missing or a blocking issue was found.
                                        </div>
                                    </div>

                                    {result.fallbackMode ? (
                                        <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
                                            <div className="flex items-start gap-3">
                                                <Info className="mt-0.5 shrink-0 text-slate-500" />
                                                <div>
                                                    <p className="font-bold">Model mode</p>
                                                    <p className="mt-1 text-sm">
                                                        Local fallback mode is active because GEMINI_API_KEY is not configured. Sentinel executed deterministic local analysis steps for validation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="space-y-4">
                                        {result.agentTrace.map((trace, index) => {
                                            const action = getTraceAction(trace);

                                            return (
                                                <div
                                                    key={`${trace.agent}-${index}`}
                                                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                                >
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-xl font-bold text-slate-900">
                                                                {index + 1}. {trace.agent}
                                                            </h3>

                                                            <p className="mt-2 text-xs text-slate-655 font-mono">
                                                                <span className="font-semibold text-slate-500">Tool:</span>{" "}
                                                                {trace.tool}
                                                            </p>

                                                            <p className="mt-3 text-sm text-slate-600">
                                                                <span className="font-semibold text-slate-750">Input:</span>{" "}
                                                                {trace.inputSummary}
                                                            </p>

                                                            <p className="mt-2 text-sm text-slate-600">
                                                                <span className="font-semibold text-slate-755">Output:</span>{" "}
                                                                {trace.outputSummary}
                                                            </p>
                                                        </div>

                                                        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${traceBadge(
                                                                    trace.status
                                                                )}`}
                                                            >
                                                                {trace.status.toUpperCase()}
                                                            </span>

                                                            {(trace.status === "warning" || trace.status === "error") && (
                                                                action.action === "rerun" ? (
                                                                    <ActionButton onClick={runAnalysis}>
                                                                        {action.label}
                                                                    </ActionButton>
                                                                ) : action.href ? (
                                                                    <ActionLink href={action.href}>
                                                                        {action.label}
                                                                    </ActionLink>
                                                                ) : (
                                                                    <ActionButton
                                                                        onClick={() => {
                                                                            if (action.tab) {
                                                                                setActiveTab(action.tab);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {action.label}
                                                                    </ActionButton>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Run Sentinel Analysis
                        </h2>
                        <p className="mt-2 text-slate-650">
                            Click the blue button above to generate readiness, scholarship,
                            roadmap, essay coach, mentor summary, and trace results.
                        </p>
                    </div>
                ))}
        </div>
    );
}