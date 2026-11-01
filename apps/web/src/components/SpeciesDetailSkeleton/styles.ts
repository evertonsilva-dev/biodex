import styled from 'styled-components';

export const SkeletonHero = styled.section`
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) 1.1fr;
  overflow: hidden;
  margin-top: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 12px 32px #202b2608;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const SkeletonArtwork = styled.div`
  min-height: 340px;
  padding: 0.75rem;

  @media (max-width: 700px) {
    min-height: 260px;
  }
`;

export const SkeletonHeroInfo = styled.div`
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 0.9rem;
  padding: clamp(1.5rem, 5vw, 3.5rem);
`;

export const SkeletonBadges = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
`;

export const SkeletonContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  align-items: start;
  gap: 1.25rem;
  margin-top: 2rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const SkeletonColumn = styled.div`
  display: grid;
  align-content: start;
  gap: 1.25rem;
`;

export const SkeletonSection = styled.div`
  display: grid;
  align-content: start;
  gap: 1rem;
  min-height: 150px;
  padding: clamp(1.2rem, 3vw, 1.8rem);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 5px 20px #202b2608;
`;

export const SkeletonFacts = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.25rem;
`;

export const SkeletonFact = styled.div`
  display: grid;
  align-content: start;
  gap: 0.55rem;
`;
