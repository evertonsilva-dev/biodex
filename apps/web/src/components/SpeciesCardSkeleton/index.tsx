import { Skeleton } from '../Skeleton';
import type { SpeciesCardSkeletonProps } from './types';
import {
  Artwork,
  ArtworkMeta,
  ArtworkShimmer,
  Card,
  SideLabel,
  SpecimenInfo,
} from './styles';

export function SpeciesCardSkeleton(_props: SpeciesCardSkeletonProps) {
  return (
    <Card aria-hidden="true">
      <Artwork>
        <ArtworkShimmer>
          <Skeleton $height="100%" $radius="inherit" $tone="forest" />
        </ArtworkShimmer>
        <ArtworkMeta>
          <Skeleton $width="38%" $height="0.55rem" $radius="999px" $tone="on-dark" />
          <Skeleton $width="24%" $height="0.55rem" $radius="999px" $tone="on-dark" />
        </ArtworkMeta>
        <SideLabel>
          <Skeleton $width="0.45rem" $height="4.25rem" $radius="999px" $tone="on-dark" />
        </SideLabel>
        <SpecimenInfo>
          <Skeleton $width="58%" $height="0.52rem" $tone="on-dark" />
          <Skeleton $width="82%" $height="1.25rem" $tone="on-dark" />
          <Skeleton $width="64%" $height="0.6rem" $tone="on-dark" />
        </SpecimenInfo>
      </Artwork>
    </Card>
  );
}
