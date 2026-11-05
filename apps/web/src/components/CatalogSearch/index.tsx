import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSearchSuggestions } from '../../api/species';
import type { SearchSuggestion } from '../../types/species';
import type { CatalogSearchProps } from './types';
import { Input, Listbox, Option, Status, Wrapper } from './styles';

const SUGGESTION_DEBOUNCE_MS = 250;
const FALLBACK_COLOR = '#4f7a5a';

function Highlighted({ label, term }: { label: string; term: string }) {
  const matches = label.toLowerCase().startsWith(term.toLowerCase());
  if (!matches) return <>{label}</>;
  return <><strong>{label.slice(0, term.length)}</strong>{label.slice(term.length)}</>;
}

export function CatalogSearch({ value, minLength, onChange }: CatalogSearchProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const term = value.trim();
  const [debouncedTerm, setDebouncedTerm] = useState(term);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedTerm(term), SUGGESTION_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [term]);

  const enabled = open && debouncedTerm.length >= minLength && debouncedTerm === term;
  const suggestionsQuery = useQuery({
    queryKey: ['search-suggestions', debouncedTerm],
    queryFn: ({ signal }) => getSearchSuggestions(debouncedTerm, signal),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const suggestions = enabled ? suggestionsQuery.data?.data ?? [] : [];
  const showList = enabled && !suggestionsQuery.isPending && !suggestionsQuery.isError && suggestions.length > 0;

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  function choose(suggestion: SearchSuggestion) {
    onChange(suggestion.label);
    setDebouncedTerm(suggestion.label);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!showList) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    }
  }

  return (
    <Wrapper ref={wrapperRef}>
      <Input
        type="search"
        role="combobox"
        placeholder="Nome popular, científico ou sinônimo"
        aria-label="Buscar espécies por nome popular, científico ou sinônimo"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <Listbox id={listId} role="listbox" aria-label="Sugestões de busca" hidden={!showList}>
        {showList && suggestions.map((suggestion, index) => (
          <Option
            key={`${suggestion.id}-${suggestion.label}`}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            $active={index === activeIndex}
            $color={suggestion.kingdomColor ?? FALLBACK_COLOR}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => choose(suggestion)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span><Highlighted label={suggestion.label} term={debouncedTerm} /></span>
            {suggestion.kind !== 'scientific' && <em>{suggestion.scientificName}</em>}
          </Option>
        ))}
      </Listbox>
      {enabled && suggestionsQuery.isError && <Status role="status">Não foi possível carregar sugestões.</Status>}
    </Wrapper>
  );
}
