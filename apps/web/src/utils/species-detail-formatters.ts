import type { CatalogDataset } from '../types/species';

const rankLabels: Record<string, string> = {
  kingdom: 'Reino',
  domain: 'Domínio',
  superkingdom: 'Super-reino',
  subkingdom: 'Sub-reino',
  infrakingdom: 'Infra-reino',
  phylum: 'Filo',
  superphylum: 'Superfilo',
  subphylum: 'Subfilo',
  class: 'Classe',
  superclass: 'Superclasse',
  subclass: 'Subclasse',
  infraclass: 'Infraclasse',
  order: 'Ordem',
  superorder: 'Superordem',
  suborder: 'Subordem',
  infraorder: 'Infraordem',
  family: 'Família',
  superfamily: 'Superfamília',
  subfamily: 'Subfamília',
  tribe: 'Tribo',
  subtribe: 'Subtribo',
  genus: 'Gênero',
  subgenus: 'Subgênero',
  species: 'Espécie',
  subspecies: 'Subespécie',
  variety: 'Variedade',
  form: 'Forma',
};

export function rankLabel(rank: string | null): string {
  if (!rank) return 'Categoria';
  return rankLabels[rank.toLowerCase()] ?? rank.replace(/_/g, ' ');
}

export function displayValue(value: string | boolean | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Não informado no catálogo';
  }
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return value;
}

export function formatLocalDate(
  value: CatalogDataset['issued'] | CatalogDataset['importedAt'] | undefined,
  includeTime = false,
): string {
  if (!value) return 'Não informado no catálogo';

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';

  return new Intl.DateTimeFormat(
    'pt-BR',
    includeTime
      ? { dateStyle: 'short', timeStyle: 'short' }
      : { dateStyle: 'short' },
  ).format(date);
}
