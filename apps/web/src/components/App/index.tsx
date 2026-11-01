import { CatalogPage } from '../CatalogPage';
import { ErrorPage } from '../ErrorPage';
import { SpeciesDetailPage } from '../SpeciesDetailPage';
import { useAppRoute } from '../../hooks/useAppRoute';

export function App() {
  const route = useAppRoute();

  if (route.page === 'error') return <ErrorPage />;
  if (route.page === 'species') return <SpeciesDetailPage externalId={route.externalId} />;
  if (route.page === 'catalog') return <CatalogPage />;
  return <ErrorPage type="not-found" />;
}
