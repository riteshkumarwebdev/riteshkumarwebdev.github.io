import { useState, useEffect } from "react";
import PortfolioView from "./components/PortfolioView.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import { toAppPath, toBrowserPath } from "./lib/githubPages.ts";
import { loadPortfolioData } from "./lib/portfolioData.ts";

export default function App() {
  const [currentPath, setCurrentPath] = useState(toAppPath(window.location.pathname));
  const [siteSettings, setSiteSettings] = useState<any>({
    logoText: "Ritesh",
    logoSubtext: "Kumar",
    maintenanceMode: false,
    themeColor: "indigo"
  });

  // Track SPA browser navigation changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(toAppPath(window.location.pathname));
    };

    window.addEventListener("popstate", handleLocationChange);

    // Patch pushState and replaceState to detect SPA programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Fetch brand configurations to support global maintenance settings & theme colors
  useEffect(() => {
    loadPortfolioData()
      .then((data) => {
        if (data.site) {
          setSiteSettings(data.site);
        }
      })
      .catch((e) => console.log("Silent settings load"));
  }, [currentPath]);

  // Handle pathname security redirects & head robots meta injection
  useEffect(() => {
    const isTokenPresent = !!sessionStorage.getItem("admin_token");

    // Route redirects
    if (currentPath === "/admin") {
      if (!isTokenPresent) {
        window.history.replaceState({}, "", toBrowserPath("/admin/login"));
        setCurrentPath("/admin/login");
      }
    } else if (currentPath === "/admin/login") {
      if (isTokenPresent) {
        window.history.replaceState({}, "", toBrowserPath("/admin"));
        setCurrentPath("/admin");
      }
    }

    // Dynamic Robots Meta creation to block search engine indexation
    let meta = document.querySelector("meta[name='robots']");
    if (currentPath.startsWith("/admin") || currentPath.startsWith("/admin/login")) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "robots");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", "noindex, nofollow");
    } else {
      if (meta) {
        meta.remove();
      }
    }
  }, [currentPath]);

  const goToPortfolio = () => {
    window.history.pushState({}, "", toBrowserPath("/"));
  };

  const isAdminRoute = currentPath.startsWith("/admin") || currentPath.startsWith("/admin/login");

  // Maintenance screen bypass (with no administrative link to fulfill "Public users should never see any admin option")
  if (siteSettings.maintenanceMode && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-mono">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 animate-pulse">
          ⚙️
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-center">System Maintenances Active</h1>
        <p className="text-xs text-slate-400 max-w-sm text-center mt-2 leading-relaxed">
          Ritesh Kumar's developer portfolio is under structural scheduled maintenance. Please return shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      {isAdminRoute ? (
        <AdminPanel 
          onBackToPortfolio={goToPortfolio}
          siteName={siteSettings.logoText || "Ritesh"} 
        />
      ) : (
        <PortfolioView 
          onOpenAdmin={() => {}} 
          siteName={siteSettings.logoText || "Ritesh"} 
        />
      )}
    </>
  );
}
