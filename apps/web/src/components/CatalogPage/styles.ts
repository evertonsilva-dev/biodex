import styled from 'styled-components';

export const Page = styled.main`
  width: min(1200px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 2rem 0 5rem;

  @media (max-width: 600px) {
    width: min(100% - 2rem, 1200px);
    padding-top: 1.25rem;
  }
`;

export const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 2rem;
  padding: 4.5rem 0 3rem;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    padding: 3rem 0 2rem;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 0.8rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const Headline = styled.h1`
  max-width: 700px;
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(3rem, 7vw, 6.25rem);
  letter-spacing: -0.075em;
  line-height: 0.94;

  span {
    color: ${({ theme }) => theme.colors.green};
  }
`;

export const Intro = styled.p`
  max-width: 360px;
  margin: 0 0 0.2rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1rem;
  line-height: 1.65;
`;

export const SearchBar = styled.section`
  margin-bottom: 1.5rem;
`;

export const CatalogLayout = styled.div`
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  align-items: start;
  gap: 1.5rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Search = styled.input`
  min-width: 0;
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.green};
    outline: 2px solid ${({ theme }) => `${theme.colors.green}30`};
  }
`;

export const SearchHint = styled.p`
  margin: 0.45rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
`;

export const Footer = styled.footer`
  margin-top: 4rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
`;
