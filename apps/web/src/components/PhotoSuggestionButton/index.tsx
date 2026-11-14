import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import {
  getMyPhotoSuggestionForSpecies,
  submitPhotoSuggestion,
} from '../../api/contributions';
import type { SpeciesImagePhoto } from '../../api/species-image';
import { Action, ErrorText, StatusText } from './styles';

interface PhotoSuggestionButtonProps {
  speciesId: string;
  photo: SpeciesImagePhoto | null;
}

export function PhotoSuggestionButton({
  speciesId,
  photo,
}: PhotoSuggestionButtonProps) {
  const { user, status, isConfigured, getAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['contributions', 'my-photo-suggestion', user?.id, speciesId];
  const suggestionQuery = useQuery({
    queryKey,
    queryFn: async ({ signal }) => getMyPhotoSuggestionForSpecies(
      await getAccessToken(),
      speciesId,
      signal,
    ),
    enabled: Boolean(user && photo),
    retry: false,
    refetchInterval: (query) => (
      query.state.data?.status === 'pending' ? 30_000 : false
    ),
  });
  const suggestionMutation = useMutation({
    mutationFn: async (photoUrl: string) => submitPhotoSuggestion(
      await getAccessToken(),
      speciesId,
      photoUrl,
    ),
    onSuccess: (suggestion) => {
      queryClient.setQueryData(queryKey, suggestion);
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  if (!photo) return null;

  if (!user) {
    if (status === 'loading' || !isConfigured) return null;
    const returnTo = encodeURIComponent(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
    return (
      <Action
        href={`/login?returnTo=${returnTo}`}
        aria-label="Entre para sugerir esta foto como a melhor para a espécie"
      >
        Entre para sugerir esta foto
      </Action>
    );
  }

  if (suggestionQuery.isPending) {
    return <StatusText role="status">Conferindo solicitações anteriores…</StatusText>;
  }

  if (suggestionQuery.isError && !suggestionQuery.data) {
    return (
      <div>
        <ErrorText role="alert">Não foi possível verificar suas sugestões para esta espécie.</ErrorText>
        <Action
          as="button"
          type="button"
          onClick={() => void suggestionQuery.refetch()}
        >
          Tentar novamente
        </Action>
      </div>
    );
  }

  const existingSuggestion = suggestionQuery.data;
  if (existingSuggestion?.status === 'pending') {
    return <StatusText role="status">Sugestão enviada para revisão.</StatusText>;
  }

  return (
    <div>
      {existingSuggestion && (
        <StatusText role="status">
          {existingSuggestion.status === 'approved'
            ? 'Sugestão aprovada. Você já pode sugerir outra imagem.'
            : 'Sugestão recusada. Você já pode sugerir outra imagem.'}
        </StatusText>
      )}
      {suggestionQuery.isError && (
        <ErrorText role="alert">
          Não foi possível atualizar o status da sugestão. Tente novamente.
        </ErrorText>
      )}
      {suggestionMutation.isError && (
        <ErrorText role="alert">
          {suggestionMutation.error.message}
        </ErrorText>
      )}
      <Action
        as="button"
        type="button"
        disabled={suggestionMutation.isPending}
        onClick={() => suggestionMutation.mutate(photo.url)}
      >
        {suggestionMutation.isPending ? 'Enviando sugestão…' : 'Sugerir como melhor foto'}
      </Action>
    </div>
  );
}
