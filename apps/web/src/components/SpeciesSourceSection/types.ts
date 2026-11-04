import type { CatalogDataset } from '../../types/species';

export interface SpeciesSourceSectionProps {
  dataset: CatalogDataset | null;
  dataSource: string;
  sourceId: string | null;
  sourceReference: string | null;
}
