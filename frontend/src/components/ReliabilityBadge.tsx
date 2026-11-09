import BlockIcon from "@mui/icons-material/Block";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ForumIcon from "@mui/icons-material/Forum";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { Chip, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { Reliability } from "../types/common";

// Icône + mot : le niveau ne repose jamais sur la seule couleur (daltonisme)
const ICONS: Record<Reliability, ReactElement> = {
  documentee: <DescriptionIcon />,
  recoupee: <FactCheckIcon />,
  temoignee: <RecordVoiceOverIcon />,
  transmise: <ForumIcon />,
  incertaine: <HelpOutlineIcon />,
  inconnue: <BlockIcon />,
};

const ReliabilityBadge = ({ level }: { level: Reliability }) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t(`reliability.${level}.desc`)}>
      <Chip
        icon={ICONS[level]}
        label={t(`reliability.${level}.label`)}
        size="small"
        variant="outlined"
        component={RouterLink}
        to="/nos-sources#fiabilite"
        clickable
      />
    </Tooltip>
  );
};

export default ReliabilityBadge;
