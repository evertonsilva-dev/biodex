import styled from 'styled-components';

export const Card = styled.article`
  position: relative;
  overflow: hidden;
  min-width: 0;
  aspect-ratio: 0.7;
  border: 1px solid #e8dfce;
  border-radius: 15px;
  background: #304b3b;
  box-shadow: 0 8px 22px #202b2618;
`;

export const Artwork = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1.15rem;
  background:
    radial-gradient(ellipse at 50% 40%, #78907135, transparent 56%),
    linear-gradient(180deg, #1d302d55 0%, transparent 32%, transparent 40%, #182a25ef 100%),
    linear-gradient(145deg, #3e7557, #17231b);
`;

export const ArtworkShimmer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
`;

export const ArtworkMeta = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const SideLabel = styled.div`
  position: absolute;
  top: 36%;
  bottom: 30%;
  left: 0.55rem;
  z-index: 1;
`;

export const SpecimenInfo = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: start;
  gap: 0.55rem;
  margin-top: auto;
  padding: 0.8rem 0 0 1.15rem;
  border-top: 1px solid #fff8eb70;
`;
