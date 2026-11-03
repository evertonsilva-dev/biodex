export interface SpeciesOccurrenceMapProps {
  taxonKey: number;
  occurrenceCount: number | null;
  onUnavailable(): void;
}
