import styled from "styled-components";

export const Page = styled.main<{ $kingdomColor: string }>`
  --kingdom-color: ${({ $kingdomColor }) => $kingdomColor};
  --kingdom-tint: ${({ $kingdomColor }) => `${$kingdomColor}18`};
  --kingdom-edge: ${({ $kingdomColor }) => `${$kingdomColor}18`};
  --kingdom-shadow: ${({ $kingdomColor }) => `${$kingdomColor}16`};

  width: min(1120px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 1.5rem 0 5rem;

  @media (max-width: 600px) {
    width: min(100% - 2rem, 1120px);
  }
`;

export const BackLink = styled.a`
  display: inline-flex;
  margin: 1.5rem 0;
  color: var(--kingdom-color);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const Hero = styled.section<{ $hasImage: boolean }>`
  display: grid;
  grid-template-columns: ${({ $hasImage }) =>
    $hasImage ? "minmax(260px, 0.9fr) 1.1fr" : "1fr"};
  overflow: hidden;
  border: 1px solid var(--kingdom-edge);
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow:
    0 12px 32px var(--kingdom-shadow),
    0 2px 6px #202b2608;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const Artwork = styled.div`
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  background: var(--kingdom-tint);
`;

export const ArtworkColumn = styled.div`
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 0.65rem;
  padding: 0.75rem;
`;

export const GalleryFrame = styled.div`
  --ig-primary-color: var(--kingdom-color);
  --ig-background-overlay: ${({ theme }) => `${theme.colors.ink}bb`};
  --ig-thumbnail-size: 76px;
  --ig-thumbnail-size-small: 64px;
  --ig-thumbnail-border-width: 2px;
  --ig-thumbnail-border-width-small: 2px;

  .image-gallery-content {
    background: transparent;
  }

  .image-gallery-slide .image-gallery-image {
    width: 100%;
    height: 340px;
    max-height: 340px;
    object-fit: cover;
    background: var(--kingdom-tint);
  }

  .image-gallery.fullscreen-modal .image-gallery-slide .image-gallery-image,
  .image-gallery-content.fullscreen .image-gallery-slide .image-gallery-image {
    width: 100%;
    height: calc(100vh - 100px);
    max-height: calc(100vh - 100px);
    object-fit: contain;
    background: transparent;
  }

  .image-gallery-thumbnail {
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: 9px;
  }

  .image-gallery-thumbnail.active,
  .image-gallery-thumbnail:focus,
  .image-gallery-thumbnail:hover {
    border: 2px solid var(--kingdom-color);
  }

  .image-gallery-thumbnail .image-gallery-thumbnail-image {
    height: 58px;
    object-fit: cover;
  }

  .image-gallery-icon {
    filter: drop-shadow(0 1px 5px #0008);
  }

  .image-gallery-index {
    border-radius: 8px;
    background: var(--ig-background-overlay);
  }

  @media (max-width: 700px) {
    .image-gallery-slide .image-gallery-image {
      height: 300px;
      max-height: 300px;
    }

    .image-gallery-thumbnail .image-gallery-thumbnail-image {
      height: 48px;
    }
  }
`;

export const HeroInfo = styled.div`
  align-self: center;
  padding: clamp(1.5rem, 5vw, 3.5rem);
`;

export const Eyebrow = styled.p`
  margin: 0 0 0.7rem;
  color: var(--kingdom-color);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const CommonName = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2.2rem, 5vw, 4rem);
  letter-spacing: -0.06em;
  line-height: 1;
`;

export const ScientificName = styled.p`
  margin: 0.8rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-family: Georgia, serif;
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-style: italic;
`;

export const Authorship = styled.p`
  margin: 0.35rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`;

export const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
`;

export const Badge = styled.span`
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: var(--kingdom-tint);
  color: var(--kingdom-color);
  font-size: 0.72rem;
  font-weight: 750;
`;

export const RepresentativeNote = styled.p`
  margin: 0.85rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.75rem;
  line-height: 1.45;
`;

export const Content = styled.div<{ $hasSidebar: boolean }>`
  display: grid;
  grid-template-areas: ${({ $hasSidebar }) =>
    $hasSidebar ? '"main sidebar"' : '"main"'};
  grid-template-columns: ${({ $hasSidebar }) =>
    $hasSidebar ? "minmax(0, 1fr) minmax(280px, 340px)" : "minmax(0, 1fr)"};
  align-items: start;
  gap: 1.25rem;
  margin-top: 2rem;

  @media (max-width: 820px) {
    grid-template-areas: ${({ $hasSidebar }) =>
      $hasSidebar ? '"sidebar" "main"' : '"main"'};
    grid-template-columns: 1fr;
  }
`;

export const MainColumn = styled.div`
  display: grid;
  grid-area: main;
  min-width: 0;
  gap: 1.25rem;
`;

export const SidebarColumn = styled.aside`
  display: grid;
  grid-area: sidebar;
  min-width: 0;
  gap: 1.25rem;
`;

export const Section = styled.section`
  padding: clamp(1.2rem, 3vw, 1.8rem);
  border: 1px solid var(--kingdom-edge);
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow:
    0 5px 20px var(--kingdom-shadow),
    0 1px 3px #202b2608;
`;

export const SectionTitle = styled.h2`
  margin: 0 0 1rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.25rem;
`;

export const FactGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin: 0;
`;

export const Fact = styled.div`
  min-width: 0;

  dt {
    margin-bottom: 0.25rem;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  dd {
    overflow-wrap: anywhere;
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
  }
`;

export const Lineage = styled.ol`
  position: relative;
  display: grid;
  gap: 0.15rem;
  margin: 0;
  padding: 0 0 0 0.65rem;
  list-style: none;

  &::before {
    position: absolute;
    top: 0.7rem;
    bottom: 0.7rem;
    left: 0;
    width: 1px;
    background: ${({ theme }) => theme.colors.line};
    content: "";
  }
`;

export const LineageItem = styled.li<{ $isCurrent: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: minmax(105px, 155px) minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem 1rem;
  min-height: 3rem;
  padding: 0.55rem 0.75rem 0.55rem 1.1rem;
  border-radius: 9px;
  background: ${({ $isCurrent }) =>
    $isCurrent ? "var(--kingdom-tint)" : "transparent"};

  &::before {
    position: absolute;
    top: 50%;
    left: -0.91rem;
    width: 0.55rem;
    height: 0.55rem;
    border: 2px solid
      ${({ $isCurrent, theme }) =>
        $isCurrent ? "var(--kingdom-color)" : theme.colors.line};
    border-radius: 50%;
    background: ${({ $isCurrent, theme }) =>
      $isCurrent ? "var(--kingdom-color)" : theme.colors.paper};
    content: "";
    transform: translateY(-50%);
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.25rem 0.75rem;
    padding-block: 0.65rem;
  }

  &:last-child {
    font-weight: 700;
  }

  small {
    color: ${({ $isCurrent, theme }) =>
      $isCurrent ? "var(--kingdom-color)" : theme.colors.muted};
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    overflow-wrap: anywhere;
    font-family: Georgia, serif;
    font-size: 0.95rem;
    font-weight: ${({ $isCurrent }) => ($isCurrent ? 700 : 600)};
    line-height: 1.35;

    @media (max-width: 560px) {
      grid-column: 1;
    }
  }

  span {
    display: block;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.72rem;
    font-weight: 400;

    @media (max-width: 560px) {
      grid-column: 1 / -1;
    }
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  th,
  td {
    padding: 0.7rem 0.6rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    text-align: left;
    vertical-align: top;
  }

  th {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.68rem;
    text-transform: uppercase;
  }

  td {
    line-height: 1.45;
  }

  em {
    font-family: Georgia, serif;
  }
`;

export const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.88rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
`;

export const EnrichmentGroup = styled.div`
  display: grid;
  gap: 0.75rem;

  & + & {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

export const EnrichmentTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
`;

export const EnrichmentText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.65;
  margin-bottom: 0.5rem;
`;

export const SoundList = styled.div`
  display: grid;
  gap: 0.85rem;
`;

export const SoundItem = styled.div`
  display: grid;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 12px;
  background: var(--kingdom-tint);
`;

export const WavePlayerLayout = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.75rem;
  min-width: 0;
`;

export const WavePlayButton = styled.button`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  align-self: start;
  margin-top: 4px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--kingdom-color);
  color: ${({ theme }) => theme.colors.paper};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--kingdom-color);
    outline-offset: 3px;
  }

  svg {
    width: 1rem;
    height: 1rem;
    fill: currentColor;
  }
`;

export const WavePlayerTrack = styled.div`
  display: grid;
  gap: 0.2rem;
  min-width: 0;
`;

export const Waveform = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--kingdom-color);
    outline-offset: 3px;
  }

  > span {
    flex: 1 1 3px;
    min-width: 2px;
    max-width: 4px;
    border-radius: 2px;
    background: var(--kingdom-color);
    opacity: 0.72;
  }
`;

export const WaveTime = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
`;

export const FallbackAudio = styled.audio`
  display: none;
`;

export const SourceLink = styled.a`
  color: var(--kingdom-color);
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const RetryButton = styled.button`
  justify-self: start;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--kingdom-edge);
  border-radius: 9px;
  background: var(--kingdom-tint);
  color: var(--kingdom-color);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
`;

export const Notice = styled.div<{ $error?: boolean }>`
  padding: 1.25rem;
  border: 1px solid
    ${({ $error, theme }) => ($error ? "#d27d65" : theme.colors.line)};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.paper};
  line-height: 1.6;
`;

export const Footer = styled.footer`
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
`;
