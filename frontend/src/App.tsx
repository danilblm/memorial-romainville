import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AccessibilityProvider from "./context/Accessibility/AccessibilityProvider";
import AuthProvider from "./context/Auth/AuthProvider";
import AdminContributionsPage from "./pages/admin/AdminContributionsPage";
import AdminEditPage from "./pages/admin/AdminEditPage";
import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminListPage from "./pages/admin/AdminListPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import MyAccountPage from "./pages/admin/MyAccountPage";
import ContributePage from "./pages/ContributePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import NotFoundPage from "./pages/NotFoundPage";
import PersonPage from "./pages/PersonPage";
import PlacePage from "./pages/PlacePage";
import SourcesPage from "./pages/SourcesPage";
import TestimonyPage from "./pages/TestimonyPage";
import TimelinePage from "./pages/TimelinePage";

function App() {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <a href="#contenu" className="skip-link">
            {t("nav.skip")}
          </a>
          <Navbar />
          <Box component="main" id="contenu" tabIndex={-1}>
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
                <Route path="/admin/:entity" element={<AdminListPage />} />
                <Route path="/admin/:entity/:id" element={<AdminEditPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
