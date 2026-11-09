import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PageState from "./components/PageState";
import ProtectedRoute from "./components/ProtectedRoute";
import AccessibilityProvider from "./context/Accessibility/AccessibilityProvider";
import AuthProvider from "./context/Auth/AuthProvider";
import ContributePage from "./pages/ContributePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PersonPage from "./pages/PersonPage";
import PlacePage from "./pages/PlacePage";
import SourcesPage from "./pages/SourcesPage";
import TestimonyPage from "./pages/TestimonyPage";
import TimelinePage from "./pages/TimelinePage";

// Chargées à la demande : la carte (Leaflet) et l'administration (MUI)
const MapPage = lazy(() => import("./pages/MapPage"));
const AdminHomePage = lazy(() => import("./pages/admin/AdminHomePage"));
const AdminContributionsPage = lazy(() => import("./pages/admin/AdminContributionsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const MyAccountPage = lazy(() => import("./pages/admin/MyAccountPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminListPage = lazy(() => import("./pages/admin/AdminListPage"));
const AdminEditPage = lazy(() => import("./pages/admin/AdminEditPage"));

// Remonte en haut de page à chaque changement de page (sauf ancre)
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

function App() {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <AccessibilityProvider>
        {/* Les animations respectent le réglage « réduire les animations » du système */}
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <ScrollToTop />
            <a href="#contenu" className="skip-link">
              {t("nav.skip")}
            </a>
            <div className="flex min-h-dvh flex-col">
              <Navbar />
              <main id="contenu" tabIndex={-1} className="flex-1 outline-none">
                <Suspense fallback={<PageState loading error={null} />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/frise" element={<TimelinePage />} />
                    <Route path="/carte" element={<MapPage />} />
                    <Route path="/lieux/:code" element={<PlacePage />} />
                    <Route path="/personnes/:id" element={<PersonPage />} />
                    <Route path="/temoignages/:id" element={<TestimonyPage />} />
                    <Route path="/contribuer" element={<ContributePage />} />
                    <Route path="/nos-sources" element={<SourcesPage />} />
                    <Route path="/connexion" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/admin" element={<AdminHomePage />} />
                      <Route path="/admin/contributions" element={<AdminContributionsPage />} />
                      <Route path="/admin/comptes" element={<AdminUsersPage />} />
                      <Route path="/admin/mon-compte" element={<MyAccountPage />} />
                      <Route path="/admin/reglages" element={<AdminSettingsPage />} />
                      <Route path="/admin/:entity" element={<AdminListPage />} />
                      <Route path="/admin/:entity/:id" element={<AdminEditPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </MotionConfig>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
