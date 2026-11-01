import { SpeciesDetailContent } from "../SpeciesDetailContent";
import { SpeciesDetailSkeleton } from "../SpeciesDetailSkeleton";
import { useSpeciesDetailPage } from "../../hooks/useSpeciesDetailPage";
import { TopBar } from "../TopBar";
import type { SpeciesDetailPageProps } from "./types";
import { Notice, Page } from "./styles";

export function SpeciesDetailPage({ externalId }: SpeciesDetailPageProps) {
  const { species, isLoading, hasError } = useSpeciesDetailPage(externalId);

  return (
    <Page $kingdomColor={species?.kingdom?.color ?? "#3e7557"}>
      <TopBar
        label="FICHA TAXONÔMICA"
        kingdomColor={species?.kingdom?.color}
      />
      {isLoading && <SpeciesDetailSkeleton />}
      {hasError && (
        <Notice $error role="alert">
          Não foi possível carregar os detalhes desta espécie. Verifique a
          conexão com a API ou volte ao catálogo.
        </Notice>
      )}
      {species && <SpeciesDetailContent species={species} />}
    </Page>
  );
}
