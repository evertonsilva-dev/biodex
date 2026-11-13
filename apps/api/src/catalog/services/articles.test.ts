import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  parseCachedScientificArticles,
  searchOpenAlexArticles,
} from './articles.js';

function openAlexWork(index: number, doi = `10.1000/test-${index}`) {
  return {
    id: `https://openalex.org/W${index}`,
    doi: `https://doi.org/${doi}`,
    title: `Study ${index}`,
    publication_year: 2024,
    authorships: [
      { author: { display_name: 'First Author' } },
      { author: { display_name: 'Second Author' } },
      { author: { display_name: 'Third Author' } },
      { author: { display_name: 'Fourth Author' } },
    ],
    primary_location: {
      landing_page_url: `https://example.org/study-${index}`,
      source: { display_name: 'Journal of Biodiversity' },
    },
    open_access: {
      is_oa: true,
      oa_url: `https://example.org/open/study-${index}`,
    },
  };
}

test('OpenAlex article search bounds and normalizes relevant results', async (context) => {
  let requestUrl: URL | undefined;
  context.mock.method(globalThis, 'fetch', async (input: string | URL | Request) => {
    requestUrl = new URL(input.toString());
    return Response.json({
      results: [
        openAlexWork(1),
        openAlexWork(2, '10.1000/test-1'),
        openAlexWork(3),
        openAlexWork(4),
        openAlexWork(5),
        openAlexWork(6),
        openAlexWork(7),
      ],
    });
  });

  const articles = await searchOpenAlexArticles(
    ['Panthera leo', 'Leo panthera', 'Panthera leo'],
    'test-api-key',
  );

  assert.equal(articles.length, 5);
  assert.equal(articles[0].title, 'Study 1');
  assert.deepEqual(articles[0].authors, [
    'First Author',
    'Second Author',
    'Third Author',
  ]);
  assert.equal(articles[0].authorCount, 4);
  assert.equal(articles[0].year, 2024);
  assert.equal(articles[0].journal, 'Journal of Biodiversity');
  assert.equal(articles[0].doi, '10.1000/test-1');
  assert.equal(articles[0].openAccessUrl, 'https://example.org/open/study-1');
  assert.equal(articles[0].url, articles[0].openAccessUrl);
  assert.equal(articles[0].isOpenAccess, true);
  assert.equal(
    requestUrl?.searchParams.get('search.title_and_abstract'),
    '"Panthera leo" OR "Leo panthera"',
  );
  assert.equal(requestUrl?.searchParams.get('per_page'), '25');
  assert.equal(requestUrl?.searchParams.get('api_key'), 'test-api-key');
});

test('OpenAlex search reports provider rate limits', async (context) => {
  context.mock.method(
    globalThis,
    'fetch',
    async () => new Response('Rate limited', { status: 429 }),
  );

  await assert.rejects(
    searchOpenAlexArticles(['Panthera leo']),
    /OpenAlex responded with status 429/,
  );
});

test('invalid article cache data is rejected', () => {
  assert.throws(
    () => parseCachedScientificArticles([{ id: 'invalid' }]),
    /Scientific article cache contains invalid data/,
  );
});
