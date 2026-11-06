import styled, { keyframes } from 'styled-components';

const orbit = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: .78; transform: scale(.9) rotate(-8deg); }
  50% { opacity: 1; transform: scale(1.08) rotate(8deg); }
`;

const travel = keyframes`
  from { transform: translateX(-110%); }
  to { transform: translateX(250%); }
`;

export const Page = styled.main`
  width: min(1200px, calc(100% - 3rem));
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem 0 5rem;
  color: ${({ theme }) => theme.colors.ink};

  @media (max-width: 600px) {
    width: min(100% - 2rem, 1200px);
    padding-top: 1.25rem;
  }
`;

export const Stage = styled.section`
  display: grid;
  min-height: min(62vh, 620px);
  justify-items: center;
  align-content: center;
  gap: 1.8rem;
  padding: 3.5rem 0;
  text-align: center;
`;

export const Orbit = styled.div`
  position: relative;
  display: grid;
  width: 8.5rem;
  height: 8.5rem;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 50%;
  animation: ${orbit} 12s linear infinite;

  &::before {
    position: absolute;
    inset: 0.75rem;
    border: 1px dashed ${({ theme }) => `${theme.colors.green}65`};
    border-radius: 50%;
    content: '';
  }

  &::after {
    position: absolute;
    top: 0.35rem;
    left: 50%;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    background: #da765b;
    content: '';
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Star = styled.span`
  color: ${({ theme }) => theme.colors.green};
  font-size: 3.2rem;
  line-height: 1;
  animation: ${pulse} 2.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Copy = styled.div`
  max-width: 36rem;

  p {
    margin: 0.75rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.95rem;
    line-height: 1.65;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 0.7rem !important;
  color: ${({ theme }) => theme.colors.green} !important;
  font-size: 0.72rem !important;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.highlightTitle};
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 400;
  letter-spacing: -0.075em;
  line-height: 0.98;
`;

export const ProgressTrack = styled.div`
  width: 10rem;
  height: 2px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.line};
`;

export const Progress = styled.div`
  width: 35%;
  height: 100%;
  background: ${({ theme }) => theme.colors.green};
  animation: ${travel} 1.8s ease-in-out infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    width: 60%;
    animation: none;
  }
`;
