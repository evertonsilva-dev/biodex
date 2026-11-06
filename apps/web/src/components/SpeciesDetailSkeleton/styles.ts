import styled from 'styled-components';

export const SkeletonHero = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  min-height: 420px;
  margin-top: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`;

export const SkeletonArtwork = styled.div`
  min-width: 0;
  overflow: hidden;
  padding: 0.8rem 0 0.8rem 0.8rem;

  > div {
    min-height: 340px;
  }

  @media (max-width: 760px) {
    padding: 0.7rem 0.7rem 0;

    > div {
      min-height: 260px;
    }
  }
`;

export const SkeletonHeroInfo = styled.div`
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 0.9rem;
  padding: clamp(2rem, 5vw, 4.5rem);

  @media (max-width: 760px) {
    padding: 1.8rem 1.5rem 2rem;
  }
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
  gap: 1rem;
  margin-top: 1.4rem;

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
  min-height: 130px;
  padding: clamp(1.25rem, 3vw, 1.9rem);

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  }
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
