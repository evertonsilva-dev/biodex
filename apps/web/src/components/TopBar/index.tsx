import type { TopBarProps } from './types';
import { AccountMenu } from '../AccountMenu';
import {
  Header,
  HeaderActions,
  HeaderNav,
  HeaderNavLink,
  Label,
  Logo,
} from './styles';

export function TopBar({ label, kingdomColor }: TopBarProps) {
  return (
    <Header $kingdomColor={kingdomColor}>
      <Logo href="/" aria-label="Biodex, início">
        bio<span>dex</span>
      </Logo>
      <HeaderActions>
        <HeaderNav aria-label="Navegação principal">
          <Label>{label}</Label>
          <HeaderNavLink href="/catalog">Catálogo</HeaderNavLink>
        </HeaderNav>
        <AccountMenu />
      </HeaderActions>
    </Header>
  );
}
