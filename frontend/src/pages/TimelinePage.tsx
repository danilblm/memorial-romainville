import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import {
  Button,
  ButtonBase,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import ClaimList from "../components/ClaimList";
import PageState from "../components/PageState";
import SourceList from "../components/SourceList";
import { useApi } from "../hooks/useApi";
import { EventItem } from "../types/Event";
import { formatFuzzyDate, localize } from "../utils/localize";

const TimelinePage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [period, setPeriod] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const { data: periods } = useApi<string[]>("/events/periods");
  const { data: events, loading, error } = useApi<EventItem[]>(
    period ? `/events?period=${encodeURIComponent(period)}` : "/events"
  );

  const current = events && selected !== null ? events[selected] : null;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t("timeline.title")}
      </Typography>

      <FormControl sx={{ minWidth: 220, mb: 3 }} size="small">
        <InputLabel id="period-label" shrink>
          {t("timeline.period")}
        </InputLabel>
        <Select
          labelId="period-label"
          label={t("timeline.period")}
          displayEmpty
          notched
          value={period}
          onChange={(event) => {
            setPeriod(event.target.value);
            setSelected(null);
          }}
        >
          <MenuItem value="">{t("timeline.allPeriods")}</MenuItem>
          {periods?.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <PageState loading={loading} error={error} />
      {events && events.length === 0 && <Typography>{t("timeline.empty")}</Typography>}

      {events && events.length > 0 && (
        <Timeline position="alternate">
          {events.map((item, index) => (
            <TimelineItem key={item._id}>
              <TimelineOppositeContent color="text.secondary">
                {formatFuzzyDate(item.start, lang)}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="secondary" />
                {index < events.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <ButtonBase
                  onClick={() => setSelected(index)}
                  sx={{ textAlign: "inherit", borderRadius: 1, p: 0.5 }}
                >
                  <Typography fontWeight={600}>{localize(item.title, lang)}</Typography>
                </ButtonBase>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}

      <Dialog open={Boolean(current)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {current && events && selected !== null && (
          <>
            <DialogTitle>
              {localize(current.title, lang)}
              <Typography color="text.secondary">{formatFuzzyDate(current.start, lang)}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Typography sx={{ whiteSpace: "pre-line" }}>{localize(current.description, lang)}</Typography>
              {current.claims && <ClaimList claims={current.claims} />}

              <Stack direction="row" gap={1} flexWrap="wrap" sx={{ my: 2 }}>
                {current.places?.map((place) => (
                  <Chip key={place._id} label={localize(place.name, lang)} component={RouterLink} to={`/lieux/${place.code}`} clickable />
                ))}
                {current.persons?.map((person) => (
                  <Chip key={person._id} label={person.displayName} component={RouterLink} to={`/personnes/${person._id}`} clickable variant="outlined" />
                ))}
              </Stack>

              <SourceList sources={current.sources} />
            </DialogContent>
            <DialogActions>
              <Button disabled={selected === 0} onClick={() => setSelected(selected - 1)}>
                {t("timeline.previous")}
              </Button>
              <Button disabled={selected === events.length - 1} onClick={() => setSelected(selected + 1)}>
                {t("timeline.next")}
              </Button>
              <Button onClick={() => setSelected(null)}>{t("timeline.close")}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default TimelinePage;
