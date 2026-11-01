export interface CatalogFilters {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  extinct: string;
}

export interface CatalogUrlState {
  search: string;
  filters: CatalogFilters;
  page: number;
}
