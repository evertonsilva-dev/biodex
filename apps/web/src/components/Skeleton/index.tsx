import type { SkeletonProps } from './types';
import { SkeletonBlock } from './styles';

export function Skeleton({ $width, $height, $radius, $tone }: SkeletonProps) {
  return (
    <SkeletonBlock
      $width={$width}
      $height={$height}
      $radius={$radius}
      $tone={$tone}
      aria-hidden="true"
    />
  );
}
