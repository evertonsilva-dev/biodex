import { apiGet } from "./client";
import type { SpeciesEnrichmentResponse } from "../types/species";

export function getSpeciesEnrichment(
  externalId: string,
  signal?: AbortSignal,
) {
  return apiGet<SpeciesEnrichmentResponse>(
    `/catalog/species/${encodeURIComponent(externalId)}/enrichment`,
    signal,
  );
}
