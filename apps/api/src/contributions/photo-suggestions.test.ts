import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { QueryResultRow } from 'pg';
import { createPhotoSuggestionService } from './photo-suggestions.js';

test('photo suggestion status is scoped to the current user and species', async () => {
  let capturedQuery = '';
  let capturedBindings: unknown[] = [];
  const service = createPhotoSuggestionService({
    async query<Row extends QueryResultRow = QueryResultRow>(
      sql: string,
      bindings: unknown[] = [],
    ): Promise<{ rows: Row[] }> {
      capturedQuery = sql;
      capturedBindings = bindings;
      return {
        rows: [{
          id: '1b9f4f31-d4f4-4c7f-a54d-eeb2d8afcce3',
          external_id: 'KF8T',
          scientific_name: 'Panthera leo',
          photo_payload: {
            url: 'https://example.org/lion.jpg',
            source: 'GBIF',
            attribution: 'Photographer',
            license: 'CC BY',
            referenceUrl: 'https://example.org/record',
          },
          status: 'pending',
          submitted_by: 'user-1',
          reviewed_by: null,
          reviewed_at: null,
          created_at: '2026-01-01T00:00:00.000Z',
        } as QueryResultRow] as Row[],
      };
    },
  });

  const suggestion = await service.getMineForSpecies('user-1', 'KF8T');

  assert.match(capturedQuery, /suggestion\.submitted_by = \$1/);
  assert.match(capturedQuery, /suggestion\.external_id = \$2/);
  assert.match(capturedQuery, /ORDER BY suggestion\.created_at DESC\s+LIMIT 1/);
  assert.deepEqual(capturedBindings, ['user-1', 'KF8T']);
  assert.equal(suggestion?.status, 'pending');
  assert.equal(suggestion?.speciesId, 'KF8T');
});
