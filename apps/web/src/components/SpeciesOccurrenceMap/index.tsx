import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapAction,
  MapFrame,
} from "./styles";
import type { SpeciesOccurrenceMapProps } from "./types";

type MapView = {
  center: [number, number];
  zoom: number;
};

function MapSizeInvalidator({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap();
  const previousView = useRef<MapView | null>(null);

  useEffect(() => {
    const center = map.getCenter();
    const currentView: MapView | null = fullscreen
      ? {
          center: [center.lat, center.lng],
          zoom: map.getZoom(),
        }
      : null;
    const view = fullscreen ? currentView : previousView.current;

    if (fullscreen && view) {
      previousView.current = view;
    }

    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize({ animate: false, pan: false });

      if (fullscreen && view) {
        const zoomForSingleWorld = Math.round(
          Math.log2(map.getSize().x / 256),
        );
        const fullscreenZoom = Math.min(
          map.getMaxZoom(),
          Math.max(map.getZoom(), map.getMinZoom(), zoomForSingleWorld),
        );
        map.setView(view.center, fullscreenZoom, { animate: false });
        return;
      }

      if (!fullscreen && view) {
        map.setView(view.center, view.zoom, { animate: false });
        previousView.current = null;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fullscreen, map]);

  useEffect(() => {
    let frame = 0;
    const invalidateSize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        map.invalidateSize({ animate: false, pan: false });
      });
    };
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(invalidateSize);
    observer?.observe(map.getContainer());
    window.addEventListener("resize", invalidateSize);
    window.visualViewport?.addEventListener("resize", invalidateSize);
    invalidateSize();

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", invalidateSize);
      window.visualViewport?.removeEventListener("resize", invalidateSize);
      window.cancelAnimationFrame(frame);
    };
  }, [map]);

  return null;
}

export function SpeciesOccurrenceMap({
  taxonKey,
  occurrenceCount,
}: SpeciesOccurrenceMapProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    actionRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setFullscreen(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = frameRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) {
        event.preventDefault();
        frameRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [fullscreen]);

  if (occurrenceCount === null || occurrenceCount === 0) {
    return null;
  }

  return (
    <MapFrame
      ref={frameRef}
      $fullscreen={fullscreen}
      role={fullscreen ? "dialog" : undefined}
      aria-modal={fullscreen ? true : undefined}
      aria-label={fullscreen ? "Mapa de registros em tela cheia" : undefined}
      tabIndex={fullscreen ? -1 : undefined}
    >
      <MapAction
        ref={actionRef}
        type="button"
        aria-label={fullscreen ? "Sair da tela cheia" : "Abrir mapa em tela cheia"}
        title={fullscreen ? "Sair da tela cheia" : "Abrir mapa em tela cheia"}
        onClick={() => setFullscreen((current) => !current)}
      >
        {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </MapAction>
      <MapContainer
        center={[0, 0]}
        zoom={1}
        minZoom={1}
        maxZoom={12}
        scrollWheelZoom={fullscreen}
        zoomControl={false}
      >
        <MapSizeInvalidator fullscreen={fullscreen} />
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
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </MapFrame>
  );
}
