import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
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

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        background: '#202b2650',
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        style={{
          background: '#f3efe4',
          padding: '1.5rem',
          borderRadius: '8px',
          maxWidth: '26rem',
          boxShadow: '0 20px 40px #202b2626',
        }}
      >
        <h2 id="confirm-title" style={{ margin: '0 0 .5rem', fontSize: '1.1rem', fontWeight: 600, color: '#23332a' }}>
          Excluir "{name}"?
        </h2>
        <p style={{ margin: '0 0 1.5rem', color: '#7a8e7d', fontSize: '.95rem', lineHeight: 1.5 }}>
          Esta ação não pode ser desfeita. Você excluirá a coleção e todas as suas espécies serão removidas.
        </p>
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '.65rem 1rem',
              border: 0,
              borderBottom: '2px solid transparent',
              background: 'transparent',
              color: '#7a8e7d',
              font: 'inherit',
              fontSize: '.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'border-color 220ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#7a8e7d')}
            onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '.65rem 1rem',
              border: 0,
              borderBottom: '2px solid transparent',
              background: 'transparent',
              color: '#a12f22',
              font: 'inherit',
              fontSize: '.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'border-color 220ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#a12f22')}
            onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
