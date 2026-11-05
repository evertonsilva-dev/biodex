import { TopBar } from '../TopBar';
import { Page, Hero, Eyebrow, Title, Description, Actions, ActionLink, Container } from './styles';
import type { ErrorPageProps, ErrorType } from './types';
import { useErrorPage } from '../../hooks/useErrorPage';

const errorContent: Record<ErrorType, { eyebrow: string; title: string; description: string }> = {
  'not-found': {
    eyebrow: 'Página não encontrada',
    title: '404',
    description: 'O endereço pode estar incorreto ou a página não existe mais. Volte ao catálogo para continuar explorando.',
  },
  catalog: {
    eyebrow: 'Erro ao carregar',
    title: 'Catálogo indisponível',
    description: 'Verifique sua conexão e tente novamente. Seus filtros continuam salvos no endereço.',
  },
  species: {
    eyebrow: 'Espécie não carregada',
    title: 'Ficha indisponível',
    description: 'O registro pode estar indisponível no momento. Você pode tentar novamente ou voltar ao catálogo.',
  },
  unexpected: {
    eyebrow: 'Algo não saiu como esperado',
    title: 'Erro inesperado',
    description: 'Ocorreu um erro na aplicação. Tente novamente ou volte ao catálogo.',
  },
};

export function ErrorPage({ type }: ErrorPageProps) {
  const { errorType, returnTo } = useErrorPage(type);
  const content = errorContent[errorType];

  return (
    <Page>
      <TopBar label="AVISO" />

      <Hero>
        <Container>
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <Title>{content.title}</Title>
          </div>
          <Description>{content.description}</Description>
          <Actions>
            {errorType !== 'not-found' && (
              <ActionLink $primary href={returnTo}>
                Tentar novamente
              </ActionLink>
            )}
            <ActionLink href="/catalog">Voltar ao catálogo</ActionLink>
          </Actions>
        </Container>
      </Hero>
    </Page>
  );
}
