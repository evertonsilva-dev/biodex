import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  X,
} from 'lucide-react';
import { useCollections } from '../../collections/CollectionsProvider';
import { Skeleton } from '../Skeleton';
import type { SaveSpeciesButtonProps } from './types';
import {
  CollectionList,
  CollectionName,
  CollectionOption,
  CloseButton,
  CreateButton,
  CreateCollectionForm,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  EmptyState,
  ErrorMessage,
  Heading,
  HeadingIcon,
  LoadingList,
  LoadingRow,
  Popover,
  SaveButton,
  SaveControl,
  SpeciesCaption,
  TextInput,
} from './styles';

export function SaveSpeciesButton({ species, variant = 'card' }: SaveSpeciesButtonProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const {
    collections,
    createCollection,
    isLoading,
    refreshCollections,
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

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
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

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }

    setError('');
    setOpen(true);
    void refreshCollections().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as coleções.');
    });
  }

  return (
    <SaveControl $variant={variant}>
      <SaveButton
        type="button"
        disabled={isLoading}
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={`${saved ? 'Gerenciar coleções de' : 'Salvar'} ${species.commonName}`}
        title={saved ? 'Gerenciar coleções' : 'Salvar em uma coleção'}
        onClick={toggleOpen}
      >
        {saved
          ? <BookmarkCheck size={21} strokeWidth={1.8} aria-hidden="true" />
          : <Bookmark size={21} strokeWidth={1.8} aria-hidden="true" />}
      </SaveButton>
      {open && createPortal(
        <DialogOverlay
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <Popover
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <DialogHeader>
              <HeadingIcon aria-hidden="true">
                <BookmarkPlus size={19} strokeWidth={1.8} />
              </HeadingIcon>
              <Heading>
                <h2 id={titleId}>Adicionar à coleção</h2>
                <p>Organize esta espécie nas suas coleções.</p>
              </Heading>
              <CloseButton
                ref={closeButtonRef}
                type="button"
                aria-label="Fechar janela"
                onClick={() => setOpen(false)}
              >
                <X size={18} aria-hidden="true" />
              </CloseButton>
            </DialogHeader>

            <SpeciesCaption>{species.commonName}</SpeciesCaption>

            {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

            <section aria-label="Suas coleções" aria-busy={isLoading}>
              {isLoading ? (
                <LoadingList role="status" aria-label="Carregando coleções" aria-busy="true">
                  {[0, 1, 2].map((index) => (
                    <LoadingRow key={index}>
                      <Skeleton $width="1.1rem" $height="1.1rem" $radius="5px" />
                      <Skeleton $width={`${66 + index * 8}%`} $height="0.85rem" />
                    </LoadingRow>
                  ))}
                </LoadingList>
              ) : collections.length > 0 ? (
                <CollectionList>
                  {collections.map((collection) => (
                    <CollectionOption key={collection.id}>
                      <input
                        type="checkbox"
                        checked={(collection.speciesIds
                          ?? collection.species.map((item) => item.documentId))
                          .includes(collectionSpecies.documentId)}
                        onChange={async () => {
                          try {
                            await toggleSpecies(collection.id, collectionSpecies);
                            setError('');
                          } catch (reason) {
                            setError(
                              reason instanceof Error
                                ? reason.message
                                : 'Não foi possível atualizar a coleção.',
                            );
                          }
                        }}
                      />
                      <CollectionName>{collection.name}</CollectionName>
                    </CollectionOption>
                  ))}
                </CollectionList>
              ) : (
                <EmptyState>
                  Você ainda não tem coleções. Crie uma para salvar esta espécie.
                </EmptyState>
              )}
            </section>

            <CreateCollectionForm onSubmit={(event) => void create(event)}>
              <TextInput
                type="text"
                value={name}
                disabled={isLoading}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome da nova coleção"
                aria-label="Nome da nova coleção"
                maxLength={60}
              />
              <CreateButton type="submit" disabled={isLoading || !name.trim()}>
                Criar
              </CreateButton>
            </CreateCollectionForm>

            <DialogFooter>
              <a href="/collections">
                Ver minhas coleções <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </DialogFooter>
          </Popover>
        </DialogOverlay>,
        document.body,
      )}
    </SaveControl>
  );
}
