import styled from "styled-components";

export const Sidebar = styled.aside`
  display: grid;
  gap: 1rem;
  align-content: start;
  padding: 1rem;
  /* border: 1px solid ${({ theme }) => theme.colors.line}; */
  /* border-radius: 14px; */
  /* background: #ffffff80; */
  border-right: 1px solid ${({ theme }) => theme.colors.line};
  @media (min-width: 761px) {
    position: sticky;
    top: 1rem;
  }
`;

export const SidebarTitle = styled.h2`
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  /* color: ${({ theme }) => theme.colors.ink}; */
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.1rem;
`;

export const Select = styled.select`
  min-width: 0;
  width: 100%;
  padding: 0.75rem 2rem 0.75rem 0.85rem;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  /* border-radius: 9px; */
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font: inherit;
`;

export const FilterControl = styled.label`
  display: grid;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
  font-weight: 700;
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

export const ClearButton = styled.button`
  justify-self: start;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.green};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const Notice = styled.div<{ $error?: boolean }>`
  padding: 1.5rem;
  border: 1px solid
    ${({ $error, theme }) => ($error ? "#d27d65" : theme.colors.line)};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  line-height: 1.6;
`;
