import styled from 'styled-components';
import { MapFrame } from '../SpeciesOccurrenceMap/styles';

export { Empty, EnrichmentText, Section, SectionTitle, SoundItem, SoundList, SourceLink } from '../SpeciesDetailPage/styles';

export const SkeletonMap = styled(MapFrame)`
  border-color: transparent;
  background: transparent;
`;

export const SkeletonMapCaption = styled.div`
  display: grid;
  gap: 0.6rem;
  margin-top: 0.25rem;
`;
