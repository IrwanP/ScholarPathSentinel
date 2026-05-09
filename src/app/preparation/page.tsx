import { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { demoStudent, type DocumentStatus } from "@/src/data/demoData";

import { Link } from "react-router-dom";
import { realScholarships } from "../../data/scholarships";

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

import { useProfile } from "../../context/ProfileContext";
import OnePageReport from "../../components/OnePageReport";
import AIScholarshipMentor from "../../components/AIScholarshipMentor";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PreparationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("report");
  const { mode, profile, setIsProfileFormOpen, activeScholarshipId } = useProfile();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      // Map specific hashes to tab IDs if they differ
      const mapping: Record<string, string> = {
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
      if (mapping[hash]) setActiveTab(mapping[hash]);
    }
  }, [location]);

  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);

  if (mode === "empty") {
    return (
      <div className="space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-extrabold text-text-main mb-2">Application Preparation Workspace</h1>
          <p className="text-text-secondary">
            Turn your scholarship target into an actionable roadmap, document plan, essay strategy, and interview preparation.
          </p>
        </header>
        <div className="bg-white rounded-3xl p-12 border border-border-subtle shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-google-blue-light rounded-full flex items-center justify-center mx-auto">
            <ClipboardList className="h-10 w-10 text-google-blue" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-text-main mb-2">Build your Preparation Workspace</h2>
            <p className="text-sm text-text-secondary mb-8">We curate a personalized roadmap and document checklist based on your profile and target scholarships.</p>
            <button 
              onClick={() => setIsProfileFormOpen(true)}
              className="px-8 py-3 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors"
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
          <h1 className="text-3xl font-extrabold text-text-main mb-2">Application Preparation Workspace</h1>
          <p className="text-text-secondary">
            Turn your scholarship target into an actionable roadmap, document plan, essay strategy, and interview preparation.
          </p>
        </header>
        <div className="bg-white rounded-3xl p-12 border border-border-subtle shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <MapIcon className="h-10 w-10 text-text-secondary" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-text-main mb-2">Select a scholarship first</h2>
            <p className="text-sm text-text-secondary mb-8">Select or save a scholarship first to generate your personalized preparation workspace.</p>
            <Link 
              to="/scholarships"
              className="inline-block px-8 py-3 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors"
            >
              Go to Scholarships →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-extrabold text-text-main">Preparation Workspace</h1>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border-subtle shadow-sm mb-6">
          <div className="h-10 w-10 bg-google-green-light rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-google-green" />
          </div>
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Active Scholarship</p>
            <h2 className="text-lg font-bold text-text-main">{activeScholarship.name}</h2>
            <div className="flex gap-3 mt-1">
              <span className="text-xs font-medium text-text-secondary">{activeScholarship.country}</span>
              <span className="text-xs font-bold text-google-blue">{activeScholarship.matchScore}% Match</span>
              <Link to="/scholarships" className="text-xs font-bold text-google-blue hover:underline ml-2">Switch →</Link>
              <button 
                onClick={() => setActiveTab("report")}
                className="text-xs font-bold text-google-green hover:underline ml-2"
              >
                View One-Page Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold whitespace-nowrap transition-all",
              activeTab === section.id
                ? "bg-google-blue-light text-google-blue border border-google-blue/10"
                : "bg-white border border-border-subtle text-text-secondary hover:bg-gray-50 hover:text-text-main"
            )}
          >
            <section.icon className="h-4 w-4" />
            {section.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="p-8"
          >
            {activeTab === "report" && <OnePageReport 
              onNavigate={(id) => {
                const mapping: Record<string, string> = {
                  "one-page-report": "report",
                  "mentor-chat": "mentor",
                  "evidence-gap": "gap",
                  "roadmap": "roadmap",
                  "documents": "documents",
                  "essay": "essay",
                  "interview": "interview",
                  "risk": "risk",
                  "review": "review"
                };
                const tabId = mapping[id] || id;
                setActiveTab(tabId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />}
            {activeTab === "mentor" && <AIScholarshipMentor />}
            {activeTab === "gap" && <EvidenceGap onNavigate={(id) => setActiveTab(id)} />}
            {activeTab === "roadmap" && <Roadmap onNavigate={(id) => setActiveTab(id)} />}
            {activeTab === "documents" && <DocumentChecklist onNavigate={(id) => setActiveTab(id)} />}
            {activeTab === "essay" && <EssayCoach onNavigate={(id) => setActiveTab(id)} />}
            {activeTab === "interview" && <InterviewCoach onNavigate={(id) => setActiveTab(id)} />}
            {activeTab === "risk" && <RiskRadar onNavigate={(id) => setActiveTab(id)} />}
            {activeTab === "review" && <FinalReview onNavigate={(id) => setActiveTab(id)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EvidenceGap({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { mode, profile, activeScholarshipId } = useProfile();
  const navigate = useNavigate();
  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);
  
  const recommendedActions = [
    { label: "Shortlist target programs", path: "/scholarships" },
    { label: "Contact recommenders", path: "roadmap" },
    { label: "Complete documents", path: "documents" },
    { label: "Improve motivation letter", path: "essay" },
    { label: "Practice interview answer", path: "interview" }
  ];

  const strengths = mode === "demo" ? [
    "Your target degree matches this scholarship.",
    "The UK is one of your target countries.",
    "You already have IELTS readiness.",
    "Your leadership and community impact are relevant."
  ] : [
    profile?.gpa && profile.gpa >= 3.5 ? "Strong academic standing (GPA 3.5+)." : "Solid basic academic profile.",
    profile?.targetDegree ? `Clear targeting for ${profile.targetDegree}.` : "Focus set on target degree.",
    profile?.englishStatus !== "Not Taken" ? `Language proficiency confirmed (${profile?.englishStatus}).` : "Language planning in progress.",
    profile?.hasLeadership ? "Has leadership evidence." : null,
    profile?.hasCommunityImpact ? "Has community impact evidence." : null,
  ].filter(Boolean) as string[];

  const gaps = mode === "demo" ? [
    "Career impact story needs more clarity.",
    "University/program rationale is not specific enough.",
    "Recommendation letters are not yet secured.",
    "Essay needs stronger differentiation."
  ] : [
    !profile?.hasResearch ? "Missing research experience artifacts." : null,
    !profile?.hasWorkExperience ? "Lean professional experience for high-tier awards." : null,
    "Refining scholarship-specific motivation letters.",
    "Securing final commitment from 2 recommenders."
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-text-main">Evidence Gap Analyzer</h3>
        <span className="px-3 py-1 bg-green-50 text-google-green text-xs font-bold rounded-full">{activeScholarship?.fitCategory}: {activeScholarship?.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-bold text-text-main text-sm uppercase tracking-wider">Competitive Strengths</h4>
          {strengths.map(item => (
            <div key={item} className="flex gap-3 p-3 bg-green-50/50 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-google-green shrink-0" />
              <span className="text-sm font-medium text-text-main">{item}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-text-main text-sm uppercase tracking-wider text-google-red">Evidence Gaps</h4>
          {gaps.map(item => (
            <div key={item} className="flex gap-3 p-3 bg-red-50/50 rounded-xl">
              <AlertCircle className="h-5 w-5 text-google-red shrink-0" />
              <span className="text-sm font-medium text-text-main">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-google-blue/5 rounded-2xl p-6 border border-google-blue/10">
        <h4 className="font-bold text-google-blue mb-4">Recommended Next Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendedActions.map((action, i) => (
            <button 
              key={i} 
              onClick={() => action.path.startsWith("/") ? navigate(action.path) : onNavigate(action.path)}
              className="flex gap-3 items-center p-3 bg-white rounded-xl shadow-sm border border-border-subtle hover:border-google-blue hover:bg-gray-50 transition-all text-left group"
            >
              <div className="h-6 w-6 rounded-full bg-google-blue text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">{i + 1}</div>
              <span className="text-sm font-medium text-text-main flex-1">{action.label}</span>
              <ArrowRight className="h-4 w-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Roadmap({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { mode, profile } = useProfile();
  const readiness = profile?.readinessScore || 0;
  const progress = mode === "demo" ? 22 : Math.floor(readiness * 0.2);

  const steps = [
    { name: "Confirm eligibility", status: "Completed" },
    { name: "Shortlist target programs", status: "In Progress" },
    { name: "Prepare academic transcript", status: "In Progress" },
    { name: "Prepare degree certificate", status: "In Progress" },
    { name: "Prepare CV/resume", status: "In Progress" },
    { name: "Prepare English test", status: "Completed" },
    { name: "Contact recommenders", status: "Not Started" },
    { name: "Draft personal statement", status: "Not Started" },
    { name: "Review essay", status: "Not Started" },
    { name: "Submit application", status: "Not Started" },
    { name: "Prepare interview", status: "Not Started" },
    { name: "Track result", status: "Not Started" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-text-main">Application Roadmap</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-secondary">Progress:</span>
          <span className="text-xl font-black text-google-blue">{progress}%</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
        <div className="space-y-6 relative">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10",
                step.status === "Completed" ? "bg-google-green" : 
                step.status === "In Progress" ? "bg-google-blue" : "bg-gray-200"
              )}>
                {step.status === "Completed" ? <CheckCircle2 className="h-6 w-6 text-white" /> : 
                 step.status === "In Progress" ? <Clock className="h-6 w-6 text-white animate-pulse" /> : null}
              </div>
              <div className="flex-1 p-4 rounded-2xl bg-white border border-border-subtle hover:border-google-blue/20 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-main">{step.name}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                    step.status === "Completed" ? "bg-green-50 text-google-green" : 
                    step.status === "In Progress" ? "bg-blue-50 text-google-blue" : "bg-gray-50 text-text-secondary"
                  )}>{step.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentChecklist({ onNavigate }: { onNavigate: (id: string) => void }) {
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
        <h3 className="text-2xl font-bold text-text-main">Document Checklist</h3>
        <div className="text-right">
          <p className="text-xs font-bold text-text-secondary uppercase">Rediness</p>
          <p className="text-xl font-black text-google-blue">{readiness}%</p>
        </div>
      </div>

      <div className="space-y-8">
        {groups.map(group => (
          <div key={group.name} className="space-y-4">
            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-1">{group.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.docs.map(doc => (
                <div key={doc.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-google-blue/10 transition-all">
                  <span className="font-semibold text-text-main">{doc.name}</span>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full",
                    doc.status === "Ready" ? "bg-google-green text-white" :
                    doc.status === "Drafting" ? "bg-google-yellow text-text-main" :
                    doc.status === "Needs Review" ? "bg-google-red text-white" :
                    "bg-white border border-border-subtle text-text-secondary"
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

function EssayCoach({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { mode, profile } = useProfile();
  
  const advice = mode === "demo" ? [
    { title: "Story Angle", content: "Focus on your bridge between Data Science and Public Policy in Indonesia." },
    { title: "Evidence Map", content: "Connect your internship data project with local government impact stats." },
    { title: "Key Messages", content: "Integrity in data governance, sustainable development leadership." },
    { title: "Weakness Warning", content: "Avoid generic enthusiasm. Be specific about UK university choices." }
  ] : [
    { title: "Personal Brand", content: `Bridge your background in ${profile?.origin} with ${profile?.fields.join(" & ") || "your field"}.` },
    { title: "Evidence Focus", content: profile?.hasLeadership ? "Highlight your leadership initiative in the essays." : "Focus on your academic consistency and research potential." },
    { title: "Intake Strategy", content: `Prepare for the ${profile?.preferredIntakeYear} intake cycle with specific program alignment.` },
    { title: "Authenticity Tip", content: "Don't just list achievements; tell the story of the challenge and your specific role in the solution." }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-text-main">Authentic Essay Coach</h3>
      <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
        <p className="text-sm font-bold text-google-blue mb-4 flex items-center gap-2 italic">
          <AlertCircle className="h-4 w-4" />
          Our Principle: We do not fabricate achievements or generate fake final essays.
        </p>
        <p className="text-sm text-text-main leading-relaxed">
          We guide you to write from your real experiences, ensuring your voice remains authentic to the selection committee.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {advice.map(item => (
          <div key={item.title} className="p-6 rounded-2xl border border-border-subtle space-y-2">
            <h4 className="font-bold text-text-main">{item.title}</h4>
            <p className="text-sm text-text-secondary">{item.content}</p>
          </div>
        ))}
      </div>

      <div className="p-6 border border-google-blue/20 rounded-3xl bg-white shadow-sm space-y-4">
        <h4 className="font-bold text-google-blue uppercase text-xs tracking-widest">Suggested Opening Direction</h4>
        <p className="text-sm text-text-secondary italic">
          "When Indonesia launched its One Data policy in 2019, I was working on a small data project for my local community..."
        </p>
      </div>
    </div>
  );
}

function InterviewCoach({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { mode, profile } = useProfile();
  const score = mode === "demo" ? 72 : Math.floor((profile?.readinessScore || 0) * 0.85);

  const qSet = [
    { cat: "Motivation", q: `Why did you choose ${profile?.targetDegree} in ${profile?.targetCountries?.[0] || "your target country"}?` },
    { cat: "Leadership", q: profile?.hasLeadership ? "Describe your leadership approach during your most impactful project." : "How do you handle team disagreements when working toward a deadline?" },
    { cat: "Contribution", q: `How will your studies in ${profile?.fields?.[0] || "this field"} benefit ${profile?.origin || "your home country"}?` }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-text-main">Interview Coach</h3>
        <div className="bg-surface px-4 py-2 rounded-xl border border-border-subtle">
          <span className="text-sm font-bold text-text-secondary mr-2">Score:</span>
          <span className="text-2xl font-black text-google-green">{score}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {qSet.map((item, i) => (
          <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-google-blue/10 transition-all">
            <p className="text-[10px] font-bold text-google-blue uppercase mb-1">{item.cat}</p>
            <p className="font-bold text-text-main mb-4">{item.q}</p>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-text-secondary uppercase">Suggested STAR Structure</p>
              <div className="flex flex-wrap gap-2">
                {["Situation", "Task", "Action", "Result"].map(s => (
                  <span key={s} className="px-3 py-1 bg-white border border-border-subtle rounded text-[10px] font-bold text-text-secondary">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskRadar({ onNavigate }: { onNavigate: (id: string) => void }) {
  const risks = [
    { l: "Deadline Risk", v: 30, color: "bg-google-green" },
    { l: "Eligibility Risk", v: 10, color: "bg-google-green" },
    { l: "Document Risk", v: 65, color: "bg-google-yellow" },
    { l: "Essay Risk", v: 40, color: "bg-google-yellow" },
    { l: "Recommendation Risk", v: 85, color: "bg-google-red" },
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-text-main">Risk Radar</h3>
      <div className="p-8 rounded-3xl bg-gray-50 border border-border-subtle flex flex-col items-center">
        <div className="relative h-64 w-64 rounded-full border-4 border-white shadow-inner bg-white/50 flex items-center justify-center overflow-hidden mb-8">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            {[1, 2, 3, 4].map(n => <div key={n} className="absolute border border-text-main rounded-full" style={{ width: n*50, height: n*50 }} />)}
          </div>
          <Radar className="h-12 w-12 text-google-blue animate-pulse" />
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map(ris => (
            <div key={ris.l} className="space-y-1">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider px-1">
                <span>{ris.l}</span>
                <span>{ris.v}%</span>
              </div>
              <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-border-subtle">
                <div className={cn("h-full rounded-full transition-all", ris.color)} style={{ width: `${ris.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinalReview({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { mode, profile, activeScholarshipId } = useProfile();
  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);
  const finalReady = mode === "demo" ? 76 : Math.floor((profile?.readinessScore || 0) * 0.9);
  const status = finalReady >= 80 ? "Ready for Mentor Review" : finalReady >= 50 ? "Almost Ready" : "Building Core Profile";

  const summary = mode === "demo" ? 
    `Alya Putri is preparing for the ${activeScholarship?.name || "scholarship"} application. Her strongest areas are academic readiness, IELTS readiness, leadership, and community impact. Her main risks are incomplete documents, unsecured recommenders, and essay differentiation.` :
    `${profile?.name} is preparing for a ${profile?.targetDegree} application for ${activeScholarship?.name || "this scholarship"}. Current readiness is ${finalReady}%. Strongest areas include ${profile?.hasLeadership ? "Leadership, " : ""}${profile?.gpa >= 3.5 ? "Academic excellence, " : ""}and focus on ${profile?.fields?.join(", ")}. Primary next steps involve finalizing target countries (${profile?.targetCountries?.join(", ")}) and secure document submissions.`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-right">
        <h3 className="text-2xl font-bold text-text-main text-left">Final Review</h3>
        <div>
          <p className="text-sm font-bold text-google-green uppercase">{status}</p>
          <p className="text-4xl font-black text-google-blue">{finalReady}%</p>
        </div>
      </div>

      <div className="bg-surface rounded-3xl p-8 border-2 border-dashed border-google-blue/30 space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-google-blue" />
          <h4 className="text-xl font-bold text-text-main">Ready for Mentor Review</h4>
        </div>
        
        <div className="p-6 bg-gray-50 rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-text-secondary uppercase text-[10px] tracking-widest">Summary for Mentor</h5>
            <button 
              onClick={() => onNavigate("report")}
              className="text-[10px] font-bold text-google-blue hover:underline"
            >
              View One-Page Report →
            </button>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border-subtle font-mono text-sm leading-relaxed select-all cursor-pointer hover:bg-gray-50 transition-colors">
            {summary}
          </div>
          <p className="text-[10px] text-text-secondary text-center italic">Click text above to select all and copy for your mentor.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Finalize 3 target programs",
            "Contact two recommenders",
            "Complete document checklist",
            "Draft full personal statement",
            "Verify official requirements"
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-3 bg-white border border-border-subtle rounded-xl items-center">
              <div className="h-6 w-6 rounded-full bg-google-blue/10 text-google-blue flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <span className="text-sm font-medium text-text-main">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
