import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import {
  Box,
  Button,
  Drawer,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "../context/Accessibility/AccessibilityContext";

const AccessibilityPanel = () => {
  const { t } = useTranslation();
  const { settings, update, reset } = useAccessibility();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={t("a11y.open")}>
        <IconButton color="inherit" onClick={() => setOpen(true)} aria-label={t("a11y.open")}>
          <AccessibilityNewIcon />
        </IconButton>
      </Tooltip>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 300, p: 3 }} role="dialog" aria-labelledby="a11y-title">
          <Typography id="a11y-title" variant="h6" component="h2" gutterBottom>
            {t("a11y.title")}
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography id="font-scale-label">{t("a11y.textSize")}</Typography>
              <Slider
                aria-labelledby="font-scale-label"
                min={0.9}
                max={1.6}
                step={0.1}
                marks
                value={settings.fontScale}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)} %`}
                onChange={(_, value) => update({ fontScale: value as number })}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={(event) => update({ highContrast: event.target.checked })}
                />
              }
              label={t("a11y.contrast")}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.dyslexicFont}
                  onChange={(event) => update({ dyslexicFont: event.target.checked })}
                />
              }
              label={t("a11y.dyslexic")}
            />

            <Button variant="outlined" onClick={reset}>
              {t("a11y.reset")}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default AccessibilityPanel;
