import styled from 'styled-components';

export const SaveControl = styled.div<{ $variant: 'card' | 'detail' }>`
  position: relative;
  z-index: 4;
  flex: 0 0 auto;
  align-self: flex-start;
  margin-top: ${({ $variant }) => $variant === 'detail' ? '.7rem' : '0'};
  color: ${({ $variant }) => $variant === 'card' ? '#fff8eb' : 'var(--kingdom-color)'};
`;

export const SaveButton = styled.button`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  padding: 0;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
  cursor: pointer;
  opacity: .9;
  transition:
    background 160ms ease,
    opacity 160ms ease,
    transform 160ms ease;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 16%, transparent);
    opacity: 1;
    transform: translateY(-1px);
  }
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
  &:disabled {
    cursor: wait;
    opacity: .55;
  }
`;

export const DialogOverlay = styled.div`
  position: fixed;
  z-index: 1200;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(22, 31, 26, .56);
  backdrop-filter: blur(5px);

  @media (max-width: 600px) {
    align-items: end;
    padding: 0;
  }
`;

export const Popover = styled.div`
  --collection-accent: var(--kingdom-color, ${({ theme }) => theme.colors.green});

  position: relative;
  width: min(100%, 30rem);
  max-height: min(84vh, 42rem);
  overflow: auto;
  padding: 1.35rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 24px 70px rgba(13, 24, 17, .24);
  color: ${({ theme }) => theme.colors.ink};
  font-size: .92rem;

  @media (max-width: 600px) {
    width: 100%;
    max-height: min(88dvh, 44rem);
    padding: 1.1rem 1rem calc(1.15rem + env(safe-area-inset-bottom));
    border-radius: 1.35rem 1.35rem 0 0;
  }
`;

export const DialogHeader = styled.header`
  display: flex;
  align-items: center;
  gap: .85rem;
`;

export const HeadingIcon = styled.div`
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: .9rem;
  background: color-mix(in srgb, var(--collection-accent) 12%, ${({ theme }) => theme.colors.paper});
  color: var(--collection-accent);
`;

export const Heading = styled.div`
  min-width: 0;
  flex: 1;

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.ink};
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: 1.3rem;
    font-weight: 400;
    line-height: 1.2;
  }

  p {
    margin: .25rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: .82rem;
    line-height: 1.4;
  }
`;

export const CloseButton = styled.button`
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: color-mix(in srgb, ${({ theme }) => theme.colors.ink} 7%, transparent);
    color: ${({ theme }) => theme.colors.ink};
  }
  &:focus-visible {
    outline: 2px solid var(--collection-accent);
    outline-offset: 2px;
  }
`;

export const SpeciesCaption = styled.p`
  margin: 1.15rem 0 .85rem;
  overflow-wrap: anywhere;
  color: var(--collection-accent);
  font-size: .85rem;
  font-weight: 700;
`;

export const CollectionList = styled.div`
  display: grid;
  max-height: min(34vh, 18rem);
  gap: .4rem;
  overflow: auto;
  padding: .1rem;
`;

export const CollectionOption = styled.label`
  display: flex;
  min-height: 3rem;
  align-items: center;
  gap: .75rem;
  padding: .7rem .8rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: .8rem;
  background: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;

  &:hover {
    border-color: color-mix(in srgb, var(--collection-accent) 44%, ${({ theme }) => theme.colors.line});
    background: color-mix(in srgb, var(--collection-accent) 5%, ${({ theme }) => theme.colors.paper});
  }

  input {
    width: 1.05rem;
    height: 1.05rem;
    flex: 0 0 auto;
    margin: 0;
    accent-color: var(--collection-accent);
  }
`;

export const CollectionName = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.ink};
  font-size: .9rem;
  line-height: 1.35;
`;

export const LoadingList = styled.div`
  display: grid;
  gap: .4rem;
  padding: .1rem;
`;

export const LoadingRow = styled.div`
  display: flex;
  min-height: 3rem;
  align-items: center;
  gap: .75rem;
  padding: .7rem .8rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: .8rem;
`;

export const EmptyState = styled.p`
  margin: 0;
  padding: 1rem;
  border: 1px dashed ${({ theme }) => theme.colors.line};
  border-radius: .8rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: .87rem;
  line-height: 1.5;
  text-align: center;
`;

export const CreateCollectionForm = styled.form`
  display: flex;
  gap: .65rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  @media (max-width: 360px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const TextInput = styled.input`
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: .75rem .85rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: .75rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  font-size: .9rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
  &:focus {
    border-color: var(--collection-accent);
    outline: 2px solid color-mix(in srgb, var(--collection-accent) 18%, transparent);
    outline-offset: 1px;
  }
  &:disabled {
    cursor: wait;
    opacity: .65;
  }
`;

export const CreateButton = styled.button`
  display: inline-flex;
  min-height: 2.8rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: .7rem 1rem;
  border: 1px solid var(--collection-accent);
  border-radius: .75rem;
  background: var(--collection-accent);
  color: ${({ theme }) => theme.colors.paper};
  font: inherit;
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 160ms ease, transform 160ms ease;

  &:hover:not(:disabled) {
    filter: brightness(.94);
    transform: translateY(-1px);
  }
  &:focus-visible {
    outline: 2px solid var(--collection-accent);
    outline-offset: 3px;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: .52;
  }
`;

export const ErrorMessage = styled.p`
  margin: 0 0 .8rem;
  padding: .7rem .8rem;
  border: 1px solid color-mix(in srgb, #a12f22 24%, transparent);
  border-radius: .7rem;
  background: color-mix(in srgb, #a12f22 7%, ${({ theme }) => theme.colors.paper});
  color: #a12f22;
  font-size: .82rem;
  line-height: 1.45;
`;

export const DialogFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  margin-top: .9rem;

  a {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    color: var(--collection-accent);
    font-size: .82rem;
    font-weight: 700;
    text-decoration: none;

    &:hover { text-decoration: underline; }
    &:focus-visible {
      outline: 2px solid var(--collection-accent);
      outline-offset: 3px;
    }
  }
`;
