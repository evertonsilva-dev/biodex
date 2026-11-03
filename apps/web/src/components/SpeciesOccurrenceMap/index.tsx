import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapFrame } from './styles';
import type { SpeciesOccurrenceMapProps } from './types';

export function SpeciesOccurrenceMap({
  taxonKey,
  occurrenceCount,
  onUnavailable,
}: SpeciesOccurrenceMapProps) {
  const [tileError, setTileError] = useState(false);

  if (tileError) {
    return null;
  }

  if (occurrenceCount === null) {
    return null;
  }

  if (occurrenceCount === 0) {
    return null;
  }

  return (
    <MapFrame>
      <MapContainer
        center={[0, 0]}
        zoom={1}
        minZoom={1}
        maxZoom={12}
        scrollWheelZoom={false}
        zoomControl={false}
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.gbif.org/">GBIF</a> &copy; OpenStreetMap contributors'
          url="https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-light"
          maxZoom={19}
        />
        <TileLayer
          key={taxonKey}
          pane="overlayPane"
          attribution='Occurrence data &copy; <a href="https://www.gbif.org/">GBIF</a>'
          url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?taxonKey=${taxonKey}&style=purpleYellow.point`}
          opacity={0.9}
          maxNativeZoom={12}
          maxZoom={12}
          eventHandlers={{
            tileerror: () => {
              setTileError(true);
              onUnavailable();
            },
          }}
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </MapFrame>
  );
}
