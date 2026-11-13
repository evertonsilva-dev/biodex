import styled from 'styled-components';

export const Action = styled.a`
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: center;
  margin-top: 0.65rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 999px;
  background: transparent;
  color: var(--kingdom-color, ${({ theme }) => theme.colors.green});
  font: inherit;
  font-size: 0.72rem;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--kingdom-color, ${({ theme }) => theme.colors.green});
    background: var(--kingdom-color, ${({ theme }) => theme.colors.green});
    color: ${({ theme }) => theme.colors.paper};
  }

  &:focus-visible {
    outline: 2px solid var(--kingdom-color, ${({ theme }) => theme.colors.green});
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

export const StatusText = styled.p`
  margin: 0.65rem 0 0;
  color: var(--kingdom-color, ${({ theme }) => theme.colors.green});
  font-size: 0.75rem;
  font-weight: 700;
`;

export const ErrorText = styled.p`
  margin: 0.55rem 0 0;
  color: #a12f22;
  font-size: 0.75rem;
  line-height: 1.4;
`;
