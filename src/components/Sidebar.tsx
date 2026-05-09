import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Search, 
  Dna, 
  ClipboardCheck, 
  ShieldCheck,
  GraduationCap
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: BarChart3 },
  { name: "Scholarships", href: "/scholarships", icon: Search },
  { name: "Readiness", href: "/readiness", icon: Dna },
  { name: "Preparation", href: "/preparation", icon: ClipboardCheck },
  { name: "Trust & Data", href: "/trust", icon: ShieldCheck },
];

import { useProfile } from "../context/ProfileContext";

export default function Sidebar() {
  const location = useLocation();
  const { mode, profile, setIsProfileFormOpen } = useProfile();

  const displayName = profile?.name || (mode === "empty" ? "Student" : "Student");
  const displaySummary = profile 
    ? `${profile.origin} • ${profile.targetDegree || "Targeting..."}` 
    : (mode === "empty" ? "Create your profile" : "");
  const avatarInitial = displayName.charAt(0);

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-border-subtle shrink-0 print:hidden">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-google-blue rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-text-main">ScholarPath AI</span>
      </div>
      <nav className="flex flex-1 flex-col px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-google-blue-light text-google-blue"
                  : "text-text-secondary hover:bg-gray-50 hover:text-text-main"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0",
                isActive ? "text-google-blue" : "text-text-secondary group-hover:text-text-main"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border-subtle">
        <button 
          onClick={() => mode === "empty" && setIsProfileFormOpen(true)}
          className={cn(
            "w-full bg-gray-100 rounded-lg p-3 flex items-center gap-3 text-left transition-colors",
            mode === "empty" && "hover:bg-gray-200"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-google-red text-white flex items-center justify-center font-bold text-sm shrink-0">
            {avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-main truncate">{displayName}</p>
            <p className="text-[10px] text-text-secondary truncate">{displaySummary}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
