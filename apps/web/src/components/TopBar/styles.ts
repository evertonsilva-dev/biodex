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
`;
