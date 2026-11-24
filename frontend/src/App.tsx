import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PageState from "./components/PageState";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollProgress from "./components/ScrollProgress";
import AccessibilityProvider from "./context/Accessibility/AccessibilityProvider";
import AuthProvider from "./context/Auth/AuthProvider";
import { SHOW_COMMUNITY } from "./constants/features";
import MemberProvider from "./context/Member/MemberProvider";
import ArchivesPage from "./pages/ArchivesPage";
import ContributePage from "./pages/ContributePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PersonPage from "./pages/PersonPage";
import PlacePage from "./pages/PlacePage";
import TestimonyPage from "./pages/TestimonyPage";

// Chargées à la demande : la carte (Leaflet) et l'administration (MUI)
const MapPage = lazy(() => import("./pages/MapPage"));
const CommunityPage = lazy(() => import("./pages/community/CommunityPage"));
const JoinPage = lazy(() => import("./pages/community/JoinPage"));
const MemberPage = lazy(() => import("./pages/community/MemberPage"));
const PostPage = lazy(() => import("./pages/community/PostPage"));
const AdminCommunityPage = lazy(() => import("./pages/admin/AdminCommunityPage"));
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
      <MemberProvider>
      <AccessibilityProvider>
        {/* Les animations respectent le réglage « réduire les animations » du système */}
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <ScrollToTop />
            <ScrollProgress />
            <a href="#contenu" className="skip-link">
              {t("nav.skip")}
            </a>
            <div className="flex min-h-dvh flex-col">
              <Navbar />
              <main id="contenu" tabIndex={-1} className="flex-1 outline-none">
                <Suspense fallback={<PageState loading error={null} />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/carte" element={<MapPage />} />
                    <Route path="/lieux/:code" element={<PlacePage />} />
                    <Route path="/personnes/:id" element={<PersonPage />} />
                    <Route path="/temoignages/:id" element={<TestimonyPage />} />
                    {SHOW_COMMUNITY && (
                      <>
                        <Route path="/archives" element={<ArchivesPage />} />
                        <Route path="/communaute" element={<CommunityPage />} />
                        <Route path="/communaute/rejoindre" element={<JoinPage />} />
                        <Route path="/communaute/membres/:id" element={<MemberPage />} />
                        <Route path="/communaute/publication/:id" element={<PostPage />} />
                      </>
                    )}
                    <Route path="/contribuer" element={<ContributePage />} />
                    <Route path="/connexion" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/admin" element={<AdminHomePage />} />
                      <Route path="/admin/contributions" element={<AdminContributionsPage />} />
                      {SHOW_COMMUNITY && <Route path="/admin/communaute" element={<AdminCommunityPage />} />}
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
      </MemberProvider>
    </AuthProvider>
  );
}

export default App;
