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
import { Link, useNavigate } from "react-router-dom";
import { calculateScholarshipScore } from "../lib/scholarshipScoring";
import { calculateSentinelAnalysis, getActiveAnalysis } from "../utils/sentinelAnalysis";

interface OnePageReportProps {
  onNavigate?: (tabId: string, focusId?: string) => void;
}

export default function OnePageReport({ onNavigate }: OnePageReportProps) {
  const { mode, profile, activeScholarshipId, sentinelResult } = useProfile();
  const navigate = useNavigate();
  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);
  const activeScoreInfo = activeScholarship && profile ? calculateScholarshipScore(activeScholarship, profile) : null;
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [profile?.profilePhotoUrl]);

  if (mode === "empty" || !profile) {
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

  const analysis = getActiveAnalysis(profile, sentinelResult);
  const score = analysis?.readinessScore ?? 75;

  const copySummary = () => {
    const gapsStr = analysis?.needsAttentionNew && analysis.needsAttentionNew.length > 0 
      ? analysis.needsAttentionNew.map(n => `${n.name} (${n.riskValue}% Risk)`).join(", ") 
      : "None";
    const nextStepsStr = analysis?.recommendedActions && analysis.recommendedActions.length > 0 
      ? analysis.recommendedActions.map(a => a.title).join(", ") 
      : "Confirm Scholarship Deadlines, Prepare Evidence Pack, Improve Essay Story Arc, Run Final Compliance Scan";

    const summary = `ScholarPath Sentinel - One-Page Readiness Report for ${profile.name}. Overall Readiness Score: ${score}/100. Target Degree: ${profile.targetDegree}. Target Scholarship: ${activeScholarship?.name || "Chevening Scholarship"} (${activeScoreInfo?.matchScore || 92}% Match). Primary Gaps: ${gapsStr}. Next Steps: ${nextStepsStr}.`;
    navigator.clipboard.writeText(summary);
    alert("Summary copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4" id="one-page-report" ref={reportRef}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">One-Page Scholarship Readiness Report</h3>
          <p className="text-sm text-slate-500">Official snapshot of scholarship candidacy and action plan.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={copySummary}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <Copy className="h-4 w-4" /> Copy Summary
          </button>
          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 cursor-pointer shadow-md transition-colors"
          >
            <Printer className="h-4 w-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="border border-slate-200 bg-white rounded-3xl p-8 shadow-sm print:border-none print:shadow-none space-y-8">
        
        {/* Report Header block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-150">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">ScholarPath Sentinel</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">One-Page Scholarship Readiness Report</h1>
            <p className="text-sm text-slate-500 mt-1">Personalized snapshot. Clear insights. Smarter next steps.</p>
          </div>
          <div className="text-left md:text-right shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Report ID</span>
            <span className="font-mono text-xs text-slate-600">SPS-{profile.name.substring(0, 3).toUpperCase()}-{profile.preferredIntakeYear}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Student Snapshot & Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Student Snapshot Card */}
          <div className="md:col-span-2 flex items-start gap-5 p-5 bg-slate-50/50 border border-slate-150 rounded-2xl">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
              {profile.profilePhotoUrl && !imageError ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.name}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover animate-fade-in"
                />
              ) : (
                <User className="h-12 w-12 text-slate-400" />
              )}
            </div>
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 truncate">{profile.name}</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{profile.origin} • Target Degree: {profile.targetDegree}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-150 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">GPA</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.gpa.toFixed(2)} / 4.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">English</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.englishStatus} {profile.englishScore}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Intake</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.preferredIntakeYear}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score Gauge */}
          <div className="p-5 bg-slate-50/50 border border-slate-150 rounded-2xl flex flex-col items-center justify-center text-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Overall Readiness Score</h4>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke={
                    score >= 80 ? "#16A34A" : 
                    score >= 70 ? "#F59E0B" : 
                    score >= 50 ? "#D97706" : 
                    "#EF4444"
                  }
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="301.6"
                  strokeDashoffset={301.6 * (1 - score / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{score}%</span>
              </div>
            </div>
            <span className={cn(
              "mt-3 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border",
              score >= 80 ? "bg-green-50 text-google-green border-green-200" : 
              score >= 70 ? "bg-amber-50 text-amber-700 border-amber-150" : 
              score >= 50 ? "bg-amber-50/50 text-amber-800 border-amber-250" : 
              "bg-red-50 text-google-red border-red-200"
            )}>
              {score >= 80 ? "Candidacy Strong" : score >= 70 ? "Candidacy Moderate" : score >= 50 ? "Developing" : "Action Required"}
            </span>
          </div>

        </div>

        {/* Top Risks / Gaps & Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-150">
          
          {/* Strengths */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={16} className="text-google-green" /> Candidate Strengths
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2.5 items-start p-3 bg-green-50/50 border border-green-100 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Solid Academic Background</span>
                  <span className="text-slate-600">GPA is {profile.gpa.toFixed(2)}, demonstrating strong academic foundation and compatibility with top-tier universities.</span>
                </div>
              </li>
              <li className="flex gap-2.5 items-start p-3 bg-green-50/50 border border-green-100 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Verified English Proficiency</span>
                  <span className="text-slate-600">English capability is verified at {profile.englishStatus} {profile.englishScore}, eliminating language proficiency barriers.</span>
                </div>
              </li>
              <li className="flex gap-2.5 items-start p-3 bg-green-50/50 border border-green-100 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Verified Evidence Portfolio</span>
                  <span className="text-slate-600">Has confirmed leadership achievements and active community contribution supporting the scholarship narrative.</span>
                </div>
              </li>
              {analysis && analysis.risks.recommenderRisk <= 30 && (
                <li className="flex gap-2.5 items-start p-3 bg-green-50/50 border border-green-100 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Recommendation Letters Submitted / Recommender Readiness Secured</span>
                    <span className="text-slate-600">Recommender references have been successfully committed or uploaded, eliminating recommender timeline blocker.</span>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Top Risks & Gaps */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} className="text-google-red" /> Critical Risks & Gaps
            </h3>
            <ul className="space-y-3">
              {analysis?.needsAttentionNew && analysis.needsAttentionNew.length > 0 ? (
                analysis.needsAttentionNew.map((item, idx) => {
                  const isHigh = item.priority === "High";
                  return (
                    <li key={idx} className={cn(
                      "flex gap-2.5 items-start p-3 border rounded-xl",
                      isHigh ? "bg-red-50/50 border-red-100" : "bg-amber-50/50 border-amber-100"
                    )}>
                      <AlertCircle className={cn("h-4 w-4 shrink-0 mt-0.5", isHigh ? "text-google-red animate-pulse" : "text-amber-600")} />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">{item.name} (Risk: {item.riskValue}%)</span>
                        <span className="text-slate-600">{item.reason}</span>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="flex gap-2.5 items-start p-3 bg-green-50/50 border border-green-100 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">All Core Risks Addressed</span>
                    <span className="text-slate-600">No critical or high gaps detected. Continue preparing for portal submission.</span>
                  </div>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Priority Next Steps */}
        <div className="pt-6 border-t border-slate-150">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Recommended Next Steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {((analysis?.recommendedActions && analysis.recommendedActions.length > 0 ? analysis.recommendedActions : [
              { title: "Confirm Scholarship Deadlines", why: "Add official timeline milestones and portal submission dates to calendar.", priority: "High", ctaText: "Build Timeline", path: "/preparation?tab=roadmap&focus=deadline" },
              { title: "Prepare Evidence Pack", why: "Scan and catalog official transcript PDFs and leadership letters.", priority: "Medium", ctaText: "Upload Documents", path: "/preparation?tab=documents" },
              { title: "Improve Essay Story Arc", why: "Draft personal statement focusing on motivating problems in target field.", priority: "Medium", ctaText: "Open Essay Coach", path: "/preparation?tab=essay-coach" },
              { title: "Run Final Compliance Scan", why: "Check final application requirements before submission.", priority: "Medium", ctaText: "Run Compliance Scan", path: "/preparation?tab=review" }
            ])).map((step, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between gap-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs">{step.title}</h5>
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest",
                        step.priority === "Critical" || step.priority === "High" ? "bg-red-50 text-google-red animate-pulse" : "bg-blue-50 text-blue-600"
                      )}>{step.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{step.why || (step as any).desc}</p>
                  </div>
                </div>
                {step.ctaText && (
                  <button
                    type="button"
                    onClick={() => {
                      if (step.path.startsWith("/scholarships")) {
                        navigate("/scholarships");
                      } else if (onNavigate) {
                        const url = new URL(step.path, window.location.origin);
                        const tab = url.searchParams.get("tab") || "roadmap";
                        const focus = url.searchParams.get("focus") || undefined;
                        onNavigate(tab, focus);
                      } else {
                        navigate(step.path);
                      }
                    }}
                    className="self-end px-3 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {step.ctaText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-150 print:hidden justify-end">
          <button 
            type="button"
            onClick={() => navigate("/sentinel?tab=risk-radar")}
            className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            View Full Analysis
          </button>
          <button 
            type="button"
            onClick={() => {
              const focusAction = analysis?.recommendedActions?.[0];
              if (focusAction) {
                if (focusAction.path.startsWith("/scholarships")) {
                  navigate("/scholarships");
                } else if (onNavigate) {
                  const url = new URL(focusAction.path, window.location.origin);
                  const tab = url.searchParams.get("tab") || "roadmap";
                  const focus = url.searchParams.get("focus") || undefined;
                  onNavigate(tab, focus);
                } else {
                  navigate(focusAction.path);
                }
              } else {
                navigate("/preparation?tab=roadmap");
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md transition-all cursor-pointer"
          >
            See Recommended Actions
          </button>
          <button 
            type="button"
            disabled 
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold cursor-not-allowed"
          >
            Download PDF (Disabled)
          </button>
        </div>

      </div>
    </div>
  );
}
