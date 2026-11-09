import { Box, Stack, TextField, Typography } from "@mui/material";
import { MouseEvent } from "react";
import { PLAN_HEIGHT, PLAN_URL, PLAN_WIDTH } from "../../constants/plan";

interface Position {
  x?: number | null;
  y?: number | null;
}

interface Props {
  label: string;
  value?: Position | null;
  onChange: (value: Position) => void;
}

// Placer un lieu sur le plan du fort en cliquant dessus
const PositionField = ({ label, value, onChange }: Props) => {
  const current = value ?? {};
  const placed = current.x != null && current.y != null;

  const place = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChange({
      x: Math.round(((event.clientX - rect.left) / rect.width) * PLAN_WIDTH),
      y: Math.round(((event.clientY - rect.top) / rect.height) * PLAN_HEIGHT),
    });
  };

  const setNumber = (axis: "x" | "y", text: string) =>
    onChange({ ...current, [axis]: text === "" ? null : Number(text) });

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" component="p">
        {label} – cliquez sur le plan pour placer le lieu
      </Typography>
      <Box
        onClick={place}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 600,
          aspectRatio: `${PLAN_WIDTH} / ${PLAN_HEIGHT}`,
          backgroundImage: `url(${PLAN_URL})`,
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
              left: `${((current.x ?? 0) / PLAN_WIDTH) * 100}%`,
              top: `${((current.y ?? 0) / PLAN_HEIGHT) * 100}%`,
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
          label="x (0–1000)"
          size="small"
          value={current.x ?? ""}
          onChange={(event) => setNumber("x", event.target.value)}
        />
        <TextField
          type="number"
          label="y (0–700)"
          size="small"
          value={current.y ?? ""}
          onChange={(event) => setNumber("y", event.target.value)}
        />
      </Stack>
    </Stack>
  );
};

export default PositionField;
