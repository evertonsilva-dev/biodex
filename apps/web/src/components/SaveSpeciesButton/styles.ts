import styled from 'styled-components';

export const SaveControl = styled.div<{ $variant: 'card' | 'detail' }>`
  position: relative;
  z-index: 4;
  flex: 0 0 auto;
  align-self: flex-start;
  margin-top: ${({ $variant }) => $variant === 'detail' ? '.7rem' : '0'};
  color: ${({ $variant }) => $variant === 'card' ? '#fff8eb' : 'var(--kingdom-color)'};
`;

export const SaveButton = styled.button`
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: .8;
  transition: opacity 160ms ease, transform 160ms ease;

  &:hover { opacity: 1; transform: scale(1.08); }
  &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
`;

export const Popover = styled.div`
  --collection-accent: var(--kingdom-color, ${({ theme }) => theme.colors.green});

  position: absolute;
  z-index: 5;
  top: calc(100% + .45rem);
  right: 0;
  width: min(17rem, calc(100vw - 3rem));
  padding: 1.1rem 1.2rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 12px 30px #202b261c;
  color: ${({ theme }) => theme.colors.ink};
  font-size: .84rem;

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: .75rem;
  }
  h3 {
    margin: 0 0 .55rem;
    color: var(--collection-accent);
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: 1.2rem;
    font-weight: 400;
  }
  button.close {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    margin: -.25rem -.35rem 0 0;
    padding: .25rem;
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.muted};
    cursor: pointer;
    &:hover { color: var(--collection-accent); }
    &:focus-visible { outline: 2px solid var(--collection-accent); outline-offset: 2px; }
  }
  label {
    display: flex;
    align-items: center;
    gap: .55rem;
    padding: .55rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    cursor: pointer;
  }
  input[type='checkbox'] { accent-color: var(--collection-accent); }
  form { display: flex; align-items: center; gap: .6rem; margin-top: .8rem; }
  input[type='text'] {
    min-width: 0;
    flex: 1;
    padding: .55rem .1rem;
    border: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.ink};
    font: inherit;
    &:focus { border-bottom: 2px solid var(--collection-accent); outline: 0; }
  }
  button {
    padding: .45rem 0;
    border: 0;
    border-bottom: 1px solid transparent;
    background: transparent;
    color: var(--collection-accent);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    &:hover { border-bottom-color: currentColor; }
  }
  p[role='alert'] { margin: .55rem 0 0; color: #a12f22; line-height: 1.4; }
  a {
    display: inline-block;
    margin-top: .7rem;
    color: var(--collection-accent);
    font-size: .78rem;
    font-weight: 700;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;
