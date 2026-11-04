import styled from "styled-components";

export const ModelChoices = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 0.65rem;
  margin-bottom: 1rem;
`;

export const ModelChoice = styled.button`
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.55rem;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  /* border-radius: 10px; */
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.3s ease-in-out,
    background 0.3s ease-in-out;
  &[aria-pressed="true"],
  &:hover {
    border-color: var(--kingdom-color);
    background: var(--kingdom-tint);
  }
`;

export const ModelThumbnail = styled.img`
  display: block;
  width: 76px;
  height: 54px;
  border-radius: 6px;
  background: var(--kingdom-tint);
  object-fit: cover;
`;

export const ModelDetails = styled.span`
  display: grid;
  min-width: 0;
  gap: 0.25rem;
`;

export const ModelHeading = styled.span`
  overflow: hidden;
  font-size: 0.82rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ModelMatch = styled.span`
  color: var(--kingdom-color);
  font-size: 0.67rem;
  font-weight: 750;
`;

export const Attribution = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
  line-height: 1.45;

  a {
    color: var(--kingdom-color);
    font-weight: 700;
    text-decoration: none;
  }
`;

export const EmbedFrame = styled.div`
  display: grid;
  gap: 0.6rem;

  iframe {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
    border-radius: 10px;
    background: var(--kingdom-tint);
  }
`;
