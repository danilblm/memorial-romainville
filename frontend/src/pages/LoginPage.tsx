import { Alert, Box, Button, Container, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiSend } from "../api/client";
import { useAuth, UserRole } from "../context/Auth/AuthContext";

interface LoginResponse {
  token: string;
  name: string;
  role: UserRole;
}

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const result = await apiSend<LoginResponse>("/user/login", "POST", {
        email: data.get("email"),
        password: data.get("password"),
      });
      login(result.name, result.token, result.role);
      navigate("/admin");
    } catch {
      setError(true);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("login.title")}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t("login.error")}</Alert>}
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          <TextField name="email" type="email" label={t("login.email")} autoComplete="username" required />
          <TextField name="password" type="password" label={t("login.password")} autoComplete="current-password" required />
          <Button type="submit" variant="contained">
            {t("login.submit")}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default LoginPage;
