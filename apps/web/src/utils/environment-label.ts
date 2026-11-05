import type { BiodexSelectOption } from '../components/BiodexSelect';
import type { CatalogFacetOption } from '../types/species';

const environmentAliases: Record<string, string> = {
  ocean: 'marine',
  land: 'terrestrial',
  'fresh water': 'freshwater',
  'brackish water': 'brackish',
};

const environmentLabels: Record<string, string> = {
  marine: 'Marinho',
  terrestrial: 'Terrestre',
  freshwater: 'Água doce',
  brackish: 'Água salobra',
  aquatic: 'Aquático',
  aerial: 'Aéreo',
  subterranean: 'Subterrâneo',
  cavernicolous: 'Cavernícola',
  limnetic: 'Límnico',
  benthic: 'Bentônico',
  pelagic: 'Pelágico',
  coastal: 'Costeiro',
  'deep sea': 'Mar profundo',
};

const excludedEnvironments = new Set([
  'unknown',
  'unspecified',
  'not specified',
  'not applicable',
  'multiple',
]);

function normalizeEnvironment(value: string): string {
  const normalized = value.trim().toLocaleLowerCase('en');
  return environmentAliases[normalized] ?? normalized;
}

export function getEnvironmentValues(value: string): string[] {
  return value
    .split(/[,;/|&+]|\s+(?:and|or)\s+/i)
    .map(normalizeEnvironment)
    .filter((part) => part && !excludedEnvironments.has(part));
}

export function getEnvironmentLabel(value: string): string {
  const normalized = normalizeEnvironment(value);
  return environmentLabels[normalized] ?? normalized;
}

export function getEnvironmentOptions(options: CatalogFacetOption[]): BiodexSelectOption[] {
  const environments = new Map<string, BiodexSelectOption>();
  for (const option of options) {
    for (const value of getEnvironmentValues(option.value)) {
      if (!environments.has(value)) {
        environments.set(value, { value, label: getEnvironmentLabel(value) });
      }
    }
  }
  return [...environments.values()].sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));
}
