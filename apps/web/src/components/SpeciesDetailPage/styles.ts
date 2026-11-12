import styled from "styled-components";

export const Page = styled.main<{ $kingdomColor: string }>`
  --kingdom-color: ${({ $kingdomColor }) => $kingdomColor};
  --kingdom-tint: ${({ $kingdomColor }) => `${$kingdomColor}18`};
  --kingdom-edge: ${({ $kingdomColor }) => `${$kingdomColor}18`};
  --kingdom-shadow: ${({ $kingdomColor }) => `${$kingdomColor}16`};

  width: min(1240px, calc(100% - 4rem));
  margin: 0 auto;
  padding: 1.5rem 0 6rem;

  @media (max-width: 700px) {
    width: min(100% - 2rem, 1240px);
  }
`;

export const Hero = styled.section<{ $hasImage: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: ${({ $hasImage }) =>
    $hasImage ? "minmax(0, .95fr) minmax(0, 1.05fr)" : "1fr"};
  min-height: ${({ $hasImage }) => ($hasImage ? "420px" : "300px")};
  overflow: visible;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  /* border: 1px solid #fff9; */
  /* border-radius: 24px; */
  /* background:
    radial-gradient(ellipse at 92% 8%, var(--kingdom-tint), transparent 46%),
    ${({ theme }) => theme.colors.paper}; */
  /* background: ${({ theme }) => theme.colors.paper}; */

  /* box-shadow:
    0 20px 55px var(--kingdom-shadow),
    0 2px 8px #202b260a; */

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`;

export const Artwork = styled.div`
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  /* background: ${({ theme }) => theme.colors.paper}; */
`;

export const ArtworkColumn = styled.div`
  display: flex;
  min-width: 0;
  align-items: stretch;
  padding: 0.8rem 0 0.8rem 0.8rem;

  @media (max-width: 760px) {
    padding: 0.7rem 0.7rem 0;
  }
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
    height: 390px;
    max-height: 390px;
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

  .image-gallery-slide-wrapper {
    overflow: hidden;
    border-radius: 16px;
    background: linear-gradient(145deg, var(--kingdom-tint), #17231b);
  }

  .image-gallery-icon {
    filter: drop-shadow(0 1px 5px #0008);
  }

  .image-gallery-index {
    border-radius: 8px;
    background: var(--ig-background-overlay);
  }

  @media (max-width: 760px) {
    .image-gallery-slide .image-gallery-image {
      height: min(70vw, 390px);
      max-height: min(70vw, 390px);
      object-fit: cover;
    }

    .image-gallery-thumbnail .image-gallery-thumbnail-image {
      height: 52px;
    }
  }
`;

export const HeroInfo = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  align-self: center;
  justify-content: center;
  padding: clamp(2rem, 5vw, 4.5rem);

  @media (max-width: 760px) {
    padding: 1.8rem 1.5rem 2rem;
  }
`;

export const Eyebrow = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 1rem;
  color: var(--kingdom-color);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;

  &::before {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--kingdom-color);
    box-shadow: 0 0 0 4px var(--kingdom-tint);
    content: "";
  }
`;

export const CommonName = styled.h1`
  max-width: 12ch;
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.7rem, 5.2vw, 5rem);
  font-weight: 400;
  letter-spacing: -0.075em;
  line-height: 0.96;
  overflow-wrap: anywhere;
`;

export const ScientificName = styled.p`
  margin: 1rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-family: Georgia, serif;
  font-size: clamp(1.15rem, 2.2vw, 1.55rem);
  font-style: italic;
  overflow-wrap: anywhere;
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
  margin-top: 1.5rem;
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
  margin: 1rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
  a {
    color: var(--kingdom-color);
    text-decoration: none;
    font-weight: 700;
  }
`;

export const Content = styled.div<{ $hasSidebar: boolean }>`
  display: grid;
  grid-template-areas: ${({ $hasSidebar }) =>
    $hasSidebar ? '"main sidebar"' : '"main"'};
  grid-template-columns: ${({ $hasSidebar }) =>
    $hasSidebar ? "minmax(0, 1fr) minmax(280px, 340px)" : "minmax(0, 1fr)"};
  width: 100%;
  min-width: 0;
  align-items: start;
  gap: ${({ $hasSidebar }) => ($hasSidebar ? "1rem" : "0")};
  margin-top: 1.4rem;

  @media (max-width: 820px) {
    grid-template-areas: ${({ $hasSidebar }) =>
      $hasSidebar ? '"sidebar" "main"' : '"main"'};
    grid-template-columns: 1fr;
  }
`;

export const MainColumn = styled.div<{ $hasSidebar: boolean }>`
  display: grid;
  grid-area: main;
  grid-column: ${({ $hasSidebar }) => ($hasSidebar ? "1" : "1 / -1")};
  width: 100%;
  min-width: 0;
  gap: 1rem;
`;

export const SidebarColumn = styled.aside`
  display: grid;
  grid-area: sidebar;
  min-width: 0;
  gap: 1rem;
  @media (min-width: 821px) {
    border-left: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

export const Section = styled.section`
  min-width: 0;
  padding: clamp(1.25rem, 3vw, 1.9rem);
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  }
  /* border: 1px solid var(--kingdom-edge); */
  /* border-radius: 19px; */
  /* background: ${({ theme }) => theme.colors.paper}; */
  /* box-shadow:
    0 8px 26px var(--kingdom-shadow),
    0 1px 3px #202b2608; */
`;

export const SectionTitle = styled.h2`
  margin: 0 0 1.2rem;
  padding-left: 0.8rem;
  border-left: 3px solid var(--kingdom-color);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.025em;
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
  a {
    color: var(--kingdom-color);
    text-decoration: none;
    font-weight: 700;
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
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  table-layout: auto;

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

  @media (max-width: 640px) {
    display: block;

    thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      clip-path: inset(50%);
    }

    tbody {
      display: grid;
      gap: 0.75rem;
    }

    tr {
      display: grid;
      overflow: hidden;
      border: 1px solid ${({ theme }) => theme.colors.line};
      border-radius: 10px;
      background: ${({ theme }) => theme.colors.paper};
    }

    td {
      display: grid;
      grid-template-columns: minmax(6.5rem, 0.38fr) minmax(0, 1fr);
      gap: 0.65rem;
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid ${({ theme }) => theme.colors.line};
      overflow-wrap: anywhere;
    }

    td:last-child {
      border-bottom: 0;
    }

    td::before {
      color: ${({ theme }) => theme.colors.muted};
      content: attr(data-label);
      font-size: 0.66rem;
      font-weight: 750;
      text-transform: uppercase;
    }
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
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  }
  /* border-radius: 12px;
  background: var(--kingdom-tint); */
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
  background: var(--kingdom-color, ${({ theme }) => theme.colors.green});
  color: ${({ theme }) => theme.colors.paper};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--kingdom-color, ${({ theme }) => theme.colors.green});
    outline-offset: 3px;
  }

  svg {
    width: 1rem;
    height: 1rem;
    fill: currentColor;
  }
`;

export const WavePlayerTrack = styled.div`
  position: relative;
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
    outline: 2px solid var(--kingdom-color, ${({ theme }) => theme.colors.green});
    outline-offset: 3px;
  }

  > span {
    flex: 1 1 3px;
    min-width: 2px;
    max-width: 4px;
    border-radius: 2px;
    background: var(--kingdom-color, ${({ theme }) => theme.colors.green});
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
  display: block;
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  opacity: 0;
`;

export const SourceLink = styled.a`
  color: var(--kingdom-color);
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
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
  padding: 1.5rem;
  border: 1px solid
    ${({ $error, theme }) => ($error ? "#d27d6566" : theme.colors.line)};
  border-radius: 14px;
  background: ${({ $error }) => ($error ? "rgba(210, 125, 101, 0.08)" : "var(--kingdom-tint)")};
  color: ${({ $error, theme }) => ($error ? "#8B5A47" : theme.colors.ink)};
  line-height: 1.6;
  font-size: 0.95rem;
  
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  &::before {
    content: '⚠';
    font-size: 1.5rem;
    flex-shrink: 0;
    ${({ $error }) => !$error && `opacity: 0.5;`}
  }
`;

export const NoticeContent = styled.p`
  margin: 0;
  flex: 1;
`;

export const NoticeAction = styled.a`
  display: inline-flex;
  justify-content: center;
  padding: 0.6rem 1.2rem;
  margin-left: auto;
  border: 1px solid #d27d65;
  border-radius: 8px;
  background: #d27d65;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 140ms ease;
  white-space: nowrap;

  &:hover {
    background: #b35a43;
    border-color: #b35a43;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px #d27d6540;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 600px) {
    margin-left: 0;
    width: 100%;
    margin-top: 1rem;
  }
`;

export const Footer = styled.footer`
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
`;
