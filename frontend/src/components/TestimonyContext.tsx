import { Card, CardContent, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Testimony } from "../types/Testimony";
import { formatFuzzyDate, localize } from "../utils/localize";

// Cartouche affiché AVANT chaque témoignage : qui parle, pour qui, depuis quand, par quel chemin
const TestimonyContext = ({ testimony }: { testimony: Testimony }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const path = [
    testimony.collectedBy && `${t("testimony.collectedBy")} : ${testimony.collectedBy}`,
    testimony.transformations && `${t("testimony.transformations")} : ${testimony.transformations}`,
    testimony.originalLocation && `${t("testimony.originalLocation")} : ${testimony.originalLocation}`,
  ].filter(Boolean);

  const rows = [
    {
      label: t("testimony.who"),
      value: `${testimony.witnessName} (${testimony.witnessRelation}) – ${
        testimony.livedEvents ? t("testimony.lived") : t("testimony.notLived")
      }`,
    },
    { label: t("testimony.forWhom"), value: localize(testimony.audience, lang) || "—" },
    { label: t("testimony.when"), value: formatFuzzyDate(testimony.recordedAt, lang) },
    { label: t("testimony.path"), value: path.length ? path.join(" · ") : "—" },
  ];

  return (
    <Card variant="outlined" component="section" aria-labelledby="testimony-context-title" sx={{ mb: 3 }}>
      <CardContent>
        <Typography id="testimony-context-title" variant="h6" component="h2" gutterBottom>
          {t("testimony.contextTitle")}
        </Typography>
        <Grid container spacing={2}>
          {rows.map((row) => (
            <Grid item xs={12} sm={6} key={row.label}>
              <Typography variant="subtitle2" component="h3">
                {row.label}
              </Typography>
              <Typography>{row.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TestimonyContext;
