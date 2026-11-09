import { FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FieldConfig } from "../../constants/adminEntities";
import { FuzzyDate, LocalizedText, Publication } from "../../types/common";
import ClaimsEditor, { ClaimValue } from "./ClaimsEditor";
import FuzzyDateField from "./FuzzyDateField";
import GeoPositionField, { GeoValue } from "./GeoPositionField";
import { LocalizedListEditor, PhotosEditor, PhotoValue, TagsField } from "./ListEditors";
import LocalizedTextField from "./LocalizedTextField";
import MediaField from "./MediaField";
import PositionField from "./PositionField";
import PublicationField from "./PublicationField";
import { RefField, RefsField } from "./RefFields";

const STATUSES = ["propose", "en_verification", "valide", "refuse"];

interface Props {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

// Choisit l'éditeur adapté au type du champ
const FieldRenderer = ({ field, value, onChange }: Props) => {
  const { t } = useTranslation();
  const { label, required, help } = field;

  switch (field.type) {
    case "text":
      return (
        <TextField
          fullWidth
          label={label}
          required={required}
          helperText={help}
          value={(value as string | undefined) ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "localized":
    case "localizedMultiline":
      return (
        <LocalizedTextField
          label={label}
          required={required}
          help={help}
          multiline={field.type === "localizedMultiline"}
          value={value as LocalizedText | undefined}
          onChange={onChange}
        />
      );

    case "fuzzyDate":
      return (
        <FuzzyDateField
          label={label}
          required={required}
          help={help}
          value={value as FuzzyDate | undefined}
          onChange={onChange}
        />
      );

    case "select":
    case "status":
      return (
        <TextField
          select
          fullWidth
          label={label}
          required={required}
          helperText={help}
          value={(value as string | undefined) ?? ""}
          onChange={(event) => onChange(event.target.value)}
        >
          {(field.type === "status"
            ? STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) }))
            : field.options ?? []
          ).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );

    case "boolean":
      return (
        <FormControlLabel
          control={<Switch checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />}
          label={label}
        />
      );

    case "tags":
      return <TagsField label={label} help={help} value={value as string[] | undefined} onChange={onChange} />;

    case "refs":
      return field.refEntity ? (
        <RefsField
          entity={field.refEntity}
          label={label}
          help={help}
          value={value as string[] | undefined}
          onChange={onChange}
        />
      ) : null;

    case "ref":
      return field.refEntity ? (
        <RefField
          entity={field.refEntity}
          label={label}
          help={help}
          value={value as string | undefined}
          onChange={onChange}
        />
      ) : null;

    case "claims":
      return <ClaimsEditor label={label} help={help} value={value as ClaimValue[] | undefined} onChange={onChange} />;

    case "localizedList":
      return <LocalizedListEditor label={label} value={value as LocalizedText[] | undefined} onChange={onChange} />;

    case "publication":
      return <PublicationField label={label} value={value as Publication | undefined} onChange={onChange} />;

    case "position":
      return <PositionField label={label} value={value as { x?: number; y?: number } | undefined} onChange={onChange} />;

    case "geo":
      return <GeoPositionField label={label} value={value as GeoValue | undefined} onChange={onChange} />;

    case "photos":
      return <PhotosEditor label={label} value={value as PhotoValue[] | undefined} onChange={onChange} />;

    case "media":
      return (
        <MediaField
          label={label}
          help={help}
          accept={field.accept}
          value={value as string | undefined}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
};

export default FieldRenderer;
