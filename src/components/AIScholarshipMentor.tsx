import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  ClipboardCheck,
  MessageSquare,
  X
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { realScholarships } from "../data/scholarships";
import { cn } from "../lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIScholarshipMentor() {
  const { mode, profile, activeScholarshipId, readinessScore } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeScholarship = realScholarships.find(s => s.id === activeScholarshipId);

  // Load chat and summary from localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem("scholarpath_mentor_chat");
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([{
        role: "assistant",
        content: `Hello! I'm your AI Scholarship Mentor. I've reviewed your profile and current readiness score (${readinessScore}%). How can I help you today?`
      }]);
    }

    const savedSummary = localStorage.getItem("scholarpath_mentor_summary");
    if (savedSummary) setSummary(savedSummary);
  }, [readinessScore]);

  // Persist chat
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("scholarpath_mentor_chat", JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

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
        readinessScore,
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
      const fallback = getFallbackResponse(text, { profile, activeScholarship, readinessScore });
      setMessages(prev => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (q: string, ctx: any) => {
    const query = q.toLowerCase();
    const { profile, activeScholarship, readinessScore } = ctx;

    if (query.includes("prioritize")) {
      return `Based on your profile, you should prioritize scholarships that match your ${profile?.targetDegree} goal. If you haven't already, check ${activeScholarship?.name || "the Australia Awards or Chevening"} programs.`;
    }
    if (query.includes("gap")) {
      return `Your readiness score is ${readinessScore}%. Our analyzer suggests focus on ${profile?.englishStatus === "Not Taken" ? "English proficiency (IELTS/TOEFL)" : "recommender outreach"} and finalizing your target program choices.`;
    }
    if (query.includes("essay")) {
      return "For your essay, focus on connecting your past achievements with your future contribution to your home country. Be specific about why this program is the right bridge for you.";
    }
    return "That's a great question. While I'm in offline mode, I recommend focusing on securing consistent recommendation letters and verifying deadlines on the official scholarship website.";
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

  return (
    <div className="space-y-6" id="mentor-chat">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-6 w-6 text-google-blue" />
          <h3 className="text-2xl font-bold text-text-main">AI Scholarship Mentor</h3>
        </div>
        <p className="text-text-secondary text-sm">Ask questions, clarify your gaps, and get personalized guidance for your scholarship journey.</p>
      </div>

      <div className="bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-google-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest leading-none">Mentor Online</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={generateSummary}
              className="px-3 py-1 bg-google-blue-light text-google-blue text-[10px] font-bold rounded-lg hover:bg-google-blue hover:text-white transition-all flex items-center gap-1.5"
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Generate Summary
            </button>
            <button 
              onClick={clearChat}
              className="p-1.5 text-text-secondary hover:text-google-red rounded-lg transition-colors border border-transparent hover:border-google-red/10"
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
                msg.role === "assistant" ? "bg-google-blue-light" : "bg-gray-100"
              )}>
                {msg.role === "assistant" ? <Bot className="h-4 w-4 text-google-blue" /> : <User className="h-4 w-4 text-text-secondary" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === "assistant" 
                  ? "bg-white border border-border-subtle text-text-main" 
                  : "bg-google-blue text-white shadow-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 mr-auto max-w-[85%]">
              <div className="h-8 w-8 rounded-full bg-google-blue-light flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-google-blue" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-border-subtle flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-google-blue" />
                <span className="text-xs text-text-secondary">Mentor is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="px-6 py-3 border-t border-border-subtle bg-gray-50/30 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {suggestedPrompts.map(prompt => (
              <button 
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 bg-white border border-border-subtle rounded-full text-[10px] font-bold text-text-secondary hover:border-google-blue hover:text-google-blue whitespace-nowrap transition-all shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-subtle bg-white">
          <div className="flex gap-2 p-1.5 bg-gray-50 border border-border-subtle rounded-2xl focus-within:border-google-blue transition-colors">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask your mentor anything..."
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-text-secondary"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 bg-google-blue text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-lg shadow-google-blue/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mentor Summary Widget if shown on Preparation Page */}
      {summary && (
        <div className="bg-google-blue/5 border border-google-blue/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-google-blue" />
              <h4 className="text-sm font-bold text-text-main uppercase tracking-widest">Mentor Interaction Summary</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{summary}</p>
          </div>
          <div className="flex gap-2 shrink-0">
             <button 
                onClick={() => {
                  const element = document.getElementById('one-page-report');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-white border border-border-subtle text-xs font-bold text-text-main rounded-xl hover:bg-gray-50 flex items-center gap-2"
              >
                View in Report
              </button>
              <button 
                onClick={() => setSummary(null)} // Local hide
                className="p-2 text-text-secondary hover:bg-gray-100 rounded-xl"
              >
                <X className="h-4 w-4" />
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
