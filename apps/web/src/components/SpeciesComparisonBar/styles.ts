import styled from 'styled-components';

export const Bar = styled.section<{ $accentColor?: string }>`
  --comparison-accent: ${({ $accentColor, theme }) => $accentColor ?? theme.colors.green};

  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  align-items: center;
  gap: 0.6rem 1rem;
  margin: 1.1rem 0 1.3rem;
  padding: 0.7rem 0;
  border-top: 1px solid color-mix(in srgb, var(--comparison-accent) 24%, ${({ theme }) => theme.colors.line});
  border-bottom: 1px solid color-mix(in srgb, var(--comparison-accent) 24%, ${({ theme }) => theme.colors.line});

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Heading = styled.div`
  display: grid;
  min-width: 0;

  strong {
    color: color-mix(in srgb, var(--comparison-accent) 72%, ${({ theme }) => theme.colors.muted});
    font-size: 0.73rem;
    font-weight: 750;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

export const SelectionList = styled.div`
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem 0.85rem;
`;

export const SpeciesChip = styled.div`
  display: flex;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  gap: 0.25rem;
`;

export const SpeciesName = styled.span`
  display: block;
  overflow: hidden;
  max-width: 11rem;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.75rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SpeciesScientificName = styled.span`
  display: block;
  overflow: hidden;
  max-width: 10rem;
  color: ${({ theme }) => theme.colors.muted};
  font-family: Georgia, serif;
  font-size: 0.66rem;
  font-style: italic;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RemoveButton = styled.button`
  display: grid;
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font: inherit;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    color: var(--comparison-accent);
  }

  &:focus-visible {
    outline: 2px solid var(--comparison-accent);
    outline-offset: 2px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 860px) {
    grid-column: 1 / -1;
  }

  @media (max-width: 600px) {
    justify-content: flex-start;
  }
`;

export const ClearButton = styled.button`
  padding: 0.25rem 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font: inherit;
  font-size: 0.72rem;
  font-weight: 650;
  cursor: pointer;

  &:hover {
    color: var(--comparison-accent);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--comparison-accent);
    outline-offset: 2px;
  }
`;

export const CompareLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.8rem;
  color: var(--comparison-accent);
  font-size: 0.74rem;
  font-weight: 750;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: var(--comparison-accent);
  }

  &:focus-visible {
    outline: 3px solid var(--comparison-accent);
    outline-offset: 2px;
  }
`;

export const CompareUnavailable = styled.span`
  display: inline-flex;
  min-height: 1.8rem;
  align-items: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.74rem;
  font-weight: 650;
  opacity: 0.75;
`;

export const Status = styled.p`
  grid-column: 1 / -1;
  min-height: 0;
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.74rem;
  line-height: 1.4;
`;
