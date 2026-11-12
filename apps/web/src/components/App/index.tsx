import { lazy, Suspense, useEffect } from 'react';
import { CatalogPage } from '../CatalogPage';
import { ErrorPage } from '../ErrorPage';
import { LandingPage } from '../LandingPage';
import { SpeciesDetailPage } from '../SpeciesDetailPage';
import { useAppRoute } from '../../hooks/useAppRoute';
import { AuthPage } from '../AuthPage';
import { ProfilePage } from '../ProfilePage';
import { useAuth } from '../../auth/AuthProvider';
import { LoadingScreen } from '../LoadingScreen';
import { SpeciesComparisonProvider } from '../../hooks/useSpeciesComparison';

const CollectionsPage = lazy(() =>
  import('../CollectionsPage').then(({ CollectionsPage: page }) => ({ default: page })),
);
const EditorialCollectionDetail = lazy(() =>
  import('../EditorialCollectionDetail').then(({ EditorialCollectionDetail: page }) => ({
    default: page,
  })),
);
const SpeciesComparisonPage = lazy(() =>
  import('../SpeciesComparisonPage').then(({ SpeciesComparisonPage: page }) => ({
    default: page,
  })),
);

export function App() {
  const route = useAppRoute();
  const { status } = useAuth();
  const isProtectedRoute = route.page === 'profile'
    || (route.page === 'collections' && route.collectionId !== 'shared');
  const returnTo = `${window.location.pathname}${window.location.search}`;

  useEffect(() => {
    if (!isProtectedRoute || status === 'loading' || status === 'authenticated') return;
    window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [isProtectedRoute, returnTo, status]);

  if (isProtectedRoute && status !== 'authenticated') {
    const isProfile = route.page === 'profile';
    const isCheckingSession = status === 'loading';
    return (
      <LoadingScreen
        label={isProfile ? 'PERFIL' : 'MINHAS COLEÇÕES'}
        items={isProfile
          ? [{ label: 'Catálogo', href: '/catalog' }, { label: 'Perfil' }]
          : [{ label: 'Catálogo', href: '/catalog' }, { label: 'Minhas coleções' }]}
        backHref="/catalog"
        backLabel="Voltar ao catálogo"
        title={isCheckingSession
          ? isProfile ? 'Preparando seu perfil' : 'Abrindo suas coleções'
          : 'Acesso necessário'}
        description={isCheckingSession
          ? 'Estamos conferindo sua sessão para continuar sua jornada pelo Biodex.'
          : 'Entre na sua conta para acessar seu perfil e suas coleções pessoais.'}
        busy={isCheckingSession}
      />
    );
  }

  let page;
  if (route.page === 'error') page = <ErrorPage />;
  else if (route.page === 'landing') page = <LandingPage />;
  else if (route.page === 'login') page = <AuthPage />;
  else if (route.page === 'profile') page = <ProfilePage />;
  else if (route.page === 'species') page = <SpeciesDetailPage externalId={route.externalId} />;
  else if (route.page === 'catalog') page = <CatalogPage />;
  else if (route.page === 'compare') {
    page = (
      <Suspense
        fallback={
          <LoadingScreen
            label="COMPARADOR DE ESPÉCIES"
            items={[
              { label: 'Catálogo', href: `/catalog${window.location.search}` },
              { label: 'Comparador' },
            ]}
            backHref={`/catalog${window.location.search}`}
            backLabel="Voltar ao catálogo"
            title="Preparando a comparação"
            description="Estamos reunindo os dados das espécies selecionadas."
          />
        }
      >
        <SpeciesComparisonPage />
      </Suspense>
    );
  }
  else if (route.page === 'collections') {
    page = (
      <Suspense
        fallback={
          <LoadingScreen
            label={route.collectionId === 'shared' ? 'COLEÇÃO COMPARTILHADA' : 'MINHAS COLEÇÕES'}
            items={route.collectionId === 'shared'
              ? [
                  { label: 'Catálogo', href: '/catalog' },
                  { label: 'Coleção compartilhada' },
                ]
              : [
                  { label: 'Catálogo', href: '/catalog' },
                  { label: 'Minhas coleções' },
                ]}
            backHref="/catalog"
            backLabel="Voltar ao catálogo"
            title={route.collectionId === 'shared'
              ? 'Abrindo a coleção compartilhada'
              : 'Abrindo suas coleções'}
            description="Estamos organizando as cartas para continuar sua exploração."
          />
        }
      >
        <CollectionsPage collectionId={route.collectionId} />
      </Suspense>
    );
  }
  else if (route.page === 'editorial-collection') {
    page = (
      <Suspense
        fallback={
          <LoadingScreen
            label="COLEÇÃO EDITORIAL"
            items={[
              { label: 'Catálogo', href: '/catalog' },
              { label: 'Coleções editoriais', href: '/#colecoes' },
              { label: 'Coleção editorial' },
            ]}
            backHref="/#colecoes"
            backLabel="Voltar às coleções"
            title="Preparando uma seleção especial"
            description="Estamos reunindo as cartas desta coleção editorial."
          />
        }
      >
        <EditorialCollectionDetail slug={route.slug} />
      </Suspense>
    );
  }
  else page = <ErrorPage type="not-found" />;

  return <SpeciesComparisonProvider>{page}</SpeciesComparisonProvider>;
}
