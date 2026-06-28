import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  User,
  GraduationCap,
  Globe2,
  FileBadge2,
  BookOpen,
  Mail,
  Calendar,
  Dna
} from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { cn } from "../../lib/utils";
import { getActiveAnalysis } from "../../utils/sentinelAnalysis";

export default function ReadinessPage() {
  const { mode, profile, setIsProfileFormOpen, sentinelResult } = useProfile();

  if (mode === "empty") {
    return (
      <div className="space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-extrabold text-text-main mb-2">Scholarship Readiness DNA</h1>
          <p className="text-text-secondary">
            Understand your strengths, gaps, and next best action before applying.
          </p>
        </header>
        <div className="bg-white rounded-3xl p-12 border border-border-subtle shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-google-blue-light rounded-full flex items-center justify-center mx-auto">
            <Dna className="h-10 w-10 text-google-blue" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-text-main mb-2">Analyze your Readiness DNA</h2>
            <p className="text-sm text-text-secondary mb-8">We use rule-based logic to evaluate your academic, leadership, and community impact readiness.</p>
            <button 
              onClick={() => setIsProfileFormOpen(true)}
              className="px-8 py-3 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors"
            >
              Start My DNA Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const analysis = getActiveAnalysis(profile, sentinelResult);
  const readinessDimensions = analysis?.readinessDimensions ?? [];
  const readiness = analysis?.readinessScore ?? 0;
  
  const overallWhy = analysis?.overallReadinessWhy ?? "";
  const overallReasoning = analysis?.overallReadinessReasoning ?? "";
  
  const nextAction = analysis?.nextBestActionNew ?? {
    title: "Secure recommender readiness",
    whyItMatters: "Recommendation letters are not fully secured yet and this is the largest blocker to submission readiness.",
    relatedRisk: "Recommender Risk: High, 80%",
    potentialImpact: "+8 to +12 readiness points",
    reasoning: "This is the highest-leverage action because recommendation letters often take time to prepare and can block final submission readiness.",
    ctaText: "Create recommender request",
    ctaPath: "/preparation?tab=roadmap"
  };

  const strengths = analysis?.evidenceGaps?.strengths ?? ["Academic readiness", "English readiness", "Leadership evidence", "Community impact"];
  const needsAttentionList = analysis?.needsAttentionNew ?? [];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main mb-2">Scholarship Readiness DNA</h1>
          <p className="text-text-secondary">
            Understand your strengths, gaps, and next best action before applying.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Link 
            to="/preparation#one-page-report"
            className="px-6 py-2.5 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            View One-Page Report
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[#0F172A]">Overall Readiness</h2>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-blue-600">{readiness}%</span>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wide",
                  analysis?.readinessColor === "green" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                  analysis?.readinessColor === "yellow" ? "text-amber-700 bg-amber-50 border-amber-100" :
                  analysis?.readinessColor === "amber" ? "text-amber-800 bg-amber-50/50 border-amber-250" :
                  "text-rose-700 bg-rose-50 border-rose-100"
                )}>
                  {analysis?.readinessStatus}
                </span>
              </div>
            </div>
            
            <div className="space-y-5">
              {readinessDimensions.map((dim) => (
                <div key={dim.name}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="font-bold text-text-main">{dim.name}</span>
                    <span className={cn(
                      "font-black",
                      dim.score >= 80 ? "text-google-green" :
                      dim.score >= 70 ? "text-google-yellow" :
                      dim.score >= 40 ? "text-amber-700" :
                      "text-google-red"
                    )}>{dim.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-colors",
                        dim.score >= 80 ? "bg-google-green" :
                        dim.score >= 70 ? "bg-google-yellow" :
                        dim.score >= 40 ? "bg-amber-500" :
                        "bg-google-red"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Why capped / score explanation */}
            {analysis && (
              <div className="mt-8 p-6 rounded-2xl bg-amber-50/30 border border-amber-100/60 text-xs text-slate-700 space-y-4 animate-fade-in">
                <div>
                  <span className="font-extrabold text-amber-900 block text-sm mb-1">Why {readiness}% Overall Readiness?</span>
                  <p className="leading-relaxed font-semibold text-slate-800">{analysis.overallReadinessReasoning}</p>
                </div>
                
                <div className="border-t border-slate-200/60 pt-3 space-y-2 font-bold">
                  <p className="text-blue-700 text-[12px]">{analysis.improvementExplanation}</p>
                  <p className="text-emerald-700 text-[12px]">{analysis.potentialImprovementCopy}</p>
                  <p className="text-slate-500 italic leading-relaxed text-[11px] font-semibold">{analysis.howToReachGreenCopy}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-google-blue" />
              Profile Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  <GraduationCap className="h-4 w-4 text-text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">GPA</p>
                  <p className="text-sm font-bold text-text-main">{profile?.gpa.toFixed(2)} / 4.0</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  <Globe2 className="h-4 w-4 text-text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">English</p>
                  <p className="text-sm font-bold text-text-main">{profile?.englishStatus} {profile?.englishScore}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  <FileBadge2 className="h-4 w-4 text-text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Target</p>
                  <p className="text-sm font-bold text-text-main">{profile?.targetDegree}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  <BookOpen className="h-4 w-4 text-text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Fields</p>
                  <p className="text-sm font-bold text-text-main">{profile?.fields.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-google-blue rounded-3xl p-6 text-white shadow-md shadow-google-blue/10 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-100">
              <CheckCircle2 className="h-4 w-4" />
              Next Best Action
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">Action Goal</span>
                <h4 className="text-base font-extrabold text-white leading-snug mt-0.5">{nextAction.title}</h4>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">Why it matters</span>
                <p className="text-xs text-blue-100 leading-relaxed mt-0.5">{nextAction.whyItMatters}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">Related Risk</span>
                  <span className="text-xs font-black text-white">{nextAction.relatedRisk}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">Potential Impact</span>
                  <span className="text-xs font-black text-emerald-300 font-extrabold">{nextAction.potentialImpact}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-blue-200 italic leading-relaxed pt-3 border-t border-white/10">
                {nextAction.reasoning}
              </p>
            </div>

            <div className="mt-4 pt-2">
              <Link 
                to={nextAction.ctaPath} 
                className="flex items-center justify-center w-full py-3 bg-white text-google-blue hover:bg-blue-50 rounded-xl transition-all font-extrabold text-xs shadow-md cursor-pointer"
              >
                {nextAction.ctaText}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <div className="bg-google-green-light/50 rounded-2xl p-6 border border-google-green-light">
          <h3 className="text-google-green-text font-bold mb-4 text-sm uppercase tracking-widest">Strongest Areas</h3>
          <ul className="space-y-3">
            {strengths.map(item => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-text-main">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-rose-50/30 rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[#991B1B] font-extrabold text-sm uppercase tracking-widest">Needs Attention</h3>
            <span className="text-[10px] text-[#991B1B]/70 font-bold">Ranked by Priority</span>
          </div>
          
          <div className="space-y-4">
            {needsAttentionList.map(item => {
              const isHigh = item.priority === "High";
              return (
                <div key={item.name} className="p-4 bg-white border border-rose-100/60 rounded-2xl shadow-sm flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.reason}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shrink-0",
                      isHigh ? "text-rose-700 bg-rose-50 border-rose-200" : "text-amber-700 bg-amber-50 border-amber-200"
                    )}>
                      {item.priority} Priority
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-semibold">
                    <div>
                      <span className="block uppercase tracking-wide text-[9px]">Dimension Score</span>
                      <span className="text-xs font-black text-slate-700">{item.dimensionScore}%</span>
                    </div>
                    <div>
                      <span className="block uppercase tracking-wide text-[9px]">Related Risk</span>
                      <span className="text-xs font-black text-rose-600">{item.riskValue}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
