import { motion } from "motion/react";
import { 
  ShieldCheck, 
  ExternalLink, 
  Database, 
  Cpu, 
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const badges = [
  { name: "Official Data", icon: Database, color: "text-google-blue" },
  { name: "AI Guidance", icon: Cpu, color: "text-google-green" },
  { name: "Local Storage", icon: HardDrive, color: "text-google-yellow" },
  { name: "Cloud Ready", icon: Cloud, color: "text-google-red" },
];

export default function TrustPage() {
  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold text-text-main mb-2">Trust & Data</h1>
        <p className="text-text-secondary">
          Understand how ScholarPath AI uses scholarship data, AI guidance, and local storage.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map(badge => (
          <div key={badge.name} className="p-6 bg-white rounded-2xl border border-border-subtle shadow-sm flex flex-col items-center text-center space-y-3 hover:border-google-blue/20 transition-colors">
            <badge.icon className={cn("h-8 w-8", badge.color)} />
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">{badge.name}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Database className="h-5 w-5 text-google-blue" />
              Data & AI Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50/50 border border-border-subtle">
                <p className="text-[10px] font-bold text-text-secondary uppercase mb-1 tracking-tight">Current Data Mode</p>
                <p className="text-sm font-bold text-text-main">Official Real Scholarships Dataset</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50/50 border border-border-subtle">
                <p className="text-[10px] font-bold text-text-secondary uppercase mb-1 tracking-tight">AI Mentor Mode</p>
                <p className="text-sm font-bold text-text-main">Gemini with Rule-Based Fallback</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50/50 border border-border-subtle">
                <p className="text-[10px] font-bold text-text-secondary uppercase mb-1 tracking-tight">Storage Strategy</p>
                <p className="text-sm font-bold text-text-main">Local Browser (localStorage)</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50/50 border border-border-subtle">
                <p className="text-[10px] font-bold text-text-secondary uppercase mb-1 tracking-tight">Dataset Last Curated</p>
                <p className="text-sm font-bold text-text-main">May 2024 (Verified Sources)</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-google-green" />
              Service Disclosures & Methodology
            </h3>
            <div className="space-y-4 text-[13px] text-text-secondary leading-relaxed">
              <p className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                <span className="font-bold">Real Scholarship Intelligence:</span> Matches are calculated using official attributes including region, target degree, and academic fit.
              </p>
              <p className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                <span className="font-bold">AI Scholarship Mentor:</span> Utilizes Gemini AI models to provide personalized preparation feedback. If Gemini is unavailable, standard preparation rules are used.
              </p>
              <p className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                <span className="font-bold">Local Data Integrity:</span> Your chat history and mentor summaries are stored locally in your browser.
              </p>
              <p className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-google-green shrink-0 mt-0.5" />
                <span className="font-bold">No Hidden Fees:</span> ScholarPath AI is free and open-source, intended for student preparation use without paid API requirements.
              </p>
            </div>
          </section>

          <section className="p-6 bg-red-50/50 rounded-2xl border border-red-100 flex gap-4">
            <AlertTriangle className="h-5 w-5 text-google-red shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-google-red uppercase tracking-wider">Legal Disclaimer</h4>
              <p className="text-xs text-red-900/80 leading-relaxed italic">
                Scholarship information changes frequently. Always verify final eligibility, deadlines, and requirements on the official scholarship website. ScholarPath AI does not guarantee scholarship success; we are a preparation tool.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
