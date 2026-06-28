import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  X,
  ClipboardCheck
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { realScholarships } from "../data/scholarships";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { calculateSentinelAnalysis, getActiveAnalysis } from "../utils/sentinelAnalysis";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIScholarshipMentor() {
  const { mode, profile, activeScholarshipId, sentinelResult } = useProfile();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);
  const score = sentinelResult?.readinessScore ?? (profile?.readinessScore || 75);

  // Load chat and summary from localStorage
  useEffect(() => {
    const isRecSubmitted = profile?.recommenderStatus === "Submitted" || profile?.recommenderStatus === "Uploaded" || profile?.recommenderStatus === "Received";
    const isTimelineConfirmed = profile?.deadlineTimelineStatus === "confirmed" || profile?.deadlineMilestonesConfirmed === true;
    const isComplianceCompleted = profile?.complianceScanCompleted === true || profile?.complianceScanStatus === "completed" || profile?.finalReviewStatus === "completed";

    // Auto-update default welcome chat when milestone states change
    const getWelcomeChat = () => {
      if (isComplianceCompleted) {
        return [
          {
            role: "assistant" as const,
            content: "Excellent progress. Your application is now submission-ready, but a final human review is recommended before submission."
          },
          {
            role: "user" as const,
            content: "Great, what are the final steps?"
          },
          {
            role: "assistant" as const,
            content: "Verify that all file uploads are compliant, print your one-page report, and share the package with an advisor or mentor for final feedback."
          }
        ];
      } else if (isTimelineConfirmed) {
        return [
          {
            role: "assistant" as const,
            content: "Your timeline is now drafted. The next step is to run a final compliance scan to check documents, deadlines, and scholarship-specific requirements."
          },
          {
            role: "user" as const,
            content: "How do I run the compliance scan?"
          },
          {
            role: "assistant" as const,
            content: "Go to the Final Review tab in the preparation workspace and click 'Run Compliance Scan'."
          }
        ];
      } else if (isRecSubmitted) {
        return [
          {
            role: "assistant" as const,
            content: "Great, your recommender readiness is now secured. Your readiness has moved into Strong territory. The next step is to confirm your submission timeline."
          },
          {
            role: "user" as const,
            content: "How do I confirm the timeline?"
          },
          {
            role: "assistant" as const,
            content: "Go to the Roadmap tab and click 'Build Timeline' under Step 4 to draft your deadline calendar."
          }
        ];
      } else {
        return [
          {
            role: "assistant" as const,
            content: "Your profile is close to Strong readiness, but recommender readiness is the main blocker. Submit or confirm your recommendation letters to unlock stronger readiness."
          },
          {
            role: "user" as const,
            content: "How can I secure them?"
          },
          {
            role: "assistant" as const,
            content: "Go to Step 3 in the Roadmap tab, click 'Draft Request' to prepare context, and request referee commitment."
          }
        ];
      }
    };

    const savedChat = localStorage.getItem("scholarpath_mentor_chat");
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        const isDefaultChat = parsed.length === 3 && 
          (parsed[0].content.includes("recommender readiness") || 
           parsed[0].content.includes("timeline is now drafted") || 
           parsed[0].content.includes("timeline is drafted") || 
           parsed[0].content.includes("timeline is now drafted") || 
           parsed[0].content.includes("submission-ready") ||
           parsed[0].content.includes("timeline is now drafted") ||
           parsed[0].content.includes("submission timeline") ||
           parsed[0].content.includes("recommender request") ||
           parsed[0].content.includes("Your profile is close to"));

        if (isDefaultChat) {
          const newWelcome = getWelcomeChat();
          setMessages(newWelcome);
          localStorage.setItem("scholarpath_mentor_chat", JSON.stringify(newWelcome));
        } else {
          setMessages(parsed);
        }
      } catch (e) {
        // ignore
      }
    } else {
      const initialWelcome = getWelcomeChat();
      setMessages(initialWelcome);
      localStorage.setItem("scholarpath_mentor_chat", JSON.stringify(initialWelcome));
    }

    const savedSummary = localStorage.getItem("scholarpath_mentor_summary");
    if (savedSummary) setSummary(savedSummary);
  }, [profile?.recommenderStatus, profile?.deadlineTimelineStatus, profile?.deadlineMilestonesConfirmed, activeScholarshipId]);

  // Persist chat
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("scholarpath_mentor_chat", JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare context for the API
      const context = {
        profile,
        activeScholarship,
        readinessScore: score,
        mode,
        history: messages.slice(-5) // Send last 5 messages for context
      };

      const response = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      // Fallback response
      const fallback = getFallbackResponse(text, { profile, activeScholarship });
      setMessages(prev => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (q: string, ctx: any) => {
    const query = q.toLowerCase();
    const { profile, activeScholarship } = ctx;

    const name = profile?.name || "Student";
    const origin = profile?.origin || "your home country";
    const targetDegree = profile?.targetDegree || "target degree";
    const gpa = profile?.gpa || 0.0;
    const english = profile?.englishStatus !== "Not Taken" 
      ? `${profile?.englishStatus} (${profile?.englishScore})` 
      : "Not Taken Yet";
    
    const fields = profile?.fields && profile.fields.length > 0 
      ? profile.fields.join(" and ") 
      : "your fields of study";
      
    const activeName = activeScholarship?.name || "your target scholarship";
    const readiness = score;

    const offlineSubtle = "\n\n*(Note: This guidance was generated in local deterministic mode based on your student profile.)*";

    const isRecSubmitted = profile?.recommenderStatus === "Submitted" || profile?.recommenderStatus === "Uploaded" || profile?.recommenderStatus === "Received";

    // 1. Actions / Next steps
    if (query.includes("action") || query.includes("week") || query.includes("step") || query.includes("priorit") || query.includes("todo") || query.includes("to-do") || query.includes("happen")) {
      if (isRecSubmitted) {
        return `Here are the 3 most important actions you should take this week to improve your ${activeName} scholarship readiness:

1. Confirm ${activeName} official deadlines
Map out your week-by-week timeline immediately to manage deadline risks. Add all deadlines and draft lock-in dates to your calendar.

2. Complete your evidence pack
Scan and catalog official transcript PDFs, leadership proof, and supporting documents in your Documents tab.

3. Refine essays and SOP
Use the Essay Coach to outline and draft your personal statement without fabricating any achievements, keeping it authentic.${offlineSubtle}`;
      }
      return `Here are the 3 most important actions you should take this week to improve your ${activeName} scholarship readiness:

1. Confirm ${activeName} eligibility and deadline
Check the official ${activeName} fellowship and assistantship requirements, because the funding criteria may vary by program. Save the official page and note exact deadlines.

2. Secure recommender alignment
Contact two academic or professional recommenders this week. Send them your CV, target program, scholarship goal, and 3 achievement bullets related to ${fields}.

3. Prepare evidence pack
Prepare GPA transcript (current GPA: ${gpa}), English result (${english}), CV, leadership evidence, project evidence, and essay story notes. Your essay should connect your ${fields} background with a real problem in ${origin} and your future contribution after graduation.${offlineSubtle}`;
    }

    // 2. Evidence gaps / Documents
    if (query.includes("gap") || query.includes("document") || query.includes("evidence") || query.includes("missing") || query.includes("proof")) {
      const gapsList: string[] = [];
      if (gpa < 3.5) {
        gapsList.push(`- GPA Fit: Your GPA is ${gpa}. While valid, competitive scholarships often favor GPA > 3.5. Ensure you highlight leadership and work evidence to offset this.`);
      }
      if (profile?.englishStatus === "Not Taken") {
        gapsList.push("- English Proficiency: You have not taken a standardized English test yet. Standard requirement is IELTS 6.5+ or TOEFL 90+. Secure a test date immediately.");
      }
      if (profile && !profile.hasLeadership) {
        gapsList.push("- Leadership Evidence: Your profile lacks active leadership highlights. Identify 1-2 projects where you led a team or initiative.");
      }
      if (profile && !profile.hasResearch) {
        gapsList.push("- Research Potential: No research evidence declared. If applying for academic or research-focused awards, draft a 1-page project proposal.");
      }
      if (profile && !profile.hasCommunityImpact) {
        gapsList.push("- Community Impact: Lacking community involvement proof. Mention volunteering, tutoring, or social contributions.");
      }
      if (profile && !profile.hasWorkExperience) {
        gapsList.push("- Professional Experience: Limited work experience. Emphasize internships or academic group projects.");
      }
      if (!isRecSubmitted) {
        gapsList.push("- Recommender Letters: Standard letters of reference are currently pending/unsecured.");
      }

      const priorityList = isRecSubmitted 
        ? [
            `1. Confirm ${activeName} official deadlines and build a timeline.`,
            `2. Complete your evidence pack and transcript uploads.`,
            `3. Refine essays and SOP outlines.`,
          ]
        : [
            `1. Schedule English test (if not yet taken: ${english}).`,
            `2. Request recommendation letters (academic & professional).`,
            `3. Gather official transcripts and certified translations.`,
            `4. Document community and leadership achievements with specific metrics.`
          ];

      return `Here is the assessment of your evidence gaps for ${activeName}:

${gapsList.length > 0 ? gapsList.join("\n") : "No critical evidence gaps detected!"}

Recommended Priority Order:
${priorityList.join("\n")}${offlineSubtle}`;
    }

    // 3. Essay
    if (query.includes("essay") || query.includes("personal statement") || query.includes("motivation") || query.includes("letter") || query.includes("story") || query.includes("narrative")) {
      return `Here is your personalized essay strategy for ${activeName}:

- **Suggested Story Angle:** Connect your target degree (${targetDegree}) and study fields (${fields}) directly to solving a real, measurable problem in ${origin}.
- **Opening Direction:** Start with a concrete case study or personal observation in your country (e.g., *"When I observed the data gaps in ${origin}'s public services..."*), detail your direct actions, and pivot to why ${activeName} is the logical next step.
- **Evidence to Mention:** Highlight your GPA (${gpa}) to establish academic readiness, along with specific examples of ${profile?.hasLeadership ? "leadership" : "initiative"} and ${profile?.hasCommunityImpact ? "community involvement" : "collaboration"}.
- **What to Avoid:** Avoid generic lines like "I have wanted to study abroad since childhood" or copying essays from other fields. Committee members value authentic, localized stories above all.${offlineSubtle}`;
    }

    // 4. Recommenders
    if (query.includes("recommender") || query.includes("reference") || query.includes("recommend") || query.includes("referee")) {
      if (isRecSubmitted) {
        return `Great news: your recommendation letters have already been successfully committed or uploaded! This is no longer a blocker for your candidacy. You should now focus on story refinement and deadline tracking.${offlineSubtle}`;
      }
      return `Here is your recommender alignment strategy for ${activeName}:

- **Who to Ask:** Select one academic recommender (a professor who knows your work in ${fields}) and one professional recommender (a supervisor from your work or internship).
- **What to Send Them:**
  1. A polite email asking for their support and offering a quick brief.
  2. Your updated resume or CV.
  3. A 1-page summary of your target scholarship (${activeName}) and target programs.
  4. 3 specific bullet points of accomplishments you achieved under their supervision.
- **Suggested Briefing Points:** Ask them to comment on your academic rigor (GPA: ${gpa}), your aptitude in ${fields}, and concrete examples of your leadership and teamwork.${offlineSubtle}`;
    }

    // 5. Catch-all / General questions
    const nextStepSuggestion = isRecSubmitted
      ? `Confirm the official eligibility criteria and deadline for ${activeName} first, then build your submission timeline and outline your essays.`
      : `Confirm the official eligibility criteria and deadline for ${activeName} first, then secure 2 recommenders and map your leadership/community evidence to your essay.`;

    return `Hello ${name}! Here is a quick assessment of your preparation status for ${activeName}:

- **Target Destination:** ${activeScholarship?.country || "Global"}
- **Academic Standard:** GPA ${gpa} (Academic Readiness is ${gpa >= 3.5 ? "Strong" : "Moderate"})
- **English Proficiency:** ${english}
- **Target Field:** ${fields}
- **Overall Readiness:** ${readiness}%

**My recommendation:** ${nextStepSuggestion} How can I help you with your preparation today?${offlineSubtle}`;
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      const initial = [{
        role: "assistant",
        content: `Chat cleared. How can I help you progress your ${activeScholarship?.name || "scholarship"} application?`
      }];
      setMessages(initial);
      localStorage.removeItem("scholarpath_mentor_chat");
    }
  };

  const generateSummary = () => {
    const newSummary = `Based on our mentor conversation, your current priority is to strengthen your scholarship-specific narrative for ${activeScholarship?.name || "your target award"}. \n\nRecommended focus: Address recommendation letter gaps and refine your career impact story. \n\nNext actions: \n1. Contact 2 recommenders this week \n2. Update Resume/CV \n3. Draft Motivation Letter opening.`;
    setSummary(newSummary);
    localStorage.setItem("scholarpath_mentor_summary", newSummary);
    alert("Mentor summary generated for your One-Page Report!");
  };

  const suggestedPrompts = [
    "What are my biggest evidence gaps?",
    "How can I improve my essay?",
    "What should I ask my recommenders?",
    "Generate my next 5 actions"
  ];

  if (!profile) return null;

  const analysis = getActiveAnalysis(profile, sentinelResult);
  const recommendations = analysis?.mentorRecommendations || [
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
    },
    {
      title: "Review with mentor or advisor",
      desc: "Get human feedback to validate your next steps.",
      ctaText: "Get human feedback",
      ctaAction: "report"
    }
  ];

  const handleRecommendationClick = (action: string, title: string) => {
    if (action === "roadmap") {
      if (title.toLowerCase().includes("deadline") || title.toLowerCase().includes("timeline")) {
        navigate("/preparation?tab=roadmap&focus=deadline");
      } else if (title.toLowerCase().includes("recommender") || title.toLowerCase().includes("referee")) {
        navigate("/preparation?tab=roadmap&focus=recommender");
      } else {
        navigate("/preparation?tab=roadmap");
      }
    } else if (action === "documents") {
      navigate("/preparation?tab=documents");
    } else if (action === "essay" || action === "essay-coach") {
      navigate("/preparation?tab=essay-coach");
    } else if (action === "interview" || action === "interview-coach") {
      navigate("/preparation?tab=interview-coach");
    } else if (action === "report" || action === "one-page-report") {
      navigate("/preparation?tab=one-page-report");
    } else {
      navigate(`/preparation?tab=${action}`);
    }
  };

  return (
    <div className="space-y-6" id="mentor-chat">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-6 w-6 text-google-blue" />
          <h3 className="text-2xl font-bold text-slate-900">AI Scholarship Mentor</h3>
        </div>
        <p className="text-slate-500 text-sm">Personalized guidance based on your Sentinel Risk Radar Scan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left column: Student Profile Summary Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">{profile.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile.origin}</p>
            </div>
          </div>
          
          <div className="border-t border-slate-150 pt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Readiness Score</span>
              <span className="font-bold text-slate-900">{score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Level</span>
              <span className="font-bold text-slate-900 truncate max-w-[120px]">{profile.targetDegree}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GPA</span>
              <span className="font-bold text-slate-900">{profile.gpa.toFixed(2)} / 4.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">English Status</span>
              <span className="font-bold text-slate-900 truncate max-w-[120px]">{profile.englishStatus} ({profile.englishScore})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Intake Year</span>
              <span className="font-bold text-slate-900">{profile.preferredIntakeYear}</span>
            </div>
          </div>
        </div>

        {/* Right column: Chat mentor panel */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-google-green rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Mentor Online</span>
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={generateSummary}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1.5 cursor-pointer border border-transparent"
              >
                <ClipboardCheck className="h-3.5 w-3.5" /> Generate Summary
              </button>
              <button 
                type="button"
                onClick={clearChat}
                className="p-1.5 text-slate-500 hover:text-google-red rounded-lg transition-colors border border-transparent hover:border-google-red/10 cursor-pointer"
                title="Clear Chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "assistant" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-100 border border-slate-200"
                )}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4 text-slate-500" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "assistant" 
                    ? "bg-slate-50 border border-slate-200 text-slate-800" 
                    : "bg-blue-600 text-white shadow-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 mr-auto max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-xs text-slate-500">Mentor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/20 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {suggestedPrompts.map(prompt => (
                <button 
                  type="button"
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-google-blue hover:text-google-blue whitespace-nowrap transition-all shadow-sm cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-google-blue transition-colors">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask your mentor anything..."
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
              />
              <button 
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-md cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation cards below the chat */}
      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-base font-bold text-slate-900 mb-4">Sentinel Actionable Recommendations</h4>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {recommendations.map(card => {
            const isHil = card.ctaText.includes("feedback") || card.ctaText.includes("human");
            return (
              <div key={card.title} className={cn(
                "flex flex-col justify-between p-5 border rounded-2xl transition hover:shadow-md hover:border-slate-350",
                isHil ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200"
              )}>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs mb-2">{card.title}</h5>
                  <p className="text-[11px] text-slate-500 leading-normal mb-4">{card.desc}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleRecommendationClick(card.ctaAction, card.title)}
                  className="w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-2 px-3 block transition cursor-pointer border border-transparent"
                >
                  {card.ctaText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mentor Summary Widget if shown on Preparation Page */}
      {summary && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-google-blue" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Mentor Interaction Summary</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{summary}</p>
          </div>
          <div className="flex gap-2 shrink-0">
             <button 
                type="button"
                onClick={() => {
                  const element = document.getElementById('one-page-report');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                View in Report
              </button>
              <button 
                type="button"
                onClick={() => setSummary(null)} // Local hide
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
