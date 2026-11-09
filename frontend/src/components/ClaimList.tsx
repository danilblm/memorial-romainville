import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { Chip, List, ListItem, ListItemText, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Claim } from "../types/common";
import { localize } from "../utils/localize";
import ReliabilityBadge from "./ReliabilityBadge";

// Chaque affirmation s'affiche avec son niveau de fiabilité
const ClaimList = ({ claims }: { claims: Claim[] }) => {
  const { t, i18n } = useTranslation();

  if (claims.length === 0) return null;

  return (
    <List dense disablePadding>
      {claims.map((claim) => (
        <ListItem key={claim._id} disableGutters alignItems="flex-start">
          <ListItemText
            primary={localize(claim.value, i18n.language)}
            secondary={claim.note}
            primaryTypographyProps={{ component: "div" }}
          />
          <Stack direction="row" gap={1} sx={{ ml: 2, flexShrink: 0 }}>
            <ReliabilityBadge level={claim.reliability} />
            {claim.aiAssisted && (
              <Chip icon={<SmartToyOutlinedIcon />} label={t("common.aiAssisted")} size="small" />
            )}
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};

export default ClaimList;
