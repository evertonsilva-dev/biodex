import styled from 'styled-components';

export const Dropdown = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

export const MenuTrigger = styled.button<{ $account?: boolean }>`
  display: inline-flex;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.7rem 1rem;
  border: ${({ $account, theme }) => (
    $account ? '0' : `1px solid ${theme.colors.ink}30`
  )};
  border-radius: 999px;
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 180ms ease, color 180ms ease, transform 180ms ease, border-color 180ms ease;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: ${({ $account }) => ($account ? 'none' : 'translateY(-2px)')};
    border-color: ${({ $account, theme }) => (
      $account ? 'transparent' : theme.colors.green
    )};
    background: ${({ $account, theme }) => (
      $account ? 'transparent' : theme.colors.green
    )};
    color: ${({ $account, theme }) => (
      $account ? theme.colors.ink : theme.colors.paper
    )};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ink};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  .account-name {
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    padding: 0.55rem 0.7rem;
    .account-name { display: none; }
  }
`;

export const Avatar = styled.span`
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.paper};
  font-size: 0.68rem;
  font-weight: 800;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Menu = styled.div`
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.6rem);
  right: 0;
  width: min(17rem, calc(100vw - 2rem));
  padding: 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 0 14px 36px #202b261c;
`;

export const DropdownHeader = styled.div`
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  strong {
    overflow: hidden;
    color: ${({ theme }) => theme.colors.ink};
    font-size: 0.85rem;
    text-overflow: ellipsis;
  }

  span {
    overflow: hidden;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
    text-overflow: ellipsis;
  }
`;

const MenuItem = styled.a`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.75rem;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  font-size: 0.82rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: -2px;
  }
`;

export const MenuLink = styled(MenuItem)``;
export const DropdownButton = styled(MenuItem).attrs({ as: 'button' })``;

export const ErrorText = styled.p`
  position: absolute;
  top: calc(100% + 0.55rem);
  right: 0;
  z-index: 21;
  width: min(18rem, calc(100vw - 2rem));
  margin: 0;
  padding: 0.65rem 0.75rem;
  border: 1px solid #e3b4aa;
  border-radius: 0.6rem;
  background: #fff6f3;
  color: #a12f22;
  font-size: 0.75rem;
  line-height: 1.4;
  box-shadow: 0 8px 20px #202b2612;
`;
