import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Dna, 
  Search, 
  Map as MapIcon, 
  FileText, 
  MessageSquare, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useProfile } from "../context/ProfileContext";

const features = [
  { name: "Scholarship Matches", icon: Search, desc: "Find scholarships that fit your profile." },
  { name: "Readiness DNA", icon: Dna, desc: "Analyze your strengths and gaps." },
  { name: "Evidence Gap Analyzer", icon: FileText, desc: "Identify missing artifacts." },
  { name: "Application Roadmap", icon: MapIcon, desc: "Track every step of your journey." },
  { name: "Authentic Essay Coach", icon: MessageSquare, desc: "Build stories from real experiences." },
  { name: "Final Readiness Review", icon: CheckCircle2, desc: "Double-check before submission." },
];

export default function OverviewPage() {
  const { mode, profile, setDemoMode, setIsProfileFormOpen, clearProfile } = useProfile();
  const navigate = useNavigate();

  const handleStart = () => {
    if (mode === "empty") {
      setIsProfileFormOpen(true);
    } else {
      navigate("/readiness");
    }
  };

  const readiness = profile?.readinessScore || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border-subtle rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm"
      >
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-text-main mb-3 leading-tight">
            From scholarship confusion to submission readiness.
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            ScholarPath AI helps you navigate scattered info, identify evidence gaps, and master your essays with authentic AI guidance. Explore matches curated for your profile.
          </p>
          
          {mode === "empty" ? (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 border border-dashed border-border-subtle rounded-xl text-center">
                <p className="text-sm font-medium text-text-secondary mb-4">Create your profile to generate your unique scholarship readiness journey.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button 
                    onClick={() => setIsProfileFormOpen(true)}
                    className="px-6 py-2.5 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors"
                  >
                    Create My Profile
                  </button>
                  <button 
                    onClick={setDemoMode}
                    className="px-6 py-2.5 bg-white border border-border-subtle text-text-main rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Try Demo as Alya
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <div className="text-xs font-bold text-google-blue px-3 py-1.5 bg-google-blue-light rounded-md">
                  GPA {profile?.gpa.toFixed(2)}
                </div>
                <div className="text-xs font-bold text-google-blue px-3 py-1.5 bg-google-blue-light rounded-md">
                  {profile?.englishStatus} {profile?.englishScore}
                </div>
                {profile?.fields && profile.fields.length > 0 ? (
                  <div className="text-xs font-bold text-google-blue px-3 py-1.5 bg-google-blue-light rounded-md">
                    {profile.fields[0]}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleStart}
                  className="px-6 py-2.5 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Go to My Roadmap <ArrowRight className="h-4 w-4" />
                </button>
                <Link 
                  to="/preparation#one-page-report"
                  className="px-6 py-2.5 bg-white border border-google-blue text-google-blue rounded-xl text-sm font-bold hover:bg-google-blue-light transition-colors flex items-center gap-2"
                >
                  View One-Page Report
                </Link>
                {mode === "demo" ? (
                  <button 
                    onClick={() => setIsProfileFormOpen(true)}
                    className="px-6 py-2.5 bg-white border border-border-subtle text-text-main rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Use My Own Profile
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsProfileFormOpen(true)}
                    className="px-6 py-2.5 bg-white border border-border-subtle text-text-main rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Edit My Profile
                  </button>
                )}
                <button 
                  onClick={clearProfile}
                  className="px-4 py-2.5 text-text-secondary hover:text-google-red text-xs font-bold transition-colors"
                >
                  Reset Profile
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center md:border-l border-border-subtle md:pl-10 shrink-0">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#F1F3F4" strokeWidth="8" fill="none" />
              <circle 
                cx="56" 
                cy="56" 
                r="48" 
                stroke={readiness >= 80 ? "#34A853" : readiness >= 60 ? "#FBBC04" : "#EA4335"} 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray="301.59" 
                strokeDashoffset={301.59 * (1 - readiness / 100)} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-text-main">{readiness}%</span>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mt-3">Readiness DNA</p>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Roadmap Progress", value: mode === 'demo' ? `22%` : `${Math.floor(readiness * 0.2)}%`, color: "bg-google-yellow" },
          { label: "Docs Readiness", value: mode === 'demo' ? `38%` : `${Math.floor(readiness * 0.4)}%`, color: "bg-google-blue" },
          { label: "Interview Score", value: mode === 'demo' ? `72%` : `${Math.floor(readiness * 0.8)}%`, color: "bg-google-green" },
          { label: "Final Review", value: mode === 'demo' ? `76%` : `${Math.floor(readiness * 0.9)}%`, color: "bg-google-green" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-text-main leading-none">{stat.value}</span>
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full", stat.color)} style={{ width: stat.value }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Features List */}
        <div className="lg:col-span-2 bg-white border border-border-subtle rounded-2xl flex flex-col shadow-sm">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="font-bold text-text-main">Top Features</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Link 
                key={feature.name}
                to={feature.name === "Scholarship Matches" ? "/scholarships" : feature.name === "Readiness DNA" ? "/readiness" : "/preparation"}
                className="p-4 border border-border-subtle rounded-xl flex items-start gap-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-google-blue-light rounded-lg">
                  <feature.icon className="h-5 w-5 text-google-blue" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main group-hover:text-google-blue transition-colors">{feature.name}</h4>
                  <p className="text-[11px] text-text-secondary leading-tight mt-1">{feature.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-white border border-border-subtle rounded-2xl flex flex-col shadow-sm">
          <div className="p-5 border-b border-border-subtle">
            <h3 className="font-bold text-text-main">Next Best Actions</h3>
          </div>
          <div className="p-5 space-y-5">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-google-yellow shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-text-main">Finalize target programs</p>
                  <p className="text-[10px] text-text-secondary">Shortlist 3 eligible UK master’s programs for Chevening.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-google-blue shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-text-main">Contact recommenders</p>
                  <p className="text-[10px] text-text-secondary">Reach out to 2 academic/professional references this week.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded border-2 border-border-subtle shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-text-main">Draft leadership story</p>
                  <p className="text-[10px] text-text-secondary">Start your first draft using the Evidence Gap Analyzer.</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Risk Radar Snippet</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-text-secondary">Deadline Risk</span>
                  <span className="text-google-green font-bold">Low</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-text-secondary">Document Risk</span>
                  <span className="text-google-yellow font-bold">Medium</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-text-secondary">Recommendation Risk</span>
                  <span className="text-google-red font-bold">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
