import type { TopBarProps } from './types';
import { Header, Label, Logo } from './styles';

export function TopBar({ label, kingdomColor }: TopBarProps) {
  return (
    <Header $kingdomColor={kingdomColor}>
      <Logo href="/" aria-label="Biodex, início">
        bio<span>dex</span>
      </Logo>
      <Label>{label}</Label>
    </Header>
  );
}
