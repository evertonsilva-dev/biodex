import styled from 'styled-components';

export const Page = styled.main`
  width: min(1240px, calc(100% - 4rem));
  margin: 0 auto;
  padding: 1.5rem 0 5rem;

  @media (max-width: 700px) {
    width: min(100% - 2rem, 1240px);
  }
`;

export const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(16rem, 0.9fr);
  align-items: end;
  gap: 1.5rem;
  padding: clamp(2.5rem, 6vw, 4.5rem) 0 2.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding-top: 2rem;
  }
`;

export const HeroEyebrow = styled.p`
  margin: 0 0 0.8rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
  max-width: 13ch;
  margin: 0;
  color: ${({ theme }) => theme.colors.ink};
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.7rem, 6vw, 5.1rem);
  font-weight: 400;
  letter-spacing: -0.07em;
  line-height: 0.98;
`;

export const HeroAside = styled.div`
  display: grid;
  justify-items: start;
  gap: 1rem;
`;

export const Intro = styled.p`
  max-width: 48ch;
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.92rem;
  line-height: 1.7;
`;

export const ShareActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;

export const ShareButton = styled.button`
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.green};
  cursor: pointer;
  transition: background-color 160ms ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => `${theme.colors.green}14`};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

export const ShareStatus = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.76rem;
  line-height: 1.4;
`;

export const EmptyState = styled.section`
  display: grid;
  justify-items: start;
  gap: 0.75rem;
  margin-top: 2rem;
  padding: clamp(1.4rem, 4vw, 2.25rem);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.paper};

  h2 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 500;
    letter-spacing: -0.03em;
  }

  p {
    max-width: 58ch;
    margin: 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.88rem;
    line-height: 1.65;
  }
`;

export const EmptyActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.4rem;
`;

export const ActionLink = styled.a`
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.9rem;
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.paper};
  font-size: 0.8rem;
  font-weight: 750;
  text-decoration: none;

  &:hover {
    background: #315f46;
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }
`;

export const Notice = styled.div<{ $error?: boolean }>`
  display: grid;
  gap: 0.75rem;
  margin-top: 1.2rem;
  padding: 1rem 1.1rem;
  border: 1px solid ${({ $error, theme }) => ($error ? '#c97964' : theme.colors.line)};
  border-radius: 12px;
  background: ${({ $error, theme }) => ($error ? '#f8ece7' : theme.colors.paper)};
  color: ${({ $error, theme }) => ($error ? '#754b3d' : theme.colors.ink)};
  font-size: 0.84rem;
  line-height: 1.55;
`;

export const RetryButton = styled.button`
  justify-self: start;
  min-height: 2.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.green};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 750;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.green};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 2px;
  }
`;

export const CompareGrid = styled.section<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  align-items: start;
  gap: 1rem;
  margin-top: 1.2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(${({ $columns }) => Math.min($columns, 2)}, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const SpeciesCard = styled.article`
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 17px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 8px 24px #202b260b;
`;

export const ImageFrame = styled.div<{ $hasImage: boolean }>`
  position: relative;
  height: 225px;
  overflow: hidden;
  background: ${({ $hasImage }) => ($hasImage ? '#20352d' : 'linear-gradient(145deg, #6f9877, #304b3b)')};

  &::after {
    position: absolute;
    z-index: 1;
    inset: 0;
    background: linear-gradient(0deg, #101b17dc 0%, #101b1770 34%, transparent 76%);
    content: '';
    pointer-events: none;
  }
`;

export const Image = styled.img`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

export const ImageFallback = styled.div`
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.35rem;
  padding: 1rem;
  place-items: center;
  background: radial-gradient(ellipse at 50% 40%, #6f9877, #304b3b 80%);
  color: #fff8eb;

  span {
    font-size: 3.5rem;
  }

  small {
    color: #e4e9df;
    font-size: 0.72rem;
    text-align: center;
  }
`;

export const SpeciesHeader = styled.header`
  position: absolute;
  z-index: 2;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 2.8rem 1.2rem 1.2rem;
  color: #fff8eb;
  pointer-events: none;
`;

export const SpeciesKingdom = styled.p`
  margin: 0 0 0.45rem;
  color: #d3e2d4;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const SpeciesName = styled.h2`
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.08;
  overflow-wrap: anywhere;
  pointer-events: auto;
`;

export const SpeciesNameLink = styled.a`
  color: #fff8eb;
  text-decoration: none;

  &:hover {
    color: #d3e2d4;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }
`;

export const SpeciesScientificName = styled.p`
  margin: 0.45rem 0 0;
  color: #e1e6dc;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.92rem;
  font-style: italic;
  overflow-wrap: anywhere;
`;

export const ImageAttribution = styled.a`
  display: block;
  overflow: hidden;
  padding: 0.5rem 1.2rem 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.62rem;
  line-height: 1.35;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.green};
  }
`;

export const DataSection = styled.section`
  min-width: 0;
  padding: 1.05rem 1.2rem 1.2rem;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

export const DataSectionTitle = styled.h3`
  margin: 0 0 0.8rem;
  padding-left: 0.65rem;
  border-left: 3px solid ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.green};
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.08rem;
  font-weight: 600;
`;

export const FactList = styled.dl`
  display: grid;
  gap: 0;
  margin: 0;
`;

export const Fact = styled.div`
  min-width: 0;
  padding: 0.62rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line}99;

  &:last-child {
    border-bottom: 0;
  }

  dt {
    margin-bottom: 0.22rem;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  dd {
    overflow-wrap: anywhere;
    margin: 0;
    color: ${({ theme }) => theme.colors.ink};
    font-size: 0.82rem;
    line-height: 1.55;
  }
`;

export const MissingValue = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
  font-style: italic;
  line-height: 1.5;
`;

export const SourceGroup = styled.section`
  padding: 0.8rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  &:last-child {
    border-bottom: 0;
  }
`;

export const SourceTitle = styled.h4`
  margin: 0 0 0.45rem;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.76rem;
  font-weight: 800;
`;

export const SourceLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.8rem;
  margin-top: 0.55rem;
`;

export const SoundList = styled.div`
  display: grid;
  gap: 0.7rem;
  margin-top: 0.8rem;
`;

export const SoundItem = styled.div`
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.paper};

  p {
    margin: 0.45rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.72rem;
    line-height: 1.45;
  }
`;

export const SourceLink = styled.a`
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.74rem;
  font-weight: 750;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 2px;
  }
`;

export const EnrichmentNotice = styled.div<{ $error?: boolean }>`
  display: grid;
  gap: 0.55rem;
  margin: 0.5rem 0;
  padding: 0.7rem 0.75rem;
  border: 1px solid ${({ $error, theme }) => ($error ? '#c97964' : theme.colors.line)};
  border-radius: 9px;
  background: ${({ $error }) => ($error ? '#f8ece7' : '#f5f4ed')};
  color: ${({ $error, theme }) => ($error ? '#754b3d' : theme.colors.muted)};
  font-size: 0.74rem;
  line-height: 1.45;
`;
