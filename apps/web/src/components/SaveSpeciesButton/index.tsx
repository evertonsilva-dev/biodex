import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Bookmark, BookmarkCheck, X } from 'lucide-react';
import { useCollections } from '../../collections/CollectionsProvider';
import type { SaveSpeciesButtonProps } from './types';
import { Popover, SaveButton, SaveControl } from './styles';

export function SaveSpeciesButton({ species, variant = 'card' }: SaveSpeciesButtonProps) {
  const controlRef = useRef<HTMLDivElement>(null);
  const {
    collections,
    createCollection,
    isLoading,
    toggleSpecies,
  } = useCollections();
  const collectionSpecies = {
    id: species.id,
    documentId: species.documentId,
    commonName: species.commonName,
    scientificName: species.scientificName,
    description: species.description,
    habitat: species.habitat,
    extinct: species.extinct === true,
    conservationStatus: species.conservationStatus,
    kingdom: species.kingdom,
    taxon: species.taxon,
    image: species.image,
  };
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const saved = collections.some((collection) =>
    (collection.speciesIds ?? collection.species.map((item) => item.documentId))
      .includes(collectionSpecies.documentId),
  );

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !controlRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await createCollection(name, collectionSpecies);
      setName('');
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a coleção.');
    }
  }

  return (
    <SaveControl ref={controlRef} $variant={variant}>
      <SaveButton
        type="button"
        disabled={isLoading}
        aria-expanded={open}
        aria-label={`${saved ? 'Gerenciar coleções de' : 'Salvar'} ${species.commonName}`}
        title={saved ? 'Gerenciar coleções' : 'Salvar em uma coleção'}
        onClick={() => setOpen((value) => !value)}
      >
        {saved
          ? <BookmarkCheck size={21} strokeWidth={1.8} aria-hidden="true" />
          : <Bookmark size={21} strokeWidth={1.8} aria-hidden="true" />}
      </SaveButton>
      {open && (
        <Popover>
          <header>
            <h3>Adicionar à coleção</h3>
            <button type="button" className="close" aria-label="Fechar popup" onClick={() => setOpen(false)}>
              <X size={17} aria-hidden="true" />
            </button>
          </header>
          {collections.map((collection) => (
            <label key={collection.id}>
              <input
                type="checkbox"
                disabled={isLoading}
                checked={(collection.speciesIds ?? collection.species.map((item) => item.documentId))
                  .includes(collectionSpecies.documentId)}
                onChange={async () => {
                  try {
                    await toggleSpecies(collection.id, collectionSpecies);
                    setError('');
                  } catch (reason) {
                    setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar a coleção.');
                  }
                }}
              />
              {collection.name}
            </label>
          ))}
          <form onSubmit={create}>
            <input
              type="text"
              value={name}
              disabled={isLoading}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nova coleção"
              aria-label="Nome da nova coleção"
              maxLength={60}
            />
            <button type="submit" disabled={isLoading}>Criar</button>
          </form>
          {isLoading && <p>Sincronizando coleções…</p>}
          {error && <p role="alert">{error}</p>}
          <a href="/collections">Ver coleções</a>
        </Popover>
      )}
    </SaveControl>
  );
}
