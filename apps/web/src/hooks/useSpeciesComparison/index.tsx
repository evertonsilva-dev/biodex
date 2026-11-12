import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSpeciesByIds } from '../../api/species';

const COMPARISON_QUERY_PARAM = 'speciesIds';
export const MIN_COMPARISON_SPECIES = 2;
export const MAX_COMPARISON_SPECIES = 3;

interface SpeciesComparisonContextValue {
  selectedIds: string[];
  notice: string;
  toggleSpecies(id: string): void;
  removeSpecies(id: string): void;
  clearSelection(): void;
}

const SpeciesComparisonContext = createContext<SpeciesComparisonContextValue | null>(null);

function normalizeIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
    .slice(0, MAX_COMPARISON_SPECIES);
}

function readSelectedIds(): string[] {
  const params = new URLSearchParams(window.location.search);
  return normalizeIds(params.getAll(COMPARISON_QUERY_PARAM));
}

function writeSelectedIds(ids: string[]): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(COMPARISON_QUERY_PARAM);
  for (const id of normalizeIds(ids)) {
    url.searchParams.append(COMPARISON_QUERY_PARAM, id);
  }
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(window.history.state, '', nextUrl);
  }
}

export function getSpeciesComparisonHref(ids: string[]): string {
  const params = new URLSearchParams();
  for (const id of normalizeIds(ids)) {
    params.append(COMPARISON_QUERY_PARAM, id);
  }
  const search = params.toString();
  return search ? `/compare?${search}` : '/compare';
}

export function SpeciesComparisonProvider({ children }: PropsWithChildren) {
  const [selectedIds, setSelectedIds] = useState<string[]>(readSelectedIds);
  const selectedIdsRef = useRef(selectedIds);
  const [notice, setNotice] = useState('');

  const commitSelection = useCallback((ids: string[]) => {
    const nextIds = normalizeIds(ids);
    selectedIdsRef.current = nextIds;
    setSelectedIds(nextIds);
    setNotice('');
    writeSelectedIds(nextIds);
  }, []);

  const toggleSpecies = useCallback((id: string) => {
    const normalizedId = id.trim();
    if (!normalizedId) return;

    const currentIds = selectedIdsRef.current;
    if (currentIds.includes(normalizedId)) {
      commitSelection(currentIds.filter((currentId) => currentId !== normalizedId));
      return;
    }

    if (currentIds.length >= MAX_COMPARISON_SPECIES) {
      setNotice(`Você pode comparar até ${MAX_COMPARISON_SPECIES} espécies. Remova uma para adicionar outra.`);
      return;
    }

    commitSelection([...currentIds, normalizedId]);
  }, [commitSelection]);

  const removeSpecies = useCallback((id: string) => {
    commitSelection(selectedIdsRef.current.filter((currentId) => currentId !== id));
  }, [commitSelection]);

  const clearSelection = useCallback(() => {
    commitSelection([]);
  }, [commitSelection]);

  useEffect(() => {
    const syncWithLocation = () => {
      const nextIds = readSelectedIds();
      selectedIdsRef.current = nextIds;
      setSelectedIds(nextIds);
      setNotice('');
      writeSelectedIds(nextIds);
    };

    writeSelectedIds(selectedIdsRef.current);
    window.addEventListener('popstate', syncWithLocation);
    return () => window.removeEventListener('popstate', syncWithLocation);
  }, []);

  const value = useMemo(() => ({
    selectedIds,
    notice,
    toggleSpecies,
    removeSpecies,
    clearSelection,
  }), [selectedIds, notice, toggleSpecies, removeSpecies, clearSelection]);

  return (
    <SpeciesComparisonContext.Provider value={value}>
      {children}
    </SpeciesComparisonContext.Provider>
  );
}

export function useSpeciesComparison(): SpeciesComparisonContextValue {
  const context = useContext(SpeciesComparisonContext);
  if (!context) {
    throw new Error('useSpeciesComparison must be used within SpeciesComparisonProvider.');
  }
  return context;
}

export function useSpeciesComparisonSpecies(ids: string[]) {
  const normalizedIds = normalizeIds(ids);
  return useQuery({
    queryKey: ['species-comparison', normalizedIds],
    queryFn: ({ signal }) => getSpeciesByIds(normalizedIds, signal),
    enabled: normalizedIds.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}
