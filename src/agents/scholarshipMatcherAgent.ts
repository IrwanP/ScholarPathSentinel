import type { StudentProfile } from "../types";
import { realScholarships } from "../data/scholarships";

export interface ScholarshipMatch {
    id: string;
    name: string;
    provider: string;
    country: string;
    region: string;
    matchScore: number;
    fitCategory: "Excellent Match" | "Good Match" | "Moderate Match" | "Competitive Reach";
    reason: string;
    requiredDocuments: string[];
    coverage: string;
}

export interface AgentTrace {
    agent: string;
    tool: string;
    inputSummary: string;
    outputSummary: string;
    status: "success" | "warning" | "blocked";
}

export interface ScholarshipMatcherResult {
    matches: ScholarshipMatch[];
    trace: AgentTrace;
}

function normalize(value: string | undefined): string {
    return (value || "").toLowerCase().trim();
}

function degreeMatches(profile: StudentProfile, degreeLevels: string[]): boolean {
    const targetDegree = normalize(profile.targetDegree);

    return degreeLevels.some((degree) => {
        const normalizedDegree = normalize(degree);
        return normalizedDegree.includes(targetDegree) || targetDegree.includes(normalizedDegree);
    });
}

function countryOrRegionMatches(
    profile: StudentProfile,
    scholarshipCountry: string,
    scholarshipRegion: string
): boolean {
    const targetCountries = profile.targetCountries.map(normalize);
    const country = normalize(scholarshipCountry);
    const region = normalize(scholarshipRegion);

    return targetCountries.some((target) => {
        if (!target) return false;

        return (
            country.includes(target) ||
            target.includes(country) ||
            region.includes(target) ||
            target.includes(region) ||
            (target === "uk" && country.includes("united kingdom")) ||
            (target === "usa" && (country.includes("united states") || country.includes("usa"))) ||
            (target === "europe" && region.includes("europe"))
        );
    });
}

function fieldMatches(profile: StudentProfile, fieldsOfStudy?: string[]): boolean {
    if (!fieldsOfStudy || fieldsOfStudy.length === 0) return true;

    const profileFields = profile.fields.map(normalize);
    const scholarshipFields = fieldsOfStudy.map(normalize);

    return profileFields.some((profileField) =>
        scholarshipFields.some((scholarshipField) =>
            scholarshipField.includes(profileField) ||
            profileField.includes(scholarshipField) ||
            scholarshipField.includes("all fields")
        )
    );
}

function getFitCategory(score: number): ScholarshipMatch["fitCategory"] {
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Good Match";
    if (score >= 50) return "Moderate Match";
    return "Competitive Reach";
}

export function scholarshipMatcherAgent(profile: StudentProfile): ScholarshipMatcherResult {
    const matches: ScholarshipMatch[] = realScholarships
        .map((scholarship) => {
            let score = 0;
            const reasons: string[] = [];

            if (degreeMatches(profile, scholarship.degreeLevels)) {
                score += 30;
                reasons.push(`Target degree aligns with ${scholarship.degreeLevels.join(", ")}.`);
            }

            if (countryOrRegionMatches(profile, scholarship.country, scholarship.region)) {
                score += 25;
                reasons.push("Country or region aligns with your target preference.");
            }

            if (fieldMatches(profile, scholarship.fieldsOfStudy)) {
                score += 15;
                reasons.push("Field of study is relevant to your profile.");
            }

            if (profile.gpa >= 3.7) {
                score += 12;
                reasons.push("Strong GPA improves competitiveness.");
            } else if (profile.gpa >= 3.3) {
                score += 8;
                reasons.push("GPA is within a competitive range.");
            } else if (profile.gpa >= 3.0) {
                score += 5;
                reasons.push("GPA may still be acceptable, but evidence strength becomes more important.");
            }

            if (profile.englishStatus !== "Not Taken" && profile.englishScore) {
                score += 8;
                reasons.push("English readiness evidence is available.");
            }

            if (profile.hasLeadership) {
                score += 4;
                reasons.push("Leadership evidence strengthens your application story.");
            }

            if (profile.hasCommunityImpact) {
                score += 3;
                reasons.push("Community impact evidence supports contribution narrative.");
            }

            if (profile.hasResearch) {
                score += 3;
                reasons.push("Research evidence supports academic readiness.");
            }

            const finalScore = Math.min(score, 100);

            return {
                id: scholarship.id,
                name: scholarship.name,
                provider: scholarship.provider,
                country: scholarship.country,
                region: scholarship.region,
                matchScore: finalScore,
                fitCategory: getFitCategory(finalScore),
                reason: reasons.length > 0
                    ? reasons.join(" ")
                    : "Potential fit, but more profile evidence is needed.",
                requiredDocuments: scholarship.requiredDocuments,
                coverage: scholarship.coverage
            };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

    return {
        matches,
        trace: {
            agent: "Scholarship Matcher Agent",
            tool: "realScholarships matching dataset",
            inputSummary: "Target degree, countries, fields, GPA, English readiness, and evidence indicators",
            outputSummary: `Ranked ${matches.length} scholarship matches from the existing ScholarPath AI dataset.`,
            status: "success"
        }
    };
}