import { useSpeciesArticles } from "../../hooks/useSpeciesArticles";
import type { SpeciesArticlesProps } from "./types";
import {
  Empty,
  EnrichmentGroup,
  EnrichmentText,
  EnrichmentTitle,
  RetryButton,
  Section,
  SectionTitle,
  SourceLink,
} from "../SpeciesSupplementalData/styles";
import { Group } from "./styles";

function formatAuthors(authors: string[], authorCount: number): string {
  if (authors.length === 0) return "Autoria não informada";
  return `${authors.join(", ")}${authorCount > authors.length ? ", et al." : ""}`;
}

export function SpeciesArticles({
  speciesId,
  scientificName,
}: SpeciesArticlesProps) {
  const articlesQuery = useSpeciesArticles(speciesId);
  const articles = articlesQuery.data?.data;
  const openAlexSearchUrl = new URL("https://openalex.org/works");
  openAlexSearchUrl.searchParams.set("search", scientificName);

  return (
    <Section aria-labelledby="species-articles-title">
      <SectionTitle id="species-articles-title">
        Artigos científicos relacionados
      </SectionTitle>
      {articlesQuery.isPending && (
        <Empty role="status">Buscando artigos científicos no OpenAlex…</Empty>
      )}
      {articlesQuery.isError && !articles && (
        <>
          <Empty role="alert">
            Não foi possível consultar os artigos científicos agora.
          </Empty>
          <RetryButton
            type="button"
            disabled={articlesQuery.isFetching}
            onClick={() => {
              void articlesQuery.refetch();
            }}
          >
            {articlesQuery.isFetching
              ? "Tentando novamente…"
              : "Tentar novamente"}
          </RetryButton>
        </>
      )}
      {articles && articles.length === 0 && (
        <Empty>
          Nenhum artigo relacionado foi encontrado para esta espécie.
        </Empty>
      )}
      <Group>
        {articles?.map((article) => (
          <EnrichmentGroup key={article.id}>
            <EnrichmentTitle>{article.title}</EnrichmentTitle>
            <EnrichmentText>
              {formatAuthors(article.authors, article.authorCount)}
            </EnrichmentText>
            {(article.journal || article.year) && (
              <EnrichmentText>
                {[article.journal, article.year?.toLocaleString("pt-BR")]
                  .filter(Boolean)
                  .join(" · ")}
              </EnrichmentText>
            )}
            {article.isOpenAccess && (
              <EnrichmentText>Acesso aberto</EnrichmentText>
            )}
            <div>
              <SourceLink
                href={article.openAccessUrl ?? article.url}
                target="_blank"
                rel="noreferrer"
              >
                Acessar artigo
              </SourceLink>
              {article.doi && (
                <>
                  {" · "}
                  <SourceLink
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    DOI: {article.doi}
                  </SourceLink>
                </>
              )}
            </div>
          </EnrichmentGroup>
        ))}
      </Group>

      {articles && articles.length > 0 && (
        <SourceLink
          href={openAlexSearchUrl.toString()}
          target="_blank"
          rel="noreferrer"
        >
          Ver mais artigos no OpenAlex
        </SourceLink>
      )}
      <Empty>Referências e metadados fornecidos pelo OpenAlex.</Empty>
    </Section>
  );
}
