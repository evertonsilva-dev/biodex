import { Skeleton } from '../Skeleton';
import type { SpeciesDetailSkeletonProps } from './types';
import {
  SkeletonArtwork,
  SkeletonBadges,
  SkeletonColumn,
  SkeletonContent,
  SkeletonFact,
  SkeletonFacts,
  SkeletonHero,
  SkeletonHeroInfo,
  SkeletonSection,
} from './styles';

function SkeletonSectionContent({ factCount = 3 }: { factCount?: number }) {
  return (
    <SkeletonSection>
      <Skeleton $width="42%" $height="1.25rem" />
      <SkeletonFacts>
        {Array.from({ length: factCount }, (_, index) => (
          <SkeletonFact key={index}>
            <Skeleton $width="48%" $height="0.65rem" />
            <Skeleton $width={`${70 + (index % 2) * 15}%`} $height="0.9rem" />
          </SkeletonFact>
        ))}
      </SkeletonFacts>
    </SkeletonSection>
  );
}

export function SpeciesDetailSkeleton(_props: SpeciesDetailSkeletonProps) {
  return (
    <div role="status" aria-label="Carregando ficha da espécie" aria-busy="true">
      <Skeleton $width="9rem" $height="0.9rem" />
      <SkeletonHero>
        <SkeletonArtwork>
          <Skeleton $height="100%" $radius="12px" />
        </SkeletonArtwork>
        <SkeletonHeroInfo>
          <Skeleton $width="48%" $height="0.75rem" />
          <Skeleton $width="82%" $height="3rem" $radius="10px" />
          <Skeleton $width="65%" $height="1.4rem" $radius="8px" />
          <SkeletonBadges>
            <Skeleton $width="5rem" $height="1.8rem" $radius="999px" />
            <Skeleton $width="4.5rem" $height="1.8rem" $radius="999px" />
          </SkeletonBadges>
        </SkeletonHeroInfo>
      </SkeletonHero>
      <SkeletonContent>
        <SkeletonColumn>
          <SkeletonSectionContent />
          <SkeletonSectionContent factCount={2} />
          <SkeletonSectionContent factCount={2} />
        </SkeletonColumn>
        <SkeletonColumn>
          <SkeletonSectionContent factCount={2} />
          <SkeletonSectionContent factCount={2} />
        </SkeletonColumn>
      </SkeletonContent>
    </div>
  );
}
