import React, { createContext, useContext, useState, useEffect } from "react";
import { ProfileMode, StudentProfile, AppState } from "../types";
import { demoStudent } from "../data/demoData";

interface ProfileContextType {
  mode: ProfileMode;
  profile: StudentProfile | null;
  savedScholarshipIds: string[];
  activeScholarshipId: string | null;
  setDemoMode: () => void;
  setCustomProfile: (profile: StudentProfile) => void;
  clearProfile: () => void;
  isProfileFormOpen: boolean;
  setIsProfileFormOpen: (open: boolean) => void;
  calculateReadiness: (profile: StudentProfile) => number;
  toggleSaveScholarship: (id: string, name?: string) => void;
  setActiveScholarship: (id: string, name?: string) => void;
  handleAnalyzeFit: (id: string, name: string) => void;
  feedback: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: "scholarpath_profile",
  MODE: "scholarpath_profile_mode",
  SAVED_IDS: "scholarpath_saved_scholarships",
  ACTIVE_ID: "scholarpath_active_scholarship",
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ProfileMode>("empty");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [activeScholarshipId, setActiveScholarshipId] = useState<string | null>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as ProfileMode;
    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const savedIds = localStorage.getItem(STORAGE_KEYS.SAVED_IDS);
    const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);

    if (savedMode === "demo") {
      setMode("demo");
      setProfile(demoStudent as unknown as StudentProfile);
      setSavedScholarshipIds(["chevening", "erasmus-mundus"]);
      setActiveScholarshipId("chevening");
    } else if (savedMode === "custom" && savedProfile) {
      setMode("custom");
      setProfile(JSON.parse(savedProfile));
      if (savedIds) setSavedScholarshipIds(JSON.parse(savedIds));
      if (savedActiveId) setActiveScholarshipId(savedActiveId);
    } else {
      setMode("empty");
      setProfile(null);
      setSavedScholarshipIds([]);
      setActiveScholarshipId(null);
    }
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const calculateReadiness = (p: StudentProfile): number => {
    let score = 0;
    // GPA
    if (p.gpa >= 3.7) score += 20;
    else if (p.gpa >= 3.3) score += 15;
    else if (p.gpa >= 3.0) score += 10;

    // English
    if (p.englishStatus !== "Not Taken" && p.englishScore) score += 20;

    // Experiences
    if (p.hasLeadership) score += 15;
    if (p.hasResearch) score += 10;
    if (p.hasCommunityImpact) score += 10;
    
    // Planning
    if (p.targetDegree && p.targetCountries.length > 0) score += 15;

    return Math.min(score, 100);
  };

  const setDemoMode = () => {
    setMode("demo");
    const demo = {
      ...demoStudent,
      currentEducation: "Bachelor's",
      englishStatus: "IELTS",
      englishScore: "7.0",
      hasLeadership: true,
      hasResearch: true,
      hasCommunityImpact: true,
      hasWorkExperience: true,
      hasFinancialNeed: false,
      preferredIntakeYear: "2025",
      readinessScore: 82,
    } as unknown as StudentProfile;
    setProfile(demo);
    setSavedScholarshipIds(["chevening", "erasmus-mundus"]);
    setActiveScholarshipId("chevening");
    localStorage.setItem(STORAGE_KEYS.MODE, "demo");
    localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify(["chevening", "erasmus-mundus"]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, "chevening");
  };

  const setCustomProfile = (newProfile: StudentProfile) => {
    const readiness = calculateReadiness(newProfile);
    const profileWithScore = { ...newProfile, readinessScore: readiness };
    setMode("custom");
    setProfile(profileWithScore);
    localStorage.setItem(STORAGE_KEYS.MODE, "custom");
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileWithScore));
    setIsProfileFormOpen(false);
  };

  const clearProfile = () => {
    setMode("empty");
    setProfile(null);
    setSavedScholarshipIds([]);
    setActiveScholarshipId(null);
    localStorage.removeItem(STORAGE_KEYS.MODE);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SAVED_IDS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
  };

  const toggleSaveScholarship = (id: string, name?: string) => {
    setSavedScholarshipIds(prev => {
      const isSaved = prev.includes(id);
      let next: string[];
      if (isSaved) {
        next = prev.filter(item => item !== id);
        showFeedback(`${name || "Scholarship"} removed from your roadmap.`);
        if (activeScholarshipId === id) {
          const nextActive = next.length > 0 ? next[0] : null;
          setActiveScholarshipId(nextActive);
          if (nextActive) localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, nextActive);
          else localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
        }
      } else {
        next = [...prev, id];
        if (!activeScholarshipId) {
          setActiveScholarshipId(id);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
          showFeedback(`${name || "Scholarship"} has been saved to your roadmap and set as your active scholarship.`);
        } else {
          showFeedback(`${name || "Scholarship"} has been saved to your roadmap. You can track multiple saved scholarships, but only one scholarship can be Set as Active for Preparation at a time.`);
        }
      }
      localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify(next));
      return next;
    });
  };

  const setActiveScholarship = (id: string, name?: string) => {
    setActiveScholarshipId(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    showFeedback(`${name || "Scholarship"} is now active for preparation.`);
  };

  const handleAnalyzeFit = (id: string, name: string) => {
    // 1. Set active scholarship
    setActiveScholarshipId(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);

    // 2. Save if not already saved
    setSavedScholarshipIds(prev => {
      if (!prev.includes(id)) {
        const next = [...prev, id];
        localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify(next));
        return next;
      }
      return prev;
    });

    showFeedback(`${name} is now active for fit analysis.`);
  };

  return (
    <ProfileContext.Provider 
      value={{ 
        mode, 
        profile, 
        savedScholarshipIds,
        activeScholarshipId,
        setDemoMode, 
        setCustomProfile, 
        clearProfile,
        isProfileFormOpen,
        setIsProfileFormOpen,
        calculateReadiness,
        toggleSaveScholarship,
        setActiveScholarship,
        handleAnalyzeFit,
        feedback
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
