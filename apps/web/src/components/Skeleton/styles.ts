import styled, { keyframes } from 'styled-components';
import type { SkeletonProps } from './types';

const shimmer = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

export const SkeletonBlock = styled.div<SkeletonProps>`
  position: relative;
  display: block;
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height};
  overflow: hidden;
  border-radius: ${({ $radius }) => $radius ?? '6px'};
  background: ${({ theme }) => `${theme.colors.line}80`};

  &::after {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      ${({ theme }) => `${theme.colors.paper}b8`},
      transparent
    );
    content: '';
    transform: translateX(-100%);
    animation: ${shimmer} 1.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;
