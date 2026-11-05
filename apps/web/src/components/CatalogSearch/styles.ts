import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
`;

export const Input = styled.input`
  min-width: 0;
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  transition: border-color 0.2s ease-in-out;
  &:focus {
    border-color: ${({ theme }) => theme.colors.green};
    border-width: 2px;
    outline: none;
  }
`;

export const Listbox = styled.ul`
  position: absolute;
  z-index: 20;
  top: 100%;
  right: 0;
  left: 0;
  margin: 0;
  padding: 0.35rem 0;
  background: #f3efe4;
  box-shadow: 0 14px 28px #202b2626;
  list-style: none;

  &[hidden] { display: none; }
`;

export const Option = styled.li<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.6rem 0.85rem;
  border-left: 3px solid ${({ $active, $color }) => ($active ? $color : 'transparent')};
  background: ${({ $active, $color }) => ($active ? `${$color}14` : 'transparent')};
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;

  strong { font-weight: 800; }
  em {
    min-width: 0;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.82rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Status = styled.p`
  margin: 0;
  padding: 0.6rem 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
`;
