import styled from 'styled-components';

export const Page = styled.main`
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 2rem;
  background:
    radial-gradient(ellipse at 50% 35%, #3e755712, transparent 55%),
    ${({ theme }) => theme.colors.background};
`;

export const Panel = styled.section`
  width: min(100%, 520px);
  padding: clamp(1.5rem, 5vw, 3rem);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 22px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 18px 50px #202b2614, 0 2px 8px #202b2608;
  text-align: center;
`;

export const Logo = styled.a`
  display: inline-block;
  margin-bottom: 2.5rem;
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.06em;
  text-decoration: none;

  span {
    color: ${({ theme }) => theme.colors.green};
  }
`;

export const ErrorCode = styled.p`
  margin: 0 0 0.6rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.8rem, 6vw, 2.6rem);
  letter-spacing: -0.055em;
`;

export const Description = styled.p`
  margin: 0.85rem 0 1.75rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  line-height: 1.6;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
`;

export const ActionLink = styled.a<{ $primary?: boolean }>`
  display: inline-flex;
  justify-content: center;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $primary, theme }) => $primary ? theme.colors.green : theme.colors.line};
  border-radius: 10px;
  background: ${({ $primary, theme }) => $primary ? theme.colors.green : theme.colors.paper};
  color: ${({ $primary, theme }) => $primary ? '#fff' : theme.colors.ink};
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 140ms ease, box-shadow 140ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 14px #202b2614;
  }
`;
