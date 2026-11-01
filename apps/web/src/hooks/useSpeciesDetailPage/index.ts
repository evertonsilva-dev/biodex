import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSpeciesDetails } from '../../api/species';
import { redirectToError } from '../../utils/errors';
import type { SpeciesDetailPageState } from './types';

export function useSpeciesDetailPage(externalId: string): SpeciesDetailPageState {
  const speciesQuery = useQuery({
    queryKey: ['species-detail', externalId],
    queryFn: ({ signal }) => getSpeciesDetails(externalId, signal),
  });

  useEffect(() => {
    if (speciesQuery.isError) redirectToError('species');
  }, [speciesQuery.isError]);

  return {
    species: speciesQuery.data?.data,
    isLoading: speciesQuery.isPending,
    hasError: speciesQuery.isError,
  };
}
