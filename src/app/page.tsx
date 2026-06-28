import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Dna, 
  Search, 
  Map as MapIcon, 
  FileText, 
  MessageSquare, 
  CheckCircle2,
  ArrowRight,
  Radar,
  ClipboardList,
  User,
  ShieldAlert,
  Compass,
  Sparkles,
  RefreshCw,
  Edit,
  Globe,
  Award,
  Zap,
  Users,
  Info
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useProfile } from "../context/ProfileContext";
import { getActiveAnalysis } from "../utils/sentinelAnalysis";
import RiskRadarChart from "../components/RiskRadarChart";

export default function OverviewPage() {
  const { mode, profile, sentinelResult, setDemoMode, setIsProfileFormOpen, clearProfile } = useProfile();
  const navigate = useNavigate();

  // Unified analysis data source
  const analysis = getActiveAnalysis(profile, sentinelResult);
  const isRecSubmitted = profile?.recommenderStatus === "Submitted" || profile?.recommenderStatus === "Uploaded" || profile?.recommenderStatus === "Received" || (analysis?.risks?.recommenderRisk ?? 80) <= 30;

  const handleStart = () => {
    if (mode === "empty") {
      setIsProfileFormOpen(true);
    } else {
      navigate("/sentinel");
    }
  };

  const getRiskColor = (val: number) => {
    if (val <= 30) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (val <= 60) return "text-amber-600 bg-amber-50 border-amber-100";
    if (val <= 80) return "text-rose-600 bg-rose-50 border-rose-100";
    return "text-red-700 bg-red-100 border-red-200";
  };

  const getRiskBarColor = (val: number) => {
    if (val <= 30) return "bg-emerald-500";
    if (val <= 60) return "bg-amber-500";
    if (val <= 80) return "bg-rose-500";
    return "bg-red-600";
  };

  return (
    <div className="space-y-8 pb-12 min-w-0 max-w-full overflow-hidden">
      
      {/* Decorative Top Gradient Blobs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-1/4 -z-10 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* Welcome & Profile Intake Header */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm"
      >
        <div className="max-w-2xl min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase flex items-center gap-1.5 shadow-sm">
              <Zap className="h-3 w-3 fill-blue-600" /> Multi-Agent Risk Studio
            </span>
            {mode === "demo" && (
              <span className="text-[10px] font-black tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase shadow-sm">
                Alya's Demo Profile Loaded
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2">
            ScholarPath Sentinel
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Audit your scholarship application profile dynamically. Detect critical evidence gaps, predict recommendation risks, and receive a prioritized rescue roadmap.
          </p>
        </div>

        {mode === "empty" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button 
              onClick={() => setIsProfileFormOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-600/10 hover:bg-blue-700 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4" /> Create My Profile
            </button>
            <button 
              onClick={setDemoMode}
              className="px-6 py-3 bg-slate-50 border border-slate-200 text-[#0f172a] rounded-2xl text-sm font-bold hover:bg-slate-100 hover:border-slate-300 transition-all text-center cursor-pointer"
            >
              Try Demo as Alya
            </button>
          </div>
        )}

        {mode !== "empty" && (
          <div className="flex flex-wrap gap-3 w-full lg:w-auto shrink-0">
            <button 
              onClick={handleStart}
              className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-600/10 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Open Sentinel Radar <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setIsProfileFormOpen(true)}
              className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:border-slate-350 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit className="h-4 w-4" /> Edit Profile
            </button>
            <button 
              onClick={clearProfile}
              className="px-4 py-3 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </button>
          </div>
        )}
      </motion.section>

      {/* Main Executive Dashboard Grid */}
      {analysis && profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Student Profile Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                  {profile.profilePhotoUrl ? (
                    <img src={profile.profilePhotoUrl} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-[#0F172A] truncate">{profile.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold">{profile.origin} • Candidate</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Target Degree</span>
                  <span className="font-bold text-[#0F172A]">{profile.targetDegree}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Academic GPA</span>
                  <span className="font-bold text-[#0F172A]">{profile.gpa.toFixed(2)} / 4.0</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Language Standard</span>
                  <span className="font-bold text-[#0F172A]">{profile.englishStatus} ({profile.englishScore})</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Intake Target</span>
                  <span className="font-bold text-[#0F172A]">{profile.preferredIntakeYear}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500 font-semibold">Active Scholarship: </span>
              <span className="text-xs font-bold text-blue-600">{analysis.topMatch?.name || "Chevening Scholarship"}</span>
            </div>
          </motion.div>

          {/* Card 2: Readiness Score circular gauge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-50">
              <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${analysis.readinessScore}%` }} />
            </div>
            
            <div className="w-full flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Readiness</span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border",
                analysis.readinessColor === "green" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                analysis.readinessColor === "yellow" ? "text-amber-750 bg-amber-50 border-amber-150" :
                analysis.readinessColor === "amber" ? "text-amber-850 bg-amber-50/50 border-amber-250" :
                "text-rose-700 bg-rose-50 border-rose-100"
              )}>
                {analysis.readinessStatus}
              </span>
            </div>

            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" stroke="#F1F5F9" strokeWidth="10" fill="none" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="62" 
                  stroke={
                    analysis.readinessColor === "green" ? "#10B981" : 
                    analysis.readinessColor === "yellow" ? "#F59E0B" : 
                    analysis.readinessColor === "amber" ? "#D97706" : 
                    "#EF4444"
                  } 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="389.55" 
                  strokeDashoffset={389.55 * (1 - analysis.readinessScore / 100)} 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[#0F172A]">{analysis.readinessScore}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">out of 100</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left mt-4 space-y-3 shadow-sm">
              <div className="flex items-start gap-2 text-xs">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 leading-normal font-semibold">
                  <span className="font-extrabold text-slate-800">Status Analysis:</span> {analysis.overallReadinessReasoning}
                </p>
              </div>
              <div className="border-t border-slate-200/60 pt-2.5 space-y-1.5 text-[11px] font-bold leading-normal">
                <p className="text-blue-600">{analysis.improvementExplanation}</p>
                <p className="text-emerald-600 font-extrabold">{analysis.potentialImprovementCopy}</p>
                <p className="text-slate-400 text-[10px] leading-snug">{analysis.howToReachGreenCopy}</p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Interactive Risk Radar Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate("/sentinel?tab=overview")}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-3xl p-6 shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-50/30 group"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Risk Radar Preview</span>
                <span className="text-[9px] text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                  View full Risk Radar →
                </span>
              </div>

              {/* Stack on small, row on flex-row */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                  <RiskRadarChart mode="preview" risks={analysis.risks} className="w-full h-full" />
                </div>
                
                <div className="flex-1 w-full space-y-1.5 text-xs">
                  {[
                    { label: "Evidence", val: analysis.risks.evidenceRisk },
                    { label: "Deadline", val: analysis.risks.deadlineRisk },
                    { label: "Recommender", val: analysis.risks.recommenderRisk },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                      <span className="text-slate-500 font-medium">{item.label} Risk</span>
                      <span className={cn("font-bold text-[10px] px-1.5 py-0.5 rounded", 
                        item.val <= 30 ? "text-emerald-700 bg-emerald-50" : 
                        item.val <= 60 ? "text-amber-700 bg-amber-50" : "text-rose-700 bg-rose-50"
                      )}>{item.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-4 pt-2 border-t border-slate-100">
              Interactive 6-Sided Audit Scan
            </div>
          </motion.div>

        </div>
      ) : null}

      {/* Dynamic Highest Risk & Next Best Action Box */}
      {analysis && (
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-rose-50/30 border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100/50 text-rose-600 rounded-2xl shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Highest Application Risk</span>
                <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md", getRiskColor(analysis.highestRisk.score))}>
                  {analysis.highestRisk.label} ({analysis.highestRisk.score}%) • {analysis.highestRisk.text}
                </span>
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] mt-1.5 leading-snug">
                Next Best Action: {analysis.nextBestActionNew.title}
              </h4>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                {analysis.nextBestActionNew.whyItMatters}
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-[10px] font-bold text-slate-500">
                <span>Related Risk: <span className="text-rose-600">{analysis.nextBestActionNew.relatedRisk}</span></span>
                <span>Potential Impact: <span className="text-emerald-600 font-extrabold">{analysis.nextBestActionNew.potentialImpact}</span></span>
              </div>
            </div>
          </div>
          
          <Link 
            to={analysis.nextBestActionNew.ctaPath}
            className="w-full md:w-auto px-5 py-3 bg-[#0F172A] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all text-center cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
          >
            {analysis.nextBestActionNew.ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.section>
      )}

      {/* Grid: Recommended Actions & Roadmap Summary */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols): Recommended Actions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-lg font-bold text-[#0F172A]">Priority Recommended Actions</h3>
              <span className="text-xs text-slate-400 font-semibold">Ordered by risk severity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.recommendedActions.map((action, index) => (
                <div 
                  key={action.title} 
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                        action.priority === "High" ? "text-rose-600 bg-rose-50 border-rose-100" : "text-blue-600 bg-blue-50 border-blue-100"
                      )}>
                        {action.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-[#0F172A] mb-1.5 group-hover:text-blue-600 transition-colors leading-tight">
                      {action.title}
                    </h4>
                    <p className="text-slate-500 text-xs leading-normal">
                      {action.why}
                    </p>
                  </div>

                  <Link 
                    to={action.path}
                    className="mt-5 w-full py-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-[#0f172a] rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all border border-slate-200 hover:border-blue-600"
                  >
                    {action.ctaText}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (1 Col): Roadmap Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-lg font-bold text-[#0F172A]">Roadmap Checklist</h3>
              <Link to="/preparation?tab=roadmap" className="text-xs text-blue-600 font-bold hover:underline">
                Full Roadmap →
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rescue Roadmap Status</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    {2 + (isRecSubmitted ? 1 : 0)} / 6 Milestones Completed
                  </p>
                </div>
                <span className="text-2xl font-black text-blue-600">
                  {Math.round(((2 + (isRecSubmitted ? 1 : 0)) / 6) * 100)}%
                </span>
              </div>

              {/* Unified custom progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.round(((2 + (isRecSubmitted ? 1 : 0) + ((profile?.deadlineTimelineStatus === "confirmed" || profile?.deadlineMilestonesConfirmed === true) ? 1 : 0)) / 6) * 100)}%` }} 
                />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: "Profile Intake Complete", done: true, active: false },
                  { label: "Verify Basic Academic Standing", done: profile ? profile.gpa >= 3.0 : false, active: false },
                  { label: "Secure Recommender Contact", done: isRecSubmitted, active: !isRecSubmitted },
                  { label: "Confirm Scholarship Deadlines", done: profile?.deadlineTimelineStatus === "confirmed" || profile?.deadlineMilestonesConfirmed === true, active: isRecSubmitted && profile?.deadlineTimelineStatus !== "confirmed" && profile?.deadlineMilestonesConfirmed !== true },
                  { label: "Draft Essays & SOP arc", done: false, active: false },
                  { label: "Final Submission Review", done: false, active: false },
                ].map((item, idx) => (
                  <div key={idx} className={cn("flex items-center justify-between p-2.5 rounded-xl border", 
                    item.done ? "bg-emerald-50/20 border-emerald-100/50 text-slate-600" :
                    item.active ? "bg-blue-50/20 border-blue-200 text-[#0F172A] font-bold" : "bg-slate-50/30 border-slate-100 text-slate-400"
                  )}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("h-4 w-4 rounded-full flex items-center justify-center shrink-0 border", 
                        item.done ? "bg-emerald-500 border-emerald-500 text-white" :
                        item.active ? "border-blue-500 text-blue-500" : "border-slate-300 text-transparent"
                      )}>
                        {item.done && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span className="text-xs truncate">{item.label}</span>
                    </div>
                    {item.active && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                        Critical
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Bottom Product Pillar Strip */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Compass, title: "AI-Powered Guidance", desc: "Expert reasoning" },
            { icon: FileText, title: "Evidence-Based Insights", desc: "Measurable stats" },
            { icon: MapIcon, title: "Structured Roadmap", desc: "Clear deadlines" },
            { icon: Users, title: "Human-in-the-Loop", desc: "Advisor approved" }
          ].map((pillar) => (
            <div key={pillar.title} className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold text-[#0F172A] leading-tight mb-1">{pillar.title}</h4>
              <p className="text-[10px] text-slate-400 font-semibold">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

    </div>
  );
}
