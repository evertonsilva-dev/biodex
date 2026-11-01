import styled from 'styled-components';

export const Card = styled.article`
  overflow: hidden;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.paper};
`;

export const Artwork = styled.div`
  aspect-ratio: 1.15;
  padding: 1rem;
  background: ${({ theme }) => `${theme.colors.line}30`};
`;

export const CardBody = styled.div`
  display: grid;
  justify-items: start;
  gap: 0.65rem;
  padding: 1rem 1.1rem 1.2rem;
`;
