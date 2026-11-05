import styled from 'styled-components';

export const Card = styled.article<{ $kingdomColor: string; $preview?: boolean }>`
  position: relative;
  overflow: hidden;
  min-width: 0;
  aspect-ratio: 0.7;
  border: 1px solid #e8dfce;
  border-radius: 15px;
  background: #304b3b;
  box-shadow: 0 8px 22px ${({ $kingdomColor }) => `${$kingdomColor}18`}, 0 2px 6px #202b2610;
  cursor: ${({ $preview }) => $preview ? 'default' : 'pointer'};
  transition: transform 220ms ease, box-shadow 220ms ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 34px ${({ $kingdomColor }) => `${$kingdomColor}25`}, 0 4px 10px #202b2618;
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

export const Artwork = styled.div<{ $kingdomColor: string; $hasImage: boolean }>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1.15rem;
  background:
    ${({ $hasImage, $kingdomColor }) => $hasImage
      ? 'linear-gradient(180deg, #1d302d55 0%, transparent 32%, transparent 40%, #182a25ef 100%), #182a25'
      : `radial-gradient(ellipse at 50% 42%, ${$kingdomColor}, color-mix(in srgb, ${$kingdomColor} 42%, #17231b) 78%), linear-gradient(145deg, ${$kingdomColor}, color-mix(in srgb, ${$kingdomColor} 38%, #17231b))`};
  color: #fff8eb;
  font-size: 4rem;

  &::after {
    position: absolute;
    z-index: 0;
    inset: 0;
    background:
      linear-gradient(0deg, #000d 0%, #0009 25%, transparent 62%),
      linear-gradient(180deg, #0007 0%, transparent 25%);
    content: '';
    pointer-events: none;
  }
`;

export const ArtworkImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 500ms ease;

  ${Card}:hover & { transform: scale(1.045); }
`;

export const ArtworkFallback = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.35rem;
  color: #fff8eb;

  small {
    font-size: 0.72rem;
  }
`;

export const ImageCredit = styled.a`
  position: relative;
  z-index: 2;
  display: block;
  overflow: hidden;
  margin: .5rem 0 0;
  color: #c9d3c7;
  font-size: 0.62rem;
  line-height: 1.3;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover { color: #fff8eb; }
`;

export const ArtworkMeta = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
`;

export const ArtLabel = styled.span`
  overflow: hidden;
  color: #fff8eb;
  font-size: .55rem;
  font-weight: 800;
  letter-spacing: .13em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const SideLabel = styled.span`
  position: absolute;
  top: 36%;
  bottom: 30%;
  left: .55rem;
  z-index: 1;
  overflow: hidden;
  color: #fff8eb;
  font-size: .53rem;
  font-weight: 800;
  letter-spacing: .11em;
  line-height: 1;
  opacity: .94;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
`;

export const CardTag = styled.span`
  flex: 0 0 auto;
  padding: .38rem .55rem;
  border: 1px solid #fff8eb78;
  border-radius: 999px;
  color: #fff8eb;
  font-size: .48rem;
  font-weight: 800;
  letter-spacing: .13em;
`;

export const SpecimenInfo = styled.div`
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding: .8rem 0 0 1.15rem;
  border-top: 1px solid #fff8eb70;
`;

export const Name = styled.h2`
  overflow: hidden;
  display: -webkit-box;
  min-width: 0;
  margin: 0;
  color: #fff8eb;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1rem, 1.5vw, 1.35rem);
  font-weight: 400;
  font-style: italic;
  letter-spacing: -.045em;
  line-height: 1.1;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: .4rem;
  margin-top: .35rem;
`;

export const Taxonomy = styled.p`
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 .05rem;
  color: #e7d9c4;
  font-size: .53rem;
  font-weight: 800;
  letter-spacing: .1em;
  line-height: 1.45;
  text-transform: uppercase;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;
