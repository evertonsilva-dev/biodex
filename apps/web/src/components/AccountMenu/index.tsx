import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import {
  Avatar,
  Dropdown,
  DropdownButton,
  DropdownHeader,
  ErrorText,
  Menu,
  MenuLink,
  MenuTrigger,
} from './styles';

function getReturnTo() {
  const { pathname, search, hash } = window.location;
  if (pathname === '/login' || pathname === '/profile') return '/profile';
  return `${pathname}${search}${hash}`;
}

function getInitials(name: string, email: string) {
  const parts = (name || email).trim().split(/[\s@._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
}

export function AccountMenu() {
  const { user, status, error, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImageFailed(false);
  }, [user?.image]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        rootRef.current?.querySelector('button')?.focus();
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const items = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      );
      if (items.length === 0) return;
      event.preventDefault();
      const activeIndex = items.findIndex((item) => item === document.activeElement);
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[nextIndex]?.focus();
    };
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  if (status === 'loading') {
    return <MenuTrigger type="button" disabled>Verificando…</MenuTrigger>;
  }

  if (!user) {
    const returnTo = encodeURIComponent(getReturnTo());
    return (
      <MenuTrigger as="a" href={`/login?returnTo=${returnTo}`}>
        Entrar
        <ArrowUpRight size={15} aria-hidden="true" />
      </MenuTrigger>
    );
  }

  return (
    <Dropdown ref={rootRef}>
      <MenuTrigger
        $account
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Menu da conta de ${user.name || user.email}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar aria-hidden="true">
          {user.image && !imageFailed ? (
            <img src={user.image} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
          ) : (
            <span>{getInitials(user.name, user.email)}</span>
          )}
        </Avatar>
        <span className="account-name">{user.name || user.email}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </MenuTrigger>
      {isOpen && (
        <Menu role="menu" aria-label="Menu da conta">
          <DropdownHeader>
            <strong>{user.name || 'Sua conta'}</strong>
            <span>{user.email}</span>
          </DropdownHeader>
          <MenuLink
            href="/collections"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <Bookmark size={16} aria-hidden="true" />
            Minhas coleções
          </MenuLink>
          <MenuLink
            href="/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <UserRound size={16} aria-hidden="true" />
            Meu perfil
          </MenuLink>
          <DropdownButton
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              void signOut();
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            Sair
          </DropdownButton>
        </Menu>
      )}
      {error && <ErrorText role="alert">{error}</ErrorText>}
    </Dropdown>
  );
}
