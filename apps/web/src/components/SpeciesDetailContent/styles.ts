import styled from "styled-components";

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.8rem;

  > div,
  > button {
    align-self: center;
    margin-top: 0;
  }
`;

export { Artwork, ArtworkColumn, Authorship, Badge, Badges, CommonName, Content, Eyebrow, Footer, GalleryFrame, Hero, HeroInfo, MainColumn, RepresentativeNote, SidebarColumn, ScientificName } from '../SpeciesDetailPage/styles';
