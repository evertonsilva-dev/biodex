import styled from 'styled-components';

export const Results = styled.section`
  min-width: 0;
`;

export const ResultCount = styled.p`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;

  strong {
    color: ${({ theme }) => theme.colors.ink};
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
