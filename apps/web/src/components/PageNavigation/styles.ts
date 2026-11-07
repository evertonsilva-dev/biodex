import styled from 'styled-components';

export const Breadcrumb = styled.nav.attrs({ 'aria-label': 'Navegação estrutural' })<{
  $accentColor?: string;
}>`
  --navigation-accent: ${({ $accentColor, theme }) => $accentColor ?? theme.colors.green};

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0 0.5rem;

  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.65rem;
  }
`;

export const BackLink = styled.a`
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  gap: 0.4rem;
  color: var(--navigation-accent);
  font-size: 0.78rem;
  font-weight: 750;
  text-decoration: none;

  &:hover { text-decoration: underline; }
  &:focus-visible {
    outline: 2px solid var(--navigation-accent);
    outline-offset: 3px;
  }
`;

export const CrumbList = styled.ol`
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Crumb = styled.li`
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
`;

export const CrumbLink = styled.a`
  color: var(--navigation-accent);
  text-decoration: none;

  &:hover { color: var(--navigation-accent); text-decoration: underline; }
  &:focus-visible {
    outline: 2px solid var(--navigation-accent);
    outline-offset: 2px;
  }
`;

export const CurrentCrumb = styled.span`
  max-width: min(22rem, 55vw);
  overflow: hidden;
  color: var(--navigation-accent);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
