import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { ConfirmDelete } from './ConfirmDelete';
import { MenuButton, MenuItem, MenuPopover, MenuWrapper } from './styles';

interface CollectionMenuProps {
  name: string;
  onDelete: () => void;
}

export function CollectionMenu({ name, onDelete }: CollectionMenuProps) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <MenuWrapper ref={wrapperRef}>
        <MenuButton
          type="button"
          aria-label={`Opções da coleção ${name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <MoreVertical size={20} aria-hidden="true" />
        </MenuButton>
        {open && (
          <MenuPopover role="menu">
            <MenuItem
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setShowConfirm(true);
              }}
            >
              <Trash2 size={15} aria-hidden="true" /> Excluir
            </MenuItem>
          </MenuPopover>
        )}
      </MenuWrapper>
      {showConfirm && (
        <ConfirmDelete
          name={name}
          onConfirm={() => {
            setShowConfirm(false);
            onDelete();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
