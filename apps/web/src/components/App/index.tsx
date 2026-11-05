import { lazy, Suspense } from 'react';
import { CatalogPage } from '../CatalogPage';
import { ErrorPage } from '../ErrorPage';
import { LandingPage } from '../LandingPage';
import { SpeciesDetailPage } from '../SpeciesDetailPage';
import { useAppRoute } from '../../hooks/useAppRoute';

const CollectionsPage = lazy(() =>
  import('../CollectionsPage').then(({ CollectionsPage: page }) => ({ default: page })),
);
const EditorialCollectionDetail = lazy(() =>
  import('../EditorialCollectionDetail').then(({ EditorialCollectionDetail: page }) => ({
    default: page,
  })),
);

export function App() {
  const route = useAppRoute();

  let page;
  if (route.page === 'error') page = <ErrorPage />;
  else if (route.page === 'landing') page = <LandingPage />;
  else if (route.page === 'species') page = <SpeciesDetailPage externalId={route.externalId} />;
  else if (route.page === 'catalog') page = <CatalogPage />;
  else if (route.page === 'collections') {
    page = (
      <Suspense fallback={<p role="status">Carregando coleções…</p>}>
        <CollectionsPage collectionId={route.collectionId} />
      </Suspense>
    );
  }
  else if (route.page === 'editorial-collection') {
    page = (
      <Suspense fallback={<p role="status">Carregando coleção…</p>}>
        <EditorialCollectionDetail slug={route.slug} />
      </Suspense>
    );
  }
  else page = <ErrorPage type="not-found" />;

  return page;
}
