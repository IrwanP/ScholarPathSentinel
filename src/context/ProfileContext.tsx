import React, { createContext, useContext, useState, useEffect } from "react";
import { ProfileMode, StudentProfile, AppState } from "../types";
import { demoStudent } from "../data/demoData";
import { calculateReadiness as calcReadiness } from "../agents/readinessAgent";
import { getSentinelAnalysis, SentinelAnalysisResult } from "../utils/sentinelAnalysis";

interface ProfileContextType {
  mode: ProfileMode;
  profile: StudentProfile | null;
  savedScholarshipIds: string[];
  activeScholarshipId: string | null;
  sentinelResult: SentinelAnalysisResult | null;
  updateSentinelResult: (result: any) => void;
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
  SENTINEL_RESULT: "scholarpath_sentinel_result",
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ProfileMode>("empty");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [activeScholarshipId, setActiveScholarshipId] = useState<string | null>(null);
  const [sentinelResult, setSentinelResult] = useState<SentinelAnalysisResult | null>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as ProfileMode;
    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const savedIds = localStorage.getItem(STORAGE_KEYS.SAVED_IDS);
    const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
    const savedResult = localStorage.getItem(STORAGE_KEYS.SENTINEL_RESULT);

    if (savedMode === "demo") {
      setMode("demo");
      const tempDemo: StudentProfile = {
        ...demoStudent,
        currentEducation: "Bachelor’s Degree",
        englishStatus: "IELTS",
        englishScore: "7.5",
        profilePhotoUrl: "/demo/alya-putri-profile.jpg",
        hasLeadership: true,
        hasResearch: true,
        hasCommunityImpact: true,
        hasWorkExperience: true,
        hasFinancialNeed: false,
        preferredIntakeYear: "2026",
        recommenderStatus: "Requested",
        deadlineTimelineStatus: "in_progress",
        deadlineMilestonesConfirmed: false,
        complianceScanStatus: "not_started",
        complianceScanCompleted: false,
        automatedComplianceChecksPassed: false,
        finalReviewStatus: "not_started",
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
          finalApplicationPackageReviewed: false
        },
        readinessScore: 0,
      };
      const baseDemo = {
        ...tempDemo,
        readinessScore: calcReadiness(tempDemo)
      };

      let currentDemo = baseDemo;
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          currentDemo = {
            ...baseDemo,
            ...parsed,
            profilePhotoUrl: "/demo/alya-putri-profile.jpg"
          };
        } catch (e) {
          // ignore
        }
      }
      setProfile(currentDemo);
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentDemo));

      if (savedResult) {
        try {
          const parsed = JSON.parse(savedResult);
          const alignedResult = getSentinelAnalysis(currentDemo, parsed);
          setSentinelResult(alignedResult);
          localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(alignedResult));
        } catch (e) {
          const initialResult = getSentinelAnalysis(currentDemo);
          setSentinelResult(initialResult);
          localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(initialResult));
        }
      } else {
        const initialResult = getSentinelAnalysis(currentDemo);
        setSentinelResult(initialResult);
        localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(initialResult));
      }

      if (savedIds) {
        setSavedScholarshipIds(JSON.parse(savedIds));
      } else {
        setSavedScholarshipIds(["chevening", "erasmus-mundus"]);
      }

      if (savedActiveId) {
        setActiveScholarshipId(savedActiveId);
      } else {
        setActiveScholarshipId("chevening");
      }
    } else if (savedMode === "custom" && savedProfile) {
      setMode("custom");
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      if (savedIds) setSavedScholarshipIds(JSON.parse(savedIds));
      if (savedActiveId) setActiveScholarshipId(savedActiveId);

      if (savedResult) {
        try {
          const parsed = JSON.parse(savedResult);
          const alignedResult = getSentinelAnalysis(parsedProfile, parsed);
          setSentinelResult(alignedResult);
          localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(alignedResult));
        } catch (e) {
          const initialResult = getSentinelAnalysis(parsedProfile);
          setSentinelResult(initialResult);
          localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(initialResult));
        }
      } else {
        const initialResult = getSentinelAnalysis(parsedProfile);
        setSentinelResult(initialResult);
        localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(initialResult));
      }
    } else {
      setMode("empty");
      setProfile(null);
      setSavedScholarshipIds([]);
      setActiveScholarshipId(null);
      setSentinelResult(null);
    }
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const calculateReadiness = (p: StudentProfile): number => {
    return calcReadiness(p);
  };

  const updateSentinelResult = (result: any) => {
    if (profile) {
      const normalizedResult = getSentinelAnalysis(profile, result);
      setSentinelResult(normalizedResult);
      localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(normalizedResult));
      
      // Keep profile readiness score in sync with result score
      if (profile.readinessScore !== normalizedResult.readinessScore) {
        const updatedProfile = { ...profile, readinessScore: normalizedResult.readinessScore };
        setProfile(updatedProfile);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
      }
    }
  };

  const setDemoMode = () => {
    setMode("demo");
    const tempDemo: StudentProfile = {
      ...demoStudent,
      currentEducation: "Bachelor’s Degree",
      englishStatus: "IELTS",
      englishScore: "7.5",
      profilePhotoUrl: "/demo/alya-putri-profile.jpg",
      hasLeadership: true,
      hasResearch: true,
      hasCommunityImpact: true,
      hasWorkExperience: true,
      hasFinancialNeed: false,
      preferredIntakeYear: "2026",
      recommenderStatus: "Requested",
      deadlineTimelineStatus: "in_progress",
      deadlineMilestonesConfirmed: false,
      complianceScanStatus: "not_started",
      complianceScanCompleted: false,
      automatedComplianceChecksPassed: false,
      finalReviewStatus: "not_started",
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
        finalApplicationPackageReviewed: false
      },
      readinessScore: 0,
    };
    const demo = {
      ...tempDemo,
      readinessScore: calcReadiness(tempDemo)
    };
    setProfile(demo);
    
    const result = getSentinelAnalysis(demo);
    setSentinelResult(result);

    setSavedScholarshipIds(["chevening", "erasmus-mundus"]);
    setActiveScholarshipId("chevening");
    localStorage.setItem(STORAGE_KEYS.MODE, "demo");
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(demo));
    localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(result));
    localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify(["chevening", "erasmus-mundus"]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, "chevening");
  };

  const setCustomProfile = (newProfile: StudentProfile) => {
    const readiness = calculateReadiness(newProfile);
    const profileWithScore = { ...newProfile, readinessScore: readiness };
    const nextMode = mode === "empty" ? "custom" : mode;
    setMode(nextMode);
    setProfile(profileWithScore);

    const result = getSentinelAnalysis(profileWithScore);
    setSentinelResult(result);

    localStorage.setItem(STORAGE_KEYS.MODE, nextMode);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileWithScore));
    localStorage.setItem(STORAGE_KEYS.SENTINEL_RESULT, JSON.stringify(result));
    setIsProfileFormOpen(false);
  };

  const clearProfile = () => {
    setMode("empty");
    setProfile(null);
    setSavedScholarshipIds([]);
    setActiveScholarshipId(null);
    setSentinelResult(null);
    localStorage.removeItem(STORAGE_KEYS.MODE);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SAVED_IDS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    localStorage.removeItem(STORAGE_KEYS.SENTINEL_RESULT);
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
        sentinelResult,
        updateSentinelResult,
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
