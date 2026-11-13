import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSearchSuggestions, getSpeciesByIds } from '../../api/species';
import type { SearchSuggestion } from '../../types/species';
import type {
  EditorialContentInput,
  ManagedEditorialContent,
} from '../../api/contributions';
import type { EditorialTrailStep } from '../../collections/types';
import {
  ButtonRow,
  ErrorMessage,
  Field,
  Form,
  FormGrid,
  Input,
  PrimaryButton,
  SearchResult,
  SearchResults,
  SecondaryButton,
  Select,
  Status,
  StepCard,
  Tag,
  TagList,
  Textarea,
} from './styles';

interface SelectedSpecies {
  id: string;
  label: string;
}

interface EditorialContentFormProps {
  content: ManagedEditorialContent | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: EditorialContentInput) => Promise<void>;
}

function emptyStep(speciesId: string, title: string): EditorialTrailStep {
  return {
    speciesId,
    title,
    narrative: '',
    sourceLabel: '',
    sourceUrl: '',
  };
}

export function EditorialContentForm({
  content,
  isSaving,
  onCancel,
  onSave,
}: EditorialContentFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [contentType, setContentType] = useState<'collection' | 'trail'>('collection');
  const [selectedSpecies, setSelectedSpecies] = useState<SelectedSpecies[]>([]);
  const [steps, setSteps] = useState<EditorialTrailStep[]>([]);
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => new Set(selectedSpecies.map(({ id }) => id)),
    [selectedSpecies],
  );
  const searchQuery = useQuery({
    queryKey: ['contribution-species-search', search.trim()],
    queryFn: ({ signal }) => getSearchSuggestions(search.trim(), signal),
    enabled: search.trim().length >= 3,
    staleTime: 30_000,
  });
  const initialSpeciesQuery = useQuery({
    queryKey: ['contribution-editorial-species', content?.id, content?.speciesIds],
    queryFn: ({ signal }) => getSpeciesByIds(content?.speciesIds ?? [], signal),
    enabled: Boolean(content?.speciesIds.length),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    setTitle(content?.title ?? '');
    setDescription(content?.description ?? '');
    setIntroduction(content?.introduction ?? '');
    setFeaturedImageUrl(content?.featuredImageUrl ?? '');
    setContentType(content?.steps.length ? 'trail' : 'collection');
    setSelectedSpecies(
      content?.speciesIds.map((id) => ({ id, label: id })) ?? [],
    );
    setSteps(content?.steps ?? []);
    setSearch('');
    setFormError(null);
  }, [content]);

  useEffect(() => {
    if (!content || !initialSpeciesQuery.data) return;
    const labels = new Map(
      initialSpeciesQuery.data.data.map((species) => [
        species.documentId,
        `${species.commonName} · ${species.scientificName}`,
      ]),
    );
    setSelectedSpecies((current) => current.map((item) => ({
      ...item,
      label: labels.get(item.id) ?? item.label,
    })));
  }, [content, initialSpeciesQuery.data]);

  function addSpecies(suggestion: SearchSuggestion) {
    if (selectedIds.has(suggestion.id)) return;
    const label = `${suggestion.label} · ${suggestion.scientificName}`;
    setSelectedSpecies((current) => [...current, { id: suggestion.id, label }]);
    if (contentType === 'trail') {
      setSteps((current) => [...current, emptyStep(suggestion.id, suggestion.label)]);
    }
    setSearch('');
  }

  function removeSpecies(speciesId: string) {
    setSelectedSpecies((current) => current.filter(({ id }) => id !== speciesId));
    setSteps((current) => current.filter(({ speciesId: stepId }) => stepId !== speciesId));
  }

  function changeContentType(nextType: 'collection' | 'trail') {
    setContentType(nextType);
    if (nextType === 'collection') {
      setSteps([]);
      return;
    }
    setSteps((current) => {
      const bySpecies = new Map(current.map((step) => [step.speciesId, step]));
      return selectedSpecies.map(({ id, label }) => (
        bySpecies.get(id) ?? emptyStep(id, label.split(' · ')[0] ?? label)
      ));
    });
  }

  function updateStep(index: number, patch: Partial<EditorialTrailStep>) {
    setSteps((current) => current.map((step, stepIndex) => (
      stepIndex === index ? { ...step, ...patch } : step
    )));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (selectedSpecies.length === 0) {
      setFormError('Selecione ao menos uma espécie para continuar.');
      return;
    }
    if (contentType === 'trail' && steps.length === 0) {
      setFormError('Adicione ao menos um passo à trilha.');
      return;
    }
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        introduction: introduction.trim(),
        featuredImageUrl: featuredImageUrl.trim() || null,
        speciesIds: selectedSpecies.map(({ id }) => id),
        steps: contentType === 'trail' ? steps : [],
      });
    } catch (error) {
      setFormError(error instanceof Error
        ? error.message
        : 'Não foi possível salvar o conteúdo editorial.');
    }
  }

  return (
    <Form onSubmit={(event) => void submit(event)}>
      <FormGrid>
        <Field>
          Tipo de conteúdo
          <Select
            value={contentType}
            onChange={(event) => changeContentType(event.target.value as 'collection' | 'trail')}
          >
            <option value="collection">Coleção editorial</option>
            <option value="trail">Trilha de descoberta</option>
          </Select>
        </Field>
        <Field>
          Título
          <Input
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
      </FormGrid>
      <Field>
        Descrição curta
        <Input
          required
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <Field>
        Introdução
        <Textarea
          required
          maxLength={3000}
          value={introduction}
          onChange={(event) => setIntroduction(event.target.value)}
        />
      </Field>
      <Field>
        Imagem de capa (URL HTTPS, opcional)
        <Input
          type="url"
          value={featuredImageUrl}
          onChange={(event) => setFeaturedImageUrl(event.target.value)}
        />
      </Field>
      <Field>
        Buscar espécies no catálogo
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Digite ao menos 3 caracteres"
        />
      </Field>
      {search.trim().length >= 3 && (
        <SearchResults aria-label="Resultados de espécies">
          {searchQuery.isPending && <Status>Buscando no catálogo…</Status>}
          {searchQuery.isError && (
            <ErrorMessage role="alert">Não foi possível buscar espécies no catálogo.</ErrorMessage>
          )}
          {searchQuery.data?.data.map((suggestion) => (
            <SearchResult
              key={suggestion.id}
              type="button"
              disabled={selectedIds.has(suggestion.id)}
              onClick={() => addSpecies(suggestion)}
            >
              <span>{suggestion.label}</span>
              <small>{suggestion.scientificName}</small>
            </SearchResult>
          ))}
          {searchQuery.data?.data.length === 0 && (
            <Status>Nenhuma espécie encontrada.</Status>
          )}
        </SearchResults>
      )}
      <Field>
        Espécies selecionadas · {selectedSpecies.length}
        {initialSpeciesQuery.isError && content && (
          <ErrorMessage role="alert">
            Não foi possível resolver os nomes de algumas espécies desta edição.
          </ErrorMessage>
        )}
        <TagList>
          {selectedSpecies.map(({ id, label }) => (
            <Tag key={id}>
              {label}
              <button
                type="button"
                aria-label={`Remover ${label}`}
                onClick={() => removeSpecies(id)}
              >
                ×
              </button>
            </Tag>
          ))}
        </TagList>
      </Field>
      {contentType === 'trail' && steps.map((step, index) => {
        const species = selectedSpecies.find(({ id }) => id === step.speciesId);
        return (
          <StepCard key={step.speciesId}>
            <h4>Passo {index + 1} · {species?.label ?? step.speciesId}</h4>
            <FormGrid>
              <Field>
                Título do passo
                <Input
                  required
                  maxLength={160}
                  value={step.title}
                  onChange={(event) => updateStep(index, { title: event.target.value })}
                />
              </Field>
              <Field>
                Nome da fonte
                <Input
                  required
                  maxLength={120}
                  value={step.sourceLabel}
                  onChange={(event) => updateStep(index, { sourceLabel: event.target.value })}
                />
              </Field>
            </FormGrid>
            <Field>
              Narrativa
              <Textarea
                required
                maxLength={3000}
                value={step.narrative}
                onChange={(event) => updateStep(index, { narrative: event.target.value })}
              />
            </Field>
            <Field>
              URL HTTPS da fonte
              <Input
                required
                type="url"
                value={step.sourceUrl}
                onChange={(event) => updateStep(index, { sourceUrl: event.target.value })}
              />
            </Field>
          </StepCard>
        );
      })}
      {formError && <ErrorMessage role="alert">{formError}</ErrorMessage>}
      <ButtonRow>
        <PrimaryButton type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando…' : content ? 'Salvar alterações' : 'Criar conteúdo'}
        </PrimaryButton>
        <SecondaryButton type="button" disabled={isSaving} onClick={onCancel}>
          Cancelar
        </SecondaryButton>
      </ButtonRow>
    </Form>
  );
}
