export interface Kingdom {
  id: string | number;
  name: string;
  slug: string;
  color: string;
  isVirus?: boolean;
  speciesCount?: number;
}

export interface TaxonomyEntry {
  rank: string;
  name: string;
}

export interface Taxon {
  id: string | number;
  name: string;
  scientificName?: string | null;
  rank: string;
  parent?: Taxon | null;
  taxonomy?: TaxonomyEntry[];
}

export interface SpeciesImage {
  url: string;
  alternativeText?: string | null;
}

export interface Species {
  id: string | number;
  documentId: string;
  commonName: string;
  scientificName: string;
  description?: string | null;
  habitat?: string | null;
  extinct?: boolean;
  conservationStatus?: string | null;
  kingdom?: Kingdom | null;
  taxon?: Taxon | null;
  image?: SpeciesImage | null;
}

export interface SpeciesLineageEntry {
  id: string;
  parentId: string | null;
  name: string | null;
  authorship: string | null;
  rank: string | null;
  status: string | null;
  extinct: boolean | null;
}

export interface VernacularName {
  name: string | null;
  transliteration: string | null;
  language: string | null;
  preferred: boolean | null;
  country: string | null;
  area: string | null;
  remarks: string | null;
  sourceId: string | null;
}

export interface RelatedTaxonName {
  id: string;
  externalId: string;
  sourceId: string | null;
  scientificName: string | null;
  authorship: string | null;
  rank: string | null;
  status: string | null;
  relationType: string | null;
  direction: string;
  referenceId: string | null;
  page: string | null;
  remarks: string | null;
  relationSourceId: string | null;
}

export interface CatalogDataset {
  datasetId: string;
  title: string;
  doi: string | null;
  version: string | null;
  issued: string | null;
  importedAt: string;
}

export interface SpeciesDetail extends Omit<Species, "extinct"> {
  authorship: string | null;
  status: string | null;
  sourceId: string | null;
  dataSource: string;
  sourceReference: string | null;
  parentExternalId: string | null;
  taxGroup: string | null;
  isMerged: boolean | null;
  extinct: boolean | null;
  lineage: SpeciesLineageEntry[];
  vernacularNames: VernacularName[];
  relatedNames: RelatedTaxonName[];
  dataset: CatalogDataset | null;
}

export interface SpeciesEnrichment {
  scientificName: string;
  inaturalist: {
    taxonUrl: string;
    commonName: string | null;
    summary: string | null;
    summaryUrl: string | null;
    observations: number | null;
    conservation: {
      status: string;
      label: string;
      authority: string | null;
      url: string | null;
    } | null;
  } | null;
  gbif: {
    taxonKey: number;
    taxonUrl: string;
    occurrenceCount: number | null;
    countries: Array<{ code: string; records: number }>;
    sounds: Array<{
      url: string;
      source: string;
      scientificName: string | null;
      creator: string | null;
      license: string;
      referenceUrl: string | null;
      gbifRecordUrl: string;
    }>;
    sourceErrors: string[];
  } | null;
  pbdb: {
    taxonUrl: string;
    occurrenceSampleCount: number;
    intervals: string[];
    oldestAgeMa: number | null;
    youngestAgeMa: number | null;
    localities: Array<{ label: string; records: number }>;
    references: string[];
  } | null;
  viralzoneUrl: string | null;
  errors: string[];
}

export interface SpeciesEnrichmentResponse {
  data: SpeciesEnrichment;
}

export interface SpeciesDetailResponse {
  data: SpeciesDetail;
}

export interface SpeciesResponse {
  data: Species[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface KingdomsResponse {
  data: Kingdom[];
}

export type TaxonomyFacetField =
  | "kingdom"
  | "phylum"
  | "class"
  | "order"
  | "family"
  | "genus";
export type CatalogFacetField = TaxonomyFacetField | "habitat" | "source";

export interface CatalogFacetOption {
  value: string;
  label: string;
}

export interface CatalogFacetResponse {
  data: CatalogFacetOption[];
}

export interface SearchSuggestion {
  id: string;
  label: string;
  scientificName: string;
  kind: "common" | "scientific" | "synonym";
  kingdomColor: string | null;
}

export interface SearchSuggestionsResponse {
  data: SearchSuggestion[];
}
