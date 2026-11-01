import styled from 'styled-components';

export const Card = styled.article<{ $kingdomColor: string }>`
  position: relative;
  overflow: hidden;
  min-width: 0;
  border: 1px solid ${({ $kingdomColor }) => `${$kingdomColor}24`};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 5px 18px ${({ $kingdomColor }) => `${$kingdomColor}14`}, 0 1px 3px #202b2608;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ $kingdomColor }) => `${$kingdomColor}40`};
    box-shadow: 0 10px 26px ${({ $kingdomColor }) => `${$kingdomColor}20`}, 0 2px 5px #202b260a;
  }
`;

export const CardDetailsLink = styled.a<{ $kingdomColor: string }>`
  position: absolute;
  z-index: 1;
  inset: 0;
  border-radius: inherit;

  &:focus-visible {
    outline: 3px solid ${({ $kingdomColor }) => `${$kingdomColor}99`};
    outline-offset: 3px;
  }
`;

export const Artwork = styled.div<{ $kingdomColor: string }>`
  position: relative;
  overflow: hidden;
  display: grid;
  aspect-ratio: 1.15;
  place-items: center;
  background: ${({ $kingdomColor }) => `${$kingdomColor}20`};
  color: ${({ $kingdomColor }) => $kingdomColor};
  font-size: 4rem;
`;

export const ArtworkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ArtworkFallback = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.35rem;

  small {
    font-size: 0.72rem;
  }
`;

export const ImageCredit = styled.a`
  position: absolute;
  z-index: 2;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  padding: 1.2rem 0.6rem 0.45rem;
  background: linear-gradient(transparent, #000a);
  color: white;
  font-size: 0.62rem;
  line-height: 1.3;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardBody = styled.div`
  padding: 1rem 1.1rem 1.2rem;
`;

export const KingdomLabel = styled.span<{ $kingdomColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ $kingdomColor }) => $kingdomColor};
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const Name = styled.h2`
  margin: 0.55rem 0 0.15rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.35rem;
  line-height: 1.15;
`;

export const ScientificName = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-family: Georgia, serif;
  font-size: 0.9rem;
  font-style: italic;
`;

export const Taxonomy = styled.p`
  display: -webkit-box;
  overflow: hidden;
  margin: 0.7rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const Description = styled.p`
  display: -webkit-box;
  overflow: hidden;
  margin: 0.85rem 0 0;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.86rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;
