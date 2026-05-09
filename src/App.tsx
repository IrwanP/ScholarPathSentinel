/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import OverviewPage from "./app/page";
import ScholarshipsPage from "./app/scholarships/page";
import ReadinessPage from "./app/readiness/page";
import PreparationPage from "./app/preparation/page";
import TrustPage from "./app/trust/page";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import StudentProfileForm from "./components/StudentProfileForm";
import { Info } from "lucide-react";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, profile, setIsProfileFormOpen, feedback } = useProfile();

  const pageTitle = {
    "/": "Overview",
    "/scholarships": "Scholarships",
    "/readiness": "Readiness",
    "/preparation": "Preparation",
    "/trust": "Trust & Data"
  }[location.pathname] || "ScholarPath AI";

  const handleStartJourney = () => {
    if (mode === "empty") {
      setIsProfileFormOpen(true);
    } else {
      navigate("/readiness");
    }
  };

  return (
    <div className="flex bg-background h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-border-subtle flex items-center justify-between px-8 shrink-0 print:hidden">
          <h1 className="text-xl font-medium text-text-main">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            {mode === "demo" && (
              <span className="px-3 py-1 bg-google-green-light text-google-green-text rounded-full text-[10px] font-bold uppercase tracking-wider border border-google-green/20">
                Demo Profile Loaded
              </span>
            )}
            {mode === "custom" && (
              <span className="px-3 py-1 bg-google-blue-light text-google-blue rounded-full text-[10px] font-bold uppercase tracking-wider border border-google-blue/10">
                My Profile
              </span>
            )}
            <button 
              onClick={handleStartJourney}
              className="px-4 py-2 bg-google-blue text-white rounded-md text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
            >
              Start My Journey
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="max-w-5xl mx-auto px-8 py-10 print:p-0 print:max-w-none">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/readiness" element={<ReadinessPage />} />
              <Route path="/preparation" element={<PreparationPage />} />
              <Route path="/trust" element={<TrustPage />} />
            </Routes>
          </div>
        </main>
      </div>
      <StudentProfileForm />
      
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-google-blue-dark text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
          >
            <Info className="h-4 w-4 text-blue-200" />
            <span className="text-sm font-bold tracking-tight">{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </Router>
  );
}

