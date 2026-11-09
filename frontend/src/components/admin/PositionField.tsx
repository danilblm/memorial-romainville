import { Box, Stack, TextField, Typography } from "@mui/material";
import { MouseEvent } from "react";
import { usePlan } from "../../hooks/usePlan";

interface Position {
  x?: number | null;
  y?: number | null;
}

interface Props {
  label: string;
  value?: Position | null;
  onChange: (value: Position) => void;
}

// Placer un lieu sur le plan du fort en cliquant dessus (le plan choisi dans « Réglages du site »)
const PositionField = ({ label, value, onChange }: Props) => {
  const plan = usePlan();
  const current = value ?? {};
  const placed = current.x != null && current.y != null;

  const place = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChange({
      x: Math.round(((event.clientX - rect.left) / rect.width) * plan.width),
      y: Math.round(((event.clientY - rect.top) / rect.height) * plan.height),
    });
  };

  const setNumber = (axis: "x" | "y", text: string) =>
    onChange({ ...current, [axis]: text === "" ? null : Number(text) });

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" component="p">
        {label} – cliquez sur le plan pour placer le lieu
        {plan.provisional && " (plan provisoire)"}
      </Typography>
      <Box
        onClick={place}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 600,
          aspectRatio: `${plan.width} / ${plan.height}`,
          backgroundImage: `url(${plan.url})`,
          backgroundSize: "100% 100%",
          border: 1,
          borderColor: "divider",
          cursor: "crosshair",
        }}
      >
        {placed && (
          <Box
            sx={{
              position: "absolute",
              left: `${((current.x ?? 0) / plan.width) * 100}%`,
              top: `${((current.y ?? 0) / plan.height) * 100}%`,
              width: 20,
              height: 20,
              ml: "-10px",
              mt: "-10px",
              borderRadius: "50%",
              bgcolor: "secondary.main",
              border: "2px solid white",
              pointerEvents: "none",
            }}
          />
        )}
      </Box>
      <Stack direction="row" spacing={2}>
        <TextField
          type="number"
          label={`x (0–${plan.width})`}
          size="small"
          value={current.x ?? ""}
          onChange={(event) => setNumber("x", event.target.value)}
        />
        <TextField
          type="number"
          label={`y (0–${plan.height})`}
          size="small"
          value={current.y ?? ""}
          onChange={(event) => setNumber("y", event.target.value)}
        />
      </Stack>
    </Stack>
  );
};

export default PositionField;
