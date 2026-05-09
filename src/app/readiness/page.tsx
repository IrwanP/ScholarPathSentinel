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

export default function ReadinessPage() {
  const { mode, profile, setIsProfileFormOpen } = useProfile();

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

  const generateDimensions = () => {
    if (mode === "demo") return [
      { name: "Academic Strength", score: 90, status: "Strong" },
      { name: "English Readiness", score: 85, status: "Strong" },
      { name: "Leadership Evidence", score: 88, status: "Strong" },
      { name: "Community Impact", score: 82, status: "Strong" },
      { name: "Research Potential", score: 75, status: "Moderate" },
      { name: "Career Clarity", score: 70, status: "Moderate" },
      { name: "Document Readiness", score: 38, status: "Needs Attention" },
      { name: "Essay Readiness", score: 45, status: "Needs Attention" },
    ];

    if (!profile) return [];

    return [
      { name: "Academic Strength", score: profile.gpa >= 3.5 ? 90 : profile.gpa >= 3.0 ? 75 : 50, status: profile.gpa >= 3.5 ? "Strong" : "Moderate" },
      { name: "English Readiness", score: profile.englishStatus !== "Not Taken" ? 85 : 10, status: profile.englishStatus !== "Not Taken" ? "Strong" : "Needs Attention" },
      { name: "Leadership Evidence", score: profile.hasLeadership ? 88 : 30, status: profile.hasLeadership ? "Strong" : "Needs Attention" },
      { name: "Community Impact", score: profile.hasCommunityImpact ? 82 : 25, status: profile.hasCommunityImpact ? "Strong" : "Needs Attention" },
      { name: "Research Potential", score: profile.hasResearch ? 75 : 20, status: profile.hasResearch ? "Moderate" : "Needs Attention" },
      { name: "Work Experience", score: profile.hasWorkExperience ? 80 : 40, status: profile.hasWorkExperience ? "Strong" : "Moderate" },
      { name: "Planning Depth", score: profile.targetCountries.length > 0 ? 80 : 30, status: profile.targetCountries.length > 0 ? "Strong" : "Needs Attention" },
      { name: "Financial Positioning", score: profile.hasFinancialNeed ? 90 : 50, status: "Ready" },
    ];
  };

  const readinessDimensions = generateDimensions();
  const readiness = profile?.readinessScore || 0;

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
              <h2 className="text-xl font-bold text-text-main">Overall Readiness</h2>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-google-blue">{readiness}%</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded",
                  readiness >= 80 ? "text-google-green bg-google-green-light" : 
                  readiness >= 60 ? "text-google-yellow bg-google-yellow-light" : 
                  "text-google-red bg-red-50"
                )}>
                  {readiness >= 80 ? "High" : readiness >= 60 ? "Moderate" : "Action Required"}
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
                      dim.score >= 80 ? "text-google-green" : dim.score >= 60 ? "text-google-yellow" : "text-google-red"
                    )}>{dim.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-colors",
                        dim.score >= 80 ? "bg-google-green" : dim.score >= 60 ? "bg-google-yellow" : "bg-google-red"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
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

          <div className="bg-google-blue rounded-2xl p-6 text-white shadow-md shadow-google-blue/10">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4" />
              Next Best Action
            </h3>
            <p className="text-xs text-blue-100 mb-6 leading-relaxed">
              Contact two recommenders and shortlist three target programs this week to maintain your application momentum.
            </p>
            <div className="space-y-2">
              <Link to="/scholarships" className="flex items-center justify-between w-full p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold text-xs">
                View Matches
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/preparation" className="flex items-center justify-between w-full p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold text-xs">
                Go to Preparation
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <div className="bg-google-green-light/50 rounded-2xl p-6 border border-google-green-light">
          <h3 className="text-google-green-text font-bold mb-4 text-sm uppercase tracking-widest">Strongest Areas</h3>
          <ul className="space-y-3">
            {["Academic readiness", "English readiness", "Leadership evidence", "Community impact"].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-text-main">
                <CheckCircle2 className="h-4 w-4 text-google-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
          <h3 className="text-google-red font-bold mb-4 text-sm uppercase tracking-widest">Needs Attention</h3>
          <ul className="space-y-3">
            {["Essay differentiation", "Recommendation letters", "Program shortlist", "Career impact story"].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-text-main">
                <AlertCircle className="h-4 w-4 text-google-red" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
