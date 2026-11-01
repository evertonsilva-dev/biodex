import type { SkeletonProps } from './types';
import { SkeletonBlock } from './styles';

export function Skeleton({ $width, $height, $radius }: SkeletonProps) {
  return (
    <SkeletonBlock
      $width={$width}
      $height={$height}
      $radius={$radius}
      aria-hidden="true"
    />
  );
}
