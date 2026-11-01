import { Page, Panel, Logo, ErrorCode, Title, Description, Actions, ActionLink } from './styles';
import type { ErrorPageProps, ErrorType } from './types';
import { useErrorPage } from '../../hooks/useErrorPage';

const errorContent: Record<ErrorType, { title: string; description: string }> = {
  'not-found': {
    title: 'Página não encontrada',
    description: 'O endereço pode estar incorreto ou a página não existe mais.',
  },
  catalog: {
    title: 'Não foi possível carregar o catálogo',
    description: 'Verifique sua conexão e tente novamente. Seus filtros continuam salvos no endereço.',
  },
  species: {
    title: 'Não foi possível carregar esta espécie',
    description: 'O registro pode estar indisponível no momento. Você pode tentar novamente ou voltar ao catálogo.',
  },
  unexpected: {
    title: 'Algo não saiu como esperado',
    description: 'Ocorreu um erro inesperado. Tente novamente ou volte ao catálogo.',
  },
};

export function ErrorPage({ type }: ErrorPageProps) {
  const { errorType, returnTo } = useErrorPage(type);
  const content = errorContent[errorType];

  return (
    <Page>
      <Panel role="alert">
        <Logo href="/" aria-label="Biodex, início">bio<span>dex</span></Logo>
        <ErrorCode>Erro · Biodex</ErrorCode>
        <Title>{content.title}</Title>
        <Description>{content.description}</Description>
        <Actions>
          {errorType !== 'not-found' && (
            <ActionLink $primary href={returnTo}>Tentar novamente</ActionLink>
          )}
          <ActionLink href="/">Voltar ao catálogo</ActionLink>
        </Actions>
      </Panel>
    </Page>
  );
}
