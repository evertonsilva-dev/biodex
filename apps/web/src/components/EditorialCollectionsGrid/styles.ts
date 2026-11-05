import styled from 'styled-components';

export const Section = styled.section`
  display: grid;
  gap: 1.8rem;
  padding: 5rem 0 6rem;
  scroll-margin-top: 2rem;
`;

export const SectionIntro = styled.p`
  margin: 0 0 .8rem;
  color: #79876c;
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .16em;
`;

export const Heading = styled.h2`
  margin: 0;
  color: #2a3c30;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 400;
  letter-spacing: -.06em;
  line-height: 1.05;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 1.2rem;
`;

export const EmptyState = styled.p`
  margin: 0;
  color: #687267;
  font-size: .9rem;
`;

export const ErrorState = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .75rem;
  color: #9f4935;
  font-size: .9rem;

  button {
    border: 0;
    background: none;
    color: #39513f;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
  }
`;
