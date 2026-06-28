import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Search,
  Dna,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  GraduationCap
} from "lucide-react";

import { cn } from "../lib/utils";
import { useProfile } from "../context/ProfileContext";

const navigation = [
  { name: "Overview", href: "/", icon: BarChart3 },
  { name: "Scholarships", href: "/scholarships", icon: Search },
  { name: "Readiness", href: "/readiness", icon: Dna },
  { name: "Preparation", href: "/preparation", icon: ClipboardCheck },
  { name: "Trust & Data", href: "/trust", icon: ShieldCheck },
  { name: "Sentinel", href: "/sentinel", icon: Sparkles }
];

export default function Sidebar() {
  const location = useLocation();
  const { mode, profile, setIsProfileFormOpen } = useProfile();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [profile?.profilePhotoUrl]);

  const displayName = profile?.name || "Student";

  const displaySummary = profile
    ? [profile.origin, profile.targetDegree].filter(Boolean).join(" • ")
    : mode === "empty"
      ? "Create your profile"
      : "Profile not loaded";

  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 h-screen w-72 shrink-0 flex flex-col border-r border-gray-200 bg-white z-30">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-google-blue text-white">
          <GraduationCap size={22} />
        </div>

        <div className="min-w-0">
          <h1 className="truncate font-bold text-text-main">
            ScholarPath Sentinel
          </h1>
          <p className="truncate text-xs text-text-secondary">
            Agentic scholarship studio
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          const isSentinel = item.name === "Sentinel";

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border-l-4",
                isSentinel
                  ? isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50/30 text-google-blue border-google-blue shadow-sm shadow-blue-500/5"
                    : "text-slate-650 bg-slate-50/40 hover:bg-slate-50 hover:text-slate-900 border-slate-100 hover:border-slate-350"
                  : isActive
                    ? "bg-google-blue-light text-google-blue border-google-blue"
                    : "text-text-secondary hover:bg-gray-50 hover:text-text-main border-transparent"
              )}
            >
              <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-105", isSentinel && "text-indigo-600")} />
              <span>{item.name}</span>
              {isSentinel && (
                <span className={cn(
                  "ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider",
                  isActive
                    ? "bg-blue-100 text-blue-800"
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                )}>
                  AGENTIC
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 shrink-0 bg-white">
        <button
          type="button"
          onClick={() => setIsProfileFormOpen(true)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-gray-100 p-3 text-left transition-colors hover:bg-gray-200"
          aria-label="Open student profile form"
          title="Edit profile"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-google-red text-lg font-bold text-white relative">
            {profile?.profilePhotoUrl && !imageError ? (
              <img
                src={profile.profilePhotoUrl}
                alt=""
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              avatarInitial
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text-main">
              {displayName}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {displaySummary}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}