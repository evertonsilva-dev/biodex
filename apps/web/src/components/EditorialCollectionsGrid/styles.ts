import styled from 'styled-components';

export const Section = styled.section`
  display: grid;
  gap: 1.8rem;
  padding: 5rem 0 6rem;
  scroll-margin-top: 2rem;
`;

export const SectionIntro = styled.p`
  margin: 0 0 .8rem;
  color: #79876c;
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .16em;
`;

export const Heading = styled.h2`
  margin: 0;
  color: #2a3c30;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 400;
  letter-spacing: -.06em;
  line-height: 1.05;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 1.2rem;
`;

export const CardSkeleton = styled.article`
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 0.8rem;
`;

export const DeckSkeleton = styled.div`
  position: relative;
  height: 300px;
  margin: 0 -0.5rem 0.2rem;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 50% 68%,
    ${({ theme }) => `${theme.colors.green}18`},
    transparent 68%
  );

  @media (max-width: 600px) {
    height: 280px;
  }
`;

export const DeckCardSkeleton = styled.div<{
  $offset: number;
  $rotation: number;
  $layer: number;
}>`
  position: absolute;
  top: 50%;
  left: calc(50% + ${({ $offset }) => `${$offset}px`});
  z-index: ${({ $layer }) => $layer};
  width: 147px;
  aspect-ratio: 0.7;
  overflow: hidden;
  border: 1px solid #e8dfce;
  border-radius: 15px;
  box-shadow: 0 8px 9px #202b2633;
  transform: translate(-50%, -50%) rotate(${({ $rotation }) => `${$rotation}deg`});
`;

export const CardSkeletonFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;

export const EmptyState = styled.p`
  margin: 0;
  color: #687267;
  font-size: .9rem;
`;

export const ErrorState = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .75rem;
  color: #9f4935;
  font-size: .9rem;

  button {
    border: 0;
    background: none;
    color: #39513f;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
  }
`;
