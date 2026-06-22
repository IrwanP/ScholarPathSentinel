import { useState } from "react";
import {
    Activity,
    FileText,
    GraduationCap,
    Map,
    ShieldCheck,
    Sparkles
} from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

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
}

export default function SentinelPage() {
    const { mode, profile, setIsProfileFormOpen } = useProfile();
    const [result, setResult] = useState<SentinelResult | null>(null);
    const [loading, setLoading] = useState(false);

    const runSentinel = async () => {
        if (!profile || mode === "empty") {
            setIsProfileFormOpen(true);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/sentinel/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ profile })
            });

            if (!response.ok) {
                throw new Error("Sentinel analysis request failed.");
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to run ScholarPath Sentinel analysis.");
        } finally {
            setLoading(false);
        }
    };

    if (!profile || mode === "empty") {
        return (
            <main className="p-8">
                <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold">ScholarPath Sentinel</h1>
                            <p className="text-gray-600">
                                Multi-Agent Scholarship Readiness Studio
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 max-w-3xl text-gray-600">
                        Create or load a learner profile first. Sentinel will then run a
                        secure multi-agent workflow for readiness, scholarship matching,
                        roadmap planning, essay feedback, and traceability.
                    </p>

                    <button
                        onClick={() => setIsProfileFormOpen(true)}
                        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                    >
                        Create My Profile
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="space-y-8 p-8">
            <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold">ScholarPath Sentinel</h1>
                                <p className="text-gray-600">
                                    Multi-Agent Scholarship Readiness Studio
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 max-w-3xl text-gray-600">
                            Sentinel upgrades ScholarPath AI into an auditable agentic
                            workflow: security guard, readiness analyst, scholarship matcher,
                            roadmap planner, essay coach, and orchestrator.
                        </p>
                    </div>

                    <button
                        onClick={runSentinel}
                        disabled={loading}
                        className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Running agents..." : "Run Sentinel Analysis"}
                    </button>
                </div>
            </section>

            {result && (
                <>
                    <section className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <ShieldCheck className="text-green-600" />
                            <h2 className="mt-3 font-bold">Security Status</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {result.securityStatus}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <Activity className="text-blue-600" />
                            <h2 className="mt-3 font-bold">Readiness Score</h2>
                            <p className="mt-2 text-4xl font-bold">
                                {result.readinessScore}%
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <GraduationCap className="text-blue-600" />
                            <h2 className="mt-3 font-bold">Top Match</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {result.matches[0]?.name || "No match generated"}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">Readiness Dimensions</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {result.readinessDimensions.map((item) => (
                                <div key={item.name} className="rounded-xl border p-4">
                                    <div className="flex justify-between gap-4">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="font-bold">{item.score}%</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.status}</p>
                                    {item.rationale && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            {item.rationale}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">Scholarship Matches</h2>
                        <div className="mt-4 space-y-3">
                            {result.matches.map((match) => (
                                <div key={match.id} className="rounded-xl border p-4">
                                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                                        <div>
                                            <h3 className="font-bold">{match.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {match.provider} • {match.country}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-600">
                                                {match.reason}
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-2xl font-bold">{match.matchScore}%</p>
                                            <p className="text-xs text-gray-500">
                                                {match.fitCategory}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-xl font-bold">
                            <Map size={20} />
                            Roadmap
                        </h2>
                        <div className="mt-4 space-y-3">
                            {result.roadmap.map((step, index) => (
                                <div key={index} className="rounded-xl border p-4">
                                    <p className="font-bold">{step.milestone}</p>
                                    <p className="mt-1 text-sm text-gray-600">{step.task}</p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Target: {step.targetDate} • Priority: {step.priority}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-xl font-bold">
                            <FileText size={20} />
                            Essay Coach
                        </h2>

                        <h3 className="mt-4 font-bold">Suggested Opening Direction</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            {result.essayFeedback.suggestedOpeningDirection}
                        </p>

                        <h3 className="mt-4 font-bold">Revision Checklist</h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                            {result.essayFeedback.revisionChecklist.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">Mentor Summary</h2>
                        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                            {result.mentorSummary}
                        </pre>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">Agent Trace</h2>
                        <div className="mt-4 space-y-3">
                            {result.agentTrace.map((trace, index) => (
                                <div key={index} className="rounded-xl border p-4">
                                    <p className="font-bold">{trace.agent}</p>
                                    <p className="text-sm text-gray-600">Tool: {trace.tool}</p>
                                    <p className="mt-1 text-sm text-gray-600">
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