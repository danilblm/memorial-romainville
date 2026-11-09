import { Link, List, ListItem, ListItemText } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Source } from "../types/Source";
import { localize } from "../utils/localize";

const SourceList = ({ sources }: { sources?: Source[] }) => {
  const { i18n } = useTranslation();

  if (!sources || sources.length === 0) return null;

  return (
    <List dense disablePadding>
      {sources.map((source) => {
        const title = localize(source.title, i18n.language);
        const details = [source.holder, source.reference, source.author].filter(Boolean).join(" · ");

        return (
          <ListItem key={source._id} disableGutters>
            <ListItemText
              primary={
                source.url ? (
                  <Link href={source.url} target="_blank" rel="noopener noreferrer">
                    {title}
                  </Link>
                ) : (
                  title
                )
              }
              secondary={details || undefined}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default SourceList;
