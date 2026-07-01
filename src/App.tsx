/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Info } from "lucide-react";

import Sidebar from "./components/Sidebar";
import OverviewPage from "./app/page";
import ScholarshipsPage from "./app/scholarships/page";
import ReadinessPage from "./app/readiness/page";
import PreparationPage from "./app/preparation/page";
import TrustPage from "./app/trust/page";
import SentinelPage from "./app/sentinel/page";

import { ProfileProvider, useProfile } from "./context/ProfileContext";
import StudentProfileForm from "./components/StudentProfileForm";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const { mode, setIsProfileFormOpen, feedback, clearProfile } = useProfile();

  const pageTitle: Record<string, string> = {
    "/": "Overview",
    "/scholarships": "Scholarships",
    "/readiness": "Readiness",
    "/preparation": "Preparation",
    "/trust": "Trust & Data",
    "/sentinel": "ScholarPath Sentinel"
  };

  const currentPageTitle = pageTitle[location.pathname] || "ScholarPath AI";

  const handleStartJourney = () => {
    clearProfile();
    setIsProfileFormOpen(true);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 md:px-8 lg:px-8 shrink-0">
          <h1 className="text-lg font-bold">{currentPageTitle}</h1>

          <div className="flex items-center gap-3">
            {mode === "demo" && (
              <span className="rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-green-700">
                Demo Profile Loaded
              </span>
            )}

            {mode === "custom" && (
              <span className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                My Profile
              </span>
            )}

            <button
              onClick={handleStartJourney}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Start My Journey
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 w-full min-w-0 px-4 py-8 sm:px-6 md:px-8 lg:px-8 max-w-[1440px] mx-auto"
          >
            <Routes location={location}>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/readiness" element={<ReadinessPage />} />
              <Route path="/preparation" element={<PreparationPage />} />
              <Route path="/trust" element={<TrustPage />} />
              <Route path="/sentinel" element={<SentinelPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      <StudentProfileForm />

      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-sm text-gray-700 shadow-xl">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p>{feedback}</p>
        </div>
      )}
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