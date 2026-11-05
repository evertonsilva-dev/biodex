import styled from "styled-components";

export const Page = styled.main`
  width: min(1200px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 2rem 0 5rem;
  color: #23332a;
  background: #f3efe4;

  @media (max-width: 600px) {
    width: min(100% - 2rem, 1200px);
    padding-top: 1.25rem;
  }
`;

export const Heading = styled.section`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 4.5rem 0 2.5rem;

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 400;
    letter-spacing: -0.075em;
    line-height: 0.96;
  }
  p {
    max-width: 34rem;
    margin: 0.75rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.65;
  }
  @media (max-width: 700px) {
    display: block;
    padding: 3rem 0 2rem;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 0.8rem !important;
  color: ${({ theme }) => theme.colors.green} !important;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const CreateForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 2rem;

  input {
    min-width: 0;
    width: min(24rem, 70%);
    padding: 0.8rem 0.25rem;
    border: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.ink};
    font: inherit;
    &:focus {
      border-bottom: 2px solid ${({ theme }) => theme.colors.green};
      outline: 0;
    }
  }
`;

export const Action = styled.button`
  padding: 0.6rem 0.2rem;
  border: 0;
  border-bottom: 1px solid transparent;
  border-radius: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.green};
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  &:hover:not(:disabled) {
    border-bottom-color: currentColor;
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const CollectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  column-gap: 2rem;
  row-gap: 3rem;
`;

export const CollectionCard = styled.article`
  min-width: 0;
  > header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }
  > header h2 {
    margin: 0 0 0.35rem;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: 1.35rem;
    font-weight: 400;
  }
  > header p {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
  }
`;

export const MenuWrapper = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

export const MenuButton = styled.button`
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.green};
  cursor: pointer;
  &:hover,
  &[aria-expanded="true"] {
    opacity: 0.7;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 2px;
  }
`;

export const MenuPopover = styled.div`
  position: absolute;
  z-index: 10;
  top: calc(100% + 0.25rem);
  right: 0;
  min-width: 8.5rem;
  padding: 0.35rem;
  background: #f3efe4;
  box-shadow: 0 10px 24px #202b2626;
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.55rem 0.6rem;
  border: 0;
  background: transparent;
  color: #a12f22;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  &:hover {
    background: #a12f2214;
  }
`;

export const DeckStage = styled.div`
  position: relative;
  height: 340px;
  margin: 1rem -0.5rem 0.65rem;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 50% 67%,
    ${({ theme }) => `${theme.colors.green}18`},
    transparent 68%
  );

  &:hover > div,
  &:focus-within > div {
    transform: translate(calc(-50% + var(--deck-spread-x)), -50%) rotate(0);
  }

  @media (max-width: 600px) {
    height: 300px;
  }
`;

export const DeckCard = styled.div<{
  $x: number;
  $y: number;
  $rotation: number;
  $z: number;
  $spreadX: number;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: ${({ $z }) => $z};
  --deck-spread-x: ${({ $spreadX }) => `${$spreadX}px`};
  width: 147px;
  height: 210px;
  transform: translate(
      calc(-50% + ${({ $x }) => $x}px),
      calc(-50% + ${({ $y }) => $y}px)
    )
    rotate(${({ $rotation }) => $rotation}deg);
  filter: drop-shadow(0 8px 9px #202b2633);
  transition:
    transform 480ms cubic-bezier(0.2, 0.75, 0.25, 1),
    filter 220ms ease;
  will-change: transform;

  .deck-card-face {
    width: 300px;
    height: 429px;
    transform: scale(0.49);
    transform-origin: top left;
    pointer-events: none;
  }

  @media (hover: hover) {
    &:hover {
      filter: drop-shadow(0 12px 12px #202b2640);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const DeckLink = styled.a`
  position: absolute;
  z-index: 3;
  inset: 0;
  border-radius: 15px;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }
`;

export const EmptyDeck = styled.div`
  display: grid;
  height: 100%;
  place-items: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.8rem;
  text-align: center;
`;

export const SpeciesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

export const InlineForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1.5rem;

  input {
    min-width: 0;
    width: min(24rem, 70%);
    padding: 0.65rem 0.25rem;
    border: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.ink};
    font: inherit;
    &:focus {
      border-bottom: 2px solid ${({ theme }) => theme.colors.green};
      outline: 0;
    }
  }
`;

export const CollectionIconActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.65rem;
`;

export const CollectionIconButton = styled.button<{ $danger?: boolean }>`
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ $danger, theme }) =>
    $danger ? "#a12f22" : theme.colors.green};
  cursor: pointer;
  transition: background-color 160ms ease;

  &:hover:not(:disabled) {
    background: ${({ $danger, theme }) =>
      $danger ? "#a12f2214" : `${theme.colors.green}14`};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const Notice = styled.p`
  margin: 1.5rem 0;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
`;

export const ErrorMessage = styled.p`
  color: #a12f22;
  font-size: 0.85rem;
`;
