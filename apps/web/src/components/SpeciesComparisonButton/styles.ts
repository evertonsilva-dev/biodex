import styled from 'styled-components';

export const Button = styled.button<{
  $selected: boolean;
}>`
  position: relative;
  z-index: 2;
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  place-items: center;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--kingdom-color) 18%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--kingdom-color) ${({ $selected }) => ($selected ? '16%' : '8%')}, transparent);
  color: var(--kingdom-color);
  font: inherit;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, opacity 160ms ease, transform 160ms ease;

  &:hover {
    background: color-mix(in srgb, var(--kingdom-color) 16%, transparent);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--kingdom-color);
    outline-offset: 3px;
  }
`;
