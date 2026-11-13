import { useQuery } from '@tanstack/react-query';
import { getSpeciesArticles } from '../../api/species-articles';

export function useSpeciesArticles(externalId: string) {
  return useQuery({
    queryKey: ['species-articles', externalId],
    queryFn: ({ signal }) => getSpeciesArticles(externalId, signal),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 30 * 24 * 60 * 60 * 1000,
    retry: false,
  });
}
