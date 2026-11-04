import styled from 'styled-components';

export const Results = styled.section`
  min-width: 0;
`;

export const ResultsToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
`;

export const ResultCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;

  strong {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
`;

export const ActiveFilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  max-width: 100%;
  padding: 0.4rem 0.65rem;
  border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.green} 22%, ${({ theme }) => theme.colors.paper});
  border-radius: 999px;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.green} 10%, ${({ theme }) => theme.colors.paper});
  color: ${({ theme }) => theme.colors.green};
  font: inherit;
  font-size: 0.75rem;
  overflow-wrap: anywhere;
  text-align: left;
  cursor: pointer;

  &::after {
    content: '×';
    color: ${({ theme }) => theme.colors.green};
    font-size: 1rem;
    line-height: 0.8;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.green};
    background: color-mix(in srgb, ${({ theme }) => theme.colors.green} 16%, ${({ theme }) => theme.colors.paper});
  }
`;

export const ClearAllButton = styled.button`
  padding: 0.35rem 0.2rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.green};
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const SortLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
  font-weight: 700;

  > div {
    width: 12rem;
  }

  @media (max-width: 600px) {
    width: 100%;

    > div {
      flex: 1;
    }
  }
`;

export const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
`;

export const Pagination = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
`;

export const PageButton = styled.button`
  padding: 0.65rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const Notice = styled.div<{ $error?: boolean }>`
  padding: 1.5rem;
  border: 1px solid ${({ $error, theme }) => ($error ? '#d27d65' : theme.colors.line)};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  line-height: 1.6;
`;

export const EmptyActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1rem;
`;
