import { Skeleton } from '../Skeleton';
import type { SpeciesCardSkeletonProps } from './types';
import { Artwork, Card, CardBody } from './styles';

export function SpeciesCardSkeleton(_props: SpeciesCardSkeletonProps) {
  return (
    <Card aria-hidden="true">
      <Artwork>
        <Skeleton $height="100%" $radius="12px" />
      </Artwork>
      <CardBody>
        <Skeleton $width="42%" $height="0.7rem" $radius="999px" />
        <Skeleton $width="78%" $height="1.45rem" />
        <Skeleton $width="58%" $height="0.9rem" />
        <Skeleton $width="92%" $height="0.72rem" />
        <Skeleton $width="66%" $height="0.72rem" />
      </CardBody>
    </Card>
  );
}
