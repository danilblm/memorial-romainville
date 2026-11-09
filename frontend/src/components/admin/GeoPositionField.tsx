import { Button, Stack, TextField, Typography } from "@mui/material";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { FORT_CENTER, FORT_ZOOM, SATELLITE_ATTRIBUTION, SATELLITE_TILES } from "../../constants/geo";

export interface GeoValue {
  lat?: number | null;
  lng?: number | null;
}

interface Props {
  label: string;
  value?: GeoValue | null;
  onChange: (value: GeoValue) => void;
}

const round = (value: number) => Math.round(value * 1e6) / 1e6;

const ClickToPlace = ({ onPick }: { onPick: (value: GeoValue) => void }) => {
  useMapEvents({ click: (event) => onPick({ lat: round(event.latlng.lat), lng: round(event.latlng.lng) }) });
  return null;
};

// Placer un lieu sur la vue satellite en cliquant dessus
const GeoPositionField = ({ label, value, onChange }: Props) => {
  const current = value ?? {};
  const placed = current.lat != null && current.lng != null;

  const setNumber = (axis: "lat" | "lng", text: string) =>
    onChange({ ...current, [axis]: text === "" ? null : Number(text) });

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" component="p">
        {label} – cliquez sur l'image satellite pour placer le lieu
      </Typography>
      <div style={{ height: 360, maxWidth: 600, borderRadius: 12, overflow: "hidden" }}>
        <MapContainer
          center={placed ? [current.lat as number, current.lng as number] : FORT_CENTER}
          zoom={placed ? 18 : FORT_ZOOM}
          maxZoom={19}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
        >
          <TileLayer url={SATELLITE_TILES} attribution={SATELLITE_ATTRIBUTION} maxZoom={19} />
          <ClickToPlace onPick={onChange} />
          {placed && (
            <CircleMarker
              center={[current.lat as number, current.lng as number]}
              radius={10}
              pathOptions={{ color: "#ffffff", fillColor: "#9a3a22", fillOpacity: 1, weight: 3 }}
            />
          )}
        </MapContainer>
      </div>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          type="number"
          label="Latitude"
          size="small"
          value={current.lat ?? ""}
          onChange={(event) => setNumber("lat", event.target.value)}
        />
        <TextField
          type="number"
          label="Longitude"
          size="small"
          value={current.lng ?? ""}
          onChange={(event) => setNumber("lng", event.target.value)}
        />
        {placed && (
          <Button color="error" onClick={() => onChange({ lat: null, lng: null })}>
            Retirer
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default GeoPositionField;
