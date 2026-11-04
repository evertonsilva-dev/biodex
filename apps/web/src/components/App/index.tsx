import { CatalogPage } from '../CatalogPage';
import { ErrorPage } from '../ErrorPage';
import { LandingPage } from '../LandingPage';
import { SpeciesDetailPage } from '../SpeciesDetailPage';
import { useAppRoute } from '../../hooks/useAppRoute';

export function App() {
  const route = useAppRoute();

  if (route.page === 'error') return <ErrorPage />;
  if (route.page === 'landing') return <LandingPage />;
  if (route.page === 'species') return <SpeciesDetailPage externalId={route.externalId} />;
  if (route.page === 'catalog') return <CatalogPage />;
  return <ErrorPage type="not-found" />;
}
