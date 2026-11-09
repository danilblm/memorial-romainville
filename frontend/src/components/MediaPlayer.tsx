import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TestimonyMedium } from "../types/Testimony";
import { mediaUrl } from "../utils/mediaUrl";

interface MediaPlayerProps {
  medium: TestimonyMedium;
  url?: string;
  transcript?: string;
}

// Lecteur audio/vidéo natif (lecture, pause, reprise au clavier) + transcription
const MediaPlayer = ({ medium, url, transcript }: MediaPlayerProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ my: 2 }}>
      {url && medium === "audio" && (
        <audio controls preload="none" src={mediaUrl(url)} style={{ width: "100%" }} />
      )}
      {url && medium === "video" && (
        <video controls preload="none" src={mediaUrl(url)} style={{ width: "100%", maxHeight: 480 }} />
      )}

      {transcript &&
        (medium === "ecrit" ? (
          <Typography sx={{ whiteSpace: "pre-line" }}>{transcript}</Typography>
        ) : (
          <Accordion disableGutters sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("testimony.transcript")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ whiteSpace: "pre-line" }}>{transcript}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
    </Box>
  );
};

export default MediaPlayer;
