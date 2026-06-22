import { useState } from "react";
import {
    Activity,
    AlertTriangle,
    ClipboardCheck,
    FileText,
    GraduationCap,
    Loader2,
    Map,
    ShieldCheck,
    Sparkles
} from "lucide-react";

import { useProfile } from "../../context/ProfileContext";
import { cn } from "../../lib/utils";

interface SentinelResult {
    securityStatus: string;
    readinessScore: number;
    readinessDimensions: Array<{
        name: string;
        score: number;
        status: string;
        rationale?: string;
    }>;
    matches: Array<{
        id: string;
        name: string;
        provider: string;
        country: string;
        region: string;
        matchScore: number;
        fitCategory: string;
        reason: string;
        requiredDocuments: string[];
        coverage: string;
    }>;
    roadmap: Array<{
        milestone: string;
        task: string;
        targetDate: string;
        priority: string;
        evidenceNeeded: string[];
    }>;
    essayFeedback: {
        strengths: string[];
        gaps: string[];
        suggestedOpeningDirection: string;
        revisionChecklist: string[];
    };
    agentTrace: Array<{
        agent: string;
        tool: string;
        inputSummary: string;
        outputSummary: string;
        status: string;
    }>;
    mentorSummary?: string;
    mentorSummarySource?: string;
    geminiWarning?: string;
}

function getScoreTone(score: number) {
    if (score >= 80) {
        return "text-google-green-text bg-google-green-light border-google-green/20";
    }

    if (score >= 55) {
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
    }

    return "text-google-red bg-red-50 border-red-100";
}

function getPriorityTone(priority: string) {
    if (priority === "High") {
        return "bg-red-50 text-google-red border-red-100";
    }

    if (priority === "Medium") {
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    return "bg-gray-50 text-text-secondary border-border-subtle";
}

function getTraceTone(status: string) {
    if (status === "success") {
        return "bg-google-green-light text-google-green-text border-google-green/20";
    }

    if (status === "warning") {
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    return "bg-red-50 text-google-red border-red-100";
}

export default function SentinelPage() {
    const { mode, profile, setIsProfileFormOpen } = useProfile();

    const [result, setResult] = useState<SentinelResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const hasProfile = Boolean(profile && mode !== "empty");

    const runSentinel = async () => {
        if (!profile || mode === "empty") {
            setIsProfileFormOpen(true);
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const analysisProfile = {
                ...profile,
                profilePhotoUrl: undefined
            };

            const response = await fetch("/api/sentinel/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profile: analysisProfile
                })
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    payload?.details ||
                    payload?.error ||
                    `Sentinel analysis request failed with status ${response.status}.`
                );
            }

            setResult(payload);
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to run ScholarPath Sentinel analysis."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="space-y-8 p-8">
            <section className="rounded-3xl border border-border-subtle bg-white p-8 shadow-sm">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                    <div className="flex gap-5">
                        <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-google-blue-light text-google-blue">
                            <Sparkles size={26} />
                        </div>

                        <div>
                            <h1 className="text-4xl font-bold text-text-main">
                                ScholarPath Sentinel
                            </h1>
                            <p className="mt-1 text-lg text-text-secondary">
                                Multi-Agent Scholarship Readiness Studio
                            </p>

                            <p className="mt-6 max-w-4xl text-base leading-7 text-text-secondary">
                                Sentinel upgrades ScholarPath AI into an auditable agentic
                                workflow: security guard, readiness analyst, scholarship
                                matcher, roadmap planner, essay coach, and orchestrator.
                            </p>

                            {profile && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-text-secondary">
                                        {profile.name || "Student"}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-text-secondary">
                                        {profile.origin || "Origin not set"}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-text-secondary">
                                        {profile.targetDegree || "Target degree not set"}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-text-secondary">
                                        {profile.englishStatus}
                                        {profile.englishScore ? ` ${profile.englishScore}` : ""}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={runSentinel}
                        disabled={loading}
                        className="inline-flex min-w-64 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-google-blue px-8 py-5 text-lg font-bold text-white shadow-lg shadow-google-blue/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Running Agents
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Run Sentinel Analysis
                            </>
                        )}
                    </button>
                </div>
            </section>

            {!hasProfile && (
                <section className="rounded-3xl border border-dashed border-border-subtle bg-white p-8 text-center">
                    <GraduationCap className="mx-auto h-10 w-10 text-google-blue" />
                    <h2 className="mt-4 text-2xl font-bold text-text-main">
                        Create your profile first
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-text-secondary">
                        Sentinel needs your learner profile before it can calculate
                        readiness, match scholarships, and generate a roadmap.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsProfileFormOpen(true)}
                        className="mt-6 cursor-pointer rounded-xl bg-google-blue px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                    >
                        Open Profile Form
                    </button>
                </section>
            )}

            {errorMessage && (
                <section className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-google-red">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-bold">Sentinel analysis failed</p>
                        <p className="mt-1 text-sm">{errorMessage}</p>
                    </div>
                </section>
            )}

            {result?.geminiWarning && (
                <section className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-bold">Gemini fallback mode</p>
                        <p className="mt-1 text-sm">{result.geminiWarning}</p>
                    </div>
                </section>
            )}

            {result && (
                <>
                    <section className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-google-green-text" />
                                <h2 className="font-bold text-text-main">Security Status</h2>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-text-secondary">
                                {result.securityStatus}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Activity className="h-6 w-6 text-google-blue" />
                                <h2 className="font-bold text-text-main">Readiness Score</h2>
                            </div>

                            <div
                                className={cn(
                                    "mt-4 inline-flex rounded-2xl border px-5 py-3",
                                    getScoreTone(result.readinessScore)
                                )}
                            >
                                <span className="text-4xl font-bold">
                                    {result.readinessScore}%
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="h-6 w-6 text-google-blue" />
                                <h2 className="font-bold text-text-main">Top Match</h2>
                            </div>
                            <p className="mt-4 text-sm font-bold text-text-main">
                                {result.matches[0]?.name || "No scholarship match generated"}
                            </p>
                            {result.matches[0] && (
                                <p className="mt-1 text-sm text-text-secondary">
                                    {result.matches[0].provider} • {result.matches[0].country}
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-text-main">
                            Readiness Dimensions
                        </h2>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {result.readinessDimensions.map((item) => (
                                <div
                                    key={item.name}
                                    className="rounded-2xl border border-border-subtle p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-text-main">{item.name}</p>
                                            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-text-secondary">
                                                {item.status}
                                            </p>
                                        </div>

                                        <span
                                            className={cn(
                                                "rounded-xl border px-3 py-1 text-sm font-bold",
                                                getScoreTone(item.score)
                                            )}
                                        >
                                            {item.score}%
                                        </span>
                                    </div>

                                    {item.rationale && (
                                        <p className="mt-3 text-sm leading-6 text-text-secondary">
                                            {item.rationale}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-text-main">
                            Scholarship Matches
                        </h2>

                        <div className="mt-5 space-y-4">
                            {result.matches.map((match) => (
                                <div
                                    key={match.id}
                                    className="rounded-2xl border border-border-subtle p-5"
                                >
                                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-main">
                                                {match.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-text-secondary">
                                                {match.provider} • {match.country} • {match.coverage}
                                            </p>
                                            <p className="mt-3 text-sm leading-6 text-text-secondary">
                                                {match.reason}
                                            </p>

                                            {match.requiredDocuments?.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {match.requiredDocuments.slice(0, 5).map((doc) => (
                                                        <span
                                                            key={doc}
                                                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-text-secondary"
                                                        >
                                                            {doc}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="shrink-0 text-left lg:text-right">
                                            <p className="text-3xl font-bold text-google-blue">
                                                {match.matchScore}%
                                            </p>
                                            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-text-secondary">
                                                {match.fitCategory}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-text-main">
                            <Map size={22} />
                            Application Roadmap
                        </h2>

                        <div className="mt-5 space-y-4">
                            {result.roadmap.map((step, index) => (
                                <div
                                    key={`${step.milestone}-${index}`}
                                    className="rounded-2xl border border-border-subtle p-5"
                                >
                                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                        <div>
                                            <p className="font-bold text-text-main">
                                                {index + 1}. {step.milestone}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                                {step.task}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                                            <span
                                                className={cn(
                                                    "rounded-full border px-3 py-1 text-xs font-bold",
                                                    getPriorityTone(step.priority)
                                                )}
                                            >
                                                {step.priority}
                                            </span>
                                            <span className="rounded-full border border-border-subtle bg-gray-50 px-3 py-1 text-xs font-bold text-text-secondary">
                                                {step.targetDate}
                                            </span>
                                        </div>
                                    </div>

                                    {step.evidenceNeeded?.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {step.evidenceNeeded.map((item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-text-secondary"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-text-main">
                            <FileText size={22} />
                            Essay Coach
                        </h2>

                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                            <div className="rounded-2xl border border-border-subtle p-5">
                                <h3 className="font-bold text-text-main">Strengths</h3>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                                    {(result.essayFeedback?.strengths || []).map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-border-subtle p-5">
                                <h3 className="font-bold text-text-main">Gaps</h3>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                                    {(result.essayFeedback?.gaps || []).map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-border-subtle p-5">
                            <h3 className="font-bold text-text-main">
                                Suggested Opening Direction
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-text-secondary">
                                {result.essayFeedback?.suggestedOpeningDirection}
                            </p>
                        </div>

                        <div className="mt-5 rounded-2xl border border-border-subtle p-5">
                            <h3 className="font-bold text-text-main">Revision Checklist</h3>
                            <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-6 text-text-secondary md:grid-cols-2">
                                {(result.essayFeedback?.revisionChecklist || []).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-text-main">
                            <ClipboardCheck size={22} />
                            Mentor Summary
                        </h2>

                        <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-text-secondary">
                                {result.mentorSummary ||
                                    "No mentor summary returned. Deterministic agent outputs are still available above."}
                            </pre>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-text-main">Agent Trace</h2>
                        <p className="mt-1 text-sm text-text-secondary">
                            This shows how each agent contributed to the final Sentinel
                            analysis.
                        </p>

                        <div className="mt-5 space-y-4">
                            {result.agentTrace.map((trace, index) => (
                                <div
                                    key={`${trace.agent}-${index}`}
                                    className="rounded-2xl border border-border-subtle p-5"
                                >
                                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                        <div>
                                            <p className="font-bold text-text-main">
                                                {index + 1}. {trace.agent}
                                            </p>
                                            <p className="mt-1 text-sm text-text-secondary">
                                                Tool: {trace.tool}
                                            </p>
                                        </div>

                                        <span
                                            className={cn(
                                                "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide",
                                                getTraceTone(trace.status)
                                            )}
                                        >
                                            {trace.status}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-text-secondary">
                                        {trace.outputSummary}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}