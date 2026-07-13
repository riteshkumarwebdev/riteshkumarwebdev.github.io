// Shared Entity interfaces between client and server

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  portfolioUrl: string;
  location: string;
  profileImage: string;
  resumeUrl: string;
}

export interface HeroSection {
  heading: string;
  subheading: string;
  ctaTextPrimary: string;
  ctaLinkPrimary: string;
  ctaTextSecondary: string;
  ctaLinkSecondary: string;
  backgroundImage: string;
  status: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  displayOrder: number;
  status: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Database" | "Scraping & Automation" | "Tools & Cloud";
  percentage: number;
  icon: string;
  status: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  techStack: string[];
  description: string;
  features: string[];
  clientName: string;
  projectUrl: string;
  githubUrl: string;
  thumbnail: string;
  gallery: string[];
  featured: boolean;
  status: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface Experience {
  id: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  techStack: string[];
  displayOrder: number;
}

export interface Education {
  id: string;
  institute: string;
  degree: string;
  year: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url: string;
  status: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  rating: number;
  message: string;
  photo: string;
  status: boolean;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  featuredImage: string;
  tags: string[];
  status: "draft" | "published";
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replied: boolean;
}

export interface VisitorLog {
  id: string;
  ip: string;
  userAgent: string;
  browser: string;
  deviceType: "mobile" | "tablet" | "desktop";
  os: string;
  referrer: string;
  pageUrl: string;
  visitTime: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  googleAnalytics: string;
  customHeaderScripts: string;
  customFooterScripts: string;
}

export interface SiteSettings {
  logoText: string;
  logoSubtext: string;
  websiteName: string;
  footerText: string;
  socialLinkedIn: string;
  socialGitHub: string;
  socialWhatsApp: string;
  socialEmail: string;
  maintenanceMode: boolean;
  themeColor: string; // e.g., "indigo"
}

// Full Database Schema
export interface Database {
  profile: Profile;
  hero: HeroSection;
  services: Service[];
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  testimonials: Testimonial[];
  blogs: Blog[];
  contacts: ContactInquiry[];
  visitors: VisitorLog[];
  seo: SEOSettings;
  site: SiteSettings;
}
