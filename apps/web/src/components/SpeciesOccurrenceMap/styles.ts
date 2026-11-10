import styled from 'styled-components';

export const MapFrame = styled.div<{ $fullscreen: boolean }>`
  box-sizing: border-box;
  position: ${({ $fullscreen }) => $fullscreen ? 'fixed' : 'relative'};
  inset: ${({ $fullscreen }) => $fullscreen ? '0' : 'auto'};
  z-index: ${({ $fullscreen }) => $fullscreen ? 1200 : 'auto'};
  width: ${({ $fullscreen }) => $fullscreen ? 'auto' : '100%'};
  height: ${({ $fullscreen }) => $fullscreen ? 'auto' : '220px'};
  overflow: hidden;
  border: ${({ $fullscreen, theme }) => $fullscreen ? '0' : `1px solid ${theme.colors.line}`};
  border-radius: ${({ $fullscreen }) => $fullscreen ? '0' : '12px'};
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

  .leaflet-bottom {
    bottom: ${({ $fullscreen }) => $fullscreen ? 'env(safe-area-inset-bottom)' : '0'};
  }

  .leaflet-right {
    right: ${({ $fullscreen }) => $fullscreen ? 'env(safe-area-inset-right)' : '0'};
  }
`;

export const MapAction = styled.button`
  position: absolute;
  top: max(0.7rem, env(safe-area-inset-top));
  right: max(0.7rem, env(safe-area-inset-right));
  z-index: 1000;
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  transition:
    color 160ms ease,
    opacity 160ms ease,
    transform 160ms ease;

  &:hover {
    transform: scale(1.08);
    color: ${({ theme }) => theme.colors.green};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }
`;

export const MapNotice = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  line-height: 1.5;
`;
