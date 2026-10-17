import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Code, Server, Database, Workflow, Cpu, Layers, ShoppingBag, RefreshCw, 
  Play, GitCommit, GitPullRequest, Cloud, Send, Github, Linkedin, ExternalLink, 
  FileText, CheckCircle, Phone, MapPin, Mail, ArrowUpRight, Award, MessageSquare, 
  Calendar, Briefcase, GraduationCap, Star, Check, Globe, ChevronRight, X, ArrowUp,
  Sun, Moon, GitBranch, Search, Grid, SlidersHorizontal, Zap, ChevronDown, Quote, ShieldCheck
} from "lucide-react";

import { ScrambleText } from "./animated/ScrambleText";
import { ScrollPinnedReveal } from "./animated/ScrollPinnedReveal";
import { SkillFlowDiagram } from "./animated/SkillFlowDiagram";
import { InteractiveSkillMatrix } from "./animated/InteractiveSkillMatrix";
import { HeroBannerShowcase } from "./animated/HeroBannerShowcase";
import { AnimatedProjectsShowcase } from "./animated/AnimatedProjectsShowcase";
import { AnimatedTimeline } from "./animated/AnimatedTimeline";
import { AnimatedServicesShowcase } from "./animated/AnimatedServicesShowcase";
import { AnimatedContactTerminal } from "./animated/AnimatedContactTerminal";
import { 
  MotionSection, 
  MotionStaggerGroup, 
  MotionProjectCard, 
  MotionTechCard, 
  MotionTimelineItem, 
  MotionButton 
} from "./animated/MotionComponents";
import { motionConfig, usePrefersReducedMotion } from "../motion-config";
import { loadPortfolioData } from "../lib/portfolioData";

// Types matching server schema
import { Database as DBType, Project, Blog, Service, Skill, Experience, Education, Certification, Testimonial } from "../types";

interface PortfolioViewProps {
  onOpenAdmin: () => void;
  siteName: string;
}

export default function PortfolioView({ onOpenAdmin, siteName }: PortfolioViewProps) {
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  // Skill View & Filtering States
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("All");
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>("");
  const [skillViewMode, setSkillViewMode] = useState<"both" | "flow" | "matrix">("both");
  
  // Custom Theme state (persisted to localStorage, respects system setting)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved) {
      return saved === "dark";
    }
    if (typeof window !== "undefined" && window.matchMedia) {
      return !window.matchMedia("(prefers-color-scheme: light)").matches;
    }
    return true; // Default is dark theme
  });

  useEffect(() => {
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Custom Detail Modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showAllTestimonials, setShowAllTestimonials] = useState<boolean>(false);
  const [showAllBlogs, setShowAllBlogs] = useState<boolean>(false);
  const [blogCategory, setBlogCategory] = useState<string>("All");
  const [blogSearchQuery, setBlogSearchQuery] = useState<string>("");

  // Submitting state for Contact Form
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    budget: "",
    message: ""
  });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactNotification, setContactNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load public portfolio data from the API locally and static JSON on GitHub Pages.
  useEffect(() => {
    loadPortfolioData()
      .then((data) => {
        setDb(data);
        setLoading(false);
        // Track the main index page hit
        trackVisit("/");
      })
      .catch((err) => {
        console.error("Error fetching portfolio database", err);
        setLoading(false);
      });
  }, []);

  // Helper to post dynamic visitor tracking data
  const trackVisit = (pageName: string) => {
    if (import.meta.env.DEV || import.meta.env.PROD) {
      return;
    }

    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageUrl: pageName,
        referrer: document.referrer || "Direct"
      })
    }).catch((e) => console.log("Silent analytics skip"));
  };

  // Dynamic Page Title overrides (SEO)
  useEffect(() => {
    if (db?.seo?.metaTitle) {
      document.title = db.seo.metaTitle;
    }
  }, [db]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate: Name is required, either Email or Phone is required, Message details is required.
    if (!contactForm.name.trim()) {
      setContactNotification({ type: "error", text: "Please key in your Full Name." });
      return;
    }
    if (!contactForm.email.trim() && !contactForm.phone.trim()) {
      setContactNotification({ type: "error", text: "Please provide either an Email or Phone so Ritesh can reach you." });
      return;
    }
    if (!contactForm.message.trim()) {
      setContactNotification({ type: "error", text: "Please describe your project details." });
      return;
    }
    
    setSubmittingContact(true);
    setContactNotification({ type: "success", text: "Redirecting you to WhatsApp..." });

    // Format WhatsApp message exactly as requested
    const budgetValue = contactForm.budget || "Not specified";
    const formattedMessage = `Hi Ritesh, I'd like to discuss a project.\n\n` +
      `Name: ${contactForm.name}\n` +
      `Email: ${contactForm.email || 'N/A'}\n` +
      `Phone: ${contactForm.phone || 'N/A'}\n` +
      `Budget: ${budgetValue}\n` +
      `Project Details: ${contactForm.message}`;

    const whatsappUrl = `https://wa.me/917463867570?text=${encodeURIComponent(formattedMessage)}`;
    
    // Open in a new tab
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // Pause for 1.5s to show on-page success before reset
    setTimeout(() => {
      setSubmittingContact(false);
      setContactForm({ name: "", email: "", phone: "", subject: "", budget: "", message: "" });
      setContactNotification(null);
    }, 1500);
  };

  // Safe icon lookup component
  const RenderIcon = ({ name, className = "w-6 h-6 text-indigo-400" }: { name: string; className?: string }) => {
    const clean = name?.trim()?.toLowerCase();
    switch (clean) {
      case "code": return <Code className={className} />;
      case "server": return <Server className={className} />;
      case "database": return <Database className={className} />;
      case "workflow": return <Workflow className={className} />;
      case "cpu": return <Cpu className={className} />;
      case "layers": return <Layers className={className} />;
      case "shoppingbag": return <ShoppingBag className={className} />;
      case "refreshcw": return <RefreshCw className={className} />;
      case "play": return <Play className={className} />;
      case "gitcommit": return <GitCommit className={className} />;
      case "gitpullrequest": return <GitPullRequest className={className} />;
      case "cloud": return <Cloud className={className} />;
      default: return <Code className={className} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" id="loading-spinner"></div>
        <p className="text-sm font-mono tracking-wider text-slate-400">LOADING RITESH KUMAR PORTFOLIO...</p>
      </div>
    );
  }

  // Active db fallback config
  const profile = db?.profile || {
    name: "Ritesh Kumar",
    title: "Freelance Full-Stack Web Developer",
    bio: "Need a website or planning to build a powerful, scalable web application? I'm Ritesh Kumar, a Freelance Full Stack Web Developer for Hire...",
    email: "ritesh2001stm@gmail.com",
    linkedin: "https://www.linkedin.com/in/ritesh-kumar-freelancer",
    location: "Ahmedabad, Gujarat, India",
    profileImage: "/assets/ritesh_profile.jpg",
    resumeUrl: "#"
  };
  const hero = db?.hero || { heading: "Building Scaling Apps", subheading: "4+ Years of Full-Stack Excellence" };
  const services = db?.services || [];
  const skills = db?.skills || [];
  const projects = db?.projects || [];
  const experience = db?.experience || [];
  const education = db?.education || [];
  const certifications = db?.certifications || [];
  const testimonials = db?.testimonials || [];
  const blogs = db?.blogs || [];
  const site = db?.site || { logoText: "Ritesh", logoSubtext: "Kumar", socialWhatsApp: "https://wa.me/917463867570" };

  // Generate clean categories list for portfolio projects tab
  const projectCategories = ["All", ...Array.from(new Set(projects.map((p: any) => p.category)))];

  const filteredProjects = filterCategory === "All"
    ? projects
    : projects.filter((p: any) => p.category === filterCategory);

  const projectsToDisplay = showAllProjects
    ? filteredProjects
    : filteredProjects.slice(0, 6);

  // Theme styling definitions for Light and Dark modes
  const t = {
    bgMain: isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800",
    bgCard: isDark ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200 shadow-sm",
    bgCardHover: isDark ? "hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]" : "hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.06)]",
    bgCardAlt: isDark ? "bg-slate-950/75" : "bg-slate-100/80",
    bgSectionAlt: isDark ? "bg-slate-900/40 border-y border-slate-900" : "bg-slate-100/70 border-y border-slate-200",
    borderMain: isDark ? "border-slate-900" : "border-slate-200",
    borderCard: isDark ? "border-slate-800" : "border-slate-200",
    textBright: isDark ? "text-white" : "text-slate-950",
    textMuted: isDark ? "text-slate-400" : "text-slate-600",
    textIndigo: isDark ? "text-indigo-400" : "text-indigo-600",
    borderIndigo: isDark ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" : "border-indigo-200 bg-indigo-50 text-indigo-600",
    navLink: isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-indigo-600",
    iconColor: isDark ? "text-indigo-400" : "text-indigo-600",
    bulletBg: isDark ? "bg-indigo-600 border-slate-900" : "bg-indigo-600 border-white",
    inputBg: isDark ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500" : "bg-slate-100/80 border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white"
  };

  return (
    <div className={`relative min-h-screen ${t.bgMain} font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden transition-colors duration-300`}>
      
      {/* GLOWING ORBS BACKDROP */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? "bg-indigo-600/10" : "bg-indigo-500/5"} rounded-full blur-3xl pointer-events-none transition-opacity duration-300`}></div>
      <div className={`absolute top-1/3 right-10 w-80 h-80 ${isDark ? "bg-blue-500/10" : "bg-blue-500/5"} rounded-full blur-3xl pointer-events-none transition-opacity duration-300`}></div>
      <div className={`absolute bottom-1/4 left-10 w-[450px] h-[450px] ${isDark ? "bg-purple-600/5" : "bg-purple-500/3"} rounded-full blur-3xl pointer-events-none transition-opacity duration-300`}></div>

      {/* FLOATING WHATSAPP CTA - bottom-right */}
      <a 
        href={site.socialWhatsApp || "https://wa.me/917463867570"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 transition-transform hover:scale-110 text-white p-4 rounded-full shadow-lg flex items-center justify-center group"
        title="Chat with Ritesh on WhatsApp"
        id="whatsapp-cta"
      >
        <span className={`absolute right-14 ${isDark ? "bg-slate-900 border-slate-800 text-emerald-300" : "bg-white border-slate-200 text-emerald-600 shadow-md"} border text-xs px-3 py-1.5 rounded-lg opacity-0 pointer-events-none transition-all group-hover:opacity-100 whitespace-nowrap font-mono`}>
          Chat with me! 💬
        </span>
        <Phone className="w-6 h-6 fill-white text-emerald-500" />
      </a>

      {/* HEADER NAVIGATION */}
      <header className={`sticky top-0 z-40 backdrop-blur-md ${isDark ? "bg-slate-950/80 border-slate-900" : "bg-white/85 border-slate-200"} border-b transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg tracking-wider text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
              {site.logoText ? site.logoText.slice(0, 2).toUpperCase() : "RK"}
            </div>
            <div>
              <span className={`font-mono font-extrabold tracking-tight ${t.textBright} group-hover:text-indigo-400 transition-colors`}>
                {site.logoText || "Ritesh"}
              </span>{" "}
              <span className={`${t.textIndigo} font-light`}>{site.logoSubtext || "Kumar"}</span>
            </div>
          </a>

          {/* DESKTOP LINKS */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#about" className={`${t.navLink} transition-colors`}>About</a>
            <a href="#services" className={`${t.navLink} transition-colors`}>Services</a>
            <a href="#skills" className={`${t.navLink} transition-colors`}>Skills</a>
            <a href="#portfolio" className={`${t.navLink} transition-colors`}>Projects</a>
            <a href="#experience" className={`${t.navLink} transition-colors`}>Experience</a>
            <a href="#testimonials" className={`${t.navLink} transition-colors`}>Client Buzz</a>
            <a href="#blog" className={`${t.navLink} transition-colors`}>Blog</a>
            <a href="#contact" className={`${t.navLink} transition-colors mr-2`}>Get In Touch</a>
            
            {/* Inline Theme Toggle Icon */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-900 text-amber-400" : "hover:bg-slate-100 text-indigo-600"}`}
              aria-label="Toggle theme inline"
              title="Switch Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Action Bar Theme Toggle Icon (Visible always, perfect for Mobile view) */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-xl transition-colors md:hidden ${isDark ? "bg-slate-900 hover:bg-slate-800 text-amber-400" : "bg-slate-100 hover:bg-slate-200 text-indigo-600 border border-slate-200"}`}
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a 
              href="#contact" 
              className="hidden lg:inline-flex px-4 py-2 text-xs font-bold font-mono tracking-wide uppercase rounded-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-white"
            >
              Hire Me
            </a>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <HeroBannerShowcase hero={hero} profile={profile} isDark={isDark} t={t} />

      {/* 2. ABOUT & STATS SECTION */}
      <MotionSection id="about" className={`py-20 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5" data-scroll-reveal>
              <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase mb-2`}>ABOUT THE ARCHITECT</p>
              <h2 className={`text-3xl font-bold ${t.textBright} mb-6`}>Expert in High-Performance Custom Applications</h2>
              
              <div className={`rounded-2xl ${t.bgCardAlt} border ${t.borderCard} p-6 space-y-4`}>
                <h3 className={`font-mono text-sm ${t.textIndigo} flex items-center gap-2`}>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  Freelancer credentials
                </h3>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"} leading-relaxed`}>
                  {profile.bio}
                </p>
                
                <div className={`pt-4 border-t ${t.borderCard} flex flex-col gap-2.5 text-xs ${t.textMuted} font-mono`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" /> {profile.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" /> {profile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-slate-500" /> {profile.linkedin ? "Connected Profile" : "linkedin.com/in/ritesh-kumar"}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              <div data-scroll-reveal>
                <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase mb-2`}>MY CAPABILITIES</p>
                <h2 className={`text-3xl font-bold ${t.textBright} mb-6`}>Why Client Agencies Partner with Me</h2>
              </div>

              <MotionStaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MotionTechCard index={0} className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Rapid Project Deliveries</h4>
                  <p className={`text-xs ${t.textMuted}`}>Strict on-time guarantees and structured progression milestones.</p>
                </MotionTechCard>

                <MotionTechCard index={1} className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Code className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Absolute Architectural Integrity</h4>
                  <p className={`text-xs ${t.textMuted}`}>Clean MVC design patterns utilizing robust validation algorithms.</p>
                </MotionTechCard>

                <MotionTechCard index={2} className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Flexible Scaling Capabilities</h4>
                  <p className={`text-xs ${t.textMuted}`}>Can work on isolated tasks or command our pool of 10+ devs.</p>
                </MotionTechCard>

                <MotionTechCard index={3} className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Worldwide Timezone Syncs</h4>
                  <p className={`text-xs ${t.textMuted}`}>Full collaboration availability for USA, UK, & Europe partners.</p>
                </MotionTechCard>
              </MotionStaggerGroup>

              {/* RESUME DOWNLOAD SECTION */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={`mt-8 p-5 rounded-2xl ${isDark ? "bg-indigo-900/15 border-indigo-500/20" : "bg-indigo-50 border-indigo-200"} flex flex-col sm:flex-row items-center justify-between gap-4`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-indigo-400" />
                  <div>
                    <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Download Resume Portfolio</h4>
                    <p className={`text-xs ${t.textMuted}`}>Get the full offline PDF specs & client histories.</p>
                  </div>
                </div>
                <MotionButton id="resume-download-btn">
                  <a 
                    href={profile.resumeUrl || "#"} 
                    download="Ritesh-Kumar-Full-Stack-Developer-Resume.pdf"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-xs font-mono font-bold tracking-wide uppercase text-center block"
                  >
                    Download Info (PDF)
                  </a>
                </MotionButton>
              </motion.div>

            </div>
          </div>
        </div>
      </MotionSection>

      {/* 3. SERVICES SECTION */}
      <AnimatedServicesShowcase services={services} isDark={isDark} t={t} />

      {/* 4. SKILLS SECTION */}
      <MotionSection id="skills" className={`py-20 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* HEADER */}
          <div className="flex flex-col items-center text-center space-y-3">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase`}>EVOLUTION & MASTERY</p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${t.textBright}`}>Skills & Development Stack</h2>
            <div className="w-16 h-1 bg-indigo-500 rounded-full"></div>
            <p className={`text-xs sm:text-sm ${t.textMuted} max-w-2xl`}>
              Explore the step-by-step learning progression tree or filter through full production stack competencies.
            </p>

            {/* VIEW MODE TOGGLES */}
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setSkillViewMode("both")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  skillViewMode === "both"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : `${isDark ? "bg-slate-900 text-slate-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-900"} border ${t.borderCard}`
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Combined Overview
              </button>

              <button
                onClick={() => setSkillViewMode("flow")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  skillViewMode === "flow"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : `${isDark ? "bg-slate-900 text-slate-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-900"} border ${t.borderCard}`
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" /> Step-by-Step Flow Tree
              </button>

              <button
                onClick={() => setSkillViewMode("matrix")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  skillViewMode === "matrix"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : `${isDark ? "bg-slate-900 text-slate-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-900"} border ${t.borderCard}`
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Skill Matrix Cards
              </button>
            </div>
          </div>

          {/* STEP-BY-STEP LEARNING FLOW TREE */}
          {(skillViewMode === "flow" || skillViewMode === "both") && (
            <div className="space-y-6">
              <SkillFlowDiagram isDark={isDark} t={t} />
            </div>
          )}

          {/* SKILL MATRIX CARDS WITH CATEGORY FILTERING & SEARCH */}
          {(skillViewMode === "matrix" || skillViewMode === "both") && (
            <div className="pt-4">
              <InteractiveSkillMatrix skills={skills} isDark={isDark} t={t} />
            </div>
          )}

        </div>
      </MotionSection>

      {/* 5. PORTFOLIO/PROJECTS SECTION */}
      <AnimatedProjectsShowcase projects={projects} isDark={isDark} t={t} />

      {/* 6. EXPERIENCES & RESUME TIME-LINE */}
      <AnimatedTimeline experiences={experience} education={education} certifications={certifications} isDark={isDark} t={t} />

      {/* 7. CLIENT BUZZ / TESTIMONIALS */}
      <MotionSection id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5" /> CLIENT REVIEWS & VERIFIED PARTNERSHIPS
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${t.textBright}`}>
              Feedback From Enterprise Partners
            </h2>
            <p className={`text-xs sm:text-sm ${t.textMuted} max-w-2xl mx-auto`}>
              Verified testimonials from engineering directors, CTOs, and product managers across the UK, US, Canada, Australia, and Singapore.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <MotionStaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {(showAllTestimonials ? testimonials : testimonials.slice(0, 4)).map((test: Testimonial, idx: number) => (
              <MotionTechCard 
                key={test.id || idx} 
                index={idx} 
                className={`p-6 sm:p-7 rounded-3xl ${t.bgCard} border ${t.borderCard} hover:border-indigo-500/40 transition-all relative flex flex-col justify-between shadow-xl group hover:-translate-y-1`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {Array.from({ length: test.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Client
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm ${isDark ? "text-slate-200" : "text-slate-800"} leading-relaxed italic`}>
                    "{test.message}"
                  </p>
                </div>

                <div className={`pt-5 border-t ${isDark ? "border-slate-800/60" : "border-slate-200/80"} mt-6 flex items-center gap-3.5`}>
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-900 border-2 border-indigo-500/30 shrink-0 shadow-md">
                    <img 
                      src={test.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"} 
                      alt={test.clientName} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`text-xs sm:text-sm font-bold ${t.textBright}`}>{test.clientName}</h4>
                    <p className={`text-[11px] font-mono ${t.textIndigo} font-semibold`}>{test.company}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-indigo-500/10 ml-auto pointer-events-none" />
                </div>
              </MotionTechCard>
            ))}
          </MotionStaggerGroup>

          {/* SHOW MORE / SHOW LESS TOGGLE BUTTON */}
          {testimonials.length > 4 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowAllTestimonials(!showAllTestimonials)}
                className={`px-8 py-3.5 rounded-2xl ${
                  isDark ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100" : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                } border font-mono text-xs font-bold transition-all shadow-xl hover:shadow-indigo-500/10 flex items-center gap-3 cursor-pointer group`}
              >
                <span>
                  {showAllTestimonials 
                    ? "Show Fewer Testimonials" 
                    : `Show More Enterprise Testimonials (+${testimonials.length - 4} More Client Reviews)`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${showAllTestimonials ? "rotate-180" : "group-hover:translate-y-0.5"}`} />
              </button>
            </div>
          )}

        </div>
      </MotionSection>

      {/* 8. BLOG & KNOWLEDGES SECTION */}
      <MotionSection id="blog" className={`py-20 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase font-bold text-center`}>KNOWLEDGE SHARING & ARCHITECTURE</p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${t.textBright} text-center`}>Ritesh's Architectural Blog</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 mx-auto rounded-full"></div>
            <p className={`text-xs sm:text-sm ${t.textMuted} max-w-2xl mx-auto`}>
              Technical deep dives into high-concurrency Node.js, PHP Symfony backends, web scraping strategies, and performance engineering.
            </p>
          </div>

          {/* BLOG CONTROLS (shown when expanded) */}
          {showAllBlogs && (
            <div className={`p-4 sm:p-5 rounded-2xl ${t.bgCard} border ${t.borderCard} shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4`}>
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
                {["All", "PHP & Symfony", "Web Scraping", "Backend Architecture", "Frontend Engineering", "Python Automation", "Database Systems", "AI Systems"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBlogCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                      blogCategory === cat
                        ? "bg-indigo-600 text-white shadow-sm"
                        : `${isDark ? "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800" : "bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"} border`
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles & tags..."
                  value={blogSearchQuery}
                  onChange={(e) => setBlogSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-8 py-1.5 rounded-xl text-xs font-mono ${t.inputBg} border transition-all outline-none focus:ring-2 focus:ring-indigo-500/40`}
                />
                {blogSearchQuery && (
                  <button
                    onClick={() => setBlogSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BLOG POSTS GRID */}
          {(() => {
            const filteredBlogs = blogs.filter((post: Blog) => {
              const matchesCat = blogCategory === "All" || post.category === blogCategory;
              const matchesSearch = !blogSearchQuery.trim() ||
                post.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                post.tags?.some(tag => tag.toLowerCase().includes(blogSearchQuery.toLowerCase()));
              return matchesCat && matchesSearch;
            });

            const displayedBlogs = showAllBlogs || blogSearchQuery.trim() || blogCategory !== "All"
              ? filteredBlogs
              : filteredBlogs.slice(0, 2);

            if (displayedBlogs.length === 0) {
              return (
                <div className={`p-8 text-center rounded-2xl ${t.bgCard} border ${t.borderCard}`}>
                  <p className={`text-xs font-mono ${t.textMuted}`}>No architectural blogs match your search criteria.</p>
                  <button
                    onClick={() => { setBlogCategory("All"); setBlogSearchQuery(""); }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-mono font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-8">
                <MotionStaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedBlogs.map((post: Blog, idx: number) => (
                    <MotionProjectCard 
                      key={post.id}
                      index={idx}
                      className={`group p-6 rounded-3xl ${t.bgCard} border ${t.borderCard} hover:border-indigo-500/40 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden`}
                    >
                      <div className="space-y-4">
                        <div className={`aspect-video w-full rounded-2xl overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"} relative`}>
                          <img 
                            src={post.featuredImage || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800"} 
                            alt={post.title} 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                          <span className="absolute bottom-3 left-3 bg-slate-950/90 text-indigo-400 text-[10px] font-mono px-3 py-1 rounded-full border border-slate-800 font-bold">
                            {post.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className={`${t.textMuted} uppercase`}>Published {post.createdAt}</span>
                          <span className="text-indigo-400 font-bold">5 min read</span>
                        </div>

                        <h3 className={`text-xl font-bold ${t.textBright} group-hover:text-indigo-400 transition-colors leading-snug`}>
                          {post.title}
                        </h3>
                        <p className={`text-xs ${t.textMuted} leading-relaxed line-clamp-3`}>
                          {post.content}
                        </p>
                      </div>

                      <div className={`pt-5 border-t ${isDark ? "border-slate-800/80" : "border-slate-100"} mt-6 flex items-center justify-between`}>
                        <button 
                          onClick={() => {
                            setSelectedBlog(post);
                            trackVisit(`/blog/${post.slug}`);
                          }}
                          className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/btn"
                        >
                          <span>Read Full Blueprint Article</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                        <div className="flex gap-1">
                          {post.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} className={`text-[9px] font-mono ${isDark ? "bg-slate-950 text-slate-400 border border-slate-800" : "bg-slate-100 text-slate-600 border border-slate-200/60"} px-2 py-0.5 rounded-full`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                    </MotionProjectCard>
                  ))}
                </MotionStaggerGroup>

                {/* SHOW MORE / SHOW FEWER BLOGS ACTION BUTTON */}
                {!showAllBlogs && !blogSearchQuery.trim() && blogCategory === "All" && blogs.length > 2 && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowAllBlogs(true)}
                      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <span>Show More Architectural Blogs ({blogs.length - 2}+ More Articles)</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                {showAllBlogs && !blogSearchQuery.trim() && blogCategory === "All" && blogs.length > 2 && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowAllBlogs(false)}
                      className={`px-6 py-3 rounded-2xl ${
                        isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      } border font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer`}
                    >
                      <span>Collapse Blog Articles</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </MotionSection>

      {/* 9. CONTACT & HIRE ME FORM */}
      <AnimatedContactTerminal profile={profile} isDark={isDark} t={t} onSubmitContact={handleContactSubmit} />

      {/* FOOTER */}
      <footer className={`${isDark ? "bg-slate-950 border-slate-900" : "bg-slate-100 border-slate-200"} border-t py-16 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <span className={`font-mono text-base font-extrabold ${t.textBright}`}>
              {site.logoText || "Ritesh"}{" "}
              <span className="text-indigo-400 font-light">{site.logoSubtext || "Kumar"}</span>
            </span>
            <p className={`text-xs ${t.textMuted} leading-relaxed md:max-w-xs`}>
              Providing modern enterprise full-stack development, headless API integrations, and robust automated workflows contextually since 2021.
            </p>
            <div className="flex gap-3">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={`p-2 rounded ${isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-500"} border transition-colors`}>
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={site.socialGitHub || "https://github.com/ritesh-kumar"} target="_blank" rel="noopener noreferrer" className={`p-2 rounded ${isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-500"} border transition-colors`}>
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-slate-700"} uppercase tracking-wider mb-4`}>Focus Frameworks</h4>
            <ul className={`space-y-2 text-xs ${t.textMuted} font-mono`}>
              <li>- PHP Symfony & Laravel</li>
              <li>- React.js / Next.js</li>
              <li>- Node.js (Express & APIs)</li>
              <li>- Python Web scrapers</li>
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-slate-700"} uppercase tracking-wider mb-4`}>Quick Links</h4>
            <ul className={`space-y-2 text-xs ${t.textMuted} font-mono`}>
              <li><a href="#about" className="hover:text-indigo-400">Bio Profile</a></li>
              <li><a href="#services" className="hover:text-indigo-400">Our Services</a></li>
              <li><a href="#skills" className="hover:text-indigo-400">Technical Skill Matrix</a></li>
              <li><a href="#portfolio" className="hover:text-indigo-400">Past Projects</a></li>
            </ul>
          </div>

        </div>

        <div className={`max-w-7xl mx-auto mt-12 pt-8 border-t ${isDark ? "border-slate-900/60" : "border-slate-200"} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${t.textMuted} font-mono`}>
          <p>{db?.site?.footerText || "© 2026 Ritesh Kumar. All rights reserved."}</p>
          <a href="#home" className="hover:text-indigo-500 flex items-center gap-1">
            Back to Top <ArrowUp className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>

      {/*========================================================================
         MODAL 1: PROJECT DETAIL VIEW
         ========================================================================*/}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-widest font-bold">
                  {selectedProject.category}
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedProject.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedProject(null)} 
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                id="close-project-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Thumbnail Display / Splash */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950">
                <img 
                  src={selectedProject.thumbnail} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Specs list */}
                <div className="md:col-span-8 space-y-4">
                  <h4 className="font-mono text-xs text-indigo-300 uppercase tracking-wide">Structural Blueprint</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedProject.description}
                  </p>

                  <div className="space-y-3">
                    <h5 className="font-mono text-xs text-indigo-400 font-bold uppercase">Engine Features & Metrics:</h5>
                    <ul className="text-xs space-y-2 text-slate-400">
                      {selectedProject.features?.map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Meta details list */}
                <div className="md:col-span-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 font-mono text-xs">
                  <h4 className="text-indigo-400 uppercase font-bold tracking-wide">Specs & Stack</h4>
                  
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Client Name</span>
                      <span className="text-slate-200">{selectedProject.clientName || "Agency Client"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Technology Stack</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProject.techStack?.map((t: string, i: number) => (
                          <span key={i} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-2.5">
                    {selectedProject.projectUrl && (
                      <a 
                        href={selectedProject.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-center block"
                      >
                        Launch Direct URL ↗
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a 
                        href={selectedProject.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-center block"
                      >
                        Inspect Repository (Git)
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {/* Gallery loop */}
              {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-mono text-xs text-indigo-400 uppercase">Gallery Showcase</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProject.gallery.map((img: string, i: number) => (
                      <div key={i} className="aspect-video bg-slate-950 rounded-xl overflow-hidden">
                        <img src={img} alt="Gallery item" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/*========================================================================
         MODAL 2: BLOG ARTICLE DETAIL VIEW
         ========================================================================*/}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-widest font-bold">
                  {selectedBlog.category} | Created {selectedBlog.createdAt}
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedBlog.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedBlog(null)} 
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                id="close-blog-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950">
                <img 
                  src={selectedBlog.featuredImage} 
                  alt={selectedBlog.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex gap-1.5 flex-wrap">
                  {selectedBlog.tags?.map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono" id="blog-modal-content">
                  {selectedBlog.content}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800">
                    <img 
                      src={profile.profileImage} 
                      alt={profile.name} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600";
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase font-mono">Written by {profile.name}</h5>
                    <p className="text-[10px] text-slate-500">Full-Stack Solutions Architect</p>
                  </div>
                </div>
                <a 
                  href="#contact" 
                  onClick={() => setSelectedBlog(null)}
                  className="px-4 py-2 text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-5050 text-white rounded-lg"
                >
                  Ask Me Question
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
