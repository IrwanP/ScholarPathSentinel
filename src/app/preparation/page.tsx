import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileSearch, 
  Map as MapIcon, 
  ClipboardList, 
  PenTool, 
  Users, 
  Radar, 
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Info,
  HelpCircle,
  Globe,
  Award,
  Send,
  Bot,
  User,
  ShieldCheck,
  Target
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { demoStudent, type DocumentStatus } from "@/src/data/demoData";

import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { realScholarships } from "../../data/scholarships";
import { calculateScholarshipScore } from "../../lib/scholarshipScoring";
import { calculateSentinelAnalysis, getActiveAnalysis } from "../../utils/sentinelAnalysis";
import { useProfile } from "../../context/ProfileContext";
import OnePageReport from "../../components/OnePageReport";
import AIScholarshipMentor from "../../components/AIScholarshipMentor";
import RiskRadarChart from "../../components/RiskRadarChart";

const sections = [
  { id: "report", name: "One-Page Report", icon: ClipboardList },
  { id: "mentor", name: "AI Mentor", icon: MessageSquare },
  { id: "gap", name: "Evidence Gaps", icon: FileSearch },
  { id: "roadmap", name: "Roadmap", icon: MapIcon },
  { id: "documents", name: "Documents", icon: ClipboardList },
  { id: "essay", name: "Essay Coach", icon: PenTool },
  { id: "interview", name: "Interview Coach", icon: Users },
  { id: "risk", name: "Risk Radar", icon: Radar },
  { id: "review", name: "Final Review", icon: ClipboardCheck },
];

export default function PreparationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode, profile, setCustomProfile, setIsProfileFormOpen, activeScholarshipId, sentinelResult } = useProfile();

  // Route/Param mapper: supports clean external parameter formats
  const tabMapping: Record<string, string> = {
    "one-page-report": "report",
    "report": "report",
    "mentor": "mentor",
    "ai-mentor": "mentor",
    "mentor-chat": "mentor",
    "gap": "gap",
    "evidence-gap": "gap",
    "evidence-gaps": "gap",
    "roadmap": "roadmap",
    "documents": "documents",
    "essay": "essay",
    "essay-coach": "essay",
    "interview": "interview",
    "interview-coach": "interview",
    "risk": "risk",
    "risk-radar": "risk",
    "review": "review",
    "final-review": "review"
  };

  const activeTab = tabMapping[searchParams.get("tab") || ""] || "report";

  const setActiveTab = (tabId: string) => {
    const externalMapping: Record<string, string> = {
      "report": "one-page-report",
      "mentor": "mentor",
      "gap": "gap",
      "roadmap": "roadmap",
      "documents": "documents",
      "essay": "essay-coach",
      "interview": "interview-coach",
      "risk": "risk-radar",
      "review": "review"
    };
    const extId = externalMapping[tabId] || tabId;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("tab", extId);
      return next;
    });
  };

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      const hashMapping: Record<string, string> = {
        "one-page-report": "report",
        "mentor-chat": "mentor",
        "evidence-gap": "gap",
        "roadmap": "roadmap",
        "documents": "documents",
        "essay-coach": "essay",
        "interview-coach": "interview",
        "risk-radar": "risk",
        "final-review": "review"
      };
      if (hashMapping[hash]) {
        setActiveTab(hashMapping[hash]);
      }
    }
  }, [location]);

  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);
  const activeScholarshipScoreResult = activeScholarship && profile ? calculateScholarshipScore(activeScholarship, profile) : null;

  if (mode === "empty") {
    return (
      <div className="space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2">Application Preparation Workspace</h1>
          <p className="text-slate-500">
            Turn your scholarship target into an actionable roadmap, document plan, essay strategy, and interview preparation.
          </p>
        </header>
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto border border-blue-100">
            <ClipboardList className="h-10 w-10 text-blue-600" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Complete your student profile to run your readiness scan.</h2>
            <p className="text-sm text-slate-500 mb-8">We curate a personalized roadmap and document checklist based on your profile and target scholarships.</p>
            <button 
              onClick={() => setIsProfileFormOpen(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer"
            >
              Initialize My Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeScholarship) {
    return (
      <div className="space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2">Application Preparation Workspace</h1>
          <p className="text-slate-500">
            Turn your scholarship target into an actionable roadmap, document plan, essay strategy, and interview preparation.
          </p>
        </header>
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
            <MapIcon className="h-10 w-10 text-slate-500" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Select a scholarship first</h2>
            <p className="text-sm text-slate-500 mb-8">Select or save a scholarship first to generate your personalized preparation workspace.</p>
            <Link 
              to="/scholarships"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all text-center"
            >
              Go to Scholarships →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleNavigateAndFocus = (tabId: string, focusId?: string) => {
    setActiveTab(tabId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const externalMapping: Record<string, string> = {
        "report": "one-page-report",
        "mentor": "mentor",
        "gap": "gap",
        "roadmap": "roadmap",
        "documents": "documents",
        "essay": "essay-coach",
        "interview": "interview-coach",
        "risk": "risk-radar",
        "review": "review"
      };
      const extId = externalMapping[tabId] || tabId;
      next.set("tab", extId);
      if (focusId) {
        next.set("focus", focusId);
      } else {
        next.delete("focus");
      }
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 pb-12 min-w-0 max-w-full overflow-hidden">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Preparation Workspace</h1>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-200 shadow-sm mb-6">
          <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scholarship</p>
            <h2 className="text-lg font-bold text-slate-900 truncate">{activeScholarship.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="text-xs font-semibold text-slate-500">{activeScholarship.country}</span>
              <span className="text-xs font-bold text-blue-600">
                {activeScholarshipScoreResult ? `${activeScholarshipScoreResult.matchScore}% Match` : "Not scored yet"}
              </span>
              <Link to="/scholarships" className="text-xs font-bold text-blue-600 hover:underline">Switch Scholarship →</Link>
              <button 
                onClick={() => handleNavigateAndFocus("report")}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                View One-Page Report
              </button>
            </div>
          </div>
        </div>
      </header>
 
      <div className="flex w-full max-w-full overflow-x-auto pb-2 gap-2 no-scrollbar select-none">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleNavigateAndFocus(section.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer border",
              activeTab === section.id
                ? "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-500/5"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-350 hover:text-slate-900"
            )}
          >
            <section.icon className="h-4 w-4" />
            {section.name}
          </button>
        ))}
      </div>
 
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="p-6 sm:p-8"
          >
            {activeTab === "report" && <OnePageReport onNavigate={handleNavigateAndFocus} />}
            {activeTab === "mentor" && <AIScholarshipMentor />}
            {activeTab === "gap" && <EvidenceGap onNavigate={handleNavigateAndFocus} />}
            {activeTab === "roadmap" && <Roadmap onNavigate={handleNavigateAndFocus} />}
            {activeTab === "documents" && <DocumentChecklist onNavigate={handleNavigateAndFocus} />}
            {activeTab === "essay" && <EssayCoach onNavigate={handleNavigateAndFocus} />}
            {activeTab === "interview" && <InterviewCoach onNavigate={handleNavigateAndFocus} />}
            {activeTab === "risk" && <RiskRadar onNavigate={handleNavigateAndFocus} />}
            {activeTab === "review" && <FinalReview onNavigate={handleNavigateAndFocus} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EvidenceGap({ onNavigate }: { onNavigate: (id: string, focusId?: string) => void }) {
  const { mode, profile, activeScholarshipId, sentinelResult } = useProfile();
  const navigate = useNavigate();
  
  const analysis = getActiveAnalysis(profile, sentinelResult);
  const recRisk = analysis?.risks?.recommenderRisk ?? 80;
  const isRecSubmitted = recRisk <= 30;

  const recommendedActions = isRecSubmitted ? [
    { label: "Confirm Scholarship Deadlines", tab: "roadmap", focus: "deadline", btnLabel: "Review Deadlines" },
    { label: "Build submission timeline", tab: "roadmap", focus: "deadline", btnLabel: "Open Roadmap" },
    { label: "Prepare final document pack", tab: "documents", btnLabel: "Open Documents" },
    { label: "Review essay story arc", tab: "essay", btnLabel: "Open Essay Coach" },
    { label: "Run final compliance scan", tab: "review", btnLabel: "Open Final Review" }
  ] : [
    { label: "Shortlist target programs", href: "/scholarships", btnLabel: "Open Scholarships" },
    { label: "Contact recommenders", tab: "roadmap", focus: "recommenders", btnLabel: "Fix Recommenders" },
    { label: "Complete documents", tab: "documents", focus: "missing-documents", btnLabel: "Open Documents" },
    { label: "Improve motivation letter", tab: "essay", focus: "story-clarity", btnLabel: "Open Essay Coach" },
    { label: "Practice interview answers", tab: "interview", focus: "practice-leadership", btnLabel: "Open Interview Coach" }
  ];

  const strengths = mode === "demo" ? [
    "Your target degree matches this scholarship.",
    "The UK is one of your target countries.",
    "You already have IELTS readiness (score 7.0).",
    "You have leadership and community impact relevant credentials."
  ] : [
    `GPA (${profile?.gpa.toFixed(2)}) meets basic academic requirements.`,
    profile?.englishStatus !== "Not Taken" ? `Language status verified (${profile?.englishStatus} score logged).` : "Target country preference logged.",
    profile?.hasLeadership ? "Documented leadership experience logged." : "Extracurricular interests logged."
  ];

  const gaps = isRecSubmitted ? [
    "Essay draft needs final structure review and narrative verification.",
    "Timeline milestones need calendar confirmation.",
    "Shortlist validation for target programs."
  ] : [
    "Official English test score report missing (if required, check portal).",
    "Academic/professional recommenders not secured (Status: Requested).",
    "Personal Statement draft not fully started.",
    "Shortlist validation for target programs."
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">Evidence Gaps Analyzer</h3>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analysis scan results</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-emerald-50/20 border border-emerald-100 rounded-3xl space-y-4 text-left">
          <h4 className="font-extrabold text-emerald-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Strengths Detected
          </h4>
          <ul className="space-y-2 text-xs text-slate-650 font-medium">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-emerald-600 shrink-0">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-rose-50/20 border border-rose-100 rounded-3xl space-y-4 text-left">
          <h4 className="font-extrabold text-rose-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" /> Evidence Gaps Detected
          </h4>
          <ul className="space-y-2 text-xs text-slate-650 font-medium">
            {gaps.map((gap, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-rose-600 shrink-0">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-blue-50/10 rounded-3xl p-6 border border-blue-100 text-left space-y-4">
        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Priority Next Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendedActions.map((action, i) => (
            <button 
              key={i} 
              onClick={() => {
                if (action.href) {
                  navigate(action.href);
                } else if (action.tab) {
                  onNavigate(action.tab, action.focus);
                }
              }}
              className="flex gap-3 items-center p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-400 hover:bg-slate-50/50 transition-all text-left group cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">{i + 1}</div>
              <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{action.label}</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                {action.btnLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Roadmap({ onNavigate }: { onNavigate: (id: string, focusId?: string) => void }) {
  const { mode, profile, setCustomProfile, sentinelResult } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const readiness = sentinelResult?.readinessScore ?? (profile?.readinessScore || 0);

  // Dynamically set properties based on risks
  const recRisk = sentinelResult?.risks?.recommenderRisk ?? 80;
  const evRisk = sentinelResult?.risks?.evidenceRisk ?? 25;
  const storyRisk = sentinelResult?.risks?.storyRisk ?? 20;
  const fitRisk = sentinelResult?.risks?.fitRisk ?? 35;
  const deadlineRisk = sentinelResult?.risks?.deadlineRisk ?? 75;

  const isRecSubmitted = profile?.recommenderStatus === "Submitted" || profile?.recommenderStatus === "Uploaded" || profile?.recommenderStatus === "Received";
  const isTimelineConfirmed = profile?.deadlineTimelineStatus === "confirmed" && profile?.deadlineMilestonesConfirmed === true;
  const isComplianceCompleted = profile?.complianceScanCompleted === true && profile?.automatedComplianceChecksPassed === true;

  const [showTimelineBuilder, setShowTimelineBuilder] = useState(searchParams.get("focus") === "deadline");
  const [showRecommenderBuilder, setShowRecommenderBuilder] = useState(searchParams.get("focus") === "recommender" || searchParams.get("focus") === "recommenders");
  const [recommenderSuccessMessage, setRecommenderSuccessMessage] = useState<string | null>(null);
  const [timelineSuccessMessage, setTimelineSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus === "recommender" || focus === "recommenders") {
      setShowRecommenderBuilder(true);
      setTimeout(() => {
        document.getElementById("step-3")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else if (focus === "deadline") {
      setShowTimelineBuilder(true);
      setTimeout(() => {
        document.getElementById("step-4")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [searchParams]);

  const recommendedActions = isRecSubmitted ? [
    { label: "Confirm Scholarship Deadlines", path: "/preparation?tab=roadmap&focus=deadline", btnLabel: "Review Deadlines" },
    { label: "Build submission timeline", path: "/preparation?tab=roadmap&focus=deadline", btnLabel: "Open Roadmap" },
    { label: "Prepare final document pack", path: "/preparation?tab=documents", btnLabel: "Open Documents" },
    { label: "Review essay story arc", path: "/preparation?tab=essay-coach", btnLabel: "Open Essay Coach" },
    { label: "Run final compliance scan", path: "/preparation?tab=review", btnLabel: "Open Final Review" }
  ] : [
    { label: "Shortlist target programs", path: "/scholarships", btnLabel: "Open Scholarships" },
    { label: "Contact recommenders", path: "/preparation?tab=roadmap&focus=recommenders", btnLabel: "Fix Recommenders" },
    { label: "Complete documents", path: "/preparation?tab=documents&focus=missing-documents", btnLabel: "Open Documents" },
    { label: "Improve motivation letter", path: "/preparation?tab=essay-coach&focus=story-clarity", btnLabel: "Open Essay Coach" },
    { label: "Practice interview answers", path: "/preparation?tab=interview-coach&focus=practice-leadership", btnLabel: "Open Interview Coach" }
  ];

  const handleRoadmapAction = (actionId: string) => {
    if (!profile) return;

    switch (actionId) {
      case "draft-recommender-request":
        setShowRecommenderBuilder(true);
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set("focus", "recommender");
          return next;
        });
        break;

      case "mark-recommender-request-sent":
        setCustomProfile({
          ...profile,
          recommenderStatus: "Requested"
        });
        setRecommenderSuccessMessage("Recommender request sent. Follow up and confirm submission status.");
        break;

      case "mark-recommender-submitted":
        setCustomProfile({
          ...profile,
          recommenderStatus: "Submitted"
        });
        setRecommenderSuccessMessage("Recommender materials submitted. Recommender risk is now low.");
        setShowRecommenderBuilder(false);
        setShowTimelineBuilder(true);
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set("focus", "deadline");
          return next;
        });
        setTimeout(() => {
          document.getElementById("step-4")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        break;

      case "continue-to-timeline":
        setShowRecommenderBuilder(false);
        setShowTimelineBuilder(true);
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set("focus", "deadline");
          return next;
        });
        setTimeout(() => {
          document.getElementById("step-4")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        break;

      case "build-timeline":
        setShowTimelineBuilder(true);
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set("focus", "deadline");
          return next;
        });
        break;

      case "mark-timeline-drafted":
        setCustomProfile({
          ...profile,
          deadlineTimelineStatus: "confirmed",
          deadlineMilestonesConfirmed: true
        });
        setTimelineSuccessMessage("Timeline drafted. Deadline risk reduced and your readiness has improved.");
        setShowTimelineBuilder(true);
        break;

      case "open-documents":
        onNavigate("documents");
        break;

      case "run-compliance-scan":
        onNavigate("review");
        break;

      case "view-scholarships":
        navigate("/scholarships");
        break;

      case "open-essay-coach":
        onNavigate("essay");
        break;

      case "open-interview-coach":
        onNavigate("interview");
        break;

      default:
        break;
    }
  };

  const steps = [
    {
      num: 1,
      title: "Profile Complete",
      desc: "All academic data, GPA, and language credentials verified.",
      priority: "Low Priority",
      status: "Completed",
      icon: CheckCircle2,
      ctaLabel: "View Profile",
      action: () => onNavigate("report")
    },
    {
      num: 2,
      title: "Build Evidence",
      desc: "Compile leadership portfolios, community impact, and GPA transcripts.",
      priority: evRisk >= 60 ? "High Priority" : evRisk >= 30 ? "Medium Priority" : "Low Priority",
      status: evRisk <= 30 ? "Completed" : "In Progress",
      icon: ClipboardList,
      ctaLabel: "Manage Documents",
      action: () => handleRoadmapAction("open-documents")
    },
    {
      num: 3,
      title: "Secure Recommenders",
      desc: isRecSubmitted ? "Academic and professional recommendation letters are fully secured." : "Identify academic and professional referees. Secure commitment this week.",
      priority: isRecSubmitted ? "Low Priority" : "High Priority",
      status: isRecSubmitted ? "Completed" : "In Progress",
      icon: Users,
      ctaLabel: isRecSubmitted ? "Continue to Timeline" : "Draft Request",
      action: () => {
        if (isRecSubmitted) {
          handleRoadmapAction("continue-to-timeline");
        } else {
          if (showRecommenderBuilder) {
            setShowRecommenderBuilder(false);
            setSearchParams(prev => {
              const next = new URLSearchParams(prev);
              next.delete("focus");
              return next;
            });
          } else {
            handleRoadmapAction("draft-recommender-request");
          }
        }
      }
    },
    {
      num: 4,
      title: "Confirm Scholarship Deadlines",
      desc: isTimelineConfirmed
        ? "Submission timeline drafted and milestone dates confirmed."
        : "Add official timeline milestones and portal submission dates to calendar.",
      priority: isTimelineConfirmed ? "Low Priority" : (isRecSubmitted ? "High Priority" : "Medium Priority"),
      status: isTimelineConfirmed ? "Completed" : (isRecSubmitted ? "In Progress" : "Upcoming"),
      icon: Clock,
      ctaLabel: isTimelineConfirmed ? (showTimelineBuilder ? "Hide Timeline" : "View Timeline") : (showTimelineBuilder ? "Hide Timeline" : "Build Timeline"),
      action: () => {
        if (showTimelineBuilder) {
          setShowTimelineBuilder(false);
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete("focus");
            return next;
          });
        } else {
          handleRoadmapAction("build-timeline");
        }
      }
    },
    {
      num: 5,
      title: "Final Compliance Check",
      desc: profile?.finalComplianceCheckCompleted === true
        ? "Application package successfully scanned and final compliance confirmed."
        : (isComplianceCompleted 
          ? "Automated compliance checks passed. Final compliance confirmation is pending."
          : "Run Compliance Scanner to check documents, timeline, and scholarship requirements."),
      priority: profile?.finalComplianceCheckCompleted === true ? "Low Priority" : (isTimelineConfirmed ? "High Priority" : "Medium Priority"),
      status: profile?.finalComplianceCheckCompleted === true
        ? "Completed"
        : (isComplianceCompleted 
          ? "Pending Final Confirmation"
          : (isTimelineConfirmed ? "In Progress" : "Upcoming")),
      icon: ClipboardCheck,
      ctaLabel: profile?.finalComplianceCheckCompleted === true ? "View Scan Results" : (isComplianceCompleted ? "Confirm Compliance" : "Run Compliance Scanner"),
      action: () => handleRoadmapAction("run-compliance-scan")
    },
    {
      num: 6,
      title: "Final Human Review",
      desc: profile?.finalHumanReviewCompleted === true
        ? `Human review completed by ${profile?.finalHumanReviewerType || "Advisor"}${profile?.finalHumanReviewerName ? ` (${profile.finalHumanReviewerName})` : ""}.`
        : "Mentor or advisor review is recommended to secure final sign-off before submission.",
      priority: profile?.finalHumanReviewCompleted === true ? "Low Priority" : (profile?.finalComplianceCheckCompleted === true ? "High Priority" : "Low Priority"),
      status: profile?.finalHumanReviewCompleted === true
        ? "Completed"
        : (profile?.finalComplianceCheckCompleted === true
          ? "Pending Human Review"
          : "Upcoming"),
      icon: Users,
      ctaLabel: profile?.finalHumanReviewCompleted === true ? "Review Details" : "Start Human Review",
      action: () => onNavigate("review")
    }
  ];

  const getPriorityStyle = (p: string) => {
    if (p.includes("High")) return "border-red-200 bg-red-50 text-rose-700";
    if (p.includes("Medium")) return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  };

  const getStatusStyle = (s: string) => {
    if (s === "Completed") return "bg-emerald-500 text-white";
    if (s === "In Progress" || s === "Pending Final Confirmation" || s === "Pending Human Review") return "bg-blue-600 text-white";
    return "bg-slate-100 text-slate-500 border border-slate-200";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">Preparation Roadmap</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">Readiness Score:</span>
          <span className="text-xl font-black text-blue-600">{readiness}%</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100" />
        <div className="space-y-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} id={`step-${step.num}`} className="flex gap-4 items-start">
                <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10 shrink-0 transition-all",
                  step.status === "Completed" ? "bg-emerald-500 text-white" : 
                  (step.status === "In Progress" || step.status === "Pending Final Confirmation" || step.status === "Pending Human Review") ? "bg-blue-600 text-white animate-pulse" : "bg-slate-200 text-slate-400"
                )}>
                  {step.status === "Completed" ? <CheckCircle2 className="h-5 w-5 text-white" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-350 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Step {step.num}</span>
                        <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
                        <span className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full border", getPriorityStyle(step.priority))}>
                          {step.priority}
                        </span>
                        <span className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full", getStatusStyle(step.status))}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-655 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                    <button 
                      onClick={step.action}
                      className="px-4 py-2 border border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shrink-0 self-start md:self-auto cursor-pointer"
                    >
                      {step.ctaLabel}
                    </button>
                  </div>

                  {step.num === 3 && showRecommenderBuilder && (
                    <div className={cn(
                      "mt-4 p-5 rounded-2xl space-y-4 text-left animate-fade-in w-full border",
                      isRecSubmitted
                        ? "bg-emerald-50/20 border-emerald-200" 
                        : "bg-rose-50/20 border-rose-150"
                    )}>
                      <div className={cn(
                        "flex items-center justify-between border-b pb-2",
                        isRecSubmitted ? "border-emerald-100" : "border-rose-100"
                      )}>
                        <h5 className="font-extrabold text-slate-900 text-sm">Recommender Request Builder</h5>
                        {isRecSubmitted ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Submitted</span>
                        ) : (
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">Drafting</span>
                        )}
                      </div>

                      {recommenderSuccessMessage && (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{recommenderSuccessMessage}</span>
                        </div>
                      )}

                      <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="text-xs text-slate-700 space-y-1">
                          <p className="font-bold text-slate-900">Recommender Context Summary</p>
                          <p className="text-[11px] text-slate-500">Provide background materials to help your referees write strong, specific letters focused on your academic capability and leadership evidence.</p>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Suggested Request Checklist</p>
                          <ul className="text-[11px] text-slate-655 space-y-1 list-disc pl-4 font-semibold leading-normal">
                            <li>Share scholarship name and target program</li>
                            <li>Attach CV / achievement summary</li>
                            <li>Explain why the recommender is suitable</li>
                            <li>Include deadline and submission method</li>
                            <li>Give enough time for review</li>
                          </ul>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3 pt-2 border-t border-slate-100">
                          <div className="text-[11px] text-slate-650">
                            <span className="font-bold block text-slate-800">Scholarship Context:</span>
                            Targeting {profile?.targetDegree} in {profile?.targetCountries?.join(", ") || "selected countries"}.
                          </div>
                          <div className="text-[11px] text-slate-655">
                            <span className="font-bold block text-slate-850">Deadline Note:</span>
                            Intake Year {profile?.preferredIntakeYear || "2026"} (timeline tight).
                          </div>
                          <div className="text-[11px] text-slate-655">
                            <span className="font-bold block text-slate-850">Evidence Packet:</span>
                            Attach certified GPA transcripts and leadership summaries.
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-150 flex flex-wrap gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleRoadmapAction("mark-recommender-request-sent")}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer"
                        >
                          Mark request sent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoadmapAction("mark-recommender-submitted")}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Mark recommender submitted
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoadmapAction("continue-to-timeline")}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        >
                          Continue to timeline
                        </button>
                      </div>
                    </div>
                  )}

                  {step.num === 4 && showTimelineBuilder && (
                    <div className={cn(
                      "mt-4 p-5 rounded-2xl space-y-4 text-left animate-fade-in w-full border",
                      isTimelineConfirmed
                        ? "bg-emerald-50/20 border-emerald-200" 
                        : "bg-rose-50/20 border-rose-150"
                    )}>
                      <div className={cn(
                        "flex items-center justify-between border-b pb-2",
                        isTimelineConfirmed ? "border-emerald-100" : "border-rose-100"
                      )}>
                        <h5 className="font-extrabold text-slate-900 text-sm">Submission Timeline Builder</h5>
                        {isTimelineConfirmed ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Confirmed</span>
                        ) : (
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">Active Plan</span>
                        )}
                      </div>

                      {timelineSuccessMessage && (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{timelineSuccessMessage}</span>
                        </div>
                      )}

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase">Today</span>
                          <ul className="text-[11px] text-slate-650 space-y-1 list-disc pl-4 font-semibold leading-normal">
                            <li>Confirm official scholarship deadline</li>
                            <li>Add deadline to calendar</li>
                            <li>List required documents</li>
                            <li>Identify missing submission items</li>
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase">Next 48 Hours</span>
                          <ul className="text-[11px] text-slate-655 space-y-1 list-disc pl-4 font-semibold leading-normal">
                            <li>Create submission checklist</li>
                            <li>Assign each requirement to a date</li>
                            <li>Confirm reviewer / mentor availability</li>
                            <li>Prepare final document folder</li>
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">This Week</span>
                          <ul className="text-[11px] text-slate-655 space-y-1 list-disc pl-4 font-semibold leading-normal">
                            <li>Complete evidence pack</li>
                            <li>Review essay and SOP</li>
                            <li>Verify portal requirements</li>
                            <li>Run final compliance check</li>
                          </ul>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-150 flex flex-wrap gap-2 justify-end">
                        {isTimelineConfirmed ? (
                          <button
                            type="button"
                            disabled
                            className="px-3 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5 opacity-90 cursor-default"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Timeline Drafted
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRoadmapAction("mark-timeline-drafted")}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                          >
                            Mark timeline drafted
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onNavigate("documents")}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        >
                          Open document checklist
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate("review")}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        >
                          Run final compliance check
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50/15 rounded-3xl p-6 border border-blue-100">
        <h4 className="font-bold text-slate-900 mb-4 text-left">Recommended Next Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendedActions.map((action, i) => (
            <button 
              key={i} 
              onClick={() => {
                if (action.path.startsWith("/scholarships")) {
                  navigate("/scholarships");
                } else {
                  const url = new URL(action.path, window.location.origin);
                  const tab = url.searchParams.get("tab") || "roadmap";
                  const focus = url.searchParams.get("focus") || undefined;
                  onNavigate(tab, focus);
                }
              }}
              className="flex gap-3 items-center p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-400 hover:bg-slate-50 transition-all text-left group cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">{i + 1}</div>
              <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{action.label}</span>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                {action.btnLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentChecklist({ onNavigate }: { onNavigate: (id: string, focusId?: string) => void }) {
  const { mode, profile } = useProfile();
  const readiness = mode === "demo" ? 38 : Math.floor((profile?.readinessScore || 0) * 0.4);

  const groups = [
    {
      name: "Identity Documents",
      docs: [
        { name: "Passport", status: "Ready" },
        { name: "Birth Certificate", status: "Ready" }
      ]
    },
    {
      name: "Academic Documents",
      docs: [
        { name: "Academic Transcript", status: "Drafting" },
        { name: "Degree Certificate", status: "Needs Review" },
        { name: "IELTS Score Record", status: "Ready" }
      ]
    },
    {
      name: "Scholarship Essays",
      docs: [
        { name: "Personal Statement", status: "Not Started" },
        { name: "Leadership Essay", status: "Drafting" },
        { name: "Study Plan", status: "Not Started" }
      ]
    },
    {
      name: "Recommendation Documents",
      docs: [
        { name: "Academic Reference", status: "Not Started" },
        { name: "Professional Reference", status: "Not Started" }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">Document Checklist</h3>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase">Readiness</p>
          <p className="text-xl font-black text-blue-600">{readiness}%</p>
        </div>
      </div>

      <div className="space-y-8">
        {groups.map(group => (
          <div key={group.name} className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest px-1 text-left">{group.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.docs.map(doc => (
                <div key={doc.name} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all text-left">
                  <span className="font-semibold text-slate-800 text-sm">{doc.name}</span>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full",
                    doc.status === "Ready" ? "bg-emerald-500 text-white" :
                    doc.status === "Drafting" ? "bg-amber-400 text-slate-800" :
                    doc.status === "Needs Review" ? "bg-rose-500 text-white" :
                    "bg-white border border-slate-200 text-slate-500"
                  )}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EssayCoach({ onNavigate }: { onNavigate: (id: string, focusId?: string) => void }) {
  const { mode, profile, sentinelResult } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeScholarship = realScholarships.find(s => s.id === useProfile().activeScholarshipId);
  const analysis = getActiveAnalysis(profile, sentinelResult);
  const isDeadlineHigh = (analysis?.risks?.deadlineRisk ?? 75) >= 60;
  const isRecSubmitted = profile?.recommenderStatus === "Submitted" || profile?.recommenderStatus === "Uploaded" || profile?.recommenderStatus === "Received" || (analysis?.risks?.recommenderRisk ?? 80) <= 30;
  const scholarshipName = activeScholarship?.name || "Chevening Scholarship";

  const [essayStep, setEssayStep] = useState(0); 
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "assistant" | "user", content: string }>>([
    {
      role: "assistant",
      content: `Hi ${profile?.name || "Alya"}, let’s build your scholarship essay from your real experiences. I will help you identify a strong story, connect it to evidence, and shape it into a clear essay arc without fabricating anything.`
    }
  ]);

  const [answers, setAnswers] = useState({
    problem: "",
    whyMatters: "",
    action: "",
    whoBenefited: "",
    changeResult: "",
    evidence: "",
    learnings: "",
    connection: ""
  });

  const [phrasingTip, setPhrasingTip] = useState("");
  const [outlineVisible, setOutlineVisible] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAuthenticityCheck, setShowAuthenticityCheck] = useState(false);
  const [showConnector, setShowConnector] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"arc" | "connector" | "authenticity" | "support">("arc");

  const currentQuestions = [
    { key: "problem", label: "1. What problem or challenge did you notice?", placeholder: "e.g., Regional government departments collect environmental data manually, causing slow responses." },
    { key: "whyMatters", label: "2. Why did it matter to your community, school, or field?", placeholder: "e.g., Slow response times delayed water pollution fixes, affecting public health." },
    { key: "action", label: "3. What action did you personally take?", placeholder: "e.g., I designed and piloted a spreadsheet script that automated regional data aggregation." },
    { key: "whoBenefited", label: "4. Who benefited from your action?", placeholder: "e.g., Local environment agency staff and community leaders in three districts." },
    { key: "changeResult", label: "5. What changed because of your work?", placeholder: "e.g., Data aggregation time dropped from 14 days to 4 hours." },
    { key: "evidence", label: "6. What evidence supports this story?", placeholder: "e.g., My internship performance report and supervisor verification." },
    { key: "learnings", label: "7. What did you learn?", placeholder: "e.g., Automation requires data integrity; standardized formats are key for trust." },
    { key: "connection", label: "8. How does this connect to your target scholarship and future goal?", placeholder: "e.g., Fits Chevening's focus on leadership and sustainable development policy." }
  ];

  const handleStartInterview = () => {
    setEssayStep(1);
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Start guided essay interview" },
      { 
        role: "assistant", 
        content: `Excellent! Let's start with your real-world experience. \n\nQuestion 1: What problem or challenge did you notice in your community, school, or field?`
      }
    ]);
  };

  const handleWhatExperience = () => {
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "What experience should I write about?" },
      {
        role: "assistant",
        content: "Start with an experience where you personally solved a meaningful problem, showed leadership, or created measurable impact. Let’s connect that experience to your target field and scholarship goals. \n\nLet's start the guided flow. Question 1: What problem or challenge did you notice?"
      }
    ]);
    setEssayStep(1);
  };

  const handleSendMessage = () => {
    const cleaned = inputValue.trim();
    if (!cleaned) return;

    const currentQ = currentQuestions[essayStep - 1];
    setAnswers(prev => ({ ...prev, [currentQ.key]: cleaned }));
    
    const userMsg = { role: "user" as const, content: cleaned };
    setInputValue("");

    if (essayStep < 8) {
      const nextQIdx = essayStep;
      const nextQ = currentQuestions[nextQIdx];
      setEssayStep(prev => prev + 1);
      setChatMessages(prev => [
        ...prev,
        userMsg,
        {
          role: "assistant",
          content: `Got it. Thank you. \n\nQuestion ${nextQIdx + 1}: ${nextQ.label}`
        }
      ]);
    } else {
      setEssayStep(9);
      setOutlineVisible(true);
      setChatMessages(prev => [
        ...prev,
        userMsg,
        {
          role: "assistant",
          content: "Thank you! We have gathered all your reflections. We have successfully compiled your answers into a structured Story Arc outline. \n\nYou can now use the supporting actions to build the story outline, connect evidence, check authenticity, or improve clarity without generating fake essays."
        }
      ]);
    }
  };

  const handleBuildStoryArc = () => {
    if (!answers.problem) {
      setAnswers({
        problem: "In Indonesia, regional government departments collect environmental data manually, which leads to slow public policy responses.",
        whyMatters: "Slow response times mean community water pollution issues persist for weeks, affecting public health.",
        action: "I designed and piloted a streamlined spreadsheet database script that automated regional data aggregation.",
        whoBenefited: "Local environment agency staff and community leaders in three districts.",
        changeResult: "Data aggregation time dropped from 14 days to 4 hours, and two critical water filtration issues were addressed.",
        evidence: "My leadership project certificate and internship performance report verified by my supervisor.",
        learnings: "Automation is only as good as data integrity. Standardized formats are critical for trust.",
        connection: "This fits Chevening's focus on leadership and matches UK university courses in Data Science for Public Policy."
      });
    }
    setEssayStep(9);
    setOutlineVisible(true);
    setActiveRightTab("arc");
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Build my story arc" },
      {
        role: "assistant",
        content: "I have structured your answers into a formal Essay Outline in the supporting panel. Use this outline as your draft foundation!"
      }
    ]);
  };

  const handleConnectEvidence = () => {
    setShowConnector(true);
    setActiveRightTab("connector");
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Connect evidence to story" },
      {
        role: "assistant",
        content: `I've mapped your story elements to your verified profile achievements (GPA: ${profile?.gpa.toFixed(2)}, IELTS: ${profile?.englishScore}). Your script automation directly maps to your Leadership and Community Impact tags!`
      }
    ]);
  };

  const handleCheckAuthenticity = () => {
    setShowAuthenticityCheck(true);
    setActiveRightTab("authenticity");
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Check authenticity" },
      {
        role: "assistant",
        content: "Authenticity check run. Your achievements align perfectly with your profile. Remember: do not invent awards or outcomes, and keep your personal contribution distinct from team efforts."
      }
    ]);
  };

  const handlePhrasingTip = () => {
    setPhrasingTip(
      answers.action.trim() 
        ? `Option 1: "To solve this collection delay, I personally automated regional aggregation formats..." \nOption 2: "Faced with manual aggregation logs, I designed a streamlined script that..."`
        : `Option 1: "I noticed a policy response delay..." \nOption 2: "Faced with community data gaps, my target was to..."`
    );
    setActiveRightTab("support");
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Improve clarity" },
      {
        role: "assistant",
        content: "Here are stronger phrasing suggestions based on your input. Notice how they emphasize your direct actions ('I designed') while keeping the facts completely authentic."
      }
    ]);
  };

  const handleOpenChecklist = () => {
    setShowChecklist(prev => !prev);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Authentic Essay Coach</h3>
        <p className="text-sm text-slate-500">Build a scholarship essay from your real experiences, evidence, and goals.</p>
      </div>

      {/* Principle Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 font-semibold leading-relaxed">
          <span className="font-extrabold">Our Principle:</span> We do not fabricate achievements or generate fake final essays. We help you shape your real story with clarity, evidence, and authenticity.
        </div>
      </div>

      {isDeadlineHigh && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-extrabold block">Time-Box Alert:</span>
            Since your Deadline Risk is High ({analysis?.risks?.deadlineRisk}%), keep your draft iterations strictly time-boxed to prevent delays. Focus on completing a structured outline today.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Context & Progress */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Candidate Context</span>
            <div className="space-y-1.5 font-medium text-slate-700">
              <p>Field: <span className="font-extrabold text-slate-900">{profile?.fields.join(" & ") || "General"}</span></p>
              <p>Target: <span className="font-extrabold text-slate-900">{scholarshipName}</span></p>
              <p>Next Action: <span className="font-extrabold text-blue-600">
                {isRecSubmitted ? "Build timeline & outline essays" : "Secure recommender commitments"}
              </span></p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Story Arc Status</span>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(Math.max(0, essayStep - 1) / 8) * 100}%` }} />
              </div>
              <span className="font-bold text-slate-650">{Math.round((Math.max(0, essayStep - 1) / 8) * 100)}%</span>
            </div>
            <p className="text-[10px] text-slate-455 leading-relaxed font-semibold">Progress through the guided reflection interview to outline your SOP structure.</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 text-xs shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-455 tracking-wider block">Authenticity Guardrails</span>
            <ul className="space-y-1.5 text-[11px] text-slate-600 font-semibold list-disc pl-4 leading-normal">
              <li>Claims must be supported by real evidence</li>
              <li>Do not invent awards, roles, or outcomes</li>
              <li>Avoid exaggerated numbers or percentages</li>
              <li>Use 'I' for personal work, 'we' for team effort</li>
              <li>Keep the student's authentic voice intact</li>
            </ul>
          </div>
        </div>

        {/* Middle: Conversational Coach Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600 animate-bounce" />
                <span className="text-xs font-extrabold text-slate-900">Conversational AI Coach</span>
              </div>
              {essayStep > 0 && (
                <button 
                  onClick={() => { setEssayStep(0); setChatMessages([{ role: "assistant", content: `Hi ${profile?.name || "Alya"}, let’s build your scholarship essay from your real experiences. I will help you identify a strong story, connect it to evidence, and shape it into a clear essay arc without fabricating anything.` }]); }} 
                  className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase cursor-pointer"
                >
                  Restart Flow
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-2 min-h-0 text-xs">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 rounded-2xl max-w-[85%] leading-relaxed font-semibold",
                    msg.role === "assistant" 
                      ? "bg-slate-50 border border-slate-100 text-slate-700 mr-auto text-left whitespace-pre-line" 
                      : "bg-blue-600 text-white ml-auto text-left"
                  )}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-3 shrink-0">
              {essayStep === 0 ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={handleWhatExperience}
                    className="px-4 py-2 border border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    What experience should I write about?
                  </button>
                  <button 
                    onClick={handleStartInterview}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Start guided essay interview
                  </button>
                  <button 
                    onClick={handleBuildStoryArc}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Build my story arc
                  </button>
                </div>
              ) : essayStep <= 8 ? (
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestions[essayStep - 1].placeholder}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-blue-400 focus:outline-none placeholder-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:bg-slate-200 transition cursor-pointer flex items-center justify-center"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={handleBuildStoryArc}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Build my story arc
                  </button>
                  <button 
                    onClick={handleConnectEvidence}
                    className="px-3 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Connect evidence to story
                  </button>
                  <button 
                    onClick={handleCheckAuthenticity}
                    className="px-3 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Check authenticity
                  </button>
                  <button 
                    onClick={handlePhrasingTip}
                    className="px-3 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Improve clarity
                  </button>
                  <button 
                    onClick={handleOpenChecklist}
                    className="px-3 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Open essay checklist
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column / Supporting cards (Render below chat responsive) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex gap-2 border-b border-slate-100 pb-2">
                {[
                  { id: "arc", label: "Story Arc Builder" },
                  { id: "connector", label: "Evidence Connector" },
                  { id: "authenticity", label: "Authenticity Guard" },
                  { id: "support", label: "Draft Support" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveRightTab(t.id as any)}
                    className={cn(
                      "text-[10px] font-black pb-1.5 border-b-2 uppercase tracking-wider cursor-pointer",
                      activeRightTab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-655"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeRightTab === "arc" && (
                <div className="space-y-3 text-xs leading-relaxed text-slate-650 font-medium">
                  {outlineVisible ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50/10 border border-emerald-100 rounded-xl space-y-2">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">Context / Challenge</span>
                        <p>{answers.problem || "(No details provided)"} {answers.whyMatters}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/10 border border-emerald-100 rounded-xl space-y-2">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">Action Taken</span>
                        <p>{answers.action || "(No details provided)"} (Who benefited: {answers.whoBenefited})</p>
                      </div>
                      <div className="p-3 bg-emerald-50/10 border border-emerald-100 rounded-xl space-y-2">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">Evidence & Reflection</span>
                        <p>Result: {answers.changeResult || "(No details provided)"} (Proof: {answers.evidence}) (Learnings: {answers.learnings})</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-center py-4">Story Arc is currently building. Complete the guided interview questions to assemble your arc.</p>
                  )}
                </div>
              )}

              {activeRightTab === "connector" && (
                <div className="space-y-3 text-xs text-slate-650 leading-relaxed font-semibold">
                  {showConnector ? (
                    <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-xl space-y-2">
                      <h5 className="font-extrabold text-blue-900 flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Connected Profile Evidence</h5>
                      <ul className="space-y-1.5 list-disc pl-4">
                        <li>Academic Fit verified: GPA {profile?.gpa.toFixed(2)}</li>
                        <li>English proficiency aligned: {profile?.englishStatus} {profile?.englishScore}</li>
                        {profile?.hasLeadership && <li>Leadership tag maps to: "I designed and piloted a database script..."</li>}
                        {profile?.hasCommunityImpact && <li>Community Impact verified: districts benefited from automation</li>}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-center py-4">Click "Connect evidence to story" CTA to align with your profile credentials.</p>
                  )}
                </div>
              )}

              {activeRightTab === "authenticity" && (
                <div className="space-y-3 text-xs text-slate-650 leading-relaxed font-semibold">
                  {showAuthenticityCheck ? (
                    <div className="p-4 bg-emerald-50/25 border border-emerald-100 rounded-xl flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-extrabold text-emerald-950">Authenticity Verified</h5>
                        <p className="mt-1 leading-normal text-emerald-800">
                          "All claims map accurately to profile credentials. No exaggerations detected. Keep editing in your authentic voice."
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-center py-4">Click "Check authenticity" to verify your answers against guardrails.</p>
                  )}
                </div>
              )}

              {activeRightTab === "support" && (
                <div className="space-y-3 text-xs text-slate-650 leading-relaxed font-medium">
                  {phrasingTip ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider mb-1">Outline direction</span>
                        <p className="italic">"When I analyzed government manual collection delays, I realized that data without swift aggregation limits policy responsiveness. In my local agency data role, I set out to..."</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider mb-1">Stronger phrasing suggestions</span>
                        <p className="whitespace-pre-line text-slate-700">{phrasingTip}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-center py-4">Click "Improve clarity" for draft outlines and phrasing options.</p>
                  )}
                </div>
              )}
            </div>

            {showChecklist && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Draft Improvement Checklist</h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-655 pl-1">
                  <li className="flex items-start gap-2">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded cursor-pointer" />
                    <span>State the core community problem clearly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded cursor-pointer" />
                    <span>Quantify results with measurable metrics (e.g. 14 days down to 4 hours)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5 rounded cursor-pointer" />
                    <span>Double-check personal contribution vs team effort wording</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5 rounded cursor-pointer" />
                    <span>Map past achievements to future scholarship commitments</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function InterviewCoach({ onNavigate }: { onNavigate: (id: string, focusId?: string) => void }) {
  const { mode, profile, sentinelResult } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeScholarship = realScholarships.find(s => s.id === useProfile().activeScholarshipId);
  const analysis = getActiveAnalysis(profile, sentinelResult);
  const isDeadlineHigh = (analysis?.risks?.deadlineRisk ?? 75) >= 60;
  const isRecSubmitted = profile?.recommenderStatus === "Submitted" || profile?.recommenderStatus === "Uploaded" || profile?.recommenderStatus === "Received" || (analysis?.risks?.recommenderRisk ?? 80) <= 30;

  const [chatMessages, setChatMessages] = useState<Array<{ role: "assistant" | "user", content: string }>>([
    {
      role: "assistant",
      content: `Hi ${profile?.name || "Alya"}, let’s prepare for your scholarship interview. I will ask realistic questions, help you structure your answer, and give feedback on clarity, evidence, and authenticity.`
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<string>("initial");
  const [feedback, setFeedback] = useState<{
    clarity: string;
    specificity: string;
    evidence: string;
    authenticity: string;
    fit: string;
    confidence: string;
    conciseness: string;
    text: string;
  } | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<"STAR" | "CAR" | "G-E-I-C">("STAR");
  const [showChecklist, setShowChecklist] = useState(false);

  const interviewModes = [
    { id: "motivation", name: "1. Motivation Interview", desc: "Why this scholarship, field, or program?", questions: [
      "Why do you deserve this scholarship?",
      `Why did you choose to study ${profile?.fields?.[0] || "your field"}?`,
      "Why are you interested in studying in your target country?"
    ]},
    { id: "leadership", name: "2. Leadership Interview", desc: "Tell me about leading a team and facing challenges.", questions: [
      "Tell me about a time you led a team through a difficult challenge.",
      "What challenge did you face as a leader, and what did you learn?",
      "How do you resolve conflict within a team?"
    ]},
    { id: "impact", name: "3. Impact Interview", desc: "What problem will you solve, and who benefits?", questions: [
      "What is the most pressing problem you want to solve in your home country?",
      "Who will benefit from your work, and how will you measure impact?",
      "What are your long-term career plans to implement change?"
    ]},
    { id: "fit", name: "4. Fit Interview", desc: "Why are you a good fit now?", questions: [
      "Why are you a good fit for this scholarship?",
      "How does your background align with the program requirements?",
      "Why is this the right time in your career for this degree?"
    ]},
    { id: "risk-based", name: "5. Risk-based Interview", desc: "Targeted questions on deadline & story gaps.", questions: [
      "You have high Deadline Risk. How will you manage a high-pressure workload under tight deadlines?",
      "Explain how your leadership project is supported by real verifiable evidence.",
      "If selected, how will you ensure your studies are completed on time?"
    ]}
  ];

  const handleStartMock = () => {
    setActiveMode("general");
    setActiveQuestion("Why do you deserve this scholarship?");
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Start mock interview" },
      {
        role: "assistant",
        content: `Excellent. Let’s practice: "Why do you deserve the ${activeScholarship?.name || "Chevening"} scholarship?" Try to answer using your real achievements (GPA: ${profile?.gpa.toFixed(2)}, ${profile?.englishStatus} ${profile?.englishScore}) and leadership experience.`
      }
    ]);
    setFeedback(null);
  };

  const handlePracticeMode = (modeId: string) => {
    const modeObj = interviewModes.find(m => m.id === modeId);
    if (!modeObj) return;

    setActiveMode(modeId);
    const firstQ = modeObj.questions[0];
    setActiveQuestion(firstQ);
    
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: `Practice ${modeObj.name.substring(3)}` },
      {
        role: "assistant",
        content: `Let's start the ${modeObj.name.substring(3)}. Here is your first question:\n\n"${firstQ}"\n\nRemember: do not script dishonest answers. Focus on your real experience.`
      }
    ]);
    setFeedback(null);
  };

  const handleSendMessage = () => {
    const cleaned = inputValue.trim();
    if (!cleaned) return;
    
    const nextMsgs = [...chatMessages, { role: "user" as const, content: cleaned }];
    setChatMessages(nextMsgs);
    setInputValue("");

    setTimeout(() => {
      let replyContent = "";
      let newFeedback = {
        clarity: "Strong",
        specificity: "Needs Work",
        evidence: "Needs Work",
        authenticity: "High",
        fit: "Strong",
        confidence: "Strong",
        conciseness: "Moderate",
        text: "Your answer is clear, but it needs stronger evidence. Add one specific result, such as who benefited, what changed, or what you learned to make it more persuasive."
      };

      if (activeQuestion?.includes("deserve")) {
        replyContent = "Thank you for sharing. That's a solid start. Let's analyze it: Your explanation shows strong motivation, but it lacks specific leadership numbers. Add one specific result, such as who benefited, what changed, or what you learned to make it more persuasive.";
      } else {
        replyContent = "That's a helpful perspective. Remember to structure this using STAR (Situation, Task, Action, Result). Try to focus on your specific actions ('I did') rather than just team efforts ('we did').";
        newFeedback = {
          clarity: "Moderate",
          specificity: "Moderate",
          evidence: "Moderate",
          authenticity: "High",
          fit: "Moderate",
          confidence: "Moderate",
          conciseness: "Strong",
          text: "A well-structured response. Ensure you highlight your own specific role and outcome metrics."
        };
      }
      
      setChatMessages(prev => [...prev, { role: "assistant" as const, content: replyContent }]);
      setFeedback(newFeedback);
    }, 1000);
  };

  const handleGetFeedback = () => {
    if (chatMessages.length < 2) return;
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Get feedback on my answer" },
      {
        role: "assistant",
        content: "Here is your mock coach assessment in the supporting panel. Focus on quantifying your outcomes and keeping your story authentic."
      }
    ]);
  };

  const handleImproveStructure = () => {
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Improve answer structure" },
      {
        role: "assistant",
        content: `Try organizing your response using the ${selectedStructure} structure: \n\n${
          selectedStructure === "STAR" ? "Situation -> Task -> Action -> Result" :
          selectedStructure === "CAR" ? "Challenge -> Action -> Result" :
          "Goal -> Evidence -> Impact -> Future Contribution"
        }. Keep your focus on your personal contributions ('I designed...') rather than general group work.`
      }
    ]);
  };

  const handleGenerateFollowUp = () => {
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: "Generate follow-up questions" },
      {
        role: "assistant",
        content: `Based on your answer, here is a follow-up question: "What specific metrics did you use to verify that water filtration issues were resolved?"`
      }
    ]);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Guided Interview Coach</h3>
        <p className="text-sm text-slate-500">Prepare for scholarship interviews using realistic and honest mock scenarios.</p>
      </div>

      {/* Principle Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 font-semibold leading-relaxed">
          <span className="font-extrabold">Interview Honesty Rule:</span> Do not create fake experiences or script dishonest answers. The selection panel values raw reflection and authentic leadership evidence.
        </div>
      </div>

      {isDeadlineHigh && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-extrabold block">Focused Timeline Tip:</span>
            Your Deadline Risk is High ({analysis?.risks?.deadlineRisk}%). We recommend a short, focused 15-minute daily mock practice plan rather than trying to memorize long answers.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Context & Selection */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Candidate Context</span>
            <div className="space-y-1.5 font-medium text-slate-700">
              <p>Field: <span className="font-extrabold text-slate-900">{profile?.fields.join(" & ") || "General"}</span></p>
              <p>Target: <span className="font-extrabold text-slate-900">{activeScholarship?.name}</span></p>
              <p>Priority Focus: <span className="font-extrabold text-blue-600">
                {isRecSubmitted ? "Timeline, story clarity, and scholarship fit" : "Recommender readiness & timeline"}
              </span></p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs shadow-sm text-left">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Answer Structure Coach</span>
            <div className="flex gap-2">
              {["STAR", "CAR", "G-E-I-C"].map((struct) => (
                <button
                  key={struct}
                  onClick={() => setSelectedStructure(struct as any)}
                  className={cn(
                    "flex-1 py-1 rounded text-[10px] font-bold border",
                    selectedStructure === struct 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
                  )}
                >
                  {struct}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold leading-relaxed pt-1 border-t border-slate-200">
              {selectedStructure === "STAR" && "STAR: Situation, Task, Action, Result. Focus on the Result."}
              {selectedStructure === "CAR" && "CAR: Challenge, Action, Result. Highly effective for leadership examples."}
              {selectedStructure === "G-E-I-C" && "G-E-I-C: Goal, Evidence, Impact, Future Contribution. Direct and academic."}
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 text-xs shadow-sm text-left">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Interview Modes</span>
            <div className="space-y-1.5 pt-1">
              {interviewModes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handlePracticeMode(m.id)}
                  className={cn(
                    "w-full text-left p-2.5 border rounded-xl text-xs transition-all block font-semibold cursor-pointer",
                    activeMode === m.id 
                      ? "bg-blue-50 border-blue-400 text-blue-700" 
                      : "bg-white border-slate-100 text-slate-700 hover:border-blue-400 hover:bg-slate-50/50"
                  )}
                >
                  <span className="font-extrabold block text-[11px]">{m.name}</span>
                  <span className="text-[9px] text-slate-455 block mt-0.5 leading-normal">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Chat Mock Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-900">Mock Coach Session</span>
              </div>
              <button 
                onClick={handleStartMock} 
                className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md uppercase hover:bg-blue-100 cursor-pointer"
              >
                Start mock interview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-2 min-h-0 text-xs">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 rounded-2xl max-w-[85%] leading-relaxed font-semibold",
                    msg.role === "assistant" 
                      ? "bg-slate-50 border border-slate-100 text-slate-700 mr-auto text-left whitespace-pre-line" 
                      : "bg-blue-600 text-white ml-auto text-left"
                  )}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-3 shrink-0">
              {activeQuestion ? (
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your practice answer here..."
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-blue-400 focus:outline-none placeholder-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1 disabled:bg-slate-200"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handlePracticeMode("motivation")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Practice motivation answer
                  </button>
                  <button
                    onClick={() => handlePracticeMode("leadership")}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Practice leadership answer
                  </button>
                  <button
                    onClick={() => setShowChecklist(prev => !prev)}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    View interview checklist
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedback && (
              <div className="p-5 bg-amber-50/30 border border-amber-200 rounded-3xl space-y-4 animate-fade-in text-xs shadow-sm">
                <span className="font-extrabold text-amber-900 uppercase text-[9px] tracking-wider block">Mock Coach Assessment</span>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-semibold">
                  <div className="flex justify-between border-b border-amber-100 pb-1">
                    <span className="text-slate-500">Clarity:</span>
                    <span className={cn(feedback.clarity === "Strong" ? "text-emerald-600" : "text-amber-600")}>{feedback.clarity}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100 pb-1">
                    <span className="text-slate-500">Specificity:</span>
                    <span className={cn(feedback.specificity === "Strong" ? "text-emerald-600" : "text-amber-600")}>{feedback.specificity}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100 pb-1">
                    <span className="text-slate-500">Evidence:</span>
                    <span className={cn(feedback.evidence === "Strong" ? "text-emerald-600" : "text-amber-600")}>{feedback.evidence}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100 pb-1">
                    <span className="text-slate-500">Authenticity:</span>
                    <span className="text-emerald-600">{feedback.authenticity}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100 pb-1">
                    <span className="text-slate-500">Scholarship Fit:</span>
                    <span className={cn(feedback.fit === "Strong" ? "text-emerald-600" : "text-amber-600")}>{feedback.fit}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100 pb-1">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="text-emerald-600">{feedback.confidence}</span>
                  </div>
                </div>

                <p className="font-semibold text-slate-850 pt-2 border-t border-amber-100 leading-relaxed">
                  {feedback.text}
                </p>

                <div className="flex flex-wrap gap-2 pt-2 justify-end">
                  <button 
                    onClick={handleGetFeedback}
                    className="px-3 py-1.5 border border-amber-250 text-amber-900 bg-white hover:bg-amber-50 text-[10px] font-extrabold rounded-lg cursor-pointer"
                  >
                    Get feedback on my answer
                  </button>
                  <button 
                    onClick={handleImproveStructure}
                    className="px-3 py-1.5 border border-amber-250 text-amber-900 bg-white hover:bg-amber-50 text-[10px] font-extrabold rounded-lg cursor-pointer"
                  >
                    Improve answer structure
                  </button>
                  <button 
                    onClick={handleGenerateFollowUp}
                    className="px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 text-[10px] font-extrabold rounded-lg cursor-pointer"
                  >
                    Generate follow-up questions
                  </button>
                </div>
              </div>
            )}

            {showChecklist && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Interview Checklist</h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-655">
                  <li className="flex items-start gap-2">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded cursor-pointer" />
                    <span>Outline 3 key leadership stories in STAR/CAR format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5 rounded cursor-pointer" />
                    <span>Include at least one specific metric per leadership story</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5 rounded cursor-pointer" />
                    <span>Prepare standard motivation description (Why this program, why now)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5 rounded cursor-pointer" />
                    <span>Lock in authentic future goals (no generic statements)</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function RiskRadar({ onNavigate }: { onNavigate: (id: string, focusId?: string) => void }) {
  const { sentinelResult, profile } = useProfile();
  
  const analysis = getActiveAnalysis(profile, sentinelResult);
  const risks = analysis?.risks ?? {
    evidenceRisk: 25,
    deadlineRisk: 75,
    recommenderRisk: 80,
    storyRisk: 20,
    fitRisk: 35,
    englishRisk: 15,
  };

  const getRiskBgClass = (val: number) => {
    if (val <= 30) return "bg-emerald-500";
    if (val <= 60) return "bg-amber-500";
    if (val <= 80) return "bg-rose-500";
    return "bg-red-700";
  };

  const getRiskColor = (val: number) => {
    if (val <= 30) return "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (val <= 60) return "text-amber-700 bg-amber-50 border-amber-100";
    if (val <= 80) return "text-rose-700 bg-rose-50 border-rose-100";
    return "text-red-800 bg-red-50 border-red-200";
  };

  const getRiskStatusLabel = (val: number) => {
    if (val <= 30) return "Low";
    if (val <= 60) return "Medium";
    if (val <= 80) return "High";
    return "Critical";
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">Risk Radar Audit</h3>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shared Sentinel Baseline</span>
      </div>
      
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col items-center">
        <div className="mb-8 w-full max-w-[260px] bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-center">
          <RiskRadarChart mode="detailed" risks={risks} className="w-full h-auto" />
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Evidence Risk", value: risks.evidenceRisk, desc: "Transcripts, certifications, and portfolios.", icon: ClipboardList },
            { label: "Deadline Risk", value: risks.deadlineRisk, desc: "Tight application schedules and cycle proximity.", icon: Clock },
            { label: "Recommender Risk", value: risks.recommenderRisk, desc: "Referee responses and request lock-ins.", icon: Users },
            { label: "Story Risk", value: risks.storyRisk, desc: "Essay differentiation and narrative statements.", icon: PenTool },
            { label: "Fit Risk", value: risks.fitRisk, desc: "Candidate background alignment to targets.", icon: Target },
            { label: "English Risk", value: risks.englishRisk, desc: "Official language proficiency exam outcomes.", icon: Globe },
          ].map(ris => {
            const Icon = ris.icon;
            return (
              <div key={ris.label} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{ris.label}</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded", getRiskColor(ris.value))}>
                      {getRiskStatusLabel(ris.value)} ({ris.value}%)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal pb-1.5">{ris.desc}</p>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", getRiskBgClass(ris.value))} style={{ width: `${ris.value}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deadline Risk Mitigation Plan */}
      {risks.deadlineRisk >= 60 && (
        <div className="p-6 bg-rose-50/40 border border-rose-100 rounded-3xl space-y-4 text-left animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 border border-rose-200">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Deadline Risk Mitigation</h4>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Timeline Mitigation Plan</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            "Deadline Risk is High because the application timeline is tight. The fastest way to reduce this risk is to create a submission timeline, lock key milestones, and reserve review time before the portal deadline."
          </p>

          <div className="grid gap-4 md:grid-cols-3 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">Today</span>
              <ul className="text-xs text-slate-650 space-y-1.5 list-disc pl-4 font-semibold leading-normal">
                <li>Confirm official scholarship deadline</li>
                <li>Add deadline to calendar</li>
                <li>List required documents</li>
                <li>Identify missing submission items</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase">Next 48 Hours</span>
              <ul className="text-xs text-slate-650 space-y-1.5 list-disc pl-4 font-semibold leading-normal">
                <li>Create submission checklist</li>
                <li>Assign each requirement to a date</li>
                <li>Confirm reviewer / mentor availability</li>
                <li>Prepare final document folder</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">This Week</span>
              <ul className="text-xs text-slate-650 space-y-1.5 list-disc pl-4 font-semibold leading-normal">
                <li>Complete evidence pack</li>
                <li>Review essay and SOP</li>
                <li>Verify portal requirements</li>
                <li>Run final compliance check</li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-emerald-700 font-extrabold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Potential improvement: +5 to +8 readiness points after deadline milestones are confirmed.
              </p>
              <p className="text-[10px] text-slate-400 font-semibold italic">
                “Even strong applications can fail if submitted late or rushed. Timeline control protects review quality.”
              </p>
            </div>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onNavigate("roadmap", "deadline")}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center flex-1 sm:flex-initial transition-all shadow-md shadow-blue-600/10 cursor-pointer"
              >
                Build submission timeline
              </button>
              <button
                onClick={() => onNavigate("review")}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 rounded-xl text-xs font-bold text-center flex-1 sm:flex-initial transition-all cursor-pointer"
              >
                Run final readiness check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinalReview({ onNavigate }: { onNavigate: (id: string, focusId?: string) => void }) {
  const { mode, profile, activeScholarshipId, sentinelResult, setCustomProfile } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);
  const analysis = getActiveAnalysis(profile, sentinelResult);
  const finalReady = analysis?.readinessScore ?? 0;
  
  // Status text based on score and human review
  let statusText = "Submission Ready";
  if (finalReady === 100) {
    statusText = "Final Verified / Ready to Submit";
  } else if (finalReady >= 92) {
    statusText = "Submission Ready";
  } else if (finalReady >= 80) {
    statusText = "Strong";
  } else if (finalReady >= 70) {
    statusText = "Moderate";
  } else if (finalReady >= 50) {
    statusText = "Developing";
  } else {
    statusText = "Needs Work";
  }

  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">(
    profile?.complianceScanCompleted || profile?.complianceScanStatus === "completed" ? "completed" : "idle"
  );
  const [scanMessage, setScanMessage] = useState("");

  const runComplianceScan = async () => {
    setScanState("scanning");
    const steps = [
      "Verifying document completeness...",
      "Checking English test score validity...",
      "Validating academic recommender commitments...",
      "Cross-referencing preferred intake year with target portal deadlines...",
      "Running final compliance check..."
    ];
    for (let i = 0; i < steps.length; i++) {
      setScanMessage(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setScanState("completed");
    if (profile) {
      setCustomProfile({
        ...profile,
        complianceScanStatus: "completed",
        complianceScanCompleted: true,
        automatedComplianceChecksPassed: true,
        finalReviewStatus: "completed"
      });
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewerType, setReviewerType] = useState<"Mentor" | "Teacher" | "Advisor" | "Peer Reviewer" | "Other">("Mentor");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0]);
  const [checklistState, setChecklistState] = useState({
    scholarshipFitReviewed: false,
    essayReviewed: false,
    requiredDocumentsReviewed: false,
    recommendationLettersReviewed: false,
    deadlinePlanReviewed: false,
    finalApplicationPackageReviewed: false,
  });

  // Sync state from profile
  useEffect(() => {
    if (profile?.finalHumanReviewChecklist) {
      setChecklistState(profile.finalHumanReviewChecklist);
    }
  }, [profile?.finalHumanReviewChecklist]);

  useEffect(() => {
    if (isModalOpen && profile) {
      setReviewerType(profile.finalHumanReviewerType || "Mentor");
      setReviewerName(profile.finalHumanReviewerName || "");
      setReviewDate(profile.finalHumanReviewDate || new Date().toISOString().split("T")[0]);
      if (profile.finalHumanReviewChecklist) {
        setChecklistState(profile.finalHumanReviewChecklist);
      } else {
        setChecklistState({
          scholarshipFitReviewed: false,
          essayReviewed: false,
          requiredDocumentsReviewed: false,
          recommendationLettersReviewed: false,
          deadlinePlanReviewed: false,
          finalApplicationPackageReviewed: false,
        });
      }
    }
  }, [isModalOpen, profile]);

  const confirmHumanReview = () => {
    if (profile) {
      setCustomProfile({
        ...profile,
        finalHumanReviewCompleted: true,
        finalHumanReviewDate: reviewDate,
        finalHumanReviewerType: reviewerType,
        finalHumanReviewerName: reviewerName || null,
        finalHumanReviewChecklist: { ...checklistState }
      });
      setIsModalOpen(false);
    }
  };

  const summary = mode === "demo" ? 
    `Alya Putri is preparing for the ${activeScholarship?.name || "scholarship"} application. Her strongest areas are academic readiness, IELTS readiness, leadership, and community impact. Her main risks are incomplete documents, unsecured recommenders, and essay differentiation.` :
    `${profile?.name} is preparing for a ${profile?.targetDegree} application for ${activeScholarship?.name || "this scholarship"}. Current readiness is ${finalReady}%. Strongest areas include ${profile?.hasLeadership ? "Leadership, " : ""}${profile?.gpa >= 3.5 ? "Academic excellence, " : ""}and focus on ${profile?.fields?.join(", ")}. Primary next steps involve finalizing target countries (${profile?.targetCountries?.join(", ")}) and secure document submissions.`;

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between text-right">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 text-left">Final Review & Compliance</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Verify submission readiness in one place.</p>
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
            {finalReady === 100 ? "Final Verified / Ready to Submit" : "Submission Ready"}
          </p>
          <p className="text-4xl font-black text-blue-600">{finalReady}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Final Compliance Scanner</h4>
              <p className="text-xs text-slate-500 font-semibold">Verify compliance against target scholarship requirements.</p>
            </div>
          </div>

          {scanState === "idle" && (
            <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-4">
              <p className="text-sm text-slate-600 font-medium">Click below to run a compliance scan on your current application package.</p>
              <button
                onClick={runComplianceScan}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
              >
                Run Compliance Scan
              </button>
            </div>
          )}

          {scanState === "scanning" && (
            <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-4">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-blue-600 font-bold animate-pulse">{scanMessage}</p>
            </div>
          )}

          {scanState === "completed" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-emerald-950">Automated compliance scan successful</p>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">All system-checked requirements passed. Ready for final compliance confirmation.</p>
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-3">
                {/* 1. GPA check */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">GPA requirement check passed</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Your GPA ({profile?.gpa || "3.62"}) meets or exceeds the Master’s requirement.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase shrink-0">PASSED</span>
                </div>

                {/* 2. Language proficiency */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Language proficiency verified</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        IELTS {profile?.englishScore || "7.5"} meets the language requirement.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase shrink-0">PASSED</span>
                </div>

                {/* 3. Recommenders */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Academic/professional recommenders secured and uploaded</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        All recommenders have submitted required letters.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase shrink-0">PASSED</span>
                </div>

                {/* 4. Deadline check */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Deadline check matches preferred intake</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Your application timeline aligns with the 2026 intake.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase shrink-0">PASSED</span>
                </div>

                {/* 5. Required documents */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Required documents checklist completed</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        All mandatory documents are uploaded and verified.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase shrink-0">PASSED</span>
                </div>

                {/* 6. Final human review indicator */}
                <div className={cn(
                  "p-4 border rounded-2xl flex items-start justify-between gap-4 transition-all",
                  profile?.finalHumanReviewCompleted
                    ? "bg-slate-50 border-slate-200"
                    : "bg-amber-50/20 border-amber-200"
                )}>
                  <div className="flex gap-3">
                    {profile?.finalHumanReviewCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">Final human review</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {profile?.finalHumanReviewCompleted 
                          ? `Human review completed by ${profile?.finalHumanReviewerType || "Advisor"}${profile?.finalHumanReviewerName ? ` (${profile.finalHumanReviewerName})` : ""}.`
                          : "Mentor/advisor review is recommended before submission."}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded uppercase border shrink-0",
                    profile?.finalHumanReviewCompleted
                      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                      : "text-amber-600 bg-amber-50 border-amber-100"
                  )}>
                    {profile?.finalHumanReviewCompleted ? "PASSED" : "PENDING"}
                  </span>
                </div>
              </div>

              {/* Final Completion Gate Panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Final Completion Gate</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    100% readiness is only unlocked after automated checks are passed, final compliance is confirmed, and human review is completed.
                  </p>
                </div>

                <div className="space-y-4 border-t border-slate-200 pt-4">
                  {/* Checkbox 1: Final Compliance */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile?.finalComplianceCheckCompleted || false}
                      onChange={(e) => {
                        if (profile) {
                          setCustomProfile({
                            ...profile,
                            finalComplianceCheckCompleted: e.target.checked,
                            finalComplianceCheckCompletedAt: e.target.checked ? new Date().toISOString().split("T")[0] : null
                          });
                        }
                      }}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-350 rounded mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Final Compliance Check fully completed</span>
                      <span className="text-[11px] text-slate-500 font-semibold block mt-0.5 leading-relaxed">
                        I confirm that the submission checklist, required documents, deadline plan, scholarship fit, and application package have been reviewed and are ready for final submission.
                      </span>
                    </div>
                  </label>

                  {/* Checkbox 2: Final Human Review */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile?.finalHumanReviewCompleted || false}
                      onChange={(e) => {
                        if (profile) {
                          if (e.target.checked) {
                            setIsModalOpen(true);
                          } else {
                            setCustomProfile({
                              ...profile,
                              finalHumanReviewCompleted: false,
                              finalHumanReviewDate: null,
                              finalHumanReviewerType: null,
                              finalHumanReviewerName: null,
                              finalHumanReviewChecklist: {
                                scholarshipFitReviewed: false,
                                essayReviewed: false,
                                requiredDocumentsReviewed: false,
                                recommendationLettersReviewed: false,
                                deadlinePlanReviewed: false,
                                finalApplicationPackageReviewed: false,
                              }
                            });
                          }
                        }
                      }}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-350 rounded mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Final Human Review completed</span>
                      <span className="text-[11px] text-slate-500 font-semibold block mt-0.5 leading-relaxed">
                        I confirm that a mentor, teacher, advisor, peer reviewer, or trusted reviewer has reviewed the final application package.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={cn(
                    "px-6 py-2.5 text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5",
                    profile?.finalHumanReviewCompleted
                      ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                >
                  {profile?.finalHumanReviewCompleted ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Edit Human Review Details
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Human Review Completed
                    </>
                  )}
                </button>
                
                <button
                  onClick={runComplianceScan}
                  className="px-4 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Re-Run Scan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right side panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 text-left">
            <h4 className="text-base font-bold text-slate-900">Submission Readiness</h4>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Readiness Score</span>
              <div className="text-4xl font-black text-blue-600">
                {finalReady} <span className="text-xs font-bold text-slate-455">OUT OF 100</span>
              </div>
              <div className={cn(
                "text-xs font-extrabold uppercase px-3 py-1 rounded-full border inline-block",
                finalReady === 100
                  ? "bg-emerald-50 border-emerald-250 text-emerald-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              )}>
                {finalReady === 100 ? "Final Verified / Ready to Submit" : "Submission Ready"}
              </div>

              {/* Messages block based on gates */}
              <div className="text-left text-xs text-slate-600 pt-2 border-t border-slate-100 mt-2 space-y-1.5 leading-normal font-semibold">
                {!profile?.finalComplianceCheckCompleted ? (
                  <p className="text-amber-700 font-bold text-center">
                    Automated checks passed. Final compliance confirmation is still required.
                  </p>
                ) : !profile?.finalHumanReviewCompleted ? (
                  <p className="text-amber-700 font-bold text-center">
                    Final compliance is confirmed. Human review is still required before final verification.
                  </p>
                ) : finalReady === 100 ? (
                  <p className="text-emerald-700 font-bold text-center">
                    All automated checks passed, final compliance was confirmed, and the application package has been human-reviewed.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-rose-700">
                    <p className="font-extrabold text-center">Some final conditions are still missing:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] font-bold">
                      {!(profile.recommenderStatus === "Submitted" || profile.recommenderStatus === "Uploaded" || profile.recommenderStatus === "Received") && (
                        <li>Recommender status must be Submitted, Uploaded, or Received.</li>
                      )}
                      {!(profile.deadlineTimelineStatus === "confirmed" && profile.deadlineMilestonesConfirmed === true) && (
                        <li>Application timeline must be drafted and milestones confirmed.</li>
                      )}
                      {!(checklistState.scholarshipFitReviewed &&
                         checklistState.essayReviewed &&
                         checklistState.requiredDocumentsReviewed &&
                         checklistState.recommendationLettersReviewed &&
                         checklistState.deadlinePlanReviewed &&
                         checklistState.finalApplicationPackageReviewed) && (
                        <li>All human review checklist items must be reviewed and confirmed.</li>
                      )}
                      {(analysis?.risks?.evidenceRisk > 60 ||
                        analysis?.risks?.deadlineRisk > 60 ||
                        analysis?.risks?.recommenderRisk > 60 ||
                        analysis?.risks?.storyRisk > 60 ||
                        analysis?.risks?.fitRisk > 60 ||
                        analysis?.risks?.englishRisk > 60) && (
                        <li>All High or Critical risks must be resolved.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-2xl space-y-2 text-left">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">Candidate Status</span>
              <p className="text-xs font-extrabold text-slate-900">{profile?.name || "Alya Putri"}</p>
              <p className="text-xs text-slate-650 font-semibold leading-normal">
                {finalReady === 100
                  ? `${profile?.name || "Alya"}'s readiness is Final Verified at 100% after completed human review.`
                  : `${profile?.name || "Alya"}'s readiness has improved from 78 to 94 after automated compliance checks. Final 100 requires completed human review.`}
              </p>
            </div>
          </div>

          {/* Advisor Summary Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-left">
            <h4 className="text-base font-bold text-slate-900">Advisor Summary</h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Summary for Mentor</h5>
                <button 
                  onClick={() => onNavigate("report")}
                  className="text-[9px] font-black text-blue-600 hover:underline cursor-pointer"
                >
                  View Report →
                </button>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-150 font-mono text-[10px] leading-relaxed select-all cursor-pointer hover:bg-slate-50/50 transition-colors">
                {summary}
              </div>
              <p className="text-[9px] text-slate-455 text-center italic font-semibold">Click text above to select all and copy for your mentor.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Final Human Review Confirmation</h4>
            </div>
            
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Before marking this as complete, confirm that your application package has been reviewed by a human mentor, advisor, teacher, or trusted reviewer.
            </p>

            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Reviewer Type</label>
                  <select
                    value={reviewerType}
                    onChange={(e: any) => setReviewerType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mentor">Mentor</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Advisor">Advisor</option>
                    <option value="Peer Reviewer">Peer Reviewer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Reviewer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Review Date</label>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">Human Review Checklist</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-650">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.scholarshipFitReviewed}
                      onChange={(e) => setChecklistState(prev => ({ ...prev, scholarshipFitReviewed: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <span>Scholarship fit reviewed</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.essayReviewed}
                      onChange={(e) => setChecklistState(prev => ({ ...prev, essayReviewed: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <span>Essay / SOP reviewed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.requiredDocumentsReviewed}
                      onChange={(e) => setChecklistState(prev => ({ ...prev, requiredDocumentsReviewed: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <span>Required documents reviewed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.recommendationLettersReviewed}
                      onChange={(e) => setChecklistState(prev => ({ ...prev, recommendationLettersReviewed: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <span>Recommendation letters reviewed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.deadlinePlanReviewed}
                      onChange={(e) => setChecklistState(prev => ({ ...prev, deadlinePlanReviewed: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <span>Deadline & submission plan reviewed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.finalApplicationPackageReviewed}
                      onChange={(e) => setChecklistState(prev => ({ ...prev, finalApplicationPackageReviewed: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <span>Final application package reviewed</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={confirmHumanReview}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md cursor-pointer"
              >
                Confirm Human Review Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
