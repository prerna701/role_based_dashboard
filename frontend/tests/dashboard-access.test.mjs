import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canAccessRegion,
  getRegionSummary,
  resolveRegionForRole,
} from '../lib/dashboard-data.js';

test('admin can inspect every region slice', () => {
  assert.equal(canAccessRegion('admin', 'all'), true);
  assert.equal(canAccessRegion('admin', 'north'), true);
  assert.equal(canAccessRegion('admin', 'south'), true);
  assert.equal(canAccessRegion('admin', 'east'), true);
});

test('north manager is locked to north data', () => {
  assert.equal(canAccessRegion('north', 'north'), true);
  assert.equal(canAccessRegion('north', 'south'), false);
  assert.equal(canAccessRegion('north', 'east'), false);
  assert.equal(resolveRegionForRole('north', 'south'), 'north');
});

test('south manager is locked to south data', () => {
  assert.equal(canAccessRegion('south', 'south'), true);
  assert.equal(canAccessRegion('south', 'north'), false);
  assert.equal(canAccessRegion('south', 'east'), false);
  assert.equal(resolveRegionForRole('south', 'north'), 'south');
});

test('region summaries expose the expected dashboard totals', () => {
  assert.equal(getRegionSummary('north').students, 24);
  assert.equal(getRegionSummary('south').revenue, 425000);
  assert.equal(getRegionSummary('east').enrollments, 20);
});
