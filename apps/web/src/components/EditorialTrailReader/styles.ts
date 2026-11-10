import styled from 'styled-components';

export const Reader = styled.section`
  display: grid;
  gap: 1.4rem;
  padding-top: 1.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;

export const ProgressHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.76rem;
`;

export const NavigationStatus = styled.span`
  color: ${({ theme }) => theme.colors.green};
  font-weight: 800;
`;

export const ProgressTrack = styled.div`
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.line};
`;

export const ProgressFill = styled.span<{ $progress: number }>`
  display: block;
  width: ${({ $progress }) => `${$progress}%`};
  height: 100%;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.green};
  transition: width 240ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const StepArticle = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 300px);
  align-items: center;
  gap: clamp(2rem, 7vw, 6rem);
  padding: clamp(1.25rem, 4vw, 3rem) 0;

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
  }
`;

export const StepCopy = styled.div`
  max-width: 45rem;
`;

export const StepEyebrow = styled.p`
  margin: 0 0 0.85rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
`;

export const StepHeading = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.highlightTitle};
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: 400;
  letter-spacing: -0.06em;
  line-height: 1.05;
`;

export const StepNarrative = styled.p`
  max-width: 42rem;
  margin: 1.1rem 0 1.2rem;
  color: ${({ theme }) => theme.colors.ink};
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  line-height: 1.75;
`;

export const SourceLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
  text-decoration: underline;
  text-decoration-color: ${({ theme }) => theme.colors.line};
  text-underline-offset: 0.2em;

  &:hover {
    color: ${({ theme }) => theme.colors.green};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }
`;

export const SpeciesPanel = styled.div`
  width: min(100%, 300px);
  margin: 0 auto;
`;

export const SaveAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0.35rem 0.7rem 0.35rem 0.9rem;
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.paper};
  font-size: 0.78rem;
  font-weight: 700;
`;

export const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  @media (max-width: 450px) {
    align-items: stretch;
    flex-direction: column-reverse;
  }
`;

export const NavigationButton = styled.button<{ $secondary?: boolean }>`
  display: inline-flex;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.7rem 1rem;
  border: 1px solid ${({ $secondary, theme }) =>
    $secondary ? theme.colors.line : theme.colors.green};
  border-radius: 999px;
  background: ${({ $secondary, theme }) =>
    $secondary ? 'transparent' : theme.colors.green};
  color: ${({ $secondary, theme }) =>
    $secondary ? theme.colors.ink : theme.colors.paper};
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 750;
  transition:
    background 160ms ease,
    color 160ms ease,
    opacity 160ms ease;

  &:hover:not(:disabled) {
    background: ${({ $secondary, theme }) =>
      $secondary ? `${theme.colors.green}12` : theme.colors.ink};
    color: ${({ $secondary, theme }) =>
      $secondary ? theme.colors.green : theme.colors.paper};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  @media (max-width: 450px) {
    width: 100%;
  }
`;

export const CompleteMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 0.9rem;
  background: ${({ theme }) => `${theme.colors.green}0c`};
  color: ${({ theme }) => theme.colors.ink};

  div {
    display: grid;
    gap: 0.25rem;
  }

  strong {
    color: ${({ theme }) => theme.colors.green};
    font-size: 0.9rem;
  }

  span,
  a {
    font-size: 0.78rem;
    line-height: 1.5;
  }

  a {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.green};
    font-weight: 800;
    text-decoration: none;
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }

  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const Status = styled.p`
  margin: 0;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.88rem;
  line-height: 1.6;
`;
