import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowUpRight, Play, Terminal, Sparkles, CheckCircle, Code, Server, 
  Workflow, Zap, Copy, Check, ShieldCheck, Cpu, PhoneCall, FileText, Globe
} from "lucide-react";
import { HeroSection, Profile } from "../../types";
import { ScrambleText } from "./ScrambleText";
import { MotionButton } from "./MotionComponents";
import { motionConfig } from "../../motion-config";

interface HeroBannerShowcaseProps {
  hero: HeroSection;
  profile: Profile;
  isDark: boolean;
  t: any;
}

const CODE_SNIPPETS = {
  scraper: `// High-Throughput Scrapy Engine
class ECommerceSpider(scrapy.Spider):
    name = "retail_harvester"
    custom_settings = {
        'CONCURRENT_REQUESTS': 64,
        'DOWNLOAD_DELAY': 0.15,
        'ROTATING_PROXY_LIST': ['brd.superproxy.io:22225']
    }

    def parse(self, response):
        yield {
            'sku': response.css('.product-sku::text').get(),
            'price': float(response.css('.price-val::text').get()),
            'stock': response.css('.in-stock-flag').get() is not None,
            'scraped_at': datetime.utcnow().isoformat()
        }`,
  api: `// Next.js High-Concurrency API Proxy
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUrl, selectors } = await req.json();
  const queueJob = await redis.lpush("crawl_queue", JSON.stringify({
    url: targetUrl,
    userId: session.user.id,
    timestamp: Date.now()
  }));

  return NextResponse.json({ status: "queued", jobId: queueJob });
}`,
  frontend: `// React 18 Zustand Real-Time State
export const usePortfolioStore = create<Store>((set) => ({
  activeTab: "overview",
  liveCrawlers: 14,
  toggleCrawler: (id) => set((state) => ({
    liveCrawlers: state.liveCrawlers + 1
  }))
}));`
};

export const HeroBannerShowcase: React.FC<HeroBannerShowcaseProps> = ({ hero, profile, isDark, t }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<"scraper" | "api" | "frontend">("scraper");
  const [copied, setCopied] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const heroStats = [
    { label: "Years Experience", value: "4+", desc: "Full-Stack & Scraping", icon: Zap },
    { label: "Daily Data Crawled", value: "10k+", desc: "Clean Automated Data", icon: Workflow },
    { label: "Production Up-Time", value: "99.9%", desc: "SaaS & Backend SLAs", icon: Server },
    { label: "Client Satisfaction", value: "100%", desc: "5-Star Ratings & Reviews", icon: CheckCircle }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="home" className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* BACKGROUND DECORATIVE GLOW ORBS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: HERO CONTENT & CTA */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* AVAILABILITY STATUS BADGE */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3"
          >
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${
              isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
            } border text-xs font-mono font-semibold shadow-sm`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Available for New High-Impact Projects</span>
            </div>

            <span className={`text-xs font-mono hidden sm:inline-block ${t.textMuted}`}>
              📍 {profile.location || "Patna, Bihar, India"}
            </span>
          </motion.div>

          {/* MAIN HERO HEADLINE */}
          <div className="space-y-3">
            <ScrambleText 
              text={hero.heading || "Engineering High-Scale Web Automations & Modern Full-Stack Platforms"} 
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold ${t.textBright} leading-[1.15] tracking-tight`}
              delay={0.1}
              duration={1.2}
            />

            <p className={`text-sm sm:text-base md:text-lg ${t.textMuted} max-w-2xl leading-relaxed`}>
              {hero.subheading || "Full-Stack Software Engineer specializing in high-throughput Python Web Crawling, PHP Symfony/Laravel backends, React/Next.js dynamic frontends, and automated Cloud deployments."}
            </p>
          </div>

          {/* CALL TO ACTION BUTTONS */}
          <motion.div 
            className="flex flex-wrap items-center gap-3 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MotionButton id="hero-cta-primary">
              <a 
                href={hero.ctaLinkPrimary || "https://wa.me/917463867570"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-indigo-500/25 flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                {hero.ctaTextPrimary || "Direct Connect on WhatsApp"} 
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </MotionButton>

            <MotionButton id="hero-cta-secondary">
              <a 
                href={hero.ctaLinkSecondary || "#portfolio"} 
                className={`px-6 py-3.5 rounded-2xl ${
                  isDark ? "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                } border font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2`}
              >
                <Code className="w-4 h-4 text-indigo-400" />
                {hero.ctaTextSecondary || "View Work Portfolio"}
              </a>
            </MotionButton>

            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                download="Ritesh-Kumar-Full-Stack-Developer-Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3.5 rounded-2xl ${
                  isDark ? "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                } border transition-colors flex items-center justify-center`}
                title="Download CV / Resume"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
              </a>
            )}
          </motion.div>

          {/* FLOATING QUICK STATS ROW */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/30"
          >
            {heroStats.map((st, i) => {
              const IconComp = st.icon;
              return (
                <div 
                  key={i} 
                  className={`p-3 rounded-2xl ${isDark ? "bg-slate-950/60 border-slate-900" : "bg-white/80 border-slate-200"} border space-y-1 shadow-xs`}
                >
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <IconComp className="w-3.5 h-3.5" />
                    <span className={`text-base sm:text-lg font-extrabold font-mono ${t.textBright}`}>
                      {st.value}
                    </span>
                  </div>
                  <p className={`text-[11px] font-bold ${t.textBright} line-clamp-1`}>{st.label}</p>
                  <p className={`text-[9px] ${t.textMuted} line-clamp-1`}>{st.desc}</p>
                </div>
              );
            })}
          </motion.div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE CODE TERMINAL & PROFILE CARD */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PROFILE CARD WITH GLOWING RING */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`p-6 rounded-3xl ${t.bgCard} border ${t.borderCard} shadow-2xl relative overflow-hidden group`}
          >
            {/* Ambient Corner Blur */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

            <div className="flex items-center gap-4">
              {/* Avatar with Verified Developer Badge */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-blue-500/50 relative z-10 shadow-xl">
                  <img 
                    src={profile.profileImage || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600"} 
                    alt={profile.name} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Floating Verified Badge */}
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-mono font-extrabold tracking-wider flex items-center gap-1 shadow-lg border border-blue-400/60 z-30">
                  <ShieldCheck className="w-3 h-3 fill-white text-blue-600" /> VERIFIED
                </span>
                {/* Available for Hire dot */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 z-20 flex items-center justify-center shadow-md" title="Available for hire">
                  <Check className="w-3 h-3 text-slate-950 font-bold" />
                </span>
              </div>

              {/* Bio & Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-lg font-bold ${t.textBright}`}>
                    {profile.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-extrabold border border-blue-500/30 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 fill-blue-500/20 text-blue-400" /> Verified Developer
                  </span>
                </div>
                <p className={`text-xs font-mono ${t.textIndigo} font-semibold`}>
                  {profile.title}
                </p>
                <p className={`text-xs ${t.textMuted} line-clamp-2`}>
                  Specialized in Web Scraping Pipelines, PHP Symfony, and Full-Stack SaaS Architectures.
                </p>
              </div>
            </div>

            {/* QUICK CONTACT CHIPS */}
            <div className="mt-4 pt-4 border-t border-slate-800/30 flex items-center justify-between text-xs font-mono">
              <span className={`text-[11px] ${t.textMuted}`}>
                📧 {profile.email}
              </span>
              <a 
                href={profile.githubUrl || "https://github.com"} 
                target="_blank" 
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1 font-bold"
              >
                GitHub Profile <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>

          {/* INTERACTIVE LIVE CODE TERMINAL TICKER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className={`p-5 rounded-3xl ${isDark ? "bg-slate-950/90 border-slate-900" : "bg-slate-900 text-slate-100"} border shadow-2xl relative overflow-hidden font-mono text-xs space-y-3`}
          >
            {/* Terminal Window Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[10px] text-slate-400 ml-2 font-bold flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-indigo-400" /> live-code-snippet.ts
                </span>
              </div>

              {/* Copy Code button */}
              <button
                onClick={handleCopyCode}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800/80 pb-2">
              <button
                onClick={() => setActiveCodeTab("scraper")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeCodeTab === "scraper"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 bg-slate-900"
                }`}
              >
                Python Scrapy
              </button>

              <button
                onClick={() => setActiveCodeTab("api")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeCodeTab === "api"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 bg-slate-900"
                }`}
              >
                Next.js API Route
              </button>

              <button
                onClick={() => setActiveCodeTab("frontend")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeCodeTab === "frontend"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 bg-slate-900"
                }`}
              >
                React Zustand
              </button>
            </div>

            {/* Snippet Code Area */}
            <AnimatePresence mode="wait">
              <motion.pre
                key={activeCodeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-48 p-2 bg-slate-950/60 rounded-xl border border-slate-900/80 no-scrollbar"
              >
                <code>{CODE_SNIPPETS[activeCodeTab]}</code>
              </motion.pre>
            </AnimatePresence>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3 h-3" /> Syntax Verified & Executable
              </span>
              <span>UTF-8 • Unix</span>
            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
};
