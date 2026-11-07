import { useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import { TopBar } from '../TopBar';
import { PageNavigation } from '../PageNavigation';
import { useAuth } from '../../auth/AuthProvider';
import {
  AuthLayout,
  Divider,
  ErrorMessage,
  Field,
  FormSection,
  GoogleAction,
  GoogleButton,
  Heading,
  InfoMessage,
  Input,
  Page,
  PrimaryButton,
  SwitchMode,
} from './styles';

function getSafeReturnTo() {
  const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
  if (!requestedPath || !requestedPath.startsWith('/') || requestedPath.startsWith('//') || requestedPath.includes('\\')) {
    return '/profile';
  }

  const target = new URL(requestedPath, window.location.origin);
  return target.origin === window.location.origin
    ? `${target.pathname}${target.search}${target.hash}`
    : '/profile';
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
      <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
    </svg>
  );
}

export function AuthPage() {
  const {
    user,
    status,
    error,
    isConfigured,
    isGoogleLoginEnabled,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
  } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const isSignUp = params.get('mode') === 'signup';
  const returnTo = getSafeReturnTo();
  const callbackURL = new URL(returnTo, window.location.origin).toString();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setNotice(null);
    try {
      if (isSignUp) {
        const signedIn = await signUpWithEmail(name.trim(), email.trim(), password);
        if (signedIn) {
          window.location.assign(returnTo);
        } else {
          setNotice('Conta criada. Verifique seu e-mail para concluir o acesso.');
        }
      } else {
        await signInWithEmail(email.trim(), password);
        window.location.assign(returnTo);
      }
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Não foi possível concluir a operação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function continueWithGoogle() {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signInWithGoogle(callbackURL);
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Não foi possível iniciar o login com Google.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const modeHref = `/login?mode=${isSignUp ? 'signin' : 'signup'}&returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <Page>
      <TopBar label="SUA CONTA" />
      <PageNavigation
        items={[
          { label: 'Catálogo', href: '/catalog' },
          { label: isSignUp ? 'Criar conta' : 'Entrar' },
        ]}
        backHref="/catalog"
        backLabel="Voltar ao catálogo"
      />
      <AuthLayout>
        <Heading>
          <p>{isSignUp ? 'Faça parte do Biodex' : 'Bem-vindo de volta'}</p>
          <h1>{isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
          <span>
            {isSignUp
              ? 'Salve suas espécies favoritas e organize suas próprias coleções.'
              : 'Acesse suas coleções pessoais e continue suas descobertas.'}
          </span>
        </Heading>

        <FormSection>
          {user ? (
            <InfoMessage>
              Você já está conectado como {user.name || user.email}.{' '}
              <a href="/profile">Acessar perfil</a>
            </InfoMessage>
          ) : (
            <>
              {!isConfigured && (
                <ErrorMessage role="alert">
                  O login não está configurado neste ambiente. Tente novamente mais tarde.
                </ErrorMessage>
              )}
              {(formError || error) && <ErrorMessage role="alert">{formError || error}</ErrorMessage>}
              {notice && <InfoMessage role="status">{notice}</InfoMessage>}
              {isGoogleLoginEnabled && (
                <>
                  <GoogleAction>
                    <GoogleButton
                      type="button"
                      onClick={() => void continueWithGoogle()}
                      disabled={!isConfigured || isSubmitting || status === 'loading'}
                    >
                      <GoogleMark />
                      Continuar com Google
                    </GoogleButton>
                  </GoogleAction>
                  <Divider><span>ou use seu e-mail</span></Divider>
                </>
              )}
              <form onSubmit={(event) => void submit(event)}>
                {isSignUp && (
                  <Field>
                    Nome
                    <Input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      required
                      maxLength={100}
                    />
                  </Field>
                )}
                <Field>
                  E-mail
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  Senha
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    minLength={8}
                  />
                </Field>
                <PrimaryButton
                  type="submit"
                  disabled={!isConfigured || isSubmitting || status === 'loading'}
                >
                  {isSubmitting ? (
                    <LoaderCircle size={17} aria-hidden="true" />
                  ) : isSignUp ? (
                    <UserPlus size={17} aria-hidden="true" />
                  ) : (
                    <LogIn size={17} aria-hidden="true" />
                  )}
                  {isSubmitting ? 'Aguarde…' : isSignUp ? 'Criar conta' : 'Entrar'}
                </PrimaryButton>
              </form>
              <SwitchMode>
                {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
                <a href={modeHref}>{isSignUp ? 'Entrar' : 'Criar conta'}</a>
              </SwitchMode>
            </>
          )}
        </FormSection>
      </AuthLayout>
    </Page>
  );
}
