import { SpeciesDetailContent } from "../SpeciesDetailContent";
import { SpeciesDetailSkeleton } from "../SpeciesDetailSkeleton";
import { useSpeciesDetailPage } from "../../hooks/useSpeciesDetailPage";
import { TopBar } from "../TopBar";
import { PageNavigation } from "../PageNavigation";
import type { SpeciesDetailPageProps } from "./types";
import { Notice, Page, NoticeContent, NoticeAction } from "./styles";

export function SpeciesDetailPage({ externalId }: SpeciesDetailPageProps) {
  const { species, isLoading, hasError } = useSpeciesDetailPage(externalId);

  return (
    <Page $kingdomColor={species?.kingdom?.color ?? "#3e7557"}>
      <TopBar
        label="FICHA TAXONÔMICA"
        kingdomColor={species?.kingdom?.color}
      />
      <PageNavigation
        items={[
          { label: "Catálogo", href: `/catalog${window.location.search}` },
          { label: species?.commonName || "Ficha da espécie" },
        ]}
        backHref={`/catalog${window.location.search}`}
        backLabel="Voltar ao catálogo"
        accentColor={species?.kingdom?.color ?? "#3e7557"}
      />
      {isLoading && <SpeciesDetailSkeleton />}
      {hasError && (
        <Notice $error role="alert">
          <NoticeContent>
            Não foi possível carregar os detalhes desta espécie. O registro pode estar indisponível ou ocorreu um erro de conexão. Você pode tentar novamente ou voltar ao catálogo para continuar explorando.
          </NoticeContent>
          <NoticeAction href="/catalog">
            Voltar ao catálogo
          </NoticeAction>
        </Notice>
      )}
      {species && <SpeciesDetailContent species={species} />}
    </Page>
  );
}
