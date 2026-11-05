import { useQuery } from '@tanstack/react-query';
import { getEditorialCollection } from '../../api/editorial-collections';

export function useEditorialCollection(slug: string | null) {
  return useQuery({
    queryKey: ['editorial-collection', slug],
    queryFn: ({ signal }) => {
      if (!slug) throw new Error('O slug da coleção é obrigatório.');
      return getEditorialCollection(slug, signal);
    },
    enabled: !!slug,
  });
}
