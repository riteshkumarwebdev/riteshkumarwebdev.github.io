import React, { useState, useEffect } from "react";
import { 
  Code, Server, Database, Workflow, Cpu, Layers, ShoppingBag, RefreshCw, 
  Play, GitCommit, GitPullRequest, Cloud, Send, Github, Linkedin, ExternalLink, 
  FileText, CheckCircle, Phone, MapPin, Mail, ArrowUpRight, Award, MessageSquare, 
  Calendar, Briefcase, GraduationCap, Star, Check, Globe, ChevronRight, X, ArrowUp,
  Sun, Moon
} from "lucide-react";

// Types matching server schema
import { Database as DBType, Project, Blog, Service, Skill, Experience, Education, Certification, Testimonial } from "../types";
import { assetPath } from "../lib/githubPages";
import { loadPortfolioData } from "../lib/portfolioData";

interface PortfolioViewProps {
  onOpenAdmin: () => void;
  siteName: string;
}

export default function PortfolioView({ onOpenAdmin, siteName }: PortfolioViewProps) {
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showAllProjects, setShowAllProjects] = useState(false);
  
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

  // Load public portfolio data from custom API
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
    profileImage: assetPath("assets/ritesh_profile.jpg"),
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
      <section id="home" className="relative pt-24 pb-20 md:pt-36 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"} border text-xs font-mono`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Available for New Freelance Contracts
            </div>
            
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold ${t.textBright} leading-tight`}>
              {hero.heading || "Crafting High-Volume Web Automations & SaaS backends"}
            </h1>
            
            <p className={`text-lg ${t.textMuted} max-w-xl`}>
              {hero.subheading || "Full-Stack developer with 4+ years of expertise. I turn ideas into reliable high-performing web platforms, scrapers, and dynamic frontends."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a 
                href={hero.ctaLinkPrimary || "https://wa.me/917463867570"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                id="hero-cta-primary"
              >
                {hero.ctaTextPrimary || "Hire Me On WhatsApp"} <ArrowUpRight className="w-4 h-4" />
              </a>
              <a 
                href={hero.ctaLinkSecondary || "#portfolio"} 
                className={`px-6 py-3.5 rounded-xl ${isDark ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"} border font-medium text-sm transition-all`}
                id="hero-cta-secondary"
              >
                {hero.ctaTextSecondary || "View Work Portfolio"}
              </a>
            </div>

            <div className={`grid grid-cols-3 gap-6 pt-8 border-t ${isDark ? "border-slate-900" : "border-slate-200"} max-w-lg`}>
              <div>
                <p className={`text-2xl md:text-3xl font-extrabold ${t.textBright}`}>4+ Years</p>
                <p className={`text-xs ${t.textMuted} uppercase tracking-wider font-mono`}>Real Results</p>
              </div>
              <div>
                <p className={`text-2xl md:text-3xl font-extrabold ${t.textBright}`}>100k+</p>
                <p className={`text-xs ${t.textMuted} uppercase tracking-wider font-mono`}>We scraped</p>
              </div>
              <div>
                <p className={`text-2xl md:text-3xl font-extrabold ${t.textBright}`}>10+</p>
                <p className={`text-xs ${t.textMuted} uppercase tracking-wider font-mono`}>Dev Team Leads</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin" style={{ animationDuration: '20s' }}></div>
              <div className="absolute -inset-4 rounded-full border border-blue-500/10 animate-reverse-spin" style={{ animationDuration: '30s' }}></div>
              
              {/* Core Image styled card with neon glow */}
              <div className={`absolute inset-4 rounded-3xl overflow-hidden ${t.bgCard} border-2 ${isDark ? "border-indigo-500/30" : "border-indigo-100"} shadow-2xl`}>
                <img 
                  src={profile.profileImage || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"} 
                  alt="Ritesh Kumar — Full-Stack Developer" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600";
                  }}
                  className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-all duration-500"
                />
                
                {/* Floating indicator badge */}
                <div className={`absolute bottom-4 left-4 right-4 ${isDark ? "bg-slate-950/95 border-slate-800" : "bg-white/95 border-slate-200 shadow-md"} border p-3.5 rounded-xl backdrop-blur-md flex items-center gap-3`}>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
                  <div>
                    <h4 className={`text-xs font-bold ${t.textBright} tracking-wide uppercase font-mono`}>Owner</h4>
                    <p className={`text-xs ${t.textMuted}`}>{profile.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ABOUT & STATS SECTION */}
      <section id="about" className={`py-20 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5">
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
              <div>
                <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase mb-2`}>MY CAPABILITIES</p>
                <h2 className={`text-3xl font-bold ${t.textBright} mb-6`}>Why Client Agencies Partner with Me</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Rapid Project Deliveries</h4>
                  <p className={`text-xs ${t.textMuted}`}>Strict on-time guarantees and structured progression milestones.</p>
                </div>

                <div className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Code className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Absolute Architectural Integrity</h4>
                  <p className={`text-xs ${t.textMuted}`}>Clean MVC design patterns utilizing robust validation algorithms.</p>
                </div>

                <div className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Flexible Scaling Capabilities</h4>
                  <p className={`text-xs ${t.textMuted}`}>Can work on isolated tasks or command our pool of 10+ devs.</p>
                </div>

                <div className={`p-5 rounded-xl ${isDark ? "bg-slate-950/50 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"} transition-all space-y-2`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Worldwide Timezone Syncs</h4>
                  <p className={`text-xs ${t.textMuted}`}>Full collaboration availability for USA, UK, & Europe partners.</p>
                </div>
              </div>

              {/* RESUME DOWNLOAD SECTION */}
              <div className={`mt-8 p-5 rounded-2xl ${isDark ? "bg-indigo-900/15 border-indigo-500/20" : "bg-indigo-50 border-indigo-200"} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-indigo-400" />
                  <div>
                    <h4 className={`text-sm font-bold ${t.textBright} font-mono`}>Download Resume Portfolio</h4>
                    <p className={`text-xs ${t.textMuted}`}>Get the full offline PDF specs & client histories.</p>
                  </div>
                </div>
                <a 
                  href={profile.resumeUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-xs font-mono font-bold tracking-wide uppercase text-center"
                  id="resume-download-btn"
                >
                  Download Info (PDF)
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase`}>WHAT WE DO BEST</p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${t.textBright}`}>Full-Stack Custom Services</h2>
            <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv: Service, idx: number) => (
              <div 
                key={srv.id} 
                className={`p-6 rounded-2xl ${t.bgCard} border ${t.borderCard} ${t.bgCardHover} transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <RenderIcon name={srv.icon} />
                  </div>
                  <div>
                    <p className={`font-mono text-xs ${t.textMuted} mb-1`}>Service {idx + 1}</p>
                    <h3 className={`text-lg font-bold ${t.textBright} group-hover:text-indigo-400 transition-colors`}>{srv.title}</h3>
                  </div>
                  <p className={`text-xs ${t.textMuted} leading-relaxed`}>{srv.description}</p>
                </div>
                <div className={`pt-6 border-t ${isDark ? "border-slate-800/50" : "border-slate-100"} mt-6 flex items-center justify-between`}>
                  <span className={`text-[10px] font-mono tracking-widest uppercase ${t.textMuted}`}>Active Support</span>
                  <a href="#contact" className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1.5">
                    Discuss Inquiry <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SKILLS SECTION */}
      <section id="skills" className={`py-20 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 col-span-12">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase`}>TECHNICAL MATRIX</p>
            <h2 className={`text-3xl font-extrabold ${t.textBright}`}>Skills & Development Stack</h2>
            <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-4 space-y-4">
              <h3 className={`text-2xl font-bold ${t.textBright}`}>Production Stack Core Competences</h3>
              <p className={`text-xs ${t.textMuted} leading-relaxed`}>
                Ritesh has refined a reliable modern ecosystem centered around fast state managers on the browser client, combined with robust structured database layers.
              </p>
              
              <div className={`p-4 rounded-xl ${t.bgCardAlt} border ${t.borderCard} space-y-3`}>
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider ${t.textMuted}`}>Key Focus Highlights</span>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>Web crawlers with CAPTCHA bypasses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>Robust PHP Symfony dependency logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>NextJS headless Shopify tunnels</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((sk: Skill) => (
                  <div key={sk.id} className={`p-4 rounded-xl ${t.bgCard} border ${t.borderCard} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className={`text-sm font-bold ${t.textBright}`}>{sk.name}</span>
                      </div>
                      <span className={`font-mono text-xs ${t.textIndigo} font-bold`}>{sk.percentage}%</span>
                    </div>
                    {/* Progress indicator */}
                    <div className={`w-full h-1.5 ${isDark ? "bg-slate-900" : "bg-slate-150"} rounded-full overflow-hidden`}>
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                        style={{ width: `${sk.percentage}%` }}
                      ></div>
                    </div>
                    <span className={`inline-block text-[10px] font-mono ${isDark ? "text-slate-500 bg-slate-900" : "text-slate-600 bg-slate-100 border border-slate-200/60"} px-2 py-0.5 rounded uppercase`}>
                      {sk.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. PORTFOLIO/PROJECTS SECTION */}
      <section id="portfolio" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase`}>PROVEN HISTORIES</p>
              <h2 className={`text-3xl font-extrabold ${t.textBright}`}>Interactive Work Showcase</h2>
              <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {projectCategories.map((cat: string) => (
                <button 
                  key={cat}
                  onClick={() => {
                    setFilterCategory(cat);
                    trackVisit(`/portfolio/${cat.toLowerCase().replace(/ /g, "-")}`);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    filterCategory === cat 
                      ? "bg-indigo-600 text-white font-bold" 
                      : isDark 
                        ? "bg-slate-900 hover:bg-slate-800 text-slate-400" 
                        : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-xs"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* PROJECT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="projects-grid">
            {projectsToDisplay.map((proj: Project) => (
              <div 
                key={proj.id}
                className={`group rounded-2xl ${t.bgCard} border ${t.borderCard} overflow-hidden flex flex-col justify-between ${t.bgCardHover} transition-all duration-300 hover:-translate-y-1`}
              >
                <div>
                  {/* Thumbnail */}
                  <div className={`relative aspect-video overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                    <img 
                      src={proj.thumbnail || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"} 
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {proj.featured && (
                      <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-mono tracking-widest uppercase font-bold py-1 px-2 rounded">
                        ★ Featured App
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <span className={`font-mono text-[10px] ${t.textIndigo} uppercase tracking-widest font-bold`}>
                      {proj.category}
                    </span>
                    <h3 className={`text-lg font-bold ${t.textBright} group-hover:text-indigo-400 transition-colors`}>
                      {proj.title}
                    </h3>
                    <p className={`text-xs ${t.textMuted} line-clamp-3`}>
                      {proj.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1 mb-5">
                    {proj.techStack.map((tech: string, i: number) => (
                      <span key={i} className={`text-[9px] font-mono ${isDark ? "bg-slate-950 text-slate-400" : "bg-slate-150 text-slate-700"} px-2 py-0.5 rounded`}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className={`pt-4 border-t ${t.borderCard} flex items-center justify-between`}>
                    {proj.projectUrl && !proj.projectUrl.includes("example.com") ? (
                      <a 
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${proj.title} live website (opens in new tab)`}
                        className={`text-xs ${isDark ? "text-white" : "text-slate-900"} hover:text-indigo-400 font-mono inline-flex items-center gap-1 hover:underline group/link`}
                      >
                        View Project Details 
                        <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </a>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedProject(proj);
                          trackVisit(`/projects/${proj.slug}`);
                        }}
                        className={`text-xs ${isDark ? "text-white" : "text-slate-900"} hover:text-indigo-400 font-mono inline-flex items-center gap-1 hover:underline`}
                      >
                        View Project Details <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}

                    {proj.projectUrl && (
                      <a 
                        href={proj.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`Visit ${proj.title} external live link (opens in new tab)`}
                        className={`text-[10px] ${t.textMuted} hover:text-indigo-500 transition-colors`}
                      >
                        Live Link ↗
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* SHOW MORE PAGINATION */}
          {filteredProjects.length > 6 && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => {
                  setShowAllProjects(!showAllProjects);
                  trackVisit(showAllProjects ? "/portfolio/show-less" : "/portfolio/show-more");
                }}
                className={`px-6 py-2.5 rounded-xl ${isDark ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"} border font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-indigo-500/10`}
              >
                {showAllProjects ? "Show Less" : `Show More Projects (${filteredProjects.length - 6} more)`}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 6. EXPERIENCES & RESUME TIME-LINE */}
      <section id="experience" className={`py-20 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase font-bold`}>CAREER LANDSCAPE</p>
            <h2 className={`text-3xl font-extrabold ${t.textBright}`}>Professional Experience & Background</h2>
            <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* WORK COLUMN */}
            <div className="space-y-6">
              <h3 className={`text-xl font-bold ${t.textBright} flex items-center gap-2`}>
                <Briefcase className="w-5 h-5 text-indigo-400" /> Work History
              </h3>
              
              <div className={`space-y-6 border-l ${isDark ? "border-slate-800" : "border-slate-200"} pl-6 relative`}>
                {experience.map((exp: Experience, idx: number) => (
                  <div key={exp.id || idx} className="relative space-y-2">
                    {/* Bullet marker */}
                    <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full ${t.bulletBg} flex items-center justify-center`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>

                    <span className="inline-block text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {exp.startDate} - {exp.endDate}
                    </span>

                    <h4 className={`text-base font-bold ${t.textBright}`}>{exp.role}</h4>
                    <p className={`text-xs font-mono ${t.textMuted}`}>{exp.companyName} | {exp.location}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} leading-relaxed`}>{exp.description}</p>
                    
                    <div className="flex flex-wrap gap-1 pt-2">
                      {exp.techStack?.map((tag: string, i: number) => (
                        <span key={i} className={`text-[9px] font-mono ${isDark ? "bg-slate-900 text-slate-400" : "bg-slate-100 text-slate-600 border border-slate-200/60"} px-2.5 py-0.5 rounded`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACADEMICS & RECOGNITIONS */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${t.textBright} flex items-center gap-2`}>
                  <GraduationCap className="w-5 h-5 text-indigo-400" /> Education Background
                </h3>
                
                <div className="space-y-4">
                  {education.map((edu: Education, idx: number) => (
                    <div key={edu.id || idx} className={`p-5 rounded-xl ${t.bgCardAlt} border ${t.borderCard} space-y-2`}>
                      <span className={`font-mono text-[10px] ${t.textMuted}`}>{edu.year}</span>
                      <h4 className={`text-sm font-bold ${t.textBright}`}>{edu.degree}</h4>
                      <p className={`text-xs ${t.textIndigo} font-mono`}>{edu.institute}</p>
                      <p className={`text-xs ${t.textMuted} leading-normal`}>{edu.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CERTIFICATES MODULE */}
              <div id="certifications" className="space-y-6">
                <h3 className={`text-xl font-bold ${t.textBright} flex items-center gap-2`}>
                  <Award className="w-5 h-5 text-indigo-400" /> Certifications & Achievements
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certifications.map((cert: Certification) => (
                    <div key={cert.id} className={`p-4 rounded-xl ${isDark ? "bg-slate-950/40 border-slate-900 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"} transition-all flex items-start gap-3`}>
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-300 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-mono ${t.textMuted}`}>{cert.year}</span>
                        <h4 className={`text-xs font-bold ${t.textBright} leading-snug`}>{cert.name}</h4>
                        <p className={`text-[10px] ${t.textMuted}`}>{cert.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. CLIENT BUZZ / TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase font-bold`}>CLIENT HEARSAYS</p>
            <h2 className={`text-3xl font-extrabold ${t.textBright}`}>Feedback From Enterprise Partners</h2>
            <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((test: Testimonial) => (
              <div key={test.id} className={`p-6 rounded-2xl ${t.bgCard} border ${t.borderCard} hover:border-indigo-500/20 transition-all relative flex flex-col justify-between`}>
                
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"} leading-relaxed italic`}>
                    "{test.message}"
                  </p>
                </div>

                <div className={`pt-6 border-t ${isDark ? "border-slate-800/50" : "border-slate-100"} mt-6 flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800">
                    <img src={test.photo} alt={test.clientName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${t.textBright}`}>{test.clientName}</h4>
                    <p className={`text-[10px] font-mono ${t.textIndigo}`}>{test.company}</p>
                  </div>
                  <MessageSquare className="w-6 h-6 text-indigo-500/10 ml-auto absolute bottom-6 right-6" />
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. BLOG & KNOWLEDGES SECTION */}
      <section id="blog" className={`py-20 ${t.bgSectionAlt} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase font-bold text-center`}>KNOWLEDGE SHARING</p>
            <h2 className={`text-3xl font-extrabold ${t.textBright} text-center`}>Ritesh's Architectural Blog</h2>
            <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((post: Blog) => (
              <div 
                key={post.id}
                className={`group p-5 rounded-2xl ${t.bgCard} border ${t.borderCard} hover:border-slate-800 transition-all flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className={`aspect-video w-full rounded-xl overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"} relative`}>
                    <img 
                      src={post.featuredImage || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800"} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-3 left-3 bg-slate-950/90 text-indigo-400 text-[10px] font-mono px-2.5 py-1 rounded">
                      {post.category}
                    </span>
                  </div>

                  <span className={`font-mono text-[10px] ${t.textMuted} uppercase`}>{post.createdAt}</span>
                  <h3 className={`text-lg font-bold ${t.textBright} group-hover:text-indigo-400 transition-colors`}>
                    {post.title}
                  </h3>
                  <p className={`text-xs ${t.textMuted} line-clamp-2`}>
                    {post.content}
                  </p>
                </div>

                <div className={`pt-6 border-t ${isDark ? "border-slate-800/80" : "border-slate-100"} mt-6 flex items-center justify-between`}>
                  <button 
                    onClick={() => {
                      setSelectedBlog(post);
                      trackVisit(`/blog/${post.slug}`);
                    }}
                    className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Read Full Blueprint Article ↗
                  </button>
                  <div className="flex gap-1">
                    {post.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className={`text-[9px] font-mono ${isDark ? "bg-slate-950 text-slate-500" : "bg-slate-100 text-slate-600 border border-slate-200/60"} px-2 py-0.5 rounded`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. CONTACT & HIRE ME FORM */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 space-y-6">
            <p className={`font-mono ${t.textIndigo} text-xs tracking-widest uppercase font-bold`}>READY TO COMMENCE?</p>
            <h2 className={`text-4xl font-extrabold ${t.textBright}`}>Let's Discuss Your Solutions Blueprint</h2>
            <p className={`text-xs ${t.textMuted} leading-relaxed`}>
              Have an automation challenge, a relational database scope, or look to acquire remote web talent? Let me know details and I'll send an initial structural diagnostic estimate.
            </p>

            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase">Primary Inbox</h4>
                  <p className={`text-xs ${isDark ? "text-slate-200" : "text-slate-800 font-medium"}`}>{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Phone className="w-5 h-5 hover:animate-shake" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase">WhatsApp Channel</h4>
                  <p className={`text-xs ${isDark ? "text-slate-200" : "text-slate-800 font-medium"}`}>{profile.whatsapp || "Available Directly"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase">Location Basis</h4>
                  <p className={`text-xs ${isDark ? "text-slate-200" : "text-slate-800 font-medium"}`}>{profile.location}</p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl ${isDark ? "bg-indigo-900/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"} border space-y-2`}>
              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase">📢 Lead Dev Advisory</h4>
              <p className={`text-xs ${t.textMuted}`}>
                To guarantee maximum execution precision, I schedule face-time Zoom diagnostic calls for scope requests over $2.5k.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className={`p-6 sm:p-8 rounded-3xl ${t.bgCard} border ${t.borderCard} shadow-xl space-y-6`}>
              <h3 className={`text-xl font-bold ${t.textBright} font-mono`}>Submit Structural Inquiry Form</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-4" id="consultation-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`block text-xs font-mono ${t.textMuted} uppercase`}>Your Name *</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. David Harrison"
                      className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"} focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-xs`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-xs font-mono ${t.textMuted} uppercase`}>Your Email *</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. david@media.co.uk"
                      className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"} focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-xs`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`block text-xs font-mono ${t.textMuted} uppercase`}>Phone (Optional)</label>
                    <input 
                      type="text" 
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="e.g. +44 7911 XXXXXX"
                      className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"} focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-xs`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-xs font-mono ${t.textMuted} uppercase`}>Subject Topic</label>
                    <input 
                      type="text" 
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="e.g. Python scraper setup"
                      className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"} focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-xs`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-xs font-mono ${t.textMuted} uppercase`}>Message details *</label>
                  <textarea 
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your goals, tech expectations, timeline bounds..."
                    className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"} focus:border-indigo-500 outline-none rounded-xl p-4 text-xs resize-none`}
                  ></textarea>
                </div>

                {contactNotification && (
                  <div className={`p-4 rounded-xl text-xs font-mono ${
                    contactNotification.type === "success" 
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300" 
                      : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300"
                  }`} id="form-notification">
                    {contactNotification.text}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={submittingContact}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold tracking-wider text-xs uppercase transition-all flex items-center justify-center gap-2"
                  id="submit-contact-btn"
                >
                  {submittingContact ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Encrypting Submission...
                    </>
                  ) : (
                    <>
                      Transmit Inquiry <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

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
