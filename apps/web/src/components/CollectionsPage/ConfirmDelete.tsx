import { useEffect, useRef } from 'react';

interface ConfirmDeleteProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDelete({
  name,
  onConfirm,
  onCancel,
}: ConfirmDeleteProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    cancelButtonRef.current?.focus();

    return () => previouslyFocusedRef.current?.focus();
  }, []);

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
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onCancel();
          return;
        }
        if (event.key !== 'Tab') return;

        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)',
        );
        const firstButton = buttons[0];
        const lastButton = buttons[buttons.length - 1];
        if (
          event.shiftKey &&
          firstButton &&
          document.activeElement === firstButton
        ) {
          event.preventDefault();
          lastButton?.focus();
        } else if (
          !event.shiftKey &&
          lastButton &&
          document.activeElement === lastButton
        ) {
          event.preventDefault();
          firstButton?.focus();
        }
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: '#f3efe4',
          padding: '1.5rem',
          borderRadius: '8px',
          maxWidth: '26rem',
          boxShadow: '0 20px 40px #202b2626',
        }}
      >
        <h2
          id="confirm-title"
          style={{
            margin: '0 0 .5rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#23332a',
          }}
        >
          Excluir “{name}”?
        </h2>
        <p
          style={{
            margin: '0 0 1.5rem',
            color: '#7a8e7d',
            fontSize: '.95rem',
            lineHeight: 1.5,
          }}
        >
          Esta ação não pode ser desfeita. A coleção e a lista de espécies
          salvas nela serão removidas.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '.75rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            ref={cancelButtonRef}
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
            onMouseEnter={(event) =>
              (event.currentTarget.style.borderBottomColor = '#7a8e7d')
            }
            onMouseLeave={(event) =>
              (event.currentTarget.style.borderBottomColor = 'transparent')
            }
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
            onMouseEnter={(event) =>
              (event.currentTarget.style.borderBottomColor = '#a12f22')
            }
            onMouseLeave={(event) =>
              (event.currentTarget.style.borderBottomColor = 'transparent')
            }
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
