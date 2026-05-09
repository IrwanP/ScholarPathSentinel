import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, User, Globe2, GraduationCap, BookOpen, Trophy, Lightbulb, Users, Briefcase, Wallet, Calendar } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { StudentProfile } from "../types";
import { cn } from "../lib/utils";

export default function StudentProfileForm() {
  const { profile, setCustomProfile, clearProfile, isProfileFormOpen, setIsProfileFormOpen } = useProfile();

  const [formData, setFormData] = useState<StudentProfile>({
    name: "",
    origin: "",
    currentEducation: "",
    targetDegree: "",
    targetCountries: [],
    fields: [],
    gpa: 0,
    englishStatus: "Not Taken",
    englishScore: "",
    hasLeadership: false,
    hasResearch: false,
    hasCommunityImpact: false,
    hasWorkExperience: false,
    hasFinancialNeed: false,
    preferredIntakeYear: "2025",
    readinessScore: 0,
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomProfile(formData);
  };

  const handleCountryToggle = (country: string) => {
    setFormData(prev => ({
      ...prev,
      targetCountries: prev.targetCountries.includes(country)
        ? prev.targetCountries.filter(c => c !== country)
        : [...prev.targetCountries, country]
    }));
  };

  const countries = ["UK", "USA", "Europe", "Australia", "Japan", "Singapore", "Others"];

  if (!isProfileFormOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-google-blue-light rounded-xl">
              <User className="h-6 w-6 text-google-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main">Student Profile Setup</h2>
              <p className="text-xs text-text-secondary">Fill in your profile to get personalized scholarship guidance.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileFormOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <User className="h-3 w-3" /> Full Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Irwan Prabowo"
                className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Globe2 className="h-3 w-3" /> Country of Origin
              </label>
              <input
                required
                type="text"
                value={formData.origin}
                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Ex: Indonesia"
                className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-3 w-3" /> Target Degree Level
              </label>
              <select
                value={formData.targetDegree}
                onChange={e => setFormData({ ...formData, targetDegree: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
              >
                <option value="">Select Degree</option>
                <option value="Bachelor's">Bachelor's</option>
                <option value="Master's">Master's</option>
                <option value="PhD">PhD</option>
                <option value="Short Course">Short Course</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> GPA / Grade
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="5.0"
                value={formData.gpa || ""}
                onChange={e => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                placeholder="Ex: 3.50"
                className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* English */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                English Proficiency
              </label>
              <select
                value={formData.englishStatus}
                onChange={e => setFormData({ ...formData, englishStatus: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
              >
                <option value="Not Taken">Not Taken Yet</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
                <option value="Duolingo">Duolingo</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                English Score (if any)
              </label>
              <input
                type="text"
                value={formData.englishScore}
                onChange={e => setFormData({ ...formData, englishScore: e.target.value })}
                placeholder="Ex: 7.0 or 100"
                className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Target Countries */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Target Countries</label>
            <div className="flex flex-wrap gap-2">
              {countries.map(country => (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleCountryToggle(country)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                    formData.targetCountries.includes(country)
                      ? "bg-google-blue text-white border-google-blue"
                      : "bg-white text-text-secondary border-border-subtle hover:border-google-blue/30"
                  )}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Field of Study */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              Field of Study
            </label>
            <input
              type="text"
              value={formData.fields.join(", ")}
              onChange={e => setFormData({ ...formData, fields: e.target.value.split(",").map(f => f.trim()).filter(f => f !== "") })}
              placeholder="Ex: AI Strategy, Digital Transformation, Public Policy"
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
            />
          </div>

          {/* Experience Toggles */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Experiences & Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "hasLeadership", label: "Leadership Experience", icon: Users },
                { key: "hasResearch", label: "Research Experience", icon: Lightbulb },
                { key: "hasCommunityImpact", label: "Community Impact", icon: Trophy },
                { key: "hasWorkExperience", label: "Work Experience", icon: Briefcase },
                { key: "hasFinancialNeed", label: "Financial Need Focus", icon: Wallet },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof StudentProfile] })}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    formData[item.key as keyof StudentProfile]
                      ? "bg-google-green-light border-google-green/20 text-google-green-text"
                      : "bg-white border-border-subtle text-text-secondary hover:border-google-blue/30"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intake Year */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Preferred Intake Year
            </label>
            <select
              value={formData.preferredIntakeYear}
              onChange={e => setFormData({ ...formData, preferredIntakeYear: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-all text-sm"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="Later">Later</option>
            </select>
          </div>
        </form>

        <div className="p-6 border-t border-border-subtle bg-gray-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={clearProfile}
            className="px-4 py-2 text-xs font-bold text-google-red hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear Profile
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsProfileFormOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-text-secondary hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-2.5 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Profile
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
