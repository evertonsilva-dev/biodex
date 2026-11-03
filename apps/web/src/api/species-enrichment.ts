import { apiGet } from "./client";
import type { SpeciesEnrichmentResponse } from "../types/species";

export function getSpeciesEnrichment(
  externalId: string,
  signal?: AbortSignal,
  forceRefresh = false,
) {
  return apiGet<SpeciesEnrichmentResponse>(
    `/catalog/species/${encodeURIComponent(externalId)}/enrichment${forceRefresh ? '?refresh=true' : ''}`,
    signal,
  );
}
