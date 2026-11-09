import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth/AuthContext";
import AccessibilityPanel from "./AccessibilityPanel";
import LanguageSwitcher from "./LanguageSwitcher";

const LINKS = [
  { to: "/", key: "nav.home" },
  { to: "/frise", key: "nav.timeline" },
  { to: "/carte", key: "nav.map" },
  { to: "/contribuer", key: "nav.contribute" },
  { to: "/nos-sources", key: "nav.sources" },
];

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: "inherit", textDecoration: "none", mr: 2 }}
        >
          {t("site.title")}
        </Typography>

        <Box component="nav" aria-label="Navigation principale" sx={{ flexGrow: 1 }}>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {LINKS.map((link) => (
              <Button key={link.to} component={RouterLink} to={link.to} color="inherit">
                {t(link.key)}
              </Button>
            ))}
            {isAuthenticated && (
              <Button component={RouterLink} to="/admin" color="inherit">
                {t("nav.admin")}
              </Button>
            )}
          </Stack>
        </Box>

        <Stack direction="row" alignItems="center" gap={1}>
          <LanguageSwitcher />
          <AccessibilityPanel />
          {isAuthenticated ? (
            <Button
              color="inherit"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              {t("nav.logout")}
            </Button>
          ) : (
            <Button component={RouterLink} to="/connexion" color="inherit" size="small">
              {t("nav.login")}
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
