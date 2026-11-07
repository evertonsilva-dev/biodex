import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { PageNavigation } from '../PageNavigation';
import { TopBar } from '../TopBar';
import {
  Avatar,
  EmptyMessage,
  Field,
  Page,
  ProfileContent,
  ProfileHeader,
  Value,
} from './styles';

export function ProfilePage() {
  const { user, status, isConfigured } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [user?.image]);

  return (
    <Page>
      <TopBar label="PERFIL" />
      <PageNavigation
        items={[
          { label: 'Catálogo', href: '/catalog' },
          { label: 'Perfil' },
        ]}
        backHref="/catalog"
        backLabel="Voltar ao catálogo"
      />
      <ProfileContent>
        {user ? (
          <>
            <ProfileHeader>
              <Avatar>
                {user.image && !imageFailed
                  ? <img src={user.image} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
                  : <span>{(user.name || user.email).slice(0, 1).toUpperCase()}</span>}
              </Avatar>
              <div>
                <p>Conta Biodex</p>
                <h1>{user.name || 'Seu perfil'}</h1>
              </div>
            </ProfileHeader>
            <Field>
              Nome
              <Value>{user.name || 'Não informado'}</Value>
            </Field>
            <Field>
              E-mail
              <Value>{user.email}</Value>
            </Field>
          </>
        ) : (
          <EmptyMessage>
            <p className="eyebrow">Sua conta</p>
            <h1>{status === 'loading' ? 'Carregando perfil…' : 'Entre na sua conta'}</h1>
            {status !== 'loading' && (
              <>
                <p className="description">
                  {isConfigured
                    ? 'Entre ou crie uma conta para acessar suas informações e coleções sincronizadas.'
                    : 'O login não está configurado neste ambiente.'}
                </p>
                {isConfigured && <a href="/login?returnTo=%2Fprofile">Entrar ou criar conta</a>}
              </>
            )}
          </EmptyMessage>
        )}
      </ProfileContent>
    </Page>
  );
}
