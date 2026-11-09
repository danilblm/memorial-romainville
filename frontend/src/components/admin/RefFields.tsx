import { Autocomplete, TextField } from "@mui/material";
import { EntityName } from "../../constants/adminEntities";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";

interface Option {
  _id: string;
  label: string;
  status?: string;
}

const useOptions = (entity: EntityName) => {
  const { token } = useAuth();
  const { data } = useApi<Option[]>(`/admin/${entity}/options`, token);
  return data ?? [];
};

const optionLabel = (option: Option) =>
  `${option.label || "(sans titre)"}${option.status && option.status !== "valide" ? " – non validée" : ""}`;

interface MultiProps {
  entity: EntityName;
  label: string;
  value?: string[] | null;
  onChange: (value: string[]) => void;
  help?: string;
}

// Lien vers plusieurs fiches (ex. les sources d'une femme)
export const RefsField = ({ entity, label, value, onChange, help }: MultiProps) => {
  const options = useOptions(entity);
  const byId = new Map(options.map((option) => [option._id, option]));
  const selected = (value ?? []).map((id) => byId.get(id) ?? { _id: id, label: "…" });

  return (
    <Autocomplete
      multiple
      options={options}
      value={selected}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(a, b) => a._id === b._id}
      onChange={(_, next) => onChange(next.map((option) => option._id))}
      renderInput={(params) => <TextField {...params} label={label} helperText={help} />}
    />
  );
};

interface SingleProps {
  entity: EntityName;
  label: string;
  value?: string | null;
  onChange: (value: string | null) => void;
  help?: string;
}

// Lien vers une seule fiche (ex. la fiche du témoin)
export const RefField = ({ entity, label, value, onChange, help }: SingleProps) => {
  const options = useOptions(entity);
  const selected = value ? options.find((option) => option._id === value) ?? { _id: value, label: "…" } : null;

  return (
    <Autocomplete
      options={options}
      value={selected}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(a, b) => a._id === b._id}
      onChange={(_, next) => onChange(next?._id ?? null)}
      renderInput={(params) => <TextField {...params} label={label} helperText={help} />}
    />
  );
};
