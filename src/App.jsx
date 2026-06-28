import { useCallback, useEffect, useState } from "react";

import LegacyPage from "./components/LegacyPage";
import SEO from "./components/SEO";
import { legacyPages } from "./data/legacyPages.generated";
import AuthLandingPage from "./features/auth/AuthLandingPage";
import ForecastOverview from "./features/forecast/ForecastOverview";
import ForecastPartPage from "./features/forecast/ForecastPartPage";
import ForecastPracticePage from "./features/forecast/ForecastPracticePage";
import { getRouteDefinition, normalizePath } from "./lib/routes";

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const route = getRouteDefinition(path);
  const isReactPage = route.definition.kind === "react";
  const page = isReactPage
    ? {
        title: route.definition.title,
        description: route.definition.description
      }
    : legacyPages[route.definition.id] || legacyPages.home;

  useEffect(() => {
    const handlePopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((to) => {
    if (to === -1) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.pushState({}, "", "/");
        setPath("/");
      }
      return;
    }

    const target = new URL(to, window.location.origin);
    if (target.origin !== window.location.origin) {
      window.location.href = target.href;
      return;
    }

    const nextPath = normalizePath(target.pathname);
    if (nextPath !== normalizePath(window.location.pathname)) {
      window.history.pushState({}, "", target.pathname + target.search + target.hash);
      setPath(nextPath);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  const renderReactPage = () => {
    if (route.definition.id === "login") return <AuthLandingPage onNavigate={navigate} />;
    if (route.definition.id === "forecast") return <ForecastOverview onNavigate={navigate} />;
    if (route.definition.id === "forecastPart1") {
      return <ForecastPartPage part={1} onNavigate={navigate} />;
    }
    if (route.definition.id === "forecastPart2") {
      return <ForecastPartPage part={2} onNavigate={navigate} />;
    }
    if (route.definition.id === "forecastPart3") {
      return <ForecastPartPage part={3} onNavigate={navigate} />;
    }
    if (route.definition.id === "forecastPractice") {
      return <ForecastPracticePage path={route.normalizedPath} onNavigate={navigate} />;
    }
    return <ForecastOverview onNavigate={navigate} />;
  };

  return (
    <>
      <SEO definition={route.definition} page={page} />
      {isReactPage ? (
        renderReactPage()
      ) : (
        <LegacyPage
          key={`${route.definition.id}:${route.normalizedPath}`}
          page={page}
          path={route.normalizedPath}
          onNavigate={navigate}
        />
      )}
    </>
  );
}
