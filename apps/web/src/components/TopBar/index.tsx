import type { TopBarProps } from './types';
import { Header, HeaderNav, HeaderNavLink, Label, Logo } from './styles';

export function TopBar({ label, kingdomColor }: TopBarProps) {
  return (
    <Header $kingdomColor={kingdomColor}>
      <Logo href="/" aria-label="Biodex, início">
        bio<span>dex</span>
      </Logo>
      <HeaderNav aria-label="Navegação principal">
        <Label>{label}</Label>
        {' · '}
        <HeaderNavLink href="/collections">Coleções</HeaderNavLink>
      </HeaderNav>
    </Header>
  );
}
