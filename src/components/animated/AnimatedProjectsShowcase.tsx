import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ExternalLink, Github, Search, Filter, Sparkles, Star, Eye, Code, 
  ArrowUpRight, Layers, CheckCircle, X, ShieldCheck, Tag, Laptop, Globe
} from "lucide-react";
import { Project } from "../../types";
import { motionConfig } from "../../motion-config";

interface AnimatedProjectsShowcaseProps {
  projects: Project[];
  isDark: boolean;
  t: any;
}

export const AnimatedProjectsShowcase: React.FC<AnimatedProjectsShowcaseProps> = ({ projects, isDark, t }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"bento" | "grid">("bento");
  const [showAllProjects, setShowAllProjects] = useState<boolean>(false);

  // Filter Categories
  const categories = useMemo(() => {
    const cats = ["All"];
    projects.forEach((p) => {
      if (p.category && !cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Displayed projects slicing
  const displayedProjects = useMemo(() => {
    if (showAllProjects || searchQuery.trim() || selectedCategory !== "All") {
      return filteredProjects;
    }
    return filteredProjects.slice(0, 6);
  }, [filteredProjects, showAllProjects, searchQuery, selectedCategory]);

  return (
    <section id="portfolio" className={`py-24 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8 relative`}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-3">
          <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase font-bold`}>
            PORTFOLIO SHOWCASE
          </p>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${t.textBright}`}>
            Featured Production Works
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
          <p className={`text-xs sm:text-sm ${t.textMuted} max-w-2xl`}>
            Explore battle-tested web crawlers, full-stack SaaS apps, and enterprise APIs engineered for real-world reliability.
          </p>
        </div>

        {/* CONTROLS BAR: SEARCH, CATEGORIES & VIEW MODE */}
        <div className={`p-4 sm:p-6 rounded-3xl ${t.bgCard} border ${t.borderCard} shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          
          {/* CATEGORY PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : `${isDark ? "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800" : "bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"} border`
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* SEARCH & LAYOUT MODE TOGGLES */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tech or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-8 py-2 rounded-2xl text-xs font-mono ${t.inputBg} border transition-all outline-none focus:ring-2 focus:ring-indigo-500/40`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
                >
                  ×
                </button>
              )}
            </div>

            <div className={`p-1 rounded-2xl ${isDark ? "bg-slate-950 border-slate-900" : "bg-slate-100 border-slate-200"} border flex items-center shrink-0`}>
              <button
                onClick={() => setViewMode("bento")}
                className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  viewMode === "bento"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : `${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`
                }`}
                title="Bento Grid View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : `${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`
                }`}
                title="Standard Grid View"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* PROJECTS GRID DISPLAY */}
        {filteredProjects.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl ${t.bgCard} border ${t.borderCard}`}>
            <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className={`text-sm font-mono ${t.textBright} font-bold mb-1`}>No projects match your filter</p>
            <p className={`text-xs ${t.textMuted} mb-4`}>Try searching for different keywords or reset categories.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-mono font-bold hover:bg-indigo-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${viewMode === "bento" ? "md:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"} gap-6`}>
            <AnimatePresence>
              {displayedProjects.map((project, idx) => {
                const isFeatured = project.featured;

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    whileHover={{ y: -6 }}
                    className={`rounded-3xl ${t.bgCard} border ${t.borderCard} hover:border-indigo-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-xl relative ${
                      "h-full"
                    }`}
                  >
                    {/* TOP IMAGE & HOVER OVERLAY */}
                    <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-950">
                      <img 
                        src={project.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"} 
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800";
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/60 to-transparent" />

                      {/* FEATURED BADGE */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        {isFeatured && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-mono font-extrabold uppercase shadow-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-slate-950" /> Featured Flagship
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-indigo-300 text-[10px] font-mono font-bold uppercase border border-slate-700/60">
                          {project.category}
                        </span>
                      </div>

                      {/* HOVER QUICK INSPECT BUTTON */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-xl transition-all flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0"
                        >
                          <Eye className="w-4 h-4" /> Inspect Project Details
                        </button>
                      </div>
                    </div>

                    {/* CONTENT BODY */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg sm:text-xl font-bold ${t.textBright} group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug min-h-[3.1rem]`}>
                            {project.title}
                          </h3>
                        </div>

                        <p className={`text-xs ${t.textMuted} leading-relaxed line-clamp-2 min-h-[2.5rem]`}>
                          {project.description}
                        </p>
                      </div>

                      {/* TECH STACK PILLS */}
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.slice(0, 4).map((tech, i) => (
                            <span 
                              key={i} 
                              className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-lg ${
                                isDark ? "bg-slate-900/90 text-indigo-300 border border-slate-800" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 4 && (
                            <span className={`text-[10px] font-mono ${t.textMuted} px-1.5 py-0.5`}>
                              +{project.techStack.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* BOTTOM ACTION BUTTONS */}
                        <div className="pt-3 border-t border-slate-800/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 font-mono text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                Live Demo <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-white font-mono text-xs flex items-center gap-1 transition-colors"
                              >
                                Source <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedProject(project)}
                            className={`text-xs font-mono font-bold ${t.textIndigo} hover:underline flex items-center gap-1`}
                          >
                            Details <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* SHOW MORE / FEWER PROJECTS ACTION BAR */}
        {!showAllProjects && !searchQuery.trim() && selectedCategory === "All" && filteredProjects.length > 6 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAllProjects(true)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Show More Production Projects ({filteredProjects.length - 6}+ More)</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}
        {showAllProjects && !searchQuery.trim() && selectedCategory === "All" && filteredProjects.length > 6 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAllProjects(false)}
              className={`px-6 py-3 rounded-2xl ${
                isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              } border font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer`}
            >
              <span>Show Fewer Projects</span>
            </button>
          </div>
        )}

      </div>

      {/* PROJECT INSPECTION MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl ${t.bgCard} border ${t.borderCard} shadow-2xl relative space-y-6 overflow-hidden`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800/60 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* IMAGE HEADER */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img 
                  src={selectedProject.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"} 
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800";
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider mb-2 inline-block">
                      {selectedProject.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {selectedProject.title}
                    </h3>
                  </div>

                  {selectedProject.clientName && (
                    <div className="text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      Client: <span className="text-indigo-400 font-bold">{selectedProject.clientName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DESCRIPTION & FEATURES */}
              <div className="space-y-4">
                <h4 className={`text-sm font-mono uppercase font-bold tracking-wider ${t.textIndigo}`}>
                  Project Architecture & Overview
                </h4>
                <p className={`text-xs sm:text-sm ${t.textMuted} leading-relaxed`}>
                  {selectedProject.description}
                </p>

                {selectedProject.features && selectedProject.features.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className={`text-xs font-mono uppercase font-bold tracking-wider ${t.textBright}`}>
                      Key Technical Features & Deliverables:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProject.features.map((feat, i) => (
                        <div key={i} className={`p-3 rounded-xl ${isDark ? "bg-slate-950/80 border-slate-900" : "bg-slate-50 border-slate-200"} border flex items-start gap-2 text-xs`}>
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TECH STACK BADGES */}
                <div className="space-y-2 pt-2">
                  <span className={`text-xs font-mono uppercase font-bold tracking-wider ${t.textBright}`}>
                    Technology Stack & Tooling:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech, i) => (
                      <span 
                        key={i} 
                        className={`text-xs font-mono font-bold px-3 py-1 rounded-xl ${
                          isDark ? "bg-slate-900 text-indigo-300 border border-slate-800" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-4 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedProject.projectUrl && (
                    <a
                      href={selectedProject.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      <Globe className="w-4 h-4" /> Open Live Application <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-5 py-2.5 rounded-xl ${isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"} border font-mono text-xs font-bold transition-all flex items-center gap-2`}
                    >
                      <Github className="w-4 h-4" /> View Source Code
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  Close Modal
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
