import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findCommonsImage, findCommonsRepresentative, findGbifImage } from './images.js';

function commonsPage(
  index: number,
  title: string,
  description: string,
  categories = '',
) {
  const file = title.replaceAll(' ', '_');
  return {
    index,
    title: `File:${title}`,
    imageinfo: [{
      mime: 'image/jpeg',
      thumburl: `https://upload.wikimedia.org/thumb/${file}`,
      url: `https://upload.wikimedia.org/full/${file}`,
      descriptionurl: `https://commons.wikimedia.org/wiki/File:${file}`,
      extmetadata: {
        LicenseShortName: { value: 'CC BY-SA 4.0' },
        Artist: { value: 'Test photographer' },
        ObjectName: { value: title },
        ImageDescription: { value: description },
        Categories: { value: categories },
      },
    }],
  };
}

function mockCommonsSearch(
  mock: { method: (object: object, method: string, implementation: (...args: never[]) => unknown) => unknown },
  pages: ReturnType<typeof commonsPage>[],
): void {
  mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
    query: { pages: Object.fromEntries(pages.map((page) => [page.index, page])) },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
}

test('Commons species search prefers a photographic depiction over related artwork', async (context) => {
  mockCommonsSearch(context.mock, [
    commonsPage(1, 'Panthera leo skull', 'Skull of Panthera leo', 'Panthera leo'),
    commonsPage(2, 'Painting of Panthera leo', 'Illustration of Panthera leo'),
    commonsPage(3, 'Panthera leo in the wild', 'Wild lion resting in grass'),
    commonsPage(4, 'Lion portrait', 'Portrait of Panthera leo in its habitat'),
  ]);

  const image = await findCommonsImage('Panthera leo', { exactName: 'Panthera leo' });

  assert.equal(image?.url, 'https://upload.wikimedia.org/thumb/Panthera_leo_in_the_wild');
  assert.equal(image?.isRepresentative, false);
});

test('Commons search does not accept a taxon name found only in categories', async (context) => {
  mockCommonsSearch(context.mock, [
    commonsPage(
      1,
      'Unrelated landscape',
      'A landscape photograph with no animal in frame',
      'Panthera leo',
    ),
  ]);

  const image = await findCommonsImage('Panthera leo', { exactName: 'Panthera leo' });

  assert.equal(image, null);
});

test('higher-taxonomy fallback starts with genus and marks its image representative', async (context) => {
  const requests: string[] = [];
  context.mock.method(globalThis, 'fetch', async (input: string | URL | Request) => {
    const url = new URL(input.toString());
    requests.push(`${url.hostname}${url.pathname}?${url.searchParams.toString()}`);
    if (url.hostname === 'api.inaturalist.org') {
      return Response.json({
        results: [{
          id: 123,
          name: 'Panthera',
          rank: 'genus',
          is_active: true,
          default_photo: {
            id: 456,
            license_code: 'cc-by',
            url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/456/medium.jpg',
          },
        }],
      });
    }
    throw new Error(`Unexpected request: ${url.toString()}`);
  });

  const image = await findCommonsRepresentative({
    genus: 'Panthera',
    family: 'Felidae',
    taxon_order: 'Carnivora',
    taxon_class: 'Mammalia',
    phylum: 'Chordata',
    kingdom: 'Animalia',
    is_virus: false,
  });

  assert.equal(requests.length, 1);
  assert.match(requests[0], /q=Panthera/);
  assert.equal(image?.isRepresentative, true);
  assert.equal(image?.representativeRank, 'genus');
  assert.equal(image?.representativeTaxonName, 'Panthera');
});

test('GBIF species matching is constrained by the catalog taxon hierarchy', async (context) => {
  const requests: URL[] = [];
  context.mock.method(globalThis, 'fetch', async (input: string | URL | Request) => {
    const url = new URL(input.toString());
    requests.push(url);
    if (url.pathname === '/v1/species/match') {
      return Response.json({
        rank: 'SPECIES',
        status: 'ACCEPTED',
        canonicalName: 'Panthera leo',
        speciesKey: 5219404,
      });
    }
    if (url.pathname === '/v1/occurrence/search') {
      return Response.json({
        results: [{
          key: 123,
          species: 'Panthera leo',
          media: [{
            type: 'StillImage',
            identifier: 'https://example.org/lion.jpg',
            license: 'https://creativecommons.org/licenses/by/4.0/',
            creator: 'Photographer',
          }],
        }],
      });
    }
    throw new Error(`Unexpected request: ${url.toString()}`);
  });

  const image = await findGbifImage('Panthera leo', {
    kingdom: 'Animalia',
    phylum: 'Chordata',
    taxon_class: 'Mammalia',
    taxon_order: 'Carnivora',
    family: 'Felidae',
    genus: 'Panthera',
    is_virus: false,
  });

  const matchUrl = requests.find((url) => url.pathname === '/v1/species/match');
  assert.equal(matchUrl?.searchParams.get('kingdom'), 'Animalia');
  assert.equal(matchUrl?.searchParams.get('family'), 'Felidae');
  assert.equal(matchUrl?.searchParams.get('genus'), 'Panthera');
  assert.equal(image?.url, 'https://example.org/lion.jpg');
});
