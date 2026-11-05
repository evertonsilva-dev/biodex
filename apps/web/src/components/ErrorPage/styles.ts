import styled from 'styled-components';

export const Page = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 50% 35%, #3e755712, transparent 55%),
    ${({ theme }) => theme.colors.background};
`;

export const Hero = styled.section`
  display: grid;
  place-items: center;
  flex: 1;
  padding: clamp(2rem, 8vw, 4rem) 1rem;
`;

export const Container = styled.div`
  width: min(100%, 640px);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Eyebrow = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2.4rem, 10vw, 4.5rem);
  letter-spacing: -0.055em;
  font-weight: 900;
  line-height: 1.1;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  line-height: 1.6;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 0.5rem;
`;

export const ActionLink = styled.a<{ $primary?: boolean }>`
  display: inline-flex;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ $primary, theme }) => $primary ? theme.colors.green : theme.colors.line};
  border-radius: 10px;
  background: ${({ $primary, theme }) => $primary ? theme.colors.green : theme.colors.paper};
  color: ${({ $primary, theme }) => $primary ? '#fff' : theme.colors.ink};
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 140ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 14px #202b2614;
    ${({ $primary, theme }) => $primary && `box-shadow: 0 8px 20px ${theme.colors.green}40;`}
  }

  &:active {
    transform: translateY(0);
  }
`;
