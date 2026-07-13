import React, { useState, useEffect } from "react";
import { 
  Code, Server, Database, Workflow, Cpu, Layers, ShoppingBag, RefreshCw, 
  Play, GitCommit, GitPullRequest, Cloud, Send, Github, Linkedin, ExternalLink, 
  FileText, CheckCircle, Phone, MapPin, Mail, ArrowUpRight, Award, MessageSquare, 
  Calendar, Briefcase, GraduationCap, Star, Check, Globe, ChevronRight, X, ArrowUp,
  Settings, Lock, LogOut, Menu, Trash2, Edit3, Plus, Search, Eye, Filter, Activity, ActivityIcon
} from "lucide-react";

import { 
  Profile, HeroSection, Service, Skill, Project, Experience, Education, Certification, Testimonial, Blog, ContactInquiry, VisitorLog, SEOSettings, SiteSettings 
} from "../types.js";

interface AdminPanelProps {
  onBackToPortfolio: () => void;
  siteName: string;
}

export default function AdminPanel({ onBackToPortfolio, siteName }: AdminPanelProps) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!sessionStorage.getItem("admin_token"));
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [loginEmail, setLoginEmail] = useState("admin@example.com");
  const [loginPassword, setLoginPassword] = useState("Admin@12345");
  const [loginError, setLoginError] = useState("");

  // CMS active tab
  // Options: "dashboard" | "profile" | "services" | "skills" | "projects" | "experience" | "education" | "certifications" | "testimonials" | "blogs" | "contacts" | "visitors" | "seo" | "site" | "security"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard metrics state loaded from API
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Global Lists states (synchronized with server)
  const [services, setServices] = useState<Service[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);

  // Config settings state
  const [pProfile, setPProfile] = useState<Partial<Profile>>({});
  const [pHero, setPHero] = useState<Partial<HeroSection>>({});
  const [pSeo, setPSeo] = useState<Partial<SEOSettings>>({});
  const [pSite, setPSite] = useState<Partial<SiteSettings>>({});

  // Active Selected Entity for Modal Add/Edit Form
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string>(""); // e.g. "service", "skill", "project", "experience", "education", "certification", "testimonial", "blog"

  // Search filter query string
  const [searchQuery, setSearchQuery] = useState("");

  // Flash validation toast
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Trigger brief alert toast
  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper inside files uploads to convert input parameter to Base64
  const handleBase64Upload = (e: React.ChangeEvent<HTMLInputElement>, onBase64Obtained: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onBase64Obtained(reader.result);
        triggerToast("Media files processed successfully!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Login authentication request
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_token", data.token);
        setAuthToken(data.token);
        setIsLoggedIn(true);
        triggerToast("Admin validation successful!", "success");
        if (window.location.pathname === "/admin/login") {
          window.history.pushState({}, "", "/admin");
        }
      } else {
        setLoginError(data.error || "Authentication failed. Try again.");
      }
    } catch (err) {
      setLoginError("Could not dispatch authentication request.");
    }
  };

  // Load and cache entire dashboard details
  const fetchDashboardData = async () => {
    if (!isLoggedIn) return;
    setLoadingDashboard(true);
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
        // Map lists
        setContacts(data.recentContacts || []);
        setVisitors(data.recentVisitorLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Reload lists depending on category
  const loadList = async (type: string) => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`/api/admin/${type}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (type === "services") setServices(data);
        else if (type === "skills") setSkills(data);
        else if (type === "projects") setProjects(data);
        else if (type === "experience") setExperiences(data);
        else if (type === "education") setEducation(data);
        else if (type === "certifications") setCertifications(data);
        else if (type === "testimonials") setTestimonials(data);
        else if (type === "blogs") setBlogs(data);
        else if (type === "contacts") setContacts(data);
      }
    } catch (e) {
      triggerToast(`Failed to parse active ${type} catalog`, "error");
    }
  };

  // Load and cache other form configurations
  const loadConfigs = async () => {
    if (!isLoggedIn) return;
    try {
      // Pull dynamic profiles from the generic API
      const res = await fetch("/api/portfolio");
      const d = await res.json();
      if (res.ok) {
        setPProfile(d.profile || {});
        setPHero(d.hero || {});
        setPSeo(d.seo || {});
        setPSite(d.site || {});
        // Seed lists initially
        setServices(d.services || []);
        setSkills(d.skills || []);
        setProjects(d.projects || []);
        setExperiences(d.experience || []);
        setEducation(d.education || []);
        setCertifications(d.certifications || []);
        setTestimonials(d.testimonials || []);
        setBlogs(d.blogs || []);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
      loadConfigs();
    }
  }, [isLoggedIn]);

  // Tab dynamic loading
  useEffect(() => {
    if (isLoggedIn && activeTab !== "dashboard") {
      if (["services", "skills", "projects", "experience", "education", "certifications", "testimonials", "blogs", "contacts"].includes(activeTab)) {
        loadList(activeTab);
      }
    }
  }, [activeTab, isLoggedIn]);

  // --------------------------------------------------------------------------
  // ADMINISTRATIVE PERSISTENCE UTILITIES (PUT / POST / DELETE ENGINES)
  // --------------------------------------------------------------------------

  const handleSaveConfig = async (endpoint: string, payload: any) => {
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Module saved and compiled successfully!");
        loadConfigs();
        fetchDashboardData();
      } else {
        triggerToast("Compile error: " + (data.error || "Check fields"), "error");
      }
    } catch (e) {
      triggerToast("System communication issue", "error");
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/admin/${editingType}s`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(editingItem)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`${editingType} saved inside JSON backend!`);
        setEditingItem(null);
        loadList(`${editingType}s`);
        fetchDashboardData();
      } else {
        triggerToast("Save failed: " + (data.error || "validation gap"), "error");
      }
    } catch (e) {
      triggerToast("Transmission error", "error");
    }
  };

  const handleDeleteItem = async (type: string, id: string) => {
    if (!window.confirm(`Confirm deleting this ${type}? This is irreversible.`)) return;
    try {
      const res = await fetch(`/api/admin/${type}s/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`${type} removed from CMS database!`);
        loadList(`${type}s`);
        fetchDashboardData();
      }
    } catch (e) {
      triggerToast("Critical deletion failure", "error");
    }
  };

  const handleMarkInquiryRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}/read`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        triggerToast("Inquiry marked as read!");
        loadList("contacts");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleMarkInquiryReplied = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}/reply`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        triggerToast("Reply status recorded successfully!");
        loadList("contacts");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Safe icon view mapping for listing
  const getIconTag = (name: string) => {
    const n = name?.trim()?.toLowerCase();
    return <span className="inline-block text-[10px] font-mono text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{name || "Code"}</span>;
  };

  // Auth logout
  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setAuthToken("");
    setIsLoggedIn(false);
    triggerToast("Logged out from CMS secure scope.", "success");
    window.history.pushState({}, "", "/admin/login");
  };

  // 1. SECURE ADMINISTRATIVE WALL
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono bg-indigo-600/10 border border-indigo-500/25 px-3 py-1 rounded-full text-indigo-400 uppercase tracking-widest font-bold">
              Symfony Admin Dashboard
            </span>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white">Administrator Login</h1>
            <p className="text-xs text-slate-500">Provide credentials to modify portfolio lists.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4" id="admin-login-form">
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400 uppercase">Email Credentials</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-mono text-slate-400 uppercase">Secure Password</label>
                <span className="text-[10px] text-slate-500 hover:underline cursor-pointer">Seed: Admin@12345</span>
              </div>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-xs text-white"
              />
            </div>

            {loginError && (
              <div className="p-3.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs text-center font-mono">
                {loginError}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors"
              id="login-btn"
            >
              Authenticate System Access
            </button>
          </form>

          <button 
            onClick={onBackToPortfolio}
            className="w-full text-center py-2 text-xs font-mono text-slate-500 hover:text-slate-300 transition-all font-light"
          >
            ← Return to Public Portfolio View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* FLOATING TOAST FLASH MESSAGES */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 backdrop-blur shadow-2xl font-mono text-xs ${
          toastMessage.type === "success" 
            ? "bg-slate-900/90 border-emerald-500/30 text-emerald-400" 
            : "bg-slate-900/90 border-rose-500/30 text-rose-400"
        }`} id="admin-toast">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ADMIN PANEL SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 shrink-0 flex flex-col justify-between">
        <div className="p-6">
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div>
              <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-indigo-400">Ritesh CMS Panel</h2>
              <p className="text-[9px] text-slate-500 uppercase">Symfony Admin Console</p>
            </div>
            <button 
              onClick={onBackToPortfolio}
              className="p-1 rounded bg-slate-950 text-slate-400 hover:text-white"
              title="Return to Site"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="space-y-1 text-xs font-mono">
            
            <span className="block text-[8px] uppercase tracking-widest text-slate-500 px-3 mb-2 font-bold">System metrics</span>
            <button 
              onClick={() => setActiveTab("dashboard")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "dashboard" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Activity className="w-4 h-4" /> 📈 Dashboard Area
            </button>
            
            <span className="block text-[8px] uppercase tracking-widest text-slate-500 px-3 pt-4 mb-2 font-bold">Static sections</span>
            <button 
              onClick={() => setActiveTab("profile")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "profile" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" /> 👤 Profile & Hero settings
            </button>

            <span className="block text-[8px] uppercase tracking-widest text-slate-500 px-3 pt-4 mb-2 font-bold">Manage catalogs</span>
            <button 
              onClick={() => setActiveTab("services")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "services" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" /> 🛠️ Services catalog
            </button>
            <button 
              onClick={() => setActiveTab("skills")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "skills" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <GitCommit className="w-4 h-4" /> 🚀 Skills matrix
            </button>
            <button 
              onClick={() => setActiveTab("projects")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "projects" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Code className="w-4 h-4" /> 💼 Projects / past works
            </button>
            <button 
              onClick={() => setActiveTab("experience")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "experience" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Briefcase className="w-4 h-4" /> 👔 Work Experience
            </button>
            <button 
              onClick={() => setActiveTab("education")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "education" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <GraduationCap className="w-4 h-4" /> 🎓 Academics
            </button>
            <button 
              onClick={() => setActiveTab("certifications")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "certifications" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Award className="w-4 h-4" /> 🏆 Certifications
            </button>
            <button 
              onClick={() => setActiveTab("testimonials")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "testimonials" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> 💬 Testimonials
            </button>
            <button 
              onClick={() => setActiveTab("blogs")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "blogs" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" /> ✍️ Blog Article CMS
            </button>

            <span className="block text-[8px] uppercase tracking-widest text-slate-500 px-3 pt-4 mb-2 font-bold">Metadata & Inbox</span>
            <button 
              onClick={() => setActiveTab("contacts")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-1 transition-colors ${
                activeTab === "contacts" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2.5"><Mail className="w-4 h-4" /> 📥 Inquiries Box</span>
              {contacts.filter(c => !c.read).length > 0 && (
                <span className="text-[9px] bg-amber-500 font-bold text-slate-950 px-1.5 py-0.5 rounded-full animate-bounce">
                  {contacts.filter(c => !c.read).length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("seo")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "seo" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Globe className="w-4 h-4" /> 🔍 SEO Settings
            </button>
            <button 
              onClick={() => setActiveTab("site")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "site" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" /> ⚙️ Brand Settings
            </button>
            <button 
              onClick={() => setActiveTab("security")} 
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                activeTab === "security" ? "bg-indigo-600 font-bold text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Lock className="w-4 h-4" /> 🔐 Security config
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/40">
          <button 
            onClick={handleLogout}
            className="w-full text-left text-xs font-mono font-medium text-rose-400 hover:text-rose-300 flex items-center gap-2 hover:translate-x-1 transition-transform"
          >
            <LogOut className="w-4 h-4 text-rose-500" /> Logout Security
          </button>
        </div>
      </aside>

      {/* DASHBOARD CMS WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        
        {/* TOP STATUS CONTROL SUMMARY */}
        <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">{activeTab} Manager</h1>
            <p className="text-xs text-slate-400">Database Synchronization State Logged: <span className="text-indigo-400 font-mono text-[10px]">Data/Database.json</span></p>
          </div>
          <button 
            onClick={onBackToPortfolio}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-2"
          >
            ← Back to live Portfolio App
          </button>
        </div>

        {/* ====================================================================
            TAB: DASHBOARD ANALYTICS PANEL
            ==================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* COUNTER METRICS CARDS */}
            {loadingDashboard ? (
              <p className="text-slate-400 font-mono text-xs">Computing analytical aggregates...</p>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black block">Total Page Views</span>
                    <p className="text-3xl font-extrabold text-white">{dashboardData?.metrics?.totalVisits || 0}</p>
                    <span className="text-[9px] font-mono block text-indigo-400">Dynamic tracking system active</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black block">Today's Hits</span>
                    <p className="text-3xl font-extrabold text-indigo-400">{dashboardData?.metrics?.todayVisits || 0}</p>
                    <span className="text-[9px] font-mono block text-emerald-400">Live reset at midnight UTC</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black block">Unique IPs Captured</span>
                    <p className="text-3xl font-extrabold text-blue-400">{dashboardData?.metrics?.uniqueVisitors || 0}</p>
                    <span className="text-[9px] font-mono block text-slate-400">Unique visitors count list</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black block font-mono">Unread Inquiries</span>
                    <p className="text-3xl font-extrabold text-amber-500">
                      {contacts.filter(c => !c.read).length}
                    </p>
                    <span className="text-[9px] font-mono block text-slate-400">Pending reply validations</span>
                  </div>
                </div>

                {/* VISITOR TRAFFIC CHART */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Dynamic Visitors Log Chart</h4>
                      <p className="text-[10px] text-slate-500">Hits metrics mapped against unique IPs (last 7 tracking columns)</p>
                    </div>
                    <div className="flex gap-4 font-mono text-[9px]">
                      <div className="flex items-center gap-1.5 text-indigo-400"><span className="w-2.5 h-0.5 bg-indigo-500"></span> Hits</div>
                      <div className="flex items-center gap-1.5 text-blue-400"><span className="w-2.5 h-0.5 bg-blue-400"></span> Unique IPs</div>
                    </div>
                  </div>

                  {/* CUSTOM SVG GRAPH */}
                  <div className="w-full relative h-48 bg-slate-950 rounded-xl overflow-hidden pt-6">
                    {/* SVG representation for 7 points */}
                    <svg className="w-full h-full" viewBox="0 0 700 130" preserveAspectRatio="none">
                      {/* Grid Horizontal Guidelines */}
                      <line x1="0" y1="30" x2="700" y2="30" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="70" x2="700" y2="70" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="110" x2="700" y2="110" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />

                      {/* Map polylines dynamically */}
                      {(() => {
                        const chartPoints = dashboardData?.trafficChart || [];
                        if (chartPoints.length === 0) return null;

                        // Find maximum visits to scale coordinate properly
                        const maxVal = Math.max(...chartPoints.map((p: any) => p.visits)) || 5;

                        const pointsHits = chartPoints.map((item: any, idx: number) => {
                          const x = idx * 100 + 50;
                          // Scale y from 10 to 110
                          const y = 110 - ((item.visits / maxVal) * 90);
                          return `${x},${y}`;
                        }).join(" ");

                        const pointsUnique = chartPoints.map((item: any, idx: number) => {
                          const x = idx * 100 + 50;
                          const y = 110 - ((item.unique / maxVal) * 90);
                          return `${x},${y}`;
                        }).join(" ");

                        return (
                          <>
                            {/* Visits Polyline */}
                            <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points={pointsHits} />
                            {/* Unique Polyline */}
                            <polyline fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2" points={pointsUnique} />

                            {/* Dots and Labels */}
                            {chartPoints.map((item: any, idx: number) => {
                              const x = idx * 100 + 50;
                              const yH = 110 - ((item.visits / maxVal) * 90);
                              return (
                                <g key={idx}>
                                  <circle cx={x} cy={yH} r="4.5" className="fill-indigo-500 stroke-slate-950 stroke-2" />
                                  <text x={x} y={yH - 8} textAnchor="middle" fill="#818cf8" fontSize="8" fontFamily="monospace">
                                    {item.visits}
                                  </text>
                                  {/* X coordinate dates label */}
                                  <text x={x} y="125" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                                    {item.date}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* DEVICE & OPERATING SYSTEM BREAKDOWNS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* DEVICE METRICS */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Visited Devices & Tech Distributions</h4>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-slate-950 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">Desktop</span>
                        <p className="text-lg font-bold text-indigo-400">{dashboardData?.deviceCounts?.desktop || 0}</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">Tablet</span>
                        <p className="text-lg font-bold text-blue-400">{dashboardData?.deviceCounts?.tablet || 0}</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">Mobile</span>
                        <p className="text-lg font-bold text-emerald-400">{dashboardData?.deviceCounts?.mobile || 0}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Top Visited Pages Hierarchy:</span>
                      <div className="mt-2 space-y-1 bg-slate-950 p-3 rounded-xl text-xs font-mono">
                        {dashboardData?.mostVisitedPages?.map((p: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-400 truncate max-w-[200px]">{p.page || "/"}</span>
                            <span className="text-indigo-400">{p.count} hits</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* VISITOR LOG TRACK TABLE */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase block">Live Visited Traffic Log Captured</span>
                    
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {dashboardData?.recentVisitorLogs?.map((l: any, i: number) => (
                        <div key={i} className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl text-[10px] font-mono space-y-1">
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="text-indigo-400 font-bold">{l.ip}</span>
                            <span>{new Date(l.visitTime).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>To: {l.pageUrl}</span>
                            <span>{l.browser} / {l.os}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RECENT INQUIRIES GOTO LINK */}
                <div className="p-5 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="text-indigo-400 w-5 h-5" />
                    <div>
                      <h4 className="text-xs font-bold font-mono">Got {contacts.length} Total Contact Inquiries</h4>
                      <p className="text-[10px] text-slate-400">Reply and mark submissions to maintain high customer rating.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("contacts")} 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono uppercase"
                  >
                    Open Inquiries Box
                  </button>
                </div>
              </>
            )}

          </div>
        )}

        {/* ====================================================================
            TAB: PROFILE & HERO SECTION SETTINGS
            ==================================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            
            {/* profile config */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig("profile", pProfile); }} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider pb-2 border-b border-slate-800">1. Modify Profile Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Owner Name</label>
                  <input type="text" value={pProfile.name || ""} onChange={(e) => setPProfile({ ...pProfile, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Professional Status Title</label>
                  <input type="text" value={pProfile.title || ""} onChange={(e) => setPProfile({ ...pProfile, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Bio summary details</label>
                <textarea rows={3} value={pProfile.bio || ""} onChange={(e) => setPProfile({ ...pProfile, bio: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl p-4 text-xs text-white resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Location</label>
                  <input type="text" value={pProfile.location || ""} onChange={(e) => setPProfile({ ...pProfile, location: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Phone No.</label>
                  <input type="text" value={pProfile.phone || ""} onChange={(e) => setPProfile({ ...pProfile, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">WhatsApp URL link</label>
                  <input type="text" value={pProfile.whatsapp || ""} onChange={(e) => setPProfile({ ...pProfile, whatsapp: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">LinkedIn Profile Link</label>
                  <input type="text" value={pProfile.linkedin || ""} onChange={(e) => setPProfile({ ...pProfile, linkedin: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
                {/* Profile Image Base64 Upload */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase block">Profile Bio Image Upload</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleBase64Upload(e, (base64) => setPProfile({ ...pProfile, profileImage: base64 }))}
                    className="w-full bg-slate-950 border border-slate-800 file:bg-indigo-600 file:text-white file:border-none file:px-3 file:py-1 file:rounded file:text-xs text-xs py-2 rounded-xl"
                  />
                  {pProfile.profileImage && (
                    <img src={pProfile.profileImage} className="w-12 h-12 object-cover rounded mt-2 border border-slate-700" alt="Profile preview" />
                  )}
                </div>
              </div>

              <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition-all">
                Save Profile Parameters
              </button>
            </form>

            {/* HERO SECTION CONFIG */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig("hero", pHero); }} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider pb-2 border-b border-slate-800">2. Hero Call-To-Action Heading Core</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase block">Primary Banner Heading</label>
                <input type="text" value={pHero.heading || ""} onChange={(e) => setPHero({ ...pHero, heading: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase block">Dynamic Subheading Description</label>
                <textarea rows={2} value={pHero.subheading || ""} onChange={(e) => setPHero({ ...pHero, subheading: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl p-4 text-xs text-white" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase block">Primary CTA Text</label>
                  <input type="text" value={pHero.ctaTextPrimary || ""} onChange={(e) => setPHero({ ...pHero, ctaTextPrimary: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase block">Primary CTA WhatsApp Redirect url</label>
                  <input type="text" value={pHero.ctaLinkPrimary || ""} onChange={(e) => setPHero({ ...pHero, ctaLinkPrimary: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
              </div>

              <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition-all">
                Save Hero Core Layout
              </button>
            </form>

          </div>
        )}

        {/* ====================================================================
            TABULAR DIRECT SERVICE CATALOG LISTS
            ==================================================================== */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Total services: <span className="text-white font-bold">{services.length} active items</span></p>
              <button 
                onClick={() => {
                  setEditingType("service");
                  setEditingItem({ title: "", description: "", icon: "Code", displayOrder: services.length + 1, status: true });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-service-btn"
              >
                <Plus className="w-4 h-4" /> Add New Service
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Service Title</th>
                    <th className="p-4">Icon Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Operation Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {services.map((srv: Service) => (
                    <tr key={srv.id} className="hover:bg-slate-950/40">
                      <td className="p-4">{srv.displayOrder}</td>
                      <td className="p-4 font-bold text-white">{srv.title}</td>
                      <td className="p-4">{getIconTag(srv.icon)}</td>
                      <td className="p-4">{srv.status ? <span className="text-emerald-400">● Live Active</span> : <span className="text-slate-500">Disabled</span>}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("service"); setEditingItem(srv); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("service", srv.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TABULAR DIRECT SKILLS MATRIX
            ==================================================================== */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Skills entries: <span className="text-white font-bold">{skills.length} listed</span></p>
              <button 
                onClick={() => {
                  setEditingType("skill");
                  setEditingItem({ name: "", category: "Frontend", percentage: 90, icon: "Code", status: true });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-skill-btn"
              >
                <Plus className="w-4 h-4" /> Add Skill Spec
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Skill Title</th>
                    <th className="p-4">Category Group</th>
                    <th className="p-4">Competency Ratio</th>
                    <th className="p-4 text-right font-mono">Options Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {skills.map((sk: Skill) => (
                    <tr key={sk.id} className="hover:bg-slate-950/40">
                      <td className="p-4 font-bold text-white">{sk.name}</td>
                      <td className="p-4"><span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] text-slate-400">{sk.category}</span></td>
                      <td className="p-4 text-indigo-400 font-bold">{sk.percentage}%</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("skill"); setEditingItem(sk); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("skill", sk.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: PROJECTS LOG CMS
            ==================================================================== */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Active projects: <span className="white font-bold">{projects.length} entries</span></p>
              <button 
                onClick={() => {
                  setEditingType("project");
                  setEditingItem({ title: "", slug: "", category: "Python Automation", techStack: ["Python", "Scrapy"], description: "", features: [], clientName: "", projectUrl: "", githubUrl: "", thumbnail: "", gallery: [], featured: false, status: true, seoTitle: "", seoDescription: "" });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-project-btn"
              >
                <Plus className="w-4 h-4" /> Add Past Project Work
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Visual</th>
                    <th className="p-4">Project Title</th>
                    <th className="p-4">Project Category</th>
                    <th className="p-4">Featured state</th>
                    <th className="p-4 text-right">Project CMS Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {projects.map((proj: Project) => (
                    <tr key={proj.id} className="hover:bg-slate-950/40">
                      <td className="p-4">
                        <img src={proj.thumbnail} className="w-10 h-7 object-cover rounded bg-slate-950" alt="" />
                      </td>
                      <td className="p-4 font-bold text-white">{proj.title}</td>
                      <td className="p-4">{proj.category}</td>
                      <td className="p-4">{proj.featured ? <span className="text-amber-400 font-bold">★ Featured</span> : <span className="text-slate-500">Standard</span>}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("project"); setEditingItem(proj); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("project", proj.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: WORK EXPERIENCE CMS
            ==================================================================== */}
        {activeTab === "experience" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Work histories: <span className="white font-bold">{experiences.length} records</span></p>
              <button 
                onClick={() => {
                  setEditingType("experience");
                  setEditingItem({ companyName: "", role: "", startDate: "", endDate: "", location: "", description: "", techStack: [], displayOrder: experiences.length + 1 });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-experience-btn"
              >
                <Plus className="w-4 h-4" /> Add Experience Record
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Role Title</th>
                    <th className="p-4">Company Name</th>
                    <th className="p-4">Calendar range</th>
                    <th className="p-4 text-right">Job CMS Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {experiences.map((exp: Experience) => (
                    <tr key={exp.id} className="hover:bg-slate-950/40">
                      <td className="p-4">{exp.displayOrder}</td>
                      <td className="p-4 font-bold text-white">{exp.role}</td>
                      <td className="p-4 text-indigo-400">{exp.companyName}</td>
                      <td className="p-4">{exp.startDate} - {exp.endDate}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("experience"); setEditingItem(exp); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("experience", exp.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: ACADEMICS & EDUCATION
            ==================================================================== */}
        {activeTab === "education" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Total degrees: <span className="white font-bold">{education.length} entries</span></p>
              <button 
                onClick={() => {
                  setEditingType("education");
                  setEditingItem({ institute: "", degree: "", year: "", description: "" });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-edu-btn"
              >
                <Plus className="w-4 h-4" /> Add Academics Degree
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Academic Degree</th>
                    <th className="p-4">Institute</th>
                    <th className="p-4">Year Calendar</th>
                    <th className="p-4 text-right font-mono">Operations Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {education.map((edu: Education) => (
                    <tr key={edu.id} className="hover:bg-slate-950/40">
                      <td className="p-4 font-bold text-white">{edu.degree}</td>
                      <td className="p-4 text-indigo-400">{edu.institute}</td>
                      <td className="p-4">{edu.year}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("education"); setEditingItem(edu); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("education", edu.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: CERTIFICATIONS CMS
            ==================================================================== */}
        {activeTab === "certifications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Certificates: <span className="white font-bold">{certifications.length} parsed</span></p>
              <button 
                onClick={() => {
                  setEditingType("certification");
                  setEditingItem({ name: "", issuer: "", year: "", url: "#", status: true });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-cert-btn"
              >
                <Plus className="w-4 h-4" /> Add Certificate
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Certificate Name</th>
                    <th className="p-4">Authority Issuer</th>
                    <th className="p-4">Year Obtained</th>
                    <th className="p-4 text-right font-mono">Operations Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {certifications.map((cert: Certification) => (
                    <tr key={cert.id} className="hover:bg-slate-950/40">
                      <td className="p-4 font-bold text-white">{cert.name}</td>
                      <td className="p-4 text-indigo-400">{cert.issuer}</td>
                      <td className="p-4">{cert.year}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("certification"); setEditingItem(cert); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("certification", cert.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: CLIENT TESTIMONIALS CMS
            ==================================================================== */}
        {activeTab === "testimonials" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Quotes list: <span className="white font-bold">{testimonials.length} reviews</span></p>
              <button 
                onClick={() => {
                  setEditingType("testimonial");
                  setEditingItem({ clientName: "", company: "", rating: 5, message: "", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", status: true });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-testimonial-btn"
              >
                <Plus className="w-4 h-4" /> Add Client Testimonial
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Photo</th>
                    <th className="p-4">Client Name</th>
                    <th className="p-4">Company Designation</th>
                    <th className="p-4">Rating Stars</th>
                    <th className="p-4 text-right">Options Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {testimonials.map((test: Testimonial) => (
                    <tr key={test.id} className="hover:bg-slate-950/40">
                      <td className="p-4">
                        <img src={test.photo} className="w-8 h-8 rounded-full object-cover bg-slate-800" alt="" />
                      </td>
                      <td className="p-4 font-bold text-white">{test.clientName}</td>
                      <td className="p-4 text-indigo-400">{test.company}</td>
                      <td className="p-4 text-amber-400">{"★".repeat(test.rating)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("testimonial"); setEditingItem(test); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("testimonial", test.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: BLOG ARTICLES WRITING WORKSPACE
            ==================================================================== */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400">Blogs catalog: <span className="white font-bold">{blogs.length} articles</span></p>
              <button 
                onClick={() => {
                  setEditingType("blog");
                  setEditingItem({ title: "", slug: "", category: "PHP & Symfony", content: "", featuredImage: "", tags: ["Symfony"], status: "published", seoTitle: "", seoDescription: "" });
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                id="add-blog-btn"
              >
                <Plus className="w-4 h-4" /> Compose Blueprint Article
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-400">
                    <th className="p-4">Visual Image</th>
                    <th className="p-4">Article Title</th>
                    <th className="p-4">Category Group</th>
                    <th className="p-4">Flow State</th>
                    <th className="p-4 text-right">Operations Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {blogs.map((post: Blog) => (
                    <tr key={post.id} className="hover:bg-slate-950/40">
                      <td className="p-4">
                        <img src={post.featuredImage} className="w-12 h-8 object-cover rounded bg-slate-950" alt="" />
                      </td>
                      <td className="p-4 font-bold text-white max-w-xs truncate">{post.title}</td>
                      <td className="p-4">{post.category}</td>
                      <td className="p-4">
                        {post.status === "published" 
                          ? <span className="text-emerald-400">● Published</span> 
                          : <span className="text-slate-500">Draft</span>
                        }
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingType("blog"); setEditingItem(post); }} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteItem("blog", post.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: INBOX INQUIRIES BOX
            ==================================================================== */}
        {activeTab === "contacts" && (
          <div className="space-y-6">
            <span className="text-xs font-mono text-slate-400 block uppercase">Inquiries received lists:</span>
            
            <div className="space-y-4">
              {contacts.map((c: ContactInquiry) => (
                <div key={c.id} className={`p-6 rounded-2xl bg-slate-900 border transition-all ${!c.read ? "border-indigo-500/40 shadow-md shadow-indigo-500/5 bg-slate-900" : "border-slate-800 bg-slate-900/60"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{c.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({c.email})</span>
                      </div>
                      <p className="text-xs font-mono text-indigo-400 font-medium">Subject: {c.subject}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px]">
                      <span className="text-slate-500">{new Date(c.date).toLocaleString()}</span>
                      {c.phone && <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-400">Cell: {c.phone}</span>}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 py-4 leading-relaxed italic whitespace-pre-line bg-slate-950/40 p-4 rounded-xl mt-3">
                    "{c.message}"
                  </p>

                  <div className="pt-4 mt-2 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px]">
                    <div className="flex gap-2">
                      {!c.read && (
                        <button 
                          onClick={() => handleMarkInquiryRead(c.id)}
                          className="px-3 py-1 bg-indigo-650 hover:bg-slate-800 bg-indigo-600/30 text-indigo-400 rounded border border-indigo-500/20"
                        >
                          Mark as Read ✔
                        </button>
                      )}
                      {!c.replied ? (
                        <button 
                          onClick={() => handleMarkInquiryReplied(c.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                        >
                          Mark as Replied
                        </button>
                      ) : (
                        <span className="p-1 px-2.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/10">✓ Replied Logged</span>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDeleteItem("contact", c.id)}
                      className="text-rose-500 hover:text-rose-400"
                    >
                      Delete Inquiry Trash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: GLOBAL SITE SEO SETTINGS
            ==================================================================== */}
        {activeTab === "seo" && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig("seo", pSeo); }} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider pb-2 border-b border-slate-800">Dynamic Metadata & SEO Tuning Panel</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase">Global Page Meta Header Title</label>
              <input type="text" value={pSeo.metaTitle || ""} onChange={(e) => setPSeo({ ...pSeo, metaTitle: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase">Global Description Meta Tags Content</label>
              <textarea rows={3} value={pSeo.metaDescription || ""} onChange={(e) => setPSeo({ ...pSeo, metaDescription: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl p-4 text-xs text-white resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase">Indexing Keywords list</label>
              <input type="text" value={pSeo.keywords || ""} onChange={(e) => setPSeo({ ...pSeo, keywords: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
            </div>

            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition-all">
              Save SEO Tuning
            </button>
          </form>
        )}

        {/* ====================================================================
            TAB: GLOBAL BRAND/SITE THEME SETTINGS
            ==================================================================== */}
        {activeTab === "site" && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig("site", pSite); }} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider pb-2 border-b border-slate-800">Global Website branding</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Logo core Headline</label>
                <input type="text" value={pSite.logoText || ""} onChange={(e) => setPSite({ ...pSite, logoText: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Logo suffix subheadline</label>
                <input type="text" value={pSite.logoSubtext || ""} onChange={(e) => setPSite({ ...pSite, logoSubtext: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase">Footer Disclaimer text</label>
              <input type="text" value={pSite.footerText || ""} onChange={(e) => setPSite({ ...pSite, footerText: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Active Palette Choice</label>
                <select value={pSite.themeColor || "indigo"} onChange={(e) => setPSite({ ...pSite, themeColor: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white font-mono">
                  <option value="indigo">Pro-Carbon Indigo</option>
                  <option value="emerald">SaaS Glowing Emerald</option>
                  <option value="rose">Neon Rosewood</option>
                  <option value="amber">Industrial Amber</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Maintenance Mode Bypass</label>
                <select value={pSite.maintenanceMode ? "true" : "false"} onChange={(e) => setPSite({ ...pSite, maintenanceMode: e.target.value === "true" })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white font-mono">
                  <option value="false">Live Active Portfolio</option>
                  <option value="true">Offline Maintenance Screen</option>
                </select>
              </div>
            </div>

            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition-all">
              Save Brand Branding
            </button>
          </form>
        )}

        {/* ====================================================================
            TAB: SECURITY CREDENTIALS ACCESS
            ==================================================================== */}
        {activeTab === "security" && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const emailValue = (e.currentTarget.elements.namedItem("sec-email") as HTMLInputElement).value;
            const passwordValue = (e.currentTarget.elements.namedItem("sec-pass") as HTMLInputElement).value;
            if (!passwordValue) {
              triggerToast("Password cannot be empty", "error");
              return;
            }
            try {
              const res = await fetch("/api/admin/user", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                body: JSON.stringify({ email: emailValue, password: passwordValue })
              });
              if (res.ok) {
                triggerToast("Secure Admin credentials altered! Use new password next login.");
              }
            } catch (e) {
              console.log(e);
            }
          }} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 max-w-lg">
            <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider pb-2 border-b border-slate-800">Alter Administrator credentials</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase block">Admin Account Email</label>
              <input type="email" id="sec-email" name="sec-email" defaultValue="admin@example.com" required className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase block">New Secure Password</label>
              <input type="password" id="sec-pass" name="sec-pass" defaultValue="Admin@12345" required className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
            </div>

            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition-all">
              Save Secure Credentials
            </button>
          </form>
        )}

      </main>

      {/* ====================================================================
          UNIVERSAL DIALOG MODAL ADD / EDIT FORM BUILDER
          ==================================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-mono text-xs font-black uppercase text-indigo-400">Edit {editingType} Parameters</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded bg-slate-950 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              
              {/* SERVICE FORM CHUNKS */}
              {editingType === "service" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Service Title</label>
                    <input type="text" required value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Service Description Summary</label>
                    <textarea rows={3} required value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl p-4 text-xs text-white resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Icon Name (lucide identifier)</label>
                      <select value={editingItem.icon} onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white">
                        <option value="Code">Code</option>
                        <option value="Server">Server</option>
                        <option value="Database">Database</option>
                        <option value="Workflow">Workflow</option>
                        <option value="Cpu">Cpu</option>
                        <option value="Layers">Layers</option>
                        <option value="ShoppingBag">ShoppingBag</option>
                        <option value="RefreshCw">RefreshCw</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Display Sorting order</label>
                      <input type="number" required value={editingItem.displayOrder} onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                    </div>
                  </div>
                </>
              )}

              {/* SKILLS FORM CHUNKS */}
              {editingType === "skill" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Skill Spec Name</label>
                      <input type="text" required value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Category Group</label>
                      <select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white font-mono">
                        <option value="Frontend">Frontend Dev</option>
                        <option value="Backend">Backend Systems</option>
                        <option value="Database">Databases</option>
                        <option value="Scraping & Automation">Web Scraping / Automation</option>
                        <option value="Tools & Cloud">Tools & Infrastructure</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Competency Level Percentage (0 - 100)</label>
                    <input type="number" min="0" max="100" required value={editingItem.percentage} onChange={(e) => setEditingItem({ ...editingItem, percentage: parseInt(e.target.value) || 90 })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                </>
              )}

              {/* PROJECT FORM CHUNKS */}
              {editingType === "project" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400 uppercase">Project Title</label>
                      <input type="text" required value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400 uppercase">URL Slug (Auto-compiled)</label>
                      <input type="text" required value={editingItem.slug} onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400 uppercase">Category</label>
                      <input type="text" required value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400 uppercase">Client Name</label>
                      <input type="text" value={editingItem.clientName} onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400 uppercase">Featured Flag</label>
                      <select value={editingItem.featured ? "true" : "false"} onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.value === "true" })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white">
                        <option value="false">Standard project</option>
                        <option value="true">★ Primary showcase</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block font-bold">Image Thumbnail Core Upload</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleBase64Upload(e, (base64) => setEditingItem({ ...editingItem, thumbnail: base64 }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs py-1 px-2 rounded-xl"
                    />
                    {editingItem.thumbnail && (
                      <img src={editingItem.thumbnail} className="w-20 h-12 object-cover rounded mt-2 border border-slate-800" alt="" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase">Past work Description</label>
                    <textarea rows={3} required value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase">Highlights (Enter one key feature per newline)</label>
                    <textarea 
                      rows={2} 
                      value={editingItem.features?.join("\n")} 
                      onChange={(e) => setEditingItem({ ...editingItem, features: e.target.value.split("\n").filter(Boolean) })} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-l p-3 text-xs text-white font-mono" 
                      placeholder="e.g. Headless browser simulation"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 font-mono text-xs">
                      <label className="text-slate-400 uppercase">Launcher Site URL</label>
                      <input type="text" value={editingItem.projectUrl} onChange={(e) => setEditingItem({ ...editingItem, projectUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      <label className="text-slate-400 uppercase">GitHub Repo Link</label>
                      <input type="text" value={editingItem.githubUrl} onChange={(e) => setEditingItem({ ...editingItem, githubUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                    </div>
                  </div>
                </>
              )}

              {/* EXPERIENCES BUILDER CHUNKS */}
              {editingType === "experience" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Company Designation</label>
                      <input type="text" required value={editingItem.companyName} onChange={(e) => setEditingItem({ ...editingItem, companyName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Role Title</label>
                      <input type="text" required value={editingItem.role} onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Start Date</label>
                      <input type="text" placeholder="e.g. Nov 2024" required value={editingItem.startDate} onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">End Date</label>
                      <input type="text" placeholder="e.g. Present" required value={editingItem.endDate} onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Job Location</label>
                      <input type="text" required value={editingItem.location} onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block font-bold">Responsibilities Description</label>
                    <textarea rows={3} required value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl p-4 text-xs text-white" />
                  </div>
                </>
              )}

              {/* EDUCATION FORM BUILDER CHUNKS */}
              {editingType === "education" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Institute Name</label>
                    <input type="text" required value={editingItem.institute} onChange={(e) => setEditingItem({ ...editingItem, institute: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Degree / Certification Title</label>
                    <input type="text" required value={editingItem.degree} onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Year Period</label>
                    <input type="text" placeholder="e.g. 2019-2023" required value={editingItem.year} onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                </>
              )}

              {/* CERTIFICATE FORM BUILDER CHUNKS */}
              {editingType === "certification" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Certificate Name</label>
                    <input type="text" required value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Issuer Authority</label>
                    <input type="text" required value={editingItem.issuer} onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Year Obtained</label>
                    <input type="text" required value={editingItem.year} onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                </>
              )}

              {/* TESTIMONIAL FORM BUILDER CHUNKS */}
              {editingType === "testimonial" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Client Name</label>
                      <input type="text" required value={editingItem.clientName} onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-400 uppercase block">Company Designation</label>
                      <input type="text" required value={editingItem.company} onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <div className="space-y-2 font-mono">
                    <label className="text-xs text-slate-400 uppercase block">Rating Score (1 - 5 stars)</label>
                    <select value={editingItem.rating} onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) || 5 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white">
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4">★★★★ (4 Stars)</option>
                      <option value="3">★★★ (3 Stars)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block">Review Message Quote</label>
                    <textarea rows={3} required value={editingItem.message} onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl p-4 text-xs text-white resize-none" />
                  </div>
                </>
              )}

              {/* BLOG ARTICLE EDIT FORM */}
              {editingType === "blog" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 font-mono text-xs">
                      <label className="text-slate-400 uppercase">Article Title</label>
                      <input type="text" required value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      <label className="text-slate-400 uppercase">Slug path (generated)</label>
                      <input type="text" required value={editingItem.slug} onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 font-mono text-xs">
                      <label className="text-slate-400 uppercase">Category Group</label>
                      <input type="text" required value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                    </div>
                    <div className="space-y-1 font-mono text-xs col-span-2">
                      <label className="text-slate-400 uppercase">Status state</label>
                      <select value={editingItem.status} onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white">
                        <option value="published">Live Published</option>
                        <option value="draft">Draft (hidden from public)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase block font-bold">Featured Header Image Upload</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleBase64Upload(e, (base64) => setEditingItem({ ...editingItem, featuredImage: base64 }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs py-1 px-2 rounded-xl"
                    />
                    {editingItem.featuredImage && (
                      <img src={editingItem.featuredImage} className="w-20 h-12 object-cover rounded mt-2 border border-slate-800" alt="" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase">Markdown Content body</label>
                    <textarea rows={6} required value={editingItem.content} onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none" />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 font-mono text-xs">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold uppercase transition-all" id="save-item-btn">Save changes</button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
