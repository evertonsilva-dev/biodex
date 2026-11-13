import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canAssignRole,
  canCreateEditorialContent,
  canDeleteEditorialContent,
  canEditEditorialContent,
  canReviewPhotoSuggestions,
  canViewUsers,
} from './roles.js';

test('role capabilities keep moderation and role assignment separate', () => {
  assert.equal(canReviewPhotoSuggestions('user'), false);
  assert.equal(canReviewPhotoSuggestions('curator'), false);
  assert.equal(canReviewPhotoSuggestions('admin'), true);
  assert.equal(canReviewPhotoSuggestions('root'), true);
  assert.equal(canViewUsers('admin'), true);
  assert.equal(canViewUsers('curator'), false);
  assert.equal(canAssignRole('admin', 'curator'), true);
  assert.equal(canAssignRole('admin', 'admin'), false);
  assert.equal(canAssignRole('root', 'admin'), true);
});

test('editorial content permissions honor ownership and role boundaries', () => {
  assert.equal(canCreateEditorialContent('user'), false);
  assert.equal(canCreateEditorialContent('curator'), true);
  assert.equal(canEditEditorialContent('curator', 'owner', 'owner'), true);
  assert.equal(canEditEditorialContent('curator', 'other', 'owner'), false);
  assert.equal(canEditEditorialContent('admin', 'admin', 'owner'), false);
  assert.equal(canEditEditorialContent('root', 'root', 'owner'), true);
  assert.equal(canDeleteEditorialContent('curator'), false);
  assert.equal(canDeleteEditorialContent('admin'), true);
});
