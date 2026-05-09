import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Globe2, 
  GraduationCap, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  ShieldCheck,
  Clock
} from "lucide-react";
import { realScholarships } from "../../data/scholarships";
import { cn } from "@/src/lib/utils";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";

export default function ScholarshipsPage() {
  const navigate = useNavigate();
  const { mode, profile, setIsProfileFormOpen, savedScholarshipIds, activeScholarshipId, toggleSaveScholarship, setActiveScholarship, handleAnalyzeFit } = useProfile();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState("All");
  const [filterDegree, setFilterDegree] = useState("All");

  const regions = useMemo(() => ["All", ...new Set(realScholarships.map(s => s.region))], []);
  const degrees = ["All", "Bachelor's", "Master's", "PhD"];

  const filteredScholarships = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return realScholarships.filter(s => {
      // Broader Search Logic
      const matchesSearch = query === "" || 
                           s.name.toLowerCase().includes(query) || 
                           s.provider.toLowerCase().includes(query) ||
                           s.institution?.toLowerCase().includes(query) ||
                           s.country.toLowerCase().includes(query) ||
                           s.region.toLowerCase().includes(query) ||
                           s.degreeLevels.some(lvl => lvl.toLowerCase().includes(query)) ||
                           s.fieldsOfStudy?.some(f => f.toLowerCase().includes(query)) ||
                           s.coverage.toLowerCase().includes(query) ||
                           s.benefits.toString().toLowerCase().includes(query) ||
                           s.eligibilitySummary.toLowerCase().includes(query) ||
                           s.tags.some(t => t.toLowerCase().includes(query)) ||
                           s.searchableKeywords?.some(k => k.toLowerCase().includes(query));

      const matchesRegion = filterRegion === "All" || s.region === filterRegion;
      const matchesDegree = filterDegree === "All" || s.degreeLevels.includes(filterDegree);
      
      return matchesSearch && matchesRegion && matchesDegree;
    }).map(s => {
      // Calculate a dynamic match score based on user profile if available
      let score = 0;
      let fitCategory = "Demo Match";
      
      if (profile) {
        // Simple heuristic matching
        if (profile.targetDegree && s.degreeLevels.includes(profile.targetDegree)) score += 40;
        if (profile.targetCountries?.includes(s.country) || s.region === "Global") score += 30;
        
        // Field of study match
        if (profile.targetField && s.fieldsOfStudy?.some(f => f.toLowerCase().includes(profile.targetField!.toLowerCase()))) score += 15;
        
        // Specific University Match (e.g. searching MIT and having MIT in tags/Keywords)
        if (searchQuery && s.tags.some(t => t.toLowerCase() === searchQuery.toLowerCase())) score += 5;

        if (profile.gpa && parseFloat(profile.gpa.toString()) >= 3.5) score += 5;
        if (profile.englishStatus !== "Not Taken") score += 5;
        
        fitCategory = score >= 85 ? "Excellent Match" : score >= 70 ? "Good Match" : score >= 50 ? "Moderate Match" : "Competitive Reach";
      } else {
        score = 0; // Will be handled in UI
        fitCategory = "Profile Required";
      }
      
      return { ...s, matchScore: Math.min(score, 100), fitCategory };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [searchQuery, filterRegion, filterDegree, profile]);

  const savedScholarships = filteredScholarships.filter(s => savedScholarshipIds.includes(s.id));

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterRegion("All");
    setFilterDegree("All");
  };

  if (mode === "empty") {
    return (
      <div className="space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-extrabold text-text-main mb-2">Scholarship Matches</h1>
          <p className="text-text-secondary">
            Discover scholarships that fit your profile, goals, and preparation readiness.
          </p>
        </header>
        <div className="bg-white rounded-3xl p-12 border border-border-subtle shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-google-blue-light rounded-full flex items-center justify-center mx-auto">
            <Search className="h-10 w-10 text-google-blue" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-text-main mb-2">Create your profile to see matches</h2>
            <p className="text-sm text-text-secondary mb-8">We need to know your target degree, GPA, and country of origin to find the right scholarships for you.</p>
            <button 
              onClick={() => setIsProfileFormOpen(true)}
              className="px-8 py-3 bg-google-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors"
            >
              Set Up My Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
             <h1 className="text-3xl font-extrabold text-text-main mb-2">Scholarship Matches</h1>
             <p className="text-text-secondary text-sm">
                Curated from official/public scholarship sources. Dynamic matching based on your profile.
             </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-google-blue/5 border border-google-blue/10 rounded-full">
            <ShieldCheck className="h-4 w-4 text-google-blue" />
            <span className="text-[10px] font-bold text-google-blue uppercase tracking-widest leading-none">Verified Sources</span>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input 
                  type="text"
                  placeholder="Search scholarships, universities, countries, fields, or keywords..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border-subtle rounded-xl text-sm focus:border-google-blue outline-none transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary shrink-0" />
                <select 
                  className="w-full px-3 py-2 bg-gray-50 border border-border-subtle rounded-xl text-sm outline-none"
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                >
                  <option value="All">All Regions</option>
                  {regions.filter(r => r !== "All").map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-text-secondary shrink-0" />
                <select 
                  className="w-full px-3 py-2 bg-gray-50 border border-border-subtle rounded-xl text-sm outline-none"
                  value={filterDegree}
                  onChange={(e) => setFilterDegree(e.target.value)}
                >
                  <option value="All">All Degree Levels</option>
                  {degrees.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mr-2">Try:</span>
                {["MIT", "Oxford", "DAAD", "fully funded", "MBA", "AI", "Japan"].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-text-secondary text-[10px] rounded-md transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              {(searchQuery || filterRegion !== "All" || filterDegree !== "All") && (
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold text-google-red hover:underline flex items-center gap-1"
                >
                  Clear All Filters & Search
                </button>
              )}
            </div>
          </div>

          {(searchQuery || filterRegion !== "All" || filterDegree !== "All") && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-text-secondary">
                Showing <span className="font-bold text-text-main">{filteredScholarships.length}</span> results 
                {searchQuery && <> for "<span className="font-bold text-google-blue">{searchQuery}</span>"</>}
                {filterRegion !== "All" && <> in <span className="font-bold text-text-main">{filterRegion}</span></>}
                {filterDegree !== "All" && <> for <span className="font-bold text-text-main">{filterDegree}</span></>}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-google-blue hover:underline"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Warning Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Disclaimer:</span> Scholarship information changes frequently. Always verify eligibility, deadlines, and requirements on the official scholarship website. ScholarPath AI provides guidance based on curated public records.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-border-subtle shadow-sm w-fit">
        <div className={cn("h-2 w-2 rounded-full", mode === "demo" ? "bg-google-green" : "bg-google-blue")} />
        <span className="text-sm font-medium text-text-main">
          {mode === "demo" ? `Demo Profile Loaded: ${profile?.name}` : `My Profile: ${profile?.name}`}
        </span>
      </div>

      {/* Saved Scholarships Section */}
      <section className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider">My Saved Scholarships</h2>
            <p className="text-[10px] text-text-secondary mt-1">
              You can save multiple scholarships, but only one can be <span className="font-bold">Active for Preparation</span> at a time. The active scholarship is used for Evidence Gap Analysis, Preparation Roadmap, Risk Radar, and Final Readiness Review.
            </p>
          </div>
          <span className="px-2 py-0.5 bg-google-blue text-white text-[10px] font-bold rounded-full shrink-0 h-fit self-start md:self-center">{savedScholarships.length}</span>
        </div>
        <div className="p-6">
          {savedScholarships.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-text-secondary italic">No scholarships saved yet. Browse matches below.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {savedScholarships.map(s => (
                <div key={s.id} className={cn(
                  "flex-1 min-w-[280px] bg-white border rounded-xl p-4 relative group transition-all",
                  activeScholarshipId === s.id ? "border-google-green shadow-sm shadow-google-green/10" : "border-border-subtle"
                )}>
                  {activeScholarshipId === s.id ? (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-google-green text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm">
                      Active
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-gray-100 text-text-secondary text-[9px] font-bold uppercase tracking-widest rounded border border-border-subtle">
                      Saved
                    </div>
                  )}
                  <h4 className="text-sm font-bold text-text-main mb-1 pr-12">{s.name}</h4>
                  <p className="text-[10px] text-text-secondary mb-3">{s.country} • {s.matchScore}% Match • <span className="font-bold">{s.fitCategory}</span></p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleSaveScholarship(s.id, s.name)}
                        className="text-[10px] font-bold text-google-red hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    {activeScholarshipId !== s.id ? (
                      <button 
                        onClick={() => setActiveScholarship(s.id, s.name)}
                        className="px-3 py-1 border border-google-blue text-google-blue text-[10px] font-bold rounded hover:bg-google-blue hover:text-white transition-colors"
                      >
                        Set as Active
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-google-green uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredScholarships.map((scholarship, idx) => {
          const isSaved = savedScholarshipIds.includes(scholarship.id);
          const isActive = activeScholarshipId === scholarship.id;
          
          return (
            <motion.div 
              key={scholarship.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "bg-white rounded-xl border transition-all relative overflow-hidden group",
                isActive ? "border-google-green shadow-md shadow-google-green/10" : "border-border-subtle shadow-sm hover:border-google-blue/30",
                isSaved && !isActive && "border-l-4 border-l-google-green"
              )}
            >
              {isSaved && !isActive && (
                <div className="absolute top-4 right-16 flex items-center gap-1 px-3 py-1 bg-google-green-light text-google-green-text text-[10px] font-bold rounded-full border border-google-green/20">
                  <CheckCircle2 className="h-3 w-3" /> Saved ✓
                </div>
              )}

              {isActive && (
                <div className="absolute top-4 right-16 flex items-center gap-1 px-3 py-1 bg-google-green text-white text-[10px] font-bold rounded-full shadow-sm">
                  <CheckCircle2 className="h-3 w-3" /> Active for Preparation
                </div>
              )}
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gray-50 border border-border-subtle flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-main group-hover:text-google-blue transition-colors leading-tight">{scholarship.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-sm font-bold text-google-blue">{scholarship.provider}</span>
                        {scholarship.institution && (
                          <span className="text-xs font-medium text-text-secondary italic">at {scholarship.institution}</span>
                        )}
                        <span className="text-text-secondary text-sm">•</span>
                        <div className="flex items-center gap-1 text-text-secondary text-sm">
                          <Globe2 className="h-3 w-3" /> {scholarship.country}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Match Score</p>
                      <div className="flex items-center gap-2 justify-end">
                        {profile ? (
                          <>
                            <span className="text-2xl font-black text-google-blue">{scholarship.matchScore}%</span>
                            <div className="h-8 w-1 bg-google-blue/10 rounded-full overflow-hidden">
                              <div className="h-full bg-google-blue" style={{ height: `${scholarship.matchScore}%` }} />
                            </div>
                          </>
                        ) : (
                          <button 
                            onClick={() => setIsProfileFormOpen(true)}
                            className="text-[10px] font-bold text-google-blue hover:underline text-right max-w-[120px] leading-tight"
                          >
                            Create profile to see score
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-10 w-[1px] bg-border-subtle" />
                    <div className="text-right min-w-[100px]">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Fit Category</p>
                      <p className={cn(
                        "text-sm font-bold",
                        !profile ? "text-text-secondary" :
                        scholarship.matchScore >= 85 ? "text-google-green" : 
                        scholarship.matchScore >= 70 ? "text-google-blue" : "text-text-main"
                      )}>{profile ? scholarship.fitCategory : "Setup Required"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5 border-y border-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
                      <GraduationCap className="h-4 w-4" /> Degree Levels
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      {scholarship.degreeLevels.map(lvl => (
                        <span key={lvl} className="px-2 py-0.5 bg-gray-100 rounded">{lvl}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
                      <Layers className="h-4 w-4" /> Coverage
                    </div>
                    <p className="text-sm font-bold text-text-main">{scholarship.coverage}</p>
                    <p className="text-[10px] text-text-secondary line-clamp-1">{scholarship.benefits}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
                      <Clock className="h-4 w-4" /> Cycle
                    </div>
                    <p className="text-sm font-bold text-text-main">{scholarship.estimatedCycle}</p>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded",
                        scholarship.applicationStatus === "Open" ? "bg-google-green text-white" : "bg-gray-100 text-text-secondary"
                      )}>{scholarship.applicationStatus}</span>
                      <span className="text-[9px] text-text-secondary italic">Last verified: {scholarship.lastVerified}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Eligibility Summary</p>
                  <p className="text-xs text-text-main leading-relaxed">{scholarship.eligibilitySummary}</p>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50/50 border-t border-border-subtle flex flex-wrap gap-2 justify-end items-center">
                <button 
                  onClick={() => {
                    handleAnalyzeFit(scholarship.id, scholarship.name);
                    navigate("/preparation#evidence-gap");
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-google-blue hover:bg-google-blue-light hover:text-google-blue rounded-md transition-all"
                >
                  Analyze My Fit
                </button>
                
                <button 
                  onClick={() => toggleSaveScholarship(scholarship.id, scholarship.name)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md transition-all border",
                    isSaved 
                      ? "text-google-red border-google-red/20 hover:bg-red-50" 
                      : "text-google-blue border-google-blue/30 hover:bg-google-blue hover:text-white"
                  )}
                >
                  {isSaved ? "Remove from Roadmap" : "Save to Roadmap"}
                </button>

                {isSaved && (
                  <button 
                    onClick={() => {
                      if (isActive) {
                        // Optional message if clicked when already active
                      } else {
                        setActiveScholarship(scholarship.id, scholarship.name);
                      }
                    }}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-md transition-all shadow-sm flex items-center gap-2",
                      isActive 
                        ? "bg-google-green text-white cursor-default" 
                        : "bg-white border border-google-blue text-google-blue hover:bg-google-blue hover:text-white"
                    )}
                  >
                    {isActive ? <><CheckCircle2 className="h-4 w-4" /> ✓ Active for Preparation</> : "Set as Active"}
                  </button>
                )}

                <div className="ml-auto md:ml-4">
                   <button 
                    onClick={() => window.open(scholarship.officialUrl, "_blank")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border-subtle rounded-md text-xs font-bold text-text-secondary hover:bg-gray-50 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Official Source
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredScholarships.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-border-subtle shadow-sm space-y-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-text-secondary">
              <Search className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-text-main mb-2">
                No exact match found for "{searchQuery}"
              </h2>
              <p className="text-sm text-text-secondary mb-8">
                Try searching for broader keywords, university names (like MIT or Oxford), 
                or specific fields of study (like AI or Public Policy).
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button 
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-white border border-border-subtle rounded-xl text-xs font-bold text-text-main hover:bg-gray-50 transition-colors"
                >
                  View All Scholarships
                </button>
                <button 
                  onClick={() => navigate("/preparation#mentor-chat")}
                  className="px-4 py-2 bg-google-blue text-white rounded-xl text-xs font-bold shadow-lg shadow-google-blue/20 hover:bg-blue-700 transition-colors"
                >
                  Ask AI Mentor
                </button>
              </div>

              <div className="pt-6 border-t border-border-subtle">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Popular Searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["fully funded", "AI", "MBA", "USA", "UK", "Germany", "Master's"].map(kw => (
                    <button 
                      key={kw}
                      onClick={() => setSearchQuery(kw)}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-border-subtle rounded-full text-[10px] font-medium text-text-secondary"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
