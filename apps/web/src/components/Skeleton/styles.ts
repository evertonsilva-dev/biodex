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
  background: ${({ $tone, theme }) => {
    if ($tone === 'forest') {
      return 'color-mix(in srgb, #304b3b 86%, #fff8eb)';
    }

    if ($tone === 'on-dark') {
      return 'rgba(255, 248, 235, 0.16)';
    }

    return `color-mix(in srgb, ${theme.colors.green} 9%, ${theme.colors.background})`;
  }};

  &::after {
    position: absolute;
    inset: 0;
    background: ${({ $tone, theme }) =>
      $tone === 'on-dark' || $tone === 'forest'
        ? 'linear-gradient(90deg, transparent, rgba(255, 248, 235, 0.28), transparent)'
        : `linear-gradient(90deg, transparent, color-mix(in srgb, ${theme.colors.paper} 68%, #d17c63), transparent)`};
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
