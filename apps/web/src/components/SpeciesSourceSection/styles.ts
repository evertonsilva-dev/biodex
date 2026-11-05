import styled from 'styled-components';

export { Empty, Fact, FactGrid, Section, SectionTitle } from '../SpeciesDetailPage/styles';

export const SourceGroupTitle = styled.h3`
  margin: 1.25rem 0 0.75rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.76rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:first-child {
    margin-top: 0;
  }
`;
