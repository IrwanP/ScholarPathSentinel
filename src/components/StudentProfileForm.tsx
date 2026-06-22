import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Save,
  User,
  Globe2,
  GraduationCap,
  BookOpen,
  Trophy,
  Lightbulb,
  Users,
  Briefcase,
  Wallet,
  Calendar,
  Camera,
  Upload,
  Trash2
} from "lucide-react";

import { useProfile } from "../context/ProfileContext";
import type { StudentProfile } from "../types";
import { cn } from "../lib/utils";

type EnglishStatus = StudentProfile["englishStatus"];

type ExperienceKey =
  | "hasLeadership"
  | "hasResearch"
  | "hasCommunityImpact"
  | "hasWorkExperience"
  | "hasFinancialNeed";

const currentYear = new Date().getFullYear();

const intakeYearOptions = [
  String(currentYear),
  String(currentYear + 1),
  String(currentYear + 2),
  "Later"
];

const countries = [
  "UK",
  "USA",
  "Europe",
  "Australia",
  "Japan",
  "Singapore",
  "Others"
];

function generateNumberOptions(
  start: number,
  end: number,
  step: number,
  decimals = 0
): string[] {
  const values: string[] = [];

  for (let value = start; value <= end + 0.0001; value += step) {
    values.push(value.toFixed(decimals));
  }

  return values;
}

const englishScoreOptions: Record<string, string[]> = {
  IELTS: generateNumberOptions(0, 9, 0.5, 1),
  "TOEFL iBT": generateNumberOptions(0, 120, 1, 0),
  "TOEFL iBT 2026": generateNumberOptions(1, 6, 0.5, 1),
  Duolingo: generateNumberOptions(10, 160, 5, 0)
};

const emptyProfile: StudentProfile = {
  name: "",
  origin: "",
  currentEducation: "",
  targetDegree: "",
  targetCountries: [],
  fields: [],
  gpa: 0,
  englishStatus: "Not Taken",
  englishScore: "",
  profilePhotoUrl: "",
  hasLeadership: false,
  hasResearch: false,
  hasCommunityImpact: false,
  hasWorkExperience: false,
  hasFinancialNeed: false,
  preferredIntakeYear: String(currentYear),
  readinessScore: 0
};

function normalizeEnglishStatus(value: string): EnglishStatus {
  if (value === "TOEFL") {
    return "TOEFL iBT";
  }

  if (
    value === "Not Taken" ||
    value === "IELTS" ||
    value === "TOEFL iBT" ||
    value === "TOEFL iBT 2026" ||
    value === "Duolingo" ||
    value === "Other"
  ) {
    return value;
  }

  return "Not Taken";
}

function normalizeIntakeYear(value: string | undefined): string {
  if (!value) return String(currentYear);
  if (value === "Later") return value;

  const numericYear = Number(value);

  if (Number.isNaN(numericYear)) {
    return String(currentYear);
  }

  if (numericYear < currentYear) {
    return String(currentYear);
  }

  return value;
}

const experienceItems: Array<{
  key: ExperienceKey;
  label: string;
  icon: typeof Users;
}> = [
    {
      key: "hasLeadership",
      label: "Leadership Experience",
      icon: Users
    },
    {
      key: "hasResearch",
      label: "Research Experience",
      icon: Lightbulb
    },
    {
      key: "hasCommunityImpact",
      label: "Community Impact",
      icon: Trophy
    },
    {
      key: "hasWorkExperience",
      label: "Work Experience",
      icon: Briefcase
    },
    {
      key: "hasFinancialNeed",
      label: "Financial Need Focus",
      icon: Wallet
    }
  ];

export default function StudentProfileForm() {
  const {
    profile,
    setCustomProfile,
    clearProfile,
    isProfileFormOpen,
    setIsProfileFormOpen
  } = useProfile();

  const [formData, setFormData] = useState<StudentProfile>(emptyProfile);
  const [fieldsText, setFieldsText] = useState("");

  useEffect(() => {
    if (profile) {
      const normalizedProfile: StudentProfile = {
        ...emptyProfile,
        ...profile,
        englishStatus: normalizeEnglishStatus(profile.englishStatus),
        profilePhotoUrl: profile.profilePhotoUrl || "",
        preferredIntakeYear: normalizeIntakeYear(profile.preferredIntakeYear)
      };

      setFormData(normalizedProfile);
      setFieldsText(normalizedProfile.fields.join(", "));
    } else {
      setFormData(emptyProfile);
      setFieldsText("");
    }
  }, [profile]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedFields = fieldsText
      .split(",")
      .map((field) => field.trim())
      .filter(Boolean);

    setCustomProfile({
      ...formData,
      fields: normalizedFields,
      preferredIntakeYear: normalizeIntakeYear(formData.preferredIntakeYear)
    });
  };

  const handleCountryToggle = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCountries: prev.targetCountries.includes(country)
        ? prev.targetCountries.filter((item) => item !== country)
        : [...prev.targetCountries, country]
    }));
  };

  const handleEnglishStatusChange = (value: EnglishStatus) => {
    setFormData((prev) => ({
      ...prev,
      englishStatus: value,
      englishScore: ""
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Please use an image below 1.5 MB so it can be stored locally.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        profilePhotoUrl: String(reader.result || "")
      }));
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      profilePhotoUrl: ""
    }));
  };

  const selectedEnglishOptions = englishScoreOptions[formData.englishStatus] || [];

  if (!isProfileFormOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <motion.form
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border-subtle p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-google-blue-light p-2">
                <User className="h-6 w-6 text-google-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main">
                  Student Profile Setup
                </h2>
                <p className="text-xs text-text-secondary">
                  Fill in your profile to get personalized scholarship guidance.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileFormOpen(false)}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto p-8">
            <section className="rounded-2xl border border-border-subtle bg-gray-50 p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                  {formData.profilePhotoUrl ? (
                    <img
                      src={formData.profilePhotoUrl}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-text-main">
                    <User className="h-4 w-4" />
                    Profile Photo
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Optional. Upload a small image below 1.5 MB. It will be
                    stored locally in this browser.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-google-blue px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.profilePhotoUrl && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-2 text-xs font-bold text-text-secondary transition-colors hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <User className="h-3 w-3" />
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="Ex: Irwan Prabowo"
                  className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <Globe2 className="h-3 w-3" />
                  Country of Origin
                </label>
                <input
                  required
                  type="text"
                  value={formData.origin}
                  onChange={(event) =>
                    setFormData({ ...formData, origin: event.target.value })
                  }
                  placeholder="Ex: Indonesia"
                  className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <GraduationCap className="h-3 w-3" />
                  Current Education
                </label>
                <input
                  type="text"
                  value={formData.currentEducation}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      currentEducation: event.target.value
                    })
                  }
                  placeholder="Ex: Bachelor's"
                  className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <GraduationCap className="h-3 w-3" />
                  Target Degree Level
                </label>
                <select
                  value={formData.targetDegree}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      targetDegree: event.target.value
                    })
                  }
                  className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                >
                  <option value="">Select Degree</option>
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Short Course">Short Course</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <BookOpen className="h-3 w-3" />
                  GPA / Grade
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={formData.gpa || ""}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      gpa:
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value)
                    })
                  }
                  placeholder="Ex: 3.50"
                  className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  English Proficiency
                </label>
                <select
                  value={formData.englishStatus}
                  onChange={(event) =>
                    handleEnglishStatusChange(event.target.value as EnglishStatus)
                  }
                  className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                >
                  <option value="Not Taken">Not Taken Yet</option>
                  <option value="IELTS">IELTS, 0.0 to 9.0</option>
                  <option value="TOEFL iBT">TOEFL iBT, 0 to 120</option>
                  <option value="TOEFL iBT 2026">
                    TOEFL iBT 2026, 1.0 to 6.0
                  </option>
                  <option value="Duolingo">Duolingo English Test, 10 to 160</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.englishStatus === "Not Taken" && (
                <div className="rounded-xl border border-dashed border-border-subtle bg-gray-50 px-4 py-3 text-sm text-text-secondary">
                  Select IELTS, TOEFL iBT, TOEFL iBT 2026, Duolingo, or Other
                  to enter a score.
                </div>
              )}

              {selectedEnglishOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {formData.englishStatus} Score
                  </label>
                  <select
                    value={formData.englishScore}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        englishScore: event.target.value
                      })
                    }
                    className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                  >
                    <option value="">Select Score</option>
                    {selectedEnglishOptions.map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.englishStatus === "Other" && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Other English Score
                  </label>
                  <input
                    type="text"
                    value={formData.englishScore}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        englishScore: event.target.value
                      })
                    }
                    placeholder="Ex: CEFR C1, PTE 65"
                    className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                  />
                </div>
              )}
            </section>

            <section className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Target Countries
              </label>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleCountryToggle(country)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-xs font-bold transition-all",
                      formData.targetCountries.includes(country)
                        ? "border-google-blue bg-google-blue text-white"
                        : "border-border-subtle bg-white text-text-secondary hover:border-google-blue/30"
                    )}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Field of Study
              </label>
              <input
                type="text"
                value={fieldsText}
                onChange={(event) => {
                  const value = event.target.value;

                  setFieldsText(value);

                  setFormData({
                    ...formData,
                    fields: value
                      .split(",")
                      .map((field) => field.trim())
                      .filter(Boolean)
                  });
                }}
                placeholder="Ex: AI Strategy, Digital Transformation, Public Policy, Data Science, GovTech"
                className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
              />
              <p className="text-xs text-text-secondary">
                Separate multiple fields with commas. Spaces, dots, hyphens,
                slashes, ampersands, and parentheses are allowed.
              </p>
            </section>

            <section className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Experiences & Status
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {experienceItems.map((item) => {
                  const Icon = item.icon;
                  const active = Boolean(formData[item.key]);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          [item.key]: !active
                        })
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        active
                          ? "border-google-green/20 bg-google-green-light text-google-green-text"
                          : "border-border-subtle bg-white text-text-secondary hover:border-google-blue/30"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                <Calendar className="h-3 w-3" />
                Preferred Intake Year
              </label>
              <select
                value={formData.preferredIntakeYear}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    preferredIntakeYear: event.target.value
                  })
                }
                className="w-full rounded-xl border border-border-subtle px-4 py-3 text-sm outline-none transition-all focus:border-google-blue focus:ring-1 focus:ring-google-blue"
              >
                {intakeYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border-subtle bg-gray-50 p-6">
            <button
              type="button"
              onClick={() => {
                clearProfile();
                setIsProfileFormOpen(false);
              }}
              className="rounded-lg px-4 py-2 text-xs font-bold text-google-red transition-colors hover:bg-red-50"
            >
              Clear Profile
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsProfileFormOpen(false)}
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-google-blue px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-google-blue/20 transition-colors hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Profile
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </AnimatePresence>
  );
}