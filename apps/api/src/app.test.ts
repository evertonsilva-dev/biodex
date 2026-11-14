import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from './app.js';

const editorialCollection = {
  id: 'editorial-1',
  slug: 'gigantes-da-vida',
  title: 'Gigantes da vida',
  description: 'Espécies de grande porte.',
  introduction: 'Quatro espécies de ambientes diferentes.',
  featuredImageUrl: null,
  speciesIds: ['KF8T'],
  steps: [],
  order: 1,
};
const userCollection = {
  id: 'a7e8f318-3342-4efe-aab2-a24d9d3e9881',
  name: 'Aves',
  speciesIds: ['KF8T'],
};
const photoSuggestion = {
  id: '1b9f4f31-d4f4-4c7f-a54d-eeb2d8afcce3',
  speciesId: 'KF8T',
  scientificName: 'Panthera leo',
  photo: {
    url: 'https://example.org/lion.jpg',
    source: 'GBIF',
    attribution: 'Photographer',
    license: 'CC BY',
    referenceUrl: 'https://example.org/record',
  },
  status: 'pending' as const,
  submittedBy: 'test-user',
  reviewedBy: null,
  reviewedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const userProfile = {
  birthDate: '1990-04-15',
  profession: 'Bióloga',
  cpfLastFour: '1234',
  professionalCouncil: 'CRBio-01',
  professionalRegistrationNumber: '12345',
  professionalRegistrationStatus: 'pending' as const,
  registrationVerifiedAt: null,
};

const app = createApp({
  catalog: {
    species: async (context) => {
      if (context.query.fail === 'true') {
        context.throw(400, 'Invalid test request.');
      }
      context.body = { data: [{ id: 'test-species' }] };
    },
    suggestions: async (context) => {
      context.body = { data: [] };
    },
    speciesDetails: async (context) => {
      context.body = { data: { id: context.params.id } };
    },
    speciesEnrichment: async (context) => {
      context.body = { data: { id: context.params.id, enrichment: true } };
    },
    speciesArticles: async (context) => {
      context.body = { data: [{ id: context.params.id, title: 'Test article' }] };
    },
    kingdoms: async (context) => {
      context.body = { data: [] };
    },
    facets: async (context) => {
      context.body = { data: [] };
    },
    image: async (context) => {
      context.body = { data: null };
    },
  },
  editorialCollections: {
    getAll: async () => [editorialCollection],
    getBySlug: async (slug) => slug === editorialCollection.slug ? editorialCollection : null,
  },
  userCollections: {
    getAll: async (ownerId) => ownerId === 'test-user' ? [userCollection] : [],
    create: async (ownerId, name, speciesIds) => ({
      ...userCollection,
      id: ownerId,
      name,
      speciesIds,
    }),
    import: async () => {},
    update: async (ownerId, id, name, speciesIds) => ({
      ...userCollection,
      id: ownerId === 'test-user' ? id : '',
      name,
      speciesIds,
    }),
    delete: async (ownerId) => ownerId === 'test-user',
  },
  userAccess: {
    getCurrentAccount: async (userId) => ({
      userId,
      role: userId === 'test-admin' ? 'admin' : userId === 'test-root' ? 'root' : 'user',
    }),
    getProfile: async () => userProfile,
    updateProfile: async () => userProfile,
    reviewProfessionalRegistration: async () => {},
    listUsers: async () => [],
    setRole: async () => {},
  },
  editorialContent: {
    listForAccount: async () => [],
    create: async () => {
      throw new Error('Not used in this test.');
    },
    update: async () => null,
    delete: async () => false,
  },
  photoSuggestions: {
    submit: async () => {
      throw new Error('Not used in this test.');
    },
    listMine: async () => [],
    getMineForSpecies: async (userId, speciesId) => (
      userId === 'test-user' && speciesId === 'KF8T' ? photoSuggestion : null
    ),
    listPending: async () => [],
    review: async () => null,
  },
  verifyAccessToken: async (token) => (
    token === 'valid-token'
      ? 'test-user'
      : token === 'admin-token'
        ? 'test-admin'
        : token === 'root-token'
          ? 'test-root'
          : null
  ),
  healthCheck: async () => true,
  config: { corsOrigins: ['http://localhost:5173'] },
});

test('Express app preserves health, catalog, CORS, and error responses', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not bind to a TCP port.');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok' });

    const catalog = await fetch(`${baseUrl}/api/catalog/species`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(catalog.status, 200);
    assert.equal(catalog.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.deepEqual(await catalog.json(), { data: [{ id: 'test-species' }] });

    const suggestions = await fetch(`${baseUrl}/api/catalog/suggestions?q=one`);
    assert.equal(suggestions.status, 200);
    assert.deepEqual(await suggestions.json(), { data: [] });

    const speciesArticles = await fetch(`${baseUrl}/api/catalog/species/test-species/articles`);
    assert.equal(speciesArticles.status, 200);
    assert.deepEqual(await speciesArticles.json(), {
      data: [{ id: 'test-species', title: 'Test article' }],
    });

    const editorialCollections = await fetch(`${baseUrl}/api/editorial-collections`);
    assert.equal(editorialCollections.status, 200);
    assert.deepEqual(await editorialCollections.json(), { data: [editorialCollection] });

    const editorialCollectionDetail = await fetch(
      `${baseUrl}/api/editorial-collections/${editorialCollection.slug}`,
    );
    assert.equal(editorialCollectionDetail.status, 200);
    assert.deepEqual(await editorialCollectionDetail.json(), { data: editorialCollection });

    const unauthenticatedCollections = await fetch(`${baseUrl}/api/collections`);
    assert.equal(unauthenticatedCollections.status, 401);
    assert.deepEqual((await unauthenticatedCollections.json()).error, {
      status: 401,
      name: 'ApplicationError',
      message: 'É necessário entrar para acessar as coleções.',
    });

    const userCollections = await fetch(`${baseUrl}/api/collections`, {
      headers: { Authorization: 'Bearer valid-token' },
    });
    assert.equal(userCollections.status, 200);
    assert.deepEqual(await userCollections.json(), { data: [userCollection] });

    const createdUserCollection = await fetch(`${baseUrl}/api/collections`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Mamíferos', speciesIds: ['KF8T'] }),
    });
    assert.equal(createdUserCollection.status, 201);
    assert.deepEqual((await createdUserCollection.json()).data, {
      ...userCollection,
      id: 'test-user',
      name: 'Mamíferos',
    });

    const importedUserCollections = await fetch(`${baseUrl}/api/collections/import`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collections: [{ ...userCollection, speciesIds: ['KF8T'] }],
      }),
    });
    assert.equal(importedUserCollections.status, 200);
    assert.deepEqual(await importedUserCollections.json(), {
      data: { imported: true },
    });

    const updatedUserCollection = await fetch(
      `${baseUrl}/api/collections/${userCollection.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Aves atualizadas', speciesIds: [] }),
      },
    );
    assert.equal(updatedUserCollection.status, 200);
    assert.deepEqual((await updatedUserCollection.json()).data, {
      ...userCollection,
      name: 'Aves atualizadas',
      speciesIds: [],
    });

    const deletedUserCollection = await fetch(
      `${baseUrl}/api/collections/${userCollection.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: 'Bearer valid-token' },
      },
    );
    assert.equal(deletedUserCollection.status, 200);
    assert.deepEqual(await deletedUserCollection.json(), {
      data: { deleted: true },
    });

    const unauthenticatedContributions = await fetch(`${baseUrl}/api/contributions/me`);
    assert.equal(unauthenticatedContributions.status, 401);

    const currentAccount = await fetch(`${baseUrl}/api/contributions/me`, {
      headers: { Authorization: 'Bearer valid-token' },
    });
    assert.equal(currentAccount.status, 200);
    assert.deepEqual(await currentAccount.json(), {
      data: { userId: 'test-user', role: 'user' },
    });

    const profile = await fetch(`${baseUrl}/api/contributions/profile`, {
      headers: { Authorization: 'Bearer valid-token' },
    });
    assert.equal(profile.status, 200);
    assert.deepEqual(await profile.json(), { data: userProfile });

    const invalidProfile = await fetch(`${baseUrl}/api/contributions/profile`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate: '2099-02-31',
        profession: 'Bióloga',
        professionalCouncil: '',
        professionalRegistrationNumber: '',
      }),
    });
    assert.equal(invalidProfile.status, 400);

    const deniedRegistrationReview = await fetch(
      `${baseUrl}/api/contributions/users/test-user/professional-registration`,
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' }),
      },
    );
    assert.equal(deniedRegistrationReview.status, 403);

    const currentSpeciesSuggestion = await fetch(
      `${baseUrl}/api/contributions/photo-suggestions/species/KF8T`,
      { headers: { Authorization: 'Bearer valid-token' } },
    );
    assert.equal(currentSpeciesSuggestion.status, 200);
    assert.deepEqual(await currentSpeciesSuggestion.json(), {
      data: photoSuggestion,
    });

    const deniedUserList = await fetch(`${baseUrl}/api/contributions/users`, {
      headers: { Authorization: 'Bearer valid-token' },
    });
    assert.equal(deniedUserList.status, 403);

    const deniedEditorialManagement = await fetch(
      `${baseUrl}/api/contributions/editorial-content`,
      { headers: { Authorization: 'Bearer valid-token' } },
    );
    assert.equal(deniedEditorialManagement.status, 403);

    const deniedAdminGrant = await fetch(
      `${baseUrl}/api/contributions/users/test-user/role`,
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      },
    );
    assert.equal(deniedAdminGrant.status, 403);

    const adminUsers = await fetch(`${baseUrl}/api/contributions/users`, {
      headers: { Authorization: 'Bearer admin-token' },
    });
    assert.equal(adminUsers.status, 200);

    const rootAdminGrant = await fetch(
      `${baseUrl}/api/contributions/users/test-user/role`,
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer root-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      },
    );
    assert.equal(rootAdminGrant.status, 200);
    assert.deepEqual(await rootAdminGrant.json(), {
      data: { userId: 'test-user', role: 'admin' },
    });

    const missingEditorialCollection = await fetch(
      `${baseUrl}/api/editorial-collections/nao-existe`,
    );
    assert.equal(missingEditorialCollection.status, 404);
    assert.deepEqual((await missingEditorialCollection.json()).error, {
      status: 404,
      name: 'ApplicationError',
      message: 'Coleção não encontrada.',
    });

    const missing = await fetch(`${baseUrl}/api/unknown`);
    assert.equal(missing.status, 404);
    assert.deepEqual((await missing.json()).error, {
      status: 404,
      name: 'NotFoundError',
      message: 'Not found.',
    });

    const invalid = await fetch(`${baseUrl}/api/catalog/species?fail=true`);
    assert.equal(invalid.status, 400);
    assert.deepEqual((await invalid.json()).error, {
      status: 400,
      name: 'ApplicationError',
      message: 'Invalid test request.',
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
