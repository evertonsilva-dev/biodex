import styled from 'styled-components';

export const Header = styled.header<{ $kingdomColor?: string }>`
  --kingdom-color: ${({ $kingdomColor, theme }) => $kingdomColor ?? theme.colors.green};

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

export const Logo = styled.a`
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.3rem;
  font-weight: 900;
  letter-spacing: -0.06em;
  text-decoration: none;

  span {
    color: var(--kingdom-color);
  }
`;

export const Label = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;

  @media (max-width: 700px) {
    display: none;
  }
`;

export const HeaderNav = styled.nav`
  display: flex;
  align-items: center;
  gap: .9rem;
  color: ${({ theme }) => theme.colors.muted};

  @media (max-width: 600px) {
    gap: .65rem;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  min-width: 0;

  @media (max-width: 600px) {
    gap: 0.6rem;
  }
`;

export const HeaderNavLink = styled.a`
  color: var(--kingdom-color);
  font-size: .82rem;
  font-weight: 800;
  text-decoration: none;
  transition: opacity 160ms ease;

  &:hover { opacity: .72; }
  &:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
`;
