import styled from 'styled-components';

export const Page = styled.main`
  width: min(1200px, calc(100% - 3rem));
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem 0 5rem;
  color: ${({ theme }) => theme.colors.ink};

  @media (max-width: 600px) {
    width: min(100% - 2rem, 1200px);
    padding-top: 1.25rem;
  }
`;

export const ProfileContent = styled.section`
  width: min(100%, 52rem);
  margin: clamp(3rem, 8vh, 5.5rem) 0 0;
`;

export const ProfileHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  p {
    margin: 0 0 0.25rem;
    color: ${({ theme }) => theme.colors.green};
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(2.8rem, 6vw, 4.5rem);
    font-weight: 400;
    letter-spacing: -0.075em;
    line-height: 0.96;
  }
`;

export const Avatar = styled.div`
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.paper};
  font-size: 1.5rem;
  font-weight: 800;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const Field = styled.div`
  display: grid;
  gap: 0.5rem;
  margin-top: 1.25rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

export const Value = styled.span`
  padding: 0.25rem 0 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: none;
`;

export const EmptyMessage = styled.div`
  .eyebrow {
    margin: 0 0 0.8rem;
    color: ${({ theme }) => theme.colors.green};
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(2.6rem, 6vw, 4rem);
    font-weight: 400;
    letter-spacing: -0.07em;
    line-height: 0.98;
  }

  .description {
    max-width: 34rem;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.6;
  }

  a {
    display: inline-block;
    padding: 0.65rem 0.15rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    color: ${({ theme }) => theme.colors.green};
    font-weight: 800;
    text-decoration: none;
  }

  a:hover { border-bottom-color: ${({ theme }) => theme.colors.green}; }
`;
