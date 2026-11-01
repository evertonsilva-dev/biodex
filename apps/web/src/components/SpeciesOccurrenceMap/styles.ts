import styled from 'styled-components';

export const MapFrame = styled.div`
  height: 220px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 12px;
  background: #e7e9e9;

  .leaflet-container {
    width: 100%;
    height: 100%;
    background: #e7e9e9;
    font-family: inherit;
  }

  .leaflet-control-attribution {
    max-width: calc(100% - 8px);
    font-size: 0.62rem;
  }
`;

export const MapNotice = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  line-height: 1.5;
`;
