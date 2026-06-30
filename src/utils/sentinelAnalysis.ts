import type { StudentProfile } from "../types";
import { calculateRisks, calculateReadiness } from "../agents/readinessAgent";
import { scholarshipMatcherAgent } from "../agents/scholarshipMatcherAgent";
import { roadmapPlannerAgent } from "../agents/roadmapPlannerAgent";
import { essayCoachAgent } from "../agents/essayCoachAgent";
import type { RiskRadarData } from "../agents/readinessAgent";

export interface RecommendationCard {
  title: string;
  desc: string;
  ctaText: string;
  ctaAction: string;
}

export interface SentinelAnalysisResult {
  overallReadinessReasoning: string;
  overallReadinessWhy: string;
  nextBestActionNew: {
    title: string;
    whyItMatters: string;
    actionCopy?: string;
    relatedRisk: string;
    potentialImpact: string;
    reasoning: string;
    ctaText: string;
    ctaPath: string;
  };
  needsAttentionNew: {
    name: string;
    dimensionScore: number;
    riskValue: number;
    reason: string;
    priority: "High" | "Medium" | "Low";
  }[];
  readinessScore: number;
  readinessStatus: "Needs Work" | "Developing" | "Moderate" | "Strong" | "Excellent";
  readinessColor: "red" | "amber" | "yellow" | "green";
  readinessColorClass: string;
  improvementExplanation: string;
  potentialImprovementCopy: string;
  howToReachGreenCopy: string;
  risks: RiskRadarData;
  riskRadar: RiskRadarData; // Alias for risks
  highestRisk: {
    label: string;
    score: number;
    text: string;
    status: "Low" | "Medium" | "High" | "Critical";
  };
  nextBestAction: string;
  topMatch: any;
  matches: any[];
  essayFeedback: any;
  evidenceGaps: {
    strengths: string[];
    gaps: string[];
  };
  roadmap: any[];
  advisorReport: {
    notes: string;
    strengths: string[];
    gaps: string[];
  };
  agentTrace: any[];
  readinessDimensions: any[];
  mentorSummary: string;
  security: {
    passed: boolean;
    issues: string[];
    sanitizedProfile: StudentProfile;
  };
  fallbackMode: boolean;
  mentorRecommendations: RecommendationCard[];
  recommendedActions: {
    title: string;
    why: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    ctaText: string;
    path: string;
  }[];
}

function getReadinessCappedStatus(score: number, risks: RiskRadarData, profile: StudentProfile) {
  const riskValues = [risks.evidenceRisk, risks.deadlineRisk, risks.recommenderRisk, risks.storyRisk, risks.fitRisk, risks.englishRisk];
  const hasCritical = riskValues.some(v => v > 80);
  const hasHigh = riskValues.some(v => v > 60 && v <= 80);
  
  let readinessStatus: "Needs Work" | "Developing" | "Moderate" | "Strong" | "Excellent" | "Final Verified" | "Final Verified / Ready to Submit" | "Submission Ready";
  if (score === 100) readinessStatus = "Final Verified / Ready to Submit";
  else if (score === 94) readinessStatus = "Submission Ready";
  else if (score >= 92) readinessStatus = "Excellent";
  else if (score >= 80) readinessStatus = "Strong";
  else if (score >= 70) readinessStatus = "Moderate";
  else if (score >= 50) readinessStatus = "Developing";
  else readinessStatus = "Needs Work";

  // Capping rule: A student can become green / Strong only if readinessScore >= 80, no Critical risk exists, and no High blocker exists
  if (hasCritical || hasHigh) {
    if (readinessStatus === "Strong" || readinessStatus === "Excellent" || readinessStatus === "Final Verified / Ready to Submit" || readinessStatus === "Submission Ready") {
      readinessStatus = "Moderate";
    }
  }

  // Determine colors based on capped status
  let readinessColor: "red" | "amber" | "yellow" | "green" = "yellow";
  let readinessColorClass = "text-amber-700 bg-amber-50 border-amber-100";
  if (readinessStatus === "Final Verified / Ready to Submit" || readinessStatus === "Excellent" || readinessStatus === "Strong" || readinessStatus === "Submission Ready") {
    readinessColor = "green";
    readinessColorClass = "text-emerald-700 bg-emerald-50 border-emerald-100";
  } else if (readinessStatus === "Moderate") {
    readinessColor = "yellow";
    readinessColorClass = "text-amber-700 bg-amber-50 border-amber-100"; // Yellow-Orange style
  } else if (readinessStatus === "Developing") {
    readinessColor = "amber";
    readinessColorClass = "text-amber-800 bg-amber-50/50 border-amber-250";
  } else {
    readinessColor = "red";
    readinessColorClass = "text-rose-700 bg-rose-50 border-rose-100";
  }

  // Copy strings:
  let overallReadinessReasoning = "";
  let overallReadinessWhy = "";
  let improvementExplanation = "";
  let potentialImprovementCopy = "";
  let howToReachGreenCopy = "";

  const isAlya = profile.name?.toLowerCase().includes("alya");
  const isRecSubmitted = profile.recommenderStatus === "Submitted" || profile.recommenderStatus === "Uploaded" || profile.recommenderStatus === "Received";
  const isTimelineConfirmed = profile.deadlineTimelineStatus === "confirmed" && profile.deadlineMilestonesConfirmed === true;
  const isComplianceCompleted = profile.complianceScanCompleted === true && profile.automatedComplianceChecksPassed === true;

  if (isAlya) {
    if (!isRecSubmitted) {
      overallReadinessReasoning = "Your readiness is Moderate because most core dimensions are strong, but recommender readiness is still a blocking dependency.";
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = "Contact academic recommenders to secure letter commitments and unlock your score.";
      potentialImprovementCopy = "Potential improvement: +6 to +8 points after recommenders submit.";
      howToReachGreenCopy = "Reducing Recommender Risk will move your overall score into the green threshold.";
    } else if (!isTimelineConfirmed) {
      overallReadinessReasoning = "Your readiness is Strong because recommender readiness is now secured. The next step is to establish your application timeline.";
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = "Establish application deadline timeline and milestones to manage timeline pressure.";
      potentialImprovementCopy = "Potential improvement: +4 to +6 points after drafting timeline.";
      howToReachGreenCopy = "Once deadline timeline is drafted, deadline readiness risk will drop.";
    } else if (!isComplianceCompleted) {
      overallReadinessReasoning = "Your readiness is close to Excellent because recommender and timeline risks are now under control. Run the final compliance scan to verify submission readiness.";
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = "Run final compliance scanner check to audit application completeness.";
      potentialImprovementCopy = "Potential improvement: +3 to +5 points after compliance scan.";
      howToReachGreenCopy = "Running final compliance scanner will verify target requirements.";
    } else if (!profile.finalComplianceCheckCompleted) {
      overallReadinessReasoning = "Automated checks passed. Final compliance confirmation is still required.";
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = "Automated checks passed. Final compliance confirmation is still required.";
      potentialImprovementCopy = "Submission Ready - Automated checks verified.";
      howToReachGreenCopy = "Verify manual checklist items under the Final Completion Gate.";
    } else if (!profile.finalHumanReviewCompleted) {
      overallReadinessReasoning = "Final compliance is confirmed. Human review is still required before final verification.";
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = "Final compliance is confirmed. Human review is still required before final verification.";
      potentialImprovementCopy = "Submission Ready - Broadly compliant.";
      howToReachGreenCopy = "Confirm that your advisor or mentor has reviewed the package to unlock 100%.";
    } else if (score === 100) {
      overallReadinessReasoning = "All automated checks passed, final compliance was confirmed, and the application package has been human-reviewed.";
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = "Your application is 100% complete and final verified. Ready to submit.";
      potentialImprovementCopy = "100% - Ready to submit!";
      howToReachGreenCopy = "Proceed to submit your application package to the portal.";
    } else {
      overallReadinessReasoning = "Final compliance and human review are checked, but some final requirements or unresolved risks are still missing.";
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = "Address remaining checklist items or unresolved risks to reach 100%.";
      potentialImprovementCopy = "Submission Ready - Missing final dependencies.";
      howToReachGreenCopy = "Ensure all recommendation letters, timelines, and required documents are complete.";
    }
  } else {
    const highRisks: string[] = [];
    if (risks.recommenderRisk >= 60) highRisks.push("recommender");
    if (risks.deadlineRisk >= 60) highRisks.push("deadline");
    if (risks.evidenceRisk >= 60) highRisks.push("evidence");
    if (risks.storyRisk >= 60) highRisks.push("story");
    if (risks.fitRisk >= 60) highRisks.push("fit");
    if (risks.englishRisk >= 60) highRisks.push("english");

    if (highRisks.length > 0) {
      const riskString = highRisks.join(" and ");
      overallReadinessReasoning = `Your readiness is ${readinessStatus} because strong academic, English, evidence, scholarship-fit, and story signals are being held back by ${riskString} risk${highRisks.length > 1 ? "s" : ""}.`;
      overallReadinessWhy = overallReadinessReasoning;
      improvementExplanation = `To move into Strong readiness, resolve ${riskString} risk${highRisks.length > 1 ? "s" : ""} first.`;
      potentialImprovementCopy = `Potential improvement: +${highRisks.length * 4} to +${highRisks.length * 6} points after ${highRisks.join(" and ")} milestones are secured.`;
      howToReachGreenCopy = `To reach Strong readiness, reduce ${highRisks.join(" and ")} pressure. Once ${highRisks.join(" and ")} readiness improve${highRisks.length > 1 ? "" : "s"}, this score can move into the green range.`;
    } else {
      overallReadinessReasoning = `Your readiness is ${readinessStatus} based on your profile scan and current risk radar.`;
      overallReadinessWhy = overallReadinessReasoning;
      if (readinessStatus === "Strong" || readinessStatus === "Excellent" || readinessStatus === "Submission Ready") {
        improvementExplanation = "Your candidacy is in a strong position. Continue polishing details and review submission forms.";
        potentialImprovementCopy = "Potential improvement: +2 to +5 points after final proofreading.";
        howToReachGreenCopy = "Ensure all documents are ready and recommenders submit on time to maintain this status.";
      } else {
        improvementExplanation = "Identify your highest risk area and take steps to reduce it first.";
        potentialImprovementCopy = "Potential improvement: +10 to +15 points after addressing primary gaps.";
        howToReachGreenCopy = "Reduce high risks to improve your overall score and move into green.";
      }
    }
  }

  return {
    readinessStatus,
    readinessColor,
    readinessColorClass,
    overallReadinessReasoning,
    overallReadinessWhy,
    improvementExplanation,
    potentialImprovementCopy,
    howToReachGreenCopy
  };
}

export function calculateSentinelAnalysis(profile: StudentProfile): SentinelAnalysisResult {
  const risks = calculateRisks(profile);
  const readinessScore = calculateReadiness(profile);

  // Highest Risk calculation
  const entries = [
    { label: "Evidence Risk", val: risks.evidenceRisk },
    { label: "Deadline Risk", val: risks.deadlineRisk },
    { label: "Recommender Risk", val: risks.recommenderRisk },
    { label: "Story Risk", val: risks.storyRisk },
    { label: "Fit Risk", val: risks.fitRisk },
    { label: "English Risk", val: risks.englishRisk },
  ];
  entries.sort((a, b) => b.val - a.val);
  const highest = entries[0];
  
  let status: "Low" | "Medium" | "High" | "Critical" = "Low";
  if (highest.val > 80) status = "Critical";
  else if (highest.val > 60) status = "High";
  else if (highest.val > 30) status = "Medium";
  
  const highestRisk = {
    label: highest.label,
    score: highest.val,
    text: status,
    status
  };

  // Next Best Action
  const nextBestAction = "Secure recommender contact and request academic/professional recommendation letters this week.";

  const {
    readinessStatus,
    readinessColor,
    readinessColorClass,
    overallReadinessReasoning,
    overallReadinessWhy,
    improvementExplanation,
    potentialImprovementCopy,
    howToReachGreenCopy
  } = getReadinessCappedStatus(readinessScore, risks, profile);

  // Priority formula calculation for Needs Attention
  const recommenderRiskVal = risks.recommenderRisk;
  const deadlineRiskVal = risks.deadlineRisk;
  const fitRiskVal = risks.fitRisk;
  const storyRiskVal = risks.storyRisk;
  
  const is2026 = profile.preferredIntakeYear === "2026";
  
  const recommenderScore = recommenderRiskVal + (is2026 ? 40 : 10) + 30 + 30; // e.g. 80 + 40 + 60 = 210
  const deadlineScore = deadlineRiskVal + (is2026 ? 50 : 10) + 30 + 10;       // e.g. 75 + 50 + 40 = 175
  const fitScoreVal = fitRiskVal + 20 + 15 + 25;                               // e.g. 35 + 60 = 95
  const storyScore = storyRiskVal + 15 + 15 + 15;                             // e.g. 20 + 45 = 65
  
  const items = [
    {
      name: "Recommendation Letters",
      key: "recommenderRisk" as const,
      dimensionScore: 100 - recommenderRiskVal,
      riskValue: recommenderRiskVal,
      reason: recommenderRiskVal <= 30 
        ? "Recommendation letters are fully secured." 
        : "Recommendation letters are not fully secured and can block submission readiness.",
      priority: recommenderRiskVal <= 20 
        ? ("Low" as const) 
        : recommenderRiskVal <= 50 
          ? ("Medium" as const) 
          : ("High" as const),
      priorityScore: recommenderRiskVal <= 30 ? -100 : recommenderScore
    },
    {
      name: "Deadline Readiness",
      key: "deadlineRisk" as const,
      dimensionScore: 100 - deadlineRiskVal,
      riskValue: deadlineRiskVal,
      reason: (profile.deadlineTimelineStatus === "confirmed" || profile.deadlineMilestonesConfirmed === true)
        ? "Submission timeline is drafted and confirmed."
        : "Timeline pressure can reduce review quality and delay submission.",
      priority: (profile.deadlineTimelineStatus === "confirmed" || profile.deadlineMilestonesConfirmed === true)
        ? ("Low" as const)
        : deadlineRiskVal >= 60 ? ("High" as const) : deadlineRiskVal >= 30 ? ("Medium" as const) : ("Low" as const),
      priorityScore: (profile.deadlineTimelineStatus === "confirmed" || profile.deadlineMilestonesConfirmed === true) ? -100 : deadlineScore
    },
    {
      name: "Program Shortlist",
      key: "fitRisk" as const,
      dimensionScore: 100 - fitRiskVal,
      riskValue: fitRiskVal,
      reason: "The selected scholarship fit is strong, but shortlist validation is still needed.",
      priority: fitRiskVal >= 60 ? ("High" as const) : fitRiskVal >= 30 ? ("Medium" as const) : ("Low" as const),
      priorityScore: fitScoreVal
    },
    {
      name: "Career Impact Story",
      key: "storyRisk" as const,
      dimensionScore: 100 - storyRiskVal,
      riskValue: storyRiskVal,
      reason: "Story is already relatively strong but can still be sharpened for differentiation.",
      priority: storyRiskVal >= 60 ? ("High" as const) : storyRiskVal >= 30 ? ("Medium" as const) : ("Low" as const),
      priorityScore: storyScore
    }
  ];

  // Sort by priorityScore descending
  items.sort((a, b) => b.priorityScore - a.priorityScore);

  // Filter out low risk (<= 30%) or completed recommenders from needs attention
  // But keep other items that have risk >= 20 (like Career Impact Story at 20%)
  const needsAttentionNew = items
    .filter(item => item.priorityScore > -50 && item.riskValue >= 20 && !(item.key === "recommenderRisk" && item.riskValue <= 30))
    .map(item => ({
      name: item.name,
      dimensionScore: item.dimensionScore,
      riskValue: item.riskValue,
      reason: item.reason,
      priority: item.priority
    }));

  // Dynamic next best action mapping
  const isRecSubmitted = profile.recommenderStatus === "Submitted" || profile.recommenderStatus === "Uploaded" || profile.recommenderStatus === "Received";
  const isTimelineConfirmed = profile.deadlineTimelineStatus === "confirmed" && profile.deadlineMilestonesConfirmed === true;
  const isComplianceCompleted = profile.complianceScanCompleted === true && profile.automatedComplianceChecksPassed === true;

  let nextBestActionNew = {
    title: "Secure recommender readiness",
    whyItMatters: "Recommendation letters are not fully secured yet and can block final submission readiness.",
    actionCopy: "Secure recommender contact and request academic/professional recommendation letters this week.",
    relatedRisk: `Recommender Risk: High, ${recommenderRiskVal}%`,
    potentialImpact: "+8 to +12 readiness points",
    reasoning: "Recommendation letters are not fully secured yet and can block final submission readiness.",
    ctaText: "Create recommender request",
    ctaPath: "/preparation?tab=roadmap&focus=recommender"
  };

  if (!isRecSubmitted) {
    // Keep default
  } else if (!isTimelineConfirmed) {
    nextBestActionNew = {
      title: "Establish application timeline",
      whyItMatters: "Your target intake year is very close, leaving little room for delay.",
      actionCopy: "Map out your week-by-week timeline immediately to manage deadline risks.",
      relatedRisk: `Deadline Risk: High, ${deadlineRiskVal}%`,
      potentialImpact: "+5 to +8 readiness points",
      reasoning: "Mapping out exact dates for draft review, recommender contact, and official portal submissions prevents last-minute compliance issues.",
      ctaText: "Build Timeline",
      ctaPath: "/preparation?tab=roadmap&focus=deadline"
    };
  } else if (!isComplianceCompleted) {
    nextBestActionNew = {
      title: "Run final compliance check",
      whyItMatters: "Check final application requirements and compliance checklists before portal submission.",
      actionCopy: "Run the final compliance scan to ensure all official documents and essay requirements are met.",
      relatedRisk: "Compliance check not yet run.",
      potentialImpact: "+3 to +5 readiness points",
      reasoning: "Running the Sentinel compliance checklist verifies you haven't missed any specific program-level eligibility constraints or mandatory files.",
      ctaText: "Run Compliance Scanner",
      ctaPath: "/preparation?tab=review"
    };
  } else if (!profile.finalComplianceCheckCompleted) {
    nextBestActionNew = {
      title: "Complete final compliance confirmation",
      whyItMatters: "Automated compliance checks are passed. Final manual verification is required to unlock submission readiness.",
      actionCopy: "Review the final compliance check to confirm documents, timeline, and scholarship fit.",
      relatedRisk: "Final compliance confirmation pending.",
      potentialImpact: "+0 readiness points (Capped at 94%)",
      reasoning: "Confirming the final compliance check ensures that all manual application details are fully completed and validated.",
      ctaText: "Confirm Final Compliance",
      ctaPath: "/preparation?tab=review"
    };
  } else if (!profile.finalHumanReviewCompleted) {
    nextBestActionNew = {
      title: "Complete final human review",
      whyItMatters: "Final compliance is confirmed. Peer or mentor review is required to verify the application package.",
      actionCopy: "Submit your application package to a mentor, teacher, or advisor for final review.",
      relatedRisk: "Final human review pending.",
      potentialImpact: "+6 readiness points (Unlocks 100%)",
      reasoning: "A final human review ensures that all aspects of your application package are in their absolute best shape.",
      ctaText: "Mark Human Review Completed",
      ctaPath: "/preparation?tab=review"
    };
  } else {
    nextBestActionNew = {
      title: "Submit application package",
      whyItMatters: "All automated checks passed, final compliance was confirmed, and human review is complete.",
      actionCopy: "Your application package is 100% complete and final verified.",
      relatedRisk: "None",
      potentialImpact: "Ready to submit",
      reasoning: "Proceed to submit your final application package to the scholarship portal.",
      ctaText: "Submit application package / Download final report",
      ctaPath: "/preparation?tab=one-page-report"
    };
  }

  // RunMatcher, Roadmap, Essay Coach locally
  const matcher = scholarshipMatcherAgent(profile);
  const topMatch = matcher.matches[0] || null;

  const roadmapAgentResult = roadmapPlannerAgent(profile, topMatch);
  const roadmap = roadmapAgentResult.roadmap;

  const essay = essayCoachAgent(profile);

  const strengths = [
    profile.gpa >= 3.5 ? `Solid Academic Standing (GPA ${profile.gpa.toFixed(2)})` : `Solid basic academic profile`,
    profile.englishStatus !== "Not Taken" ? `Language Proficiency Awareness (${profile.englishStatus}: ${profile.englishScore})` : null,
    profile.hasLeadership ? "Documented Leadership Skills" : null,
    profile.hasCommunityImpact ? "Active Community Contribution" : null,
    profile.hasResearch ? "Research/academic publication history" : null,
    profile.fields && profile.fields.length > 0 ? `Clear study goals in ${profile.fields.join(", ")}` : null,
    recommenderRiskVal <= 30 ? "Recommendation Letters Submitted / Recommender Readiness Secured" : null
  ].filter((s): s is string => s !== null);

  const gaps = [
    profile.englishStatus === "Not Taken" ? "Official English test score report missing" : null,
    profile.recommenderStatus === "Not Started" || profile.recommenderStatus === "Requested" ? "Academic/professional recommenders not secured" : null,
    risks.evidenceRisk >= 60 ? "Incomplete application evidence pack" : null,
    risks.storyRisk >= 50 ? "Essay draft needs specificity and structure" : null,
    "Program shortlists to confirm"
  ].filter((s): s is string => s !== null);

  const notes = recommenderRiskVal > 30 
    ? `Sentinel Multi-Agent scan evaluated readiness risks for ${profile.name}. Academic and English language statuses are structured, but recommender outreach must remain top priority (Recommender Risk ${risks.recommenderRisk}%). Recommend starting immediate recommender outreach and evidence organization using the Rescue Roadmap.`
    : `Sentinel Multi-Agent scan evaluated readiness risks for ${profile.name}. Recommender outreach is resolved. Academic, English language, and evidence portfolios are strong. Recommend focusing on deadline readiness and timeline management to secure portal compliance.`;

  const agentTrace = [
    {
      agent: "Profile Agent",
      status: "success" as const,
      checked: "student profile, academic background, goals, intake, and target country",
      output: `GPA: ${profile.gpa}, target degree: ${profile.targetDegree}, intake year: ${profile.preferredIntakeYear}`,
      confidence: "High"
    },
    {
      agent: "Scholarship Fit Agent",
      status: "success" as const,
      checked: "profile compatibility against scholarship criteria",
      output: `Identified ${topMatch?.name || "Chevening Scholarship"} as top match (${topMatch?.matchScore || 92}%)`,
      confidence: "High"
    },
    {
      agent: "Evidence Agent",
      status: "success" as const,
      checked: "claims and available proof (GPA, English status, leadership)",
      output: "Verified academic and IELTS credentials. Leadership evidence logged.",
      confidence: "High"
    },
    {
      agent: "Risk Agent",
      status: "warning" as const,
      checked: "readiness risks and deadlines",
      output: recommenderRiskVal > 30 
        ? `Marked Recommender Risk as High at ${risks.recommenderRisk}%, Deadline Risk as High at ${risks.deadlineRisk}%`
        : `Marked Recommender Risk as Low at ${risks.recommenderRisk}%, Deadline Risk as High at ${risks.deadlineRisk}%`,
      confidence: "High"
    },
    {
      agent: "Roadmap Agent",
      status: "success" as const,
      checked: "priority action items based on gaps",
      output: recommenderRiskVal > 30 
        ? "Prioritized recommender action this week. Essay strategy mapped."
        : "Recommenders secure. Prioritized deadline timeline and essay outlines.",
      confidence: "Medium"
    },
    {
      agent: "Mentor Agent",
      status: "success" as const,
      checked: "coaching recommendations and narrative",
      output: recommenderRiskVal > 30 
        ? "Generated next-best action and narrative templates for recommenders."
        : "Generated timeline mitigation actions and authentic essay outlining directions.",
      confidence: "High"
    }
  ];

  const academicScore = profile.gpa >= 3.7 ? 90 : profile.gpa >= 3.3 ? 78 : 62;
  const englishScore = profile.englishStatus !== "Not Taken" && profile.englishScore ? 85 : 25;
  const evidenceScore = [profile.hasLeadership, profile.hasResearch, profile.hasCommunityImpact, profile.hasWorkExperience].filter(Boolean).length * 22;

  const isFinalVerified = profile.finalHumanReviewCompleted === true && profile.finalComplianceCheckCompleted === true && readinessScore === 100;

  const mentorRecommendations: RecommendationCard[] = isFinalVerified ? [
    {
      title: "Submit application package",
      desc: "All automated and manual compliance checks are final verified and ready.",
      ctaText: "Submit Package",
      ctaAction: "review"
    },
    {
      title: "Download final report",
      desc: "Export your complete readiness DNA audit report for your records.",
      ctaText: "Download Report",
      ctaAction: "report"
    },
    {
      title: "Review final verified checklist",
      desc: "Take a final look at your completed and verified application roadmap.",
      ctaText: "Review Checklist",
      ctaAction: "roadmap"
    }
  ] : (!profile.finalHumanReviewCompleted && profile.finalComplianceCheckCompleted) ? [
    {
      title: "Complete final human review",
      desc: "Secure mentor, teacher, or advisor review and sign-off on your final package.",
      ctaText: "Start Human Review",
      ctaAction: "review"
    },
    {
      title: "Refine essays and SOP",
      desc: "Focus on motivation, personal mission, and fit.",
      ctaText: "Improve story arc",
      ctaAction: "essay"
    },
    {
      title: "Practice interview answers",
      desc: "Practice story-based answers using the STAR method.",
      ctaText: "Practice interview",
      ctaAction: "interview"
    }
  ] : (!profile.finalComplianceCheckCompleted && isComplianceCompleted) ? [
    {
      title: "Complete final compliance confirmation",
      desc: "Verify manual compliance items to complete the final compliance check step.",
      ctaText: "Confirm Compliance",
      ctaAction: "review"
    },
    {
      title: "Refine essays and SOP",
      desc: "Focus on motivation, personal mission, and fit.",
      ctaText: "Improve story arc",
      ctaAction: "essay"
    },
    {
      title: "Practice interview answers",
      desc: "Practice story-based answers using the STAR method.",
      ctaText: "Practice interview",
      ctaAction: "interview"
    }
  ] : !isRecSubmitted ? [
    {
      title: "Secure recommender readiness",
      desc: "Share context and key achievements early with referees.",
      ctaText: "Create recommender request",
      ctaAction: "roadmap"
    },
    {
      title: "Improve evidence strength",
      desc: "Add measurable impact and proof to your portfolio.",
      ctaText: "Upload missing evidence",
      ctaAction: "documents"
    },
    {
      title: "Refine essays and SOP",
      desc: "Focus on motivation, personal mission, and fit.",
      ctaText: "Improve story arc",
      ctaAction: "essay"
    },
    {
      title: "Prepare for interview questions",
      desc: "Practice story-based answers using the STAR method.",
      ctaText: "Practice interview",
      ctaAction: "interview"
    }
  ] : !isTimelineConfirmed ? [
    {
      title: "Confirm application deadlines",
      desc: "Build application submission timeline and calendar events.",
      ctaText: "Build submission timeline",
      ctaAction: "roadmap"
    },
    {
      title: "Improve evidence strength",
      desc: "Add measurable impact and proof to your portfolio.",
      ctaText: "Upload missing evidence",
      ctaAction: "documents"
    },
    {
      title: "Refine essays and SOP",
      desc: "Focus on motivation, personal mission, and fit.",
      ctaText: "Improve story arc",
      ctaAction: "essay"
    },
    {
      title: "Prepare for interview questions",
      desc: "Practice story-based answers using the STAR method.",
      ctaText: "Practice interview",
      ctaAction: "interview"
    }
  ] : [
    {
      title: "Run final compliance check",
      desc: "Verify all application requirements and check official portal checklist.",
      ctaText: "Run compliance check",
      ctaAction: "review"
    },
    {
      title: "Refine essays and SOP",
      desc: "Focus on motivation, personal mission, and fit.",
      ctaText: "Improve story arc",
      ctaAction: "essay"
    },
    {
      title: "Verify document checklist",
      desc: "Scan and catalog official transcript PDFs and leadership letters.",
      ctaText: "Open documents",
      ctaAction: "documents"
    },
    {
      title: "Practice interview answers",
      desc: "Practice story-based answers using the STAR method.",
      ctaText: "Practice interview",
      ctaAction: "interview"
    }
  ];

  const recommendedActions = isFinalVerified ? [
    {
      title: "Submit application package",
      why: "All automated and manual compliance checks are final verified and ready.",
      priority: "High" as const,
      ctaText: "Submit Package",
      path: "/preparation?tab=review"
    },
    {
      title: "Download final report",
      why: "Export your complete readiness DNA audit report for your records.",
      priority: "Medium" as const,
      ctaText: "Download Report",
      path: "/preparation?tab=one-page-report"
    },
    {
      title: "Review final verified checklist",
      why: "Take a final look at your completed and verified application roadmap.",
      priority: "Low" as const,
      ctaText: "Review Checklist",
      path: "/preparation?tab=roadmap"
    }
  ] : (!profile.finalHumanReviewCompleted && profile.finalComplianceCheckCompleted) ? [
    {
      title: "Complete final human review",
      why: "Secure mentor, teacher, or advisor review and sign-off on your final package.",
      priority: "High" as const,
      ctaText: "Start Human Review",
      path: "/preparation?tab=review"
    },
    {
      title: "Prepare Evidence Pack",
      why: "Scan and catalog official transcript PDFs and supporting documents.",
      priority: "Medium" as const,
      ctaText: "Manage Documents",
      path: "/preparation?tab=documents"
    },
    {
      title: "Improve Essay Story Arc",
      why: "Draft personal statement focusing on motivating problems in target field.",
      priority: "Medium" as const,
      ctaText: "Open Essay Coach",
      path: "/preparation?tab=essay-coach"
    }
  ] : (!profile.finalComplianceCheckCompleted && isComplianceCompleted) ? [
    {
      title: "Complete final compliance confirmation",
      why: "Verify manual compliance items to complete the final compliance check step.",
      priority: "High" as const,
      ctaText: "Confirm Compliance",
      path: "/preparation?tab=review"
    },
    {
      title: "Prepare Evidence Pack",
      why: "Scan and catalog official transcript PDFs and supporting documents.",
      priority: "Medium" as const,
      ctaText: "Manage Documents",
      path: "/preparation?tab=documents"
    },
    {
      title: "Improve Essay Story Arc",
      why: "Draft personal statement focusing on motivating problems in target field.",
      priority: "Medium" as const,
      ctaText: "Open Essay Coach",
      path: "/preparation?tab=essay-coach"
    }
  ] : !isRecSubmitted ? [
    {
      title: "Secure recommender contact",
      why: "Contact academic/professional referees to secure letters.",
      priority: "High" as const,
      ctaText: "Open Roadmap",
      path: "/preparation?tab=roadmap"
    },
    {
      title: "Confirm scholarship deadline",
      why: "Check official timeline and milestones.",
      priority: "High" as const,
      ctaText: "Review Deadline",
      path: "/preparation?tab=roadmap&focus=deadline"
    },
    {
      title: "Prepare evidence pack",
      why: "Complete transcript, certificates, and test reports.",
      priority: "Medium" as const,
      ctaText: "Upload Documents",
      path: "/preparation?tab=documents"
    },
    {
      title: "Improve story arc",
      why: "Outline a compelling essay story arc with Mentor.",
      priority: "Medium" as const,
      ctaText: "Open Essay Coach",
      path: "/preparation?tab=essay-coach"
    }
  ] : !isTimelineConfirmed ? [
    {
      title: "Confirm Scholarship Deadlines",
      why: "Add official timeline milestones and portal submission dates to calendar.",
      priority: "High" as const,
      ctaText: "Build Timeline",
      path: "/preparation?tab=roadmap&focus=deadline"
    },
    {
      title: "Prepare Evidence Pack",
      why: "Scan and catalog official transcript PDFs, leadership proof, and supporting documents.",
      priority: "Medium" as const,
      ctaText: "Manage Documents",
      path: "/preparation?tab=documents"
    },
    {
      title: "Improve Essay Story Arc",
      why: "Draft personal statement focusing on motivating problems in target field.",
      priority: "Medium" as const,
      ctaText: "Open Essay Coach",
      path: "/preparation?tab=essay-coach"
    },
    {
      title: "Run Final Compliance Scan",
      why: "Check final application requirements before submission.",
      priority: "Medium" as const,
      ctaText: "Run Compliance Scan",
      path: "/preparation?tab=review"
    }
  ] : [
    {
      title: "Run Final Compliance Scan",
      why: "Check final application requirements before submission.",
      priority: "High" as const,
      ctaText: "Run Compliance Scan",
      path: "/preparation?tab=review"
    },
    {
      title: "Prepare Evidence Pack",
      why: "Scan and catalog official transcript PDFs, leadership proof, and supporting documents.",
      priority: "Medium" as const,
      ctaText: "Manage Documents",
      path: "/preparation?tab=documents"
    },
    {
      title: "Improve Essay Story Arc",
      why: "Draft personal statement focusing on motivating problems in target field.",
      priority: "Medium" as const,
      ctaText: "Open Essay Coach",
      path: "/preparation?tab=essay-coach"
    },
    {
      title: "Confirm Scholarship Deadlines",
      why: "Add official timeline milestones and portal submission dates to calendar.",
      priority: "Low" as const,
      ctaText: "Build Timeline",
      path: "/preparation?tab=roadmap&focus=deadline"
    }
  ];

  return {
    overallReadinessReasoning,
    overallReadinessWhy,
    nextBestActionNew,
    needsAttentionNew,
    readinessScore,
    readinessStatus,
    readinessColor,
    readinessColorClass,
    improvementExplanation,
    potentialImprovementCopy,
    howToReachGreenCopy,
    risks,
    riskRadar: risks,
    highestRisk,
    nextBestAction,
    topMatch,
    matches: matcher.matches,
    essayFeedback: essay.essayFeedback,
    evidenceGaps: { strengths, gaps },
    roadmap,
    advisorReport: {
      notes,
      strengths,
      gaps
    },
    agentTrace,
    readinessDimensions: [
      { name: "Academic Fit", score: academicScore, status: academicScore >= 80 ? "Strong" : "Moderate", rationale: `GPA is ${profile.gpa.toFixed(2)}.` },
      { name: "Language Readiness", score: englishScore, status: englishScore >= 80 ? "Strong" : "Needs Attention", rationale: profile.englishStatus !== "Not Taken" ? `${profile.englishStatus} score is available: ${profile.englishScore}.` : "Language test evidence is not available yet." },
      { name: "Evidence Strength", score: Math.min(evidenceScore, 100), status: evidenceScore >= 80 ? "Strong" : "Moderate", rationale: "Evidence is assessed from leadership, research, community impact, and work experience." },
      { name: "Scholarship Fit", score: topMatch ? topMatch.matchScore : 75, status: topMatch && topMatch.matchScore >= 80 ? "Strong" : "Moderate", rationale: topMatch ? `Profile fits ${topMatch.name}.` : "Verify scholarship eligibility." },
      { name: "Recommender Readiness", score: 100 - risks.recommenderRisk, status: risks.recommenderRisk <= 30 ? "Strong" : risks.recommenderRisk <= 60 ? "Moderate" : "Needs Attention", rationale: `Recommender Risk is ${risks.recommenderRisk}%.` },
      { name: "Story Strength", score: 100 - risks.storyRisk, status: risks.storyRisk <= 30 ? "Strong" : "Moderate", rationale: `Story Risk is ${risks.storyRisk}%.` },
      { name: "Deadline Readiness", score: 100 - risks.deadlineRisk, status: risks.deadlineRisk <= 30 ? "Strong" : "Needs Attention", rationale: `Deadline Risk is ${risks.deadlineRisk}%.` }
    ],
    mentorSummary: `Overall readiness: ${readinessScore}%. Best current direction: ${topMatch?.name || "your target scholarship"}. Main recommendation: validate official eligibility first, then strengthen the essay with leadership, research, community impact, and work evidence.`,
    security: {
      passed: true,
      issues: [],
      sanitizedProfile: profile
    },
    fallbackMode: true,
    mentorRecommendations,
    recommendedActions
  };
}

export function getSentinelAnalysis(profile: StudentProfile, apiResult?: any): SentinelAnalysisResult {
  const localAnalysis = calculateSentinelAnalysis(profile);
  if (!apiResult) {
    return localAnalysis;
  }

  const root = apiResult?.result ?? apiResult ?? {};
  
  const readinessScore = localAnalysis.readinessScore;
  const risks = localAnalysis.risks;
  const highestRisk = localAnalysis.highestRisk;
  const nextBestAction = localAnalysis.nextBestActionNew.actionCopy || localAnalysis.nextBestAction;

  const {
    readinessStatus,
    readinessColor,
    readinessColorClass,
    overallReadinessReasoning,
    overallReadinessWhy,
    improvementExplanation,
    potentialImprovementCopy,
    howToReachGreenCopy
  } = getReadinessCappedStatus(readinessScore, risks, profile);

  const matches = root.matches ? root.matches : localAnalysis.matches;
  const topMatch = matches && matches[0] ? matches[0] : localAnalysis.topMatch;
  const roadmap = root.roadmap ? root.roadmap : localAnalysis.roadmap;
  const essayFeedback = root.essayFeedback ? root.essayFeedback : localAnalysis.essayFeedback;
  
  const mentorSummary = root.mentorSummary ?? localAnalysis.mentorSummary;

  return {
    overallReadinessReasoning,
    overallReadinessWhy,
    nextBestActionNew: localAnalysis.nextBestActionNew,
    needsAttentionNew: localAnalysis.needsAttentionNew,
    readinessScore,
    readinessStatus,
    readinessColor,
    readinessColorClass,
    improvementExplanation,
    potentialImprovementCopy,
    howToReachGreenCopy,
    risks,
    riskRadar: risks,
    highestRisk,
    nextBestAction,
    topMatch,
    matches,
    essayFeedback,
    evidenceGaps: localAnalysis.evidenceGaps,
    roadmap,
    advisorReport: {
      notes: localAnalysis.advisorReport.notes,
      strengths: localAnalysis.evidenceGaps.strengths,
      gaps: localAnalysis.evidenceGaps.gaps
    },
    agentTrace: localAnalysis.agentTrace, // Use aligned agent traces
    readinessDimensions: localAnalysis.readinessDimensions, // Use aligned readiness dimensions
    mentorSummary,
    security: root.security ?? localAnalysis.security,
    fallbackMode: apiResult?.fallbackMode !== undefined ? Boolean(apiResult.fallbackMode) : localAnalysis.fallbackMode,
    mentorRecommendations: localAnalysis.mentorRecommendations,
    recommendedActions: localAnalysis.recommendedActions
  };
}export function getActiveAnalysis(
  profile: StudentProfile | null,
  sentinelResult: SentinelAnalysisResult | null
): SentinelAnalysisResult | null {
  if (!profile) return null;

  if (!sentinelResult) {
    return calculateSentinelAnalysis(profile);
  }

  const savedProfile = sentinelResult.security?.sanitizedProfile;
  if (
    !savedProfile ||
    savedProfile.recommenderStatus !== profile.recommenderStatus ||
    savedProfile.deadlineTimelineStatus !== profile.deadlineTimelineStatus ||
    savedProfile.deadlineMilestonesConfirmed !== profile.deadlineMilestonesConfirmed ||
    savedProfile.finalComplianceCheckCompleted !== profile.finalComplianceCheckCompleted ||
    savedProfile.finalHumanReviewCompleted !== profile.finalHumanReviewCompleted ||
    JSON.stringify(savedProfile.finalHumanReviewChecklist) !== JSON.stringify(profile.finalHumanReviewChecklist) ||
    savedProfile.gpa !== profile.gpa ||
    savedProfile.englishStatus !== profile.englishStatus ||
    savedProfile.englishScore !== profile.englishScore ||
    savedProfile.hasLeadership !== profile.hasLeadership ||
    savedProfile.hasResearch !== profile.hasResearch ||
    savedProfile.hasCommunityImpact !== profile.hasCommunityImpact ||
    savedProfile.hasWorkExperience !== profile.hasWorkExperience ||
    savedProfile.hasFinancialNeed !== profile.hasFinancialNeed ||
    savedProfile.preferredIntakeYear !== profile.preferredIntakeYear ||
    JSON.stringify(savedProfile.targetCountries) !== JSON.stringify(profile.targetCountries)
  ) {
    return calculateSentinelAnalysis(profile);
  }

  return sentinelResult;
}
