import styled from 'styled-components';

export const Sidebar = styled.aside`
  display: grid;
  gap: 1rem;
  align-content: start;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 14px;
  background: #ffffff80;

  @media (min-width: 761px) {
    position: sticky;
    top: 1rem;
  }
`;

export const SidebarTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.1rem;
`;

export const Select = styled.select`
  min-width: 0;
  width: 100%;
  padding: 0.75rem 2rem 0.75rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
`;

export const FilterControl = styled.label`
  display: grid;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
  font-weight: 700;
`;

export const CheckboxControl = styled.label`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.85rem;
  cursor: pointer;

  input {
    width: 1rem;
    height: 1rem;
    accent-color: ${({ theme }) => theme.colors.green};
  }
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
