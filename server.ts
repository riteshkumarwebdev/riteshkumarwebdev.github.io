import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { DbStore, Database, Project, Blog, Service, Skill, Experience, Education, Certification, Testimonial, ContactInquiry, VisitorLog } from "./src/dbStore.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper: Secure API wrapper to get/save database with fallback admin credentials
interface DatabaseWithAuth extends Database {
  adminCredentials?: {
    email: string;
    passwordHash: string; // Plain password or simple secure string for this applet
  };
}

function getDatabaseWithAuth(): DatabaseWithAuth {
  const db = DbStore.getDB() as DatabaseWithAuth;
  if (!db.adminCredentials) {
    db.adminCredentials = {
      email: "admin@example.com",
      passwordHash: "Admin@12345" // Seed password as requested
    };
    DbStore.saveDB(db);
  }
  return db;
}

// ----------------------------------------------------
// PUBLIC PORTFOLIO APIs
// ----------------------------------------------------

// Dynamic Robots.txt to disallow search engine crawling of admin endpoints
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: /admin\nDisallow: /admin/login\n");
});

// Get Portfolio Content
app.get("/api/portfolio", (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    // Exclude security credentials, raw visitor logs, and secret contacts from public api
    const publicData = {
      profile: db.profile,
      hero: db.hero,
      services: db.services.filter(s => s.status),
      skills: db.skills.filter(s => s.status),
      projects: db.projects.filter(p => p.status),
      experience: db.experience,
      education: db.education,
      certifications: db.certifications.filter(c => c.status),
      testimonials: db.testimonials.filter(t => t.status),
      blogs: db.blogs.filter(b => b.status === "published"),
      seo: db.seo,
      site: db.site
    };
    res.json(publicData);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load portfolio details", details: error.message });
  }
});

// Single Project Detail
app.get("/api/portfolio/projects/:slug", (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const project = db.projects.find(p => p.slug === req.params.slug && p.status);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Single Blog Detail
app.get("/api/portfolio/blogs/:slug", (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const blog = db.blogs.find(b => b.slug === req.params.slug && b.status === "published");
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Submit Contact Inquiry
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required fields." });
    }

    const db = getDatabaseWithAuth();
    const newInquiry: ContactInquiry = {
      id: "con-" + Date.now().toString(36),
      name,
      email,
      phone: phone || "",
      subject: subject || "No Subject Provided",
      message,
      date: new Date().toISOString(),
      read: false,
      replied: false
    };

    db.contacts.unshift(newInquiry);
    DbStore.saveDB(db);

    res.json({ success: true, message: "Thank you for reaching out! Ritesh will respond to your inquiry shortly." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to store contact submission", details: error.message });
  }
});

// Dynamic Real-time Client-side Visited Page Tracking
app.post("/api/track-visit", (req, res) => {
  try {
    const { pageUrl, referrer } = req.body;
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();

    // Parse simple user agent configurations
    let browser = "Chrome";
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Postman") || userAgent.includes("curl") || userAgent.includes("Googlebot")) browser = "Bot/Utility";

    let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      deviceType = "mobile";
    } else if (userAgent.includes("iPad") || userAgent.includes("Tablet")) {
      deviceType = "tablet";
    }

    let os = "Windows";
    if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("Linux")) os = "Linux";

    const db = getDatabaseWithAuth();

    const newVisit: VisitorLog = {
      id: "vst-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
      ip,
      userAgent,
      browser,
      deviceType,
      os,
      referrer: referrer || "Direct",
      pageUrl: pageUrl || "/",
      visitTime: new Date().toISOString()
    };

    db.visitors.push(newVisit);
    // Keep max 5000 visitor logs to prevent giant database expansion
    if (db.visitors.length > 5000) {
      db.visitors.shift();
    }
    DbStore.saveDB(db);

    res.json({ success: true });
  } catch (error: any) {
    // Fail silently for page tracking so it does not block the user session
    res.status(200).json({ success: false });
  }
});

// ----------------------------------------------------
// SECURE ADMIN AUTHENTICATION
// ----------------------------------------------------
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDatabaseWithAuth();

    if (!db.adminCredentials) {
      return res.status(500).json({ error: "System initialization error" });
    }

    if (email === db.adminCredentials.email && password === db.adminCredentials.passwordHash) {
      // Create a super simple secure bearer credential
      const token = `adm-token-${Buffer.from(email + ":" + Date.now()).toString("base64")}`;
      return res.json({
        success: true,
        token,
        adminUser: {
          email: db.adminCredentials.email,
          name: db.profile.name,
          profileImage: db.profile.profileImage
        }
      });
    }

    res.status(401).json({ error: "Invalid admin email or password credentials" });
  } catch (error: any) {
    res.status(500).json({ error: "Login authentication failed", details: error.message });
  }
});

// Middleware to protect admin routes
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer adm-token-")) {
    return next();
  }
  res.status(403).json({ error: "Unauthorized. Admin credentials are required." });
}

// ----------------------------------------------------
// SECURE ADMIN CRUD MODULES
// ----------------------------------------------------

// Load Admin Dashboard Metrics
app.get("/api/admin/dashboard", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();

    // 1. Calculates Visits statistics
    const logs = db.visitors;
    const totalVisits = logs.length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter(l => new Date(l.visitTime) >= startOfToday);
    const todayVisits = todayLogs.length;

    // Unique IPs count (using dynamic set of IPs)
    const uniqueIPSet = new Set(logs.map(l => l.ip));
    const uniqueVisitors = uniqueIPSet.size;

    // 2. Fetch Module counts
    const totalProjects = db.projects.length;
    const totalContactInquiries = db.contacts.length;
    const totalServices = db.services.length;
    const totalBlogs = db.blogs.length;

    // 3. Most Visited Pages stats
    const pageFrequencies: Record<string, number> = {};
    logs.forEach(l => {
      pageFrequencies[l.pageUrl] = (pageFrequencies[l.pageUrl] || 0) + 1;
    });
    const mostVisitedPages = Object.entries(pageFrequencies)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 4. Device distributions
    const deviceCounts = { desktop: 0, tablet: 0, mobile: 0 };
    const browserCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};

    logs.forEach(l => {
      if (l.deviceType in deviceCounts) {
        deviceCounts[l.deviceType]++;
      } else {
        deviceCounts.desktop++;
      }
      browserCounts[l.browser] = (browserCounts[l.browser] || 0) + 1;
      osCounts[l.os] = (osCounts[l.os] || 0) + 1;
    });

    // 5. Build clean Traffic charts coordinates (last 7 days counts)
    const trafficChart: { date: string; visits: number; unique: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];

      const startDay = new Date(d); startDay.setHours(0,0,0,0);
      const endDay = new Date(d); endDay.setHours(23,59,59,999);

      const dayLogs = logs.filter(l => {
        const vt = new Date(l.visitTime);
        return vt >= startDay && vt <= endDay;
      });

      const dayUniqueSet = new Set(dayLogs.map(l => l.ip));

      trafficChart.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        visits: dayLogs.length,
        unique: dayUniqueSet.size
      });
    }

    res.json({
      metrics: {
        totalVisits,
        todayVisits,
        uniqueVisitors,
        totalProjects,
        totalContactInquiries,
        totalServices,
        totalBlogs
      },
      mostVisitedPages,
      deviceCounts,
      browserCounts,
      osCounts,
      trafficChart,
      recentContacts: db.contacts.slice(0, 5),
      recentVisitorLogs: logs.slice(-10).reverse()
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate system dashboard metrics", details: error.message });
  }
});

// Module 1: Update Admin Profile
app.post("/api/admin/profile", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.profile = { ...db.profile, ...req.body };
    DbStore.saveDB(db);
    res.json({ success: true, message: "Profile credentials updated successfully", profile: db.profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 2: Update Hero Settings
app.post("/api/admin/hero", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.hero = { ...db.hero, ...req.body };
    DbStore.saveDB(db);
    res.json({ success: true, message: "Hero settings updated successfully", hero: db.hero });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 3: Services CRUD
app.get("/api/admin/services", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.services);
});

app.post("/api/admin/services", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const service: Service = req.body;
    if (!service.id) {
      service.id = "srv-" + Date.now().toString(36);
      db.services.push(service);
    } else {
      const idx = db.services.findIndex(s => s.id === service.id);
      if (idx !== -1) db.services[idx] = service;
    }
    DbStore.saveDB(db);
    res.json({ success: true, services: db.services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/services/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.services = db.services.filter(s => s.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, services: db.services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 4: Skills CRUD
app.get("/api/admin/skills", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.skills);
});

app.post("/api/admin/skills", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const skill: Skill = req.body;
    if (!skill.id) {
      skill.id = "sk-" + Date.now().toString(36);
      db.skills.push(skill);
    } else {
      const idx = db.skills.findIndex(s => s.id === skill.id);
      if (idx !== -1) db.skills[idx] = skill;
    }
    DbStore.saveDB(db);
    res.json({ success: true, skills: db.skills });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/skills/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.skills = db.skills.filter(s => s.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, skills: db.skills });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 5: Projects/Portfolio CRUD
app.get("/api/admin/projects", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.projects);
});

app.post("/api/admin/projects", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const project: Project = req.body;

    // Auto-generate slug if blank
    if (!project.slug) {
      project.slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    if (!project.id) {
      project.id = "proj-" + Date.now().toString(36);
      db.projects.push(project);
    } else {
      const idx = db.projects.findIndex(p => p.id === project.id);
      if (idx !== -1) db.projects[idx] = project;
    }
    DbStore.saveDB(db);
    res.json({ success: true, projects: db.projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/projects/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.projects = db.projects.filter(p => p.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, projects: db.projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 6 & 7: Experience / Education CRUD
app.get("/api/admin/experience", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.experience);
});

app.post("/api/admin/experience", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const exp: Experience = req.body;
    if (!exp.id) {
      exp.id = "exp-" + Date.now().toString(36);
      db.experience.push(exp);
    } else {
      const idx = db.experience.findIndex(e => e.id === exp.id);
      if (idx !== -1) db.experience[idx] = exp;
    }
    DbStore.saveDB(db);
    res.json({ success: true, experience: db.experience });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/experience/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.experience = db.experience.filter(e => e.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, experience: db.experience });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/education", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.education);
});

app.post("/api/admin/education", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const edu: Education = req.body;
    if (!edu.id) {
      edu.id = "edu-" + Date.now().toString(36);
      db.education.push(edu);
    } else {
      const idx = db.education.findIndex(e => e.id === edu.id);
      if (idx !== -1) db.education[idx] = edu;
    }
    DbStore.saveDB(db);
    res.json({ success: true, education: db.education });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/education/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.education = db.education.filter(e => e.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, education: db.education });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 8: Certifications CRUD
app.get("/api/admin/certifications", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.certifications);
});

app.post("/api/admin/certifications", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const cert: Certification = req.body;
    if (!cert.id) {
      cert.id = "cert-" + Date.now().toString(36);
      db.certifications.push(cert);
    } else {
      const idx = db.certifications.findIndex(c => c.id === cert.id);
      if (idx !== -1) db.certifications[idx] = cert;
    }
    DbStore.saveDB(db);
    res.json({ success: true, certifications: db.certifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/certifications/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.certifications = db.certifications.filter(c => c.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, certifications: db.certifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 9: Testimonials CRUD
app.get("/api/admin/testimonials", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.testimonials);
});

app.post("/api/admin/testimonials", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const test: Testimonial = req.body;
    if (!test.id) {
      test.id = "tst-" + Date.now().toString(36);
      db.testimonials.push(test);
    } else {
      const idx = db.testimonials.findIndex(t => t.id === test.id);
      if (idx !== -1) db.testimonials[idx] = test;
    }
    DbStore.saveDB(db);
    res.json({ success: true, testimonials: db.testimonials });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/testimonials/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.testimonials = db.testimonials.filter(t => t.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, testimonials: db.testimonials });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 10: Blogs CRUD
app.get("/api/admin/blogs", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.blogs);
});

app.post("/api/admin/blogs", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const blog: Blog = req.body;

    if (!blog.slug) {
      blog.slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    if (!blog.id) {
      blog.id = "bl-" + Date.now().toString(36);
      blog.createdAt = new Date().toISOString().split("T")[0];
      db.blogs.push(blog);
    } else {
      const idx = db.blogs.findIndex(b => b.id === blog.id);
      if (idx !== -1) db.blogs[idx] = { ...db.blogs[idx], ...blog };
    }
    DbStore.saveDB(db);
    res.json({ success: true, blogs: db.blogs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/blogs/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.blogs = db.blogs.filter(b => b.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, blogs: db.blogs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 11: Contact Inquiry Management
app.get("/api/admin/contacts", requireAdmin, (req, res) => {
  const db = getDatabaseWithAuth();
  res.json(db.contacts);
});

app.post("/api/admin/contacts/:id/read", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const idx = db.contacts.findIndex(c => c.id === req.params.id);
    if (idx !== -1) {
      db.contacts[idx].read = true;
    }
    DbStore.saveDB(db);
    res.json({ success: true, contacts: db.contacts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/contacts/:id/reply", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    const idx = db.contacts.findIndex(c => c.id === req.params.id);
    if (idx !== -1) {
      db.contacts[idx].replied = true;
    }
    DbStore.saveDB(db);
    res.json({ success: true, contacts: db.contacts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/contacts/:id", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.contacts = db.contacts.filter(c => c.id !== req.params.id);
    DbStore.saveDB(db);
    res.json({ success: true, contacts: db.contacts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 13: SEO Settings
app.post("/api/admin/seo", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.seo = { ...db.seo, ...req.body };
    DbStore.saveDB(db);
    res.json({ success: true, message: "SEO settings saved", seo: db.seo });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 14: Site Settings
app.post("/api/admin/site", requireAdmin, (req, res) => {
  try {
    const db = getDatabaseWithAuth();
    db.site = { ...db.site, ...req.body };
    DbStore.saveDB(db);
    res.json({ success: true, message: "Site settings saved", site: db.site });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 15: Admin User Management Credentials
app.post("/api/admin/user", requireAdmin, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and secure password are required" });
    }
    const db = getDatabaseWithAuth();
    db.adminCredentials = {
      email,
      passwordHash: password
    };
    DbStore.saveDB(db);
    res.json({ success: true, message: "Admin credential settings updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// INTEGRATE VITE DEPLOYMENT MIDDLEWARE / ROUTER
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Admin CMS full-stack system listening on http://localhost:${PORT}`);
  });
}

startServer();
