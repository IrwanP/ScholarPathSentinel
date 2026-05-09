import React, { useRef, useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  User, 
  MapPin, 
  GraduationCap, 
  Globe, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Copy,
  Printer,
  ExternalLink,
  Target,
  FileText,
  MessageSquare,
  Users,
  Radar,
  Sparkles
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { realScholarships } from "../data/scholarships";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

interface OnePageReportProps {
  onNavigate?: (tabId: string) => void;
}

export default function OnePageReport({ onNavigate }: OnePageReportProps) {
  const { mode, profile, activeScholarshipId } = useProfile();
  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Mentor summary from localStorage
  const [mentorSummary, setMentorSummary] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("scholarpath_mentor_summary");
    if (saved) setMentorSummary(saved);
  }, []);

  const readinessScore = profile?.readinessScore || 0;
  
  const getStatus = (score: number) => {
    if (score >= 85) return { label: "Ready", color: "text-google-green", bg: "bg-google-green-light" };
    if (score >= 70) return { label: "Almost Ready", color: "text-google-blue", bg: "bg-google-blue-light" };
    if (score >= 50) return { label: "Needs Work", color: "text-google-yellow-text", bg: "bg-google-yellow-light" };
    return { label: "High Risk", color: "text-google-red", bg: "bg-red-50" };
  };

  const status = getStatus(readinessScore);

  // Derived metrics (using simple mapping for demo/custom)
  const metrics = [
    { label: "Profile Completeness", score: mode === "demo" ? 95 : (profile ? 80 : 0), status: "Strong", icon: User, path: "/" },
    { label: "Scholarship Match", score: activeScholarship?.matchScore || 0, status: activeScholarship ? (activeScholarship.matchScore > 80 ? "High" : "Medium") : "None", icon: Target, path: "/scholarships" },
    { label: "Document Readiness", score: mode === "demo" ? 38 : Math.floor(readinessScore * 0.45), status: "Needs Work", icon: FileText, path: "documents" },
    { label: "Essay Readiness", score: mode === "demo" ? 45 : Math.floor(readinessScore * 0.5), status: "Drafting", icon: MessageSquare, path: "essay" },
    { label: "Roadmap Progress", score: mode === "demo" ? 22 : Math.floor(readinessScore * 0.25), status: "In Progress", icon: TrendingUp, path: "roadmap" },
    { label: "Interview Readiness", score: mode === "demo" ? 72 : Math.floor(readinessScore * 0.8), status: "Needs Practice", icon: Users, path: "interview" },
    { label: "Risk Level", score: mode === "demo" ? 40 : 100 - readinessScore, status: "Moderate", icon: Radar, path: "risk" },
  ];

  const strengths = mode === "demo" ? [
    "Strong Academic Profile (GPA 3.8/4.0)",
    "Confirmed IELTS Proficiency (7.5)",
    "Significant Leadership Evidence",
    "Active Community Impact track record"
  ] : [
    profile?.gpa && profile.gpa >= 3.5 ? "Solid Academic Standing" : null,
    profile?.englishStatus !== "Not Taken" ? "Language Proficiency Awareness" : null,
    profile?.hasLeadership ? "Documented Leadership Skills" : null,
    profile?.hasCommunityImpact ? "Active Community Contribution" : null,
    "Clear study goals and target program alignment"
  ].filter(Boolean) as string[];

  const gaps = [
    { 
      title: "Recommendation letters unsecured", 
      why: "Strong references need time and should align with your scholarship story.", 
      severity: "High", 
      path: "roadmap" 
    },
    { 
      title: "Application documents incomplete", 
      why: "Incomplete documents create submission risk and reflect poor preparation.", 
      severity: "High", 
      path: "documents" 
    },
    { 
      title: "Essay differentiation remains weak", 
      why: "Scholarship essays must show personal mission, program fit, and future contribution.", 
      severity: "High", 
      path: "essay" 
    },
    !activeScholarship ? {
      title: "No active scholarship selected",
      why: "Preparation should be based on a specific target scholarship's criteria.",
      severity: "Critical",
      path: "/scholarships"
    } : null
  ].filter(Boolean) as any[];

  const recommendedActions = [
    { id: 1, title: "Shortlist target programs", why: "Lock in your choices based on fit.", priority: "High", path: "/scholarships" },
    { id: 2, title: "Contact recommenders", why: "Give them at least 4 weeks' notice.", priority: "Critical", path: "roadmap" },
    { id: 3, title: "Complete documents", why: "Finish scanning identity and academic papers.", priority: "High", path: "documents" },
    { id: 4, title: "Improve motivation letter", why: "Focus on your unique Indonesian bridge story.", priority: "High", path: "essay" },
    { id: 5, title: "Practice interview answers", why: "Use STAR method for leadership questions.", priority: "Medium", path: "interview" },
  ];

  const handlePrint = () => {
    window.print();
  };

  const copySummary = () => {
    const summary = mode === "demo" ? 
      "Alya Putri is preparing for the Chevening Scholarship. Her strongest areas are academic readiness, IELTS readiness, leadership, and community impact. Her main risks are incomplete documents, unsecured recommenders, and essay differentiation. Recommended actions: contact recommenders, complete documents, and improve motivation letter." :
      `${profile?.name || "The student"} is preparing for the ${activeScholarship?.name || "target scholarship"}. Current readiness is ${readinessScore}%. Key strengths include ${strengths.join(", ")}. Priorities include addressing gaps in recommendations and document completion.`;
    
    navigator.clipboard.writeText(summary);
    alert("Summary copied to clipboard!");
  };

  if (mode === "empty") {
    return (
      <div className="p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <User className="h-10 w-10 text-text-secondary" />
        </div>
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-text-main">Create your profile first</h2>
          <p className="text-sm text-text-secondary mb-8">We need your profile details to generate a personalized readiness report.</p>
          <Link to="/" className="px-8 py-3 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20">Set Up Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:p-0 print:space-y-4" id="one-page-report" ref={reportRef}>
      {/* Header with Print/Copy */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-2xl font-bold text-text-main">One-Page Scholarship Readiness Report</h3>
          <p className="text-sm text-text-secondary">A clear summary of your scholarship readiness, key gaps, and next best actions.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={copySummary}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border-subtle rounded-xl text-sm font-bold text-text-main hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" /> Copy Summary
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-google-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md"
          >
            <Printer className="h-4 w-4" /> Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Score */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-google-blue-light rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-google-blue" />
            </div>
            <h4 className="text-xl font-bold text-text-main">{profile?.name || "Alya Putri"}</h4>
            <div className="mt-4 w-full space-y-2 text-left">
              <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-text-secondary">Country</span>
                <span className="font-bold text-text-main">{profile?.origin || "Indonesia"}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-text-secondary">Target</span>
                <span className="font-bold text-text-main">{profile?.targetDegree || "Master's"}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-text-secondary">GPA</span>
                <span className="font-bold text-text-main">{profile?.gpa || "3.8"} / 4.0</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">English</span>
                <span className="font-bold text-text-main">{profile?.englishStatus || "Ready"}</span>
              </div>
            </div>
          </div>

          {/* Overall Readiness Ring */}
          <div className="bg-white p-8 rounded-2xl border border-border-subtle shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-google-blue/10">
              <div className="h-full bg-google-blue transition-all duration-1000" style={{ width: `${readinessScore}%` }} />
            </div>
            <h5 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6">Overall Readiness Score</h5>
            <div className="relative h-40 w-40 flex items-center justify-center mb-6">
              <svg className="h-full w-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * readinessScore) / 100} className="text-google-blue transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-text-main">{readinessScore}%</span>
              </div>
            </div>
            <span className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider", status.bg, status.color)}>
              {status.label}
            </span>
          </div>

          {/* Active Scholarship Card */}
          <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm">
             <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-google-blue" />
              <h5 className="text-sm font-bold text-text-main uppercase tracking-tight">Active Scholarship</h5>
            </div>
            {activeScholarship ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Targeting</p>
                  <p className="text-lg font-bold text-text-main leading-tight">{activeScholarship.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[9px] font-bold text-text-secondary uppercase">Match</p>
                    <p className="text-sm font-black text-google-blue">{activeScholarship.matchScore}%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[9px] font-bold text-text-secondary uppercase">Fit</p>
                    <p className="text-sm font-black text-google-green">{activeScholarship.fitCategory}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(activeScholarship.officialUrl, "_blank")}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-border-subtle rounded-xl text-xs font-bold text-text-secondary hover:bg-gray-50"
                >
                  <ExternalLink className="h-3 w-3" /> Official Source
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-text-secondary">No active scholarship selected yet.</p>
                <Link to="/scholarships" className="inline-block px-4 py-2 bg-google-blue text-white rounded-lg text-xs font-bold">Choose Scholarship</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Breakdown & Gaps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Score Breakdown */}
          <section>
            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Score Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map(metric => (
                <div key={metric.label} className="p-4 bg-white rounded-2xl border border-border-subtle flex items-center gap-4 hover:border-google-blue/30 transition-all group">
                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-google-blue-light transition-colors">
                    <metric.icon className="h-5 w-5 text-google-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-text-main truncate">{metric.label}</span>
                      <span className="text-xs font-black text-google-blue">{metric.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-google-blue" style={{ width: `${metric.score}%` }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate?.(metric.path)}
                    className="p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <ArrowRight className="h-4 w-4 text-text-secondary" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <section className="space-y-4">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-google-green" /> Strongest Areas
              </h4>
              <div className="space-y-3">
                {strengths.map(s => (
                  <div key={s} className="flex gap-3 p-3 bg-green-50/50 rounded-xl border border-google-green/10">
                    <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-text-main">{s}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Key Gaps */}
            <section className="space-y-4">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-google-red" /> Critical Gaps
              </h4>
              <div className="space-y-4">
                {gaps.map(gap => (
                  <div key={gap.title} className="p-4 bg-red-50/30 rounded-2xl border border-google-red/10 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-bold text-text-main">{gap.title}</h5>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                          gap.severity === "Critical" ? "bg-google-red text-white" : "bg-google-red-light text-google-red"
                        )}>{gap.severity}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-normal">{gap.why}</p>
                    </div>
                    <button 
                      onClick={() => onNavigate?.(gap.path)}
                      className="text-xs font-bold text-google-red hover:underline flex items-center gap-1"
                    >
                      Address this gap <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Next Steps */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Recommended Next 5 Actions</h4>
            <div className="space-y-3">
              {recommendedActions.map((action) => (
                <div key={action.id} className="p-4 bg-white rounded-2xl border border-border-subtle flex items-center gap-4 hover:border-google-blue transition-all">
                  <div className="h-10 w-10 rounded-full bg-google-blue text-white flex items-center justify-center font-black shrink-0">
                    {action.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-bold text-text-main truncate">{action.title}</h5>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                        action.priority === "Critical" ? "bg-google-red text-white" : "bg-google-blue-light text-google-blue"
                      )}>{action.priority}</span>
                    </div>
                    <p className="text-xs text-text-secondary truncate">{action.why}</p>
                  </div>
                  <button 
                    onClick={() => onNavigate?.(action.path)}
                    className="px-4 py-1.5 bg-google-blue/10 text-google-blue text-[10px] font-bold rounded-lg hover:bg-google-blue hover:text-white transition-all shrink-0"
                  >
                    Action
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Mentor Interaction Summary */}
          <section className="bg-google-blue/5 rounded-3xl p-8 border-2 border-dashed border-google-blue/30 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Sparkles className="h-6 w-6 text-google-blue" />
                 <h4 className="text-xl font-bold text-text-main">Mentor Interaction Summary</h4>
              </div>
              {!mentorSummary && (
                <button 
                  onClick={() => onNavigate?.("mentor-chat")}
                  className="px-4 py-2 bg-google-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Ask AI Mentor →
                </button>
              )}
            </div>
            
            {mentorSummary ? (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-border-subtle text-sm leading-relaxed text-text-main whitespace-pre-line">
                  {mentorSummary}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                    onClick={() => onNavigate?.("essay")}
                    className="p-3 bg-white border border-border-subtle rounded-xl text-[11px] font-bold text-text-main hover:border-google-blue transition-all flex items-center justify-between group text-left"
                  >
                    Improve Essay <ArrowRight className="h-4 w-4 text-google-blue opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                  <button 
                    onClick={() => onNavigate?.("roadmap")}
                    className="p-3 bg-white border border-border-subtle rounded-xl text-[11px] font-bold text-text-main hover:border-google-blue transition-all flex items-center justify-between group text-left"
                  >
                    Contact Recommenders <ArrowRight className="h-4 w-4 text-google-blue opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                  <button 
                    onClick={() => onNavigate?.("documents")}
                    className="p-3 bg-white border border-border-subtle rounded-xl text-[11px] font-bold text-text-main hover:border-google-blue transition-all flex items-center justify-between group text-left"
                  >
                    Complete Documents <ArrowRight className="h-4 w-4 text-google-blue opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                  <button 
                    onClick={() => onNavigate?.("interview")}
                    className="p-3 bg-white border border-border-subtle rounded-xl text-[11px] font-bold text-text-main hover:border-google-blue transition-all flex items-center justify-between group text-left"
                  >
                    Practice Interview <ArrowRight className="h-4 w-4 text-google-blue opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-border-subtle text-center py-12">
                <p className="text-sm text-text-secondary">You have not generated a mentor summary yet from the AI Scholarship Mentor chat.</p>
                <button 
                  onClick={() => onNavigate?.("mentor-chat")}
                  className="mt-4 text-google-blue font-bold text-sm hover:underline"
                >
                  Start conversation with AI Mentor →
                </button>
              </div>
            )}
          </section>

          {/* Mentor Summary copy feature */}
          <section className="bg-gray-50 rounded-3xl p-8 border border-border-subtle space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <ClipboardCheck className="h-6 w-6 text-google-blue" />
                 <h4 className="text-xl font-bold text-text-main">Mentor Review Summary</h4>
              </div>
              <button 
                onClick={copySummary}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border-subtle rounded-xl text-xs font-bold text-text-main hover:bg-gray-50"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border-subtle font-mono text-xs leading-relaxed select-all cursor-pointer hover:bg-gray-50 transition-colors">
              {mode === "demo" ? 
                "Alya Putri is preparing for the Chevening Scholarship. Her strongest areas are academic readiness, IELTS readiness, leadership, and community impact. Her main risks are incomplete documents, unsecured recommenders, and essay differentiation. Recommended next actions are to finalize target programs, contact recommenders, complete documents, improve the personal statement, and practice interview answers." :
                `${profile?.name || "The student"} is preparing for the ${activeScholarship?.name || "target scholarship"}. Current readiness is ${readinessScore}%. Key strengths include ${strengths.join(", ")}. Priorities include addressing gaps in recommendations and document completion.`
              }
            </div>
            <p className="text-[10px] text-text-secondary text-center italic">Click text above to select all and copy for your mentor.</p>
          </section>
        </div>
      </div>

      <p className="text-center text-[10px] text-text-secondary py-8 print:block hidden">
        ScholarPath AI Readiness Report - Generated on {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
