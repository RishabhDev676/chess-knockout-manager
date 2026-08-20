import assert from 'node:assert';
import test, { describe } from 'node:test';
import {
  calculateGridColumns,
  getRecommendedViewMode,
} from '../src/lib/orientation';

describe('Screen & View Orientation Utilities', () => {

  describe('calculateGridColumns', () => {
    test('returns compact grid columns based on screen width', () => {
      assert.strictEqual(calculateGridColumns(320, 10, 'compact-grid'), 'grid-cols-2');
      assert.strictEqual(calculateGridColumns(768, 10, 'compact-grid'), 'grid-cols-3');
      assert.strictEqual(calculateGridColumns(1280, 10, 'compact-grid'), 'grid-cols-4 lg:grid-cols-6');
    });

    test('returns vertical layout columns based on screen width', () => {
      assert.strictEqual(calculateGridColumns(400, 10, 'vertical'), 'grid-cols-1');
      assert.strictEqual(calculateGridColumns(800, 10, 'vertical'), 'grid-cols-2');
      assert.strictEqual(calculateGridColumns(1400, 10, 'vertical'), 'grid-cols-2 lg:grid-cols-3');
    });

    test('returns single column for horizontal bracket mode container', () => {
      assert.strictEqual(calculateGridColumns(1024, 10, 'horizontal-tree'), 'grid-cols-1');
    });
  });

  describe('getRecommendedViewMode', () => {
    test('recommends compact grid view for large match counts (> 16)', () => {
      assert.strictEqual(getRecommendedViewMode('portrait', 390, 32), 'compact-grid');
      assert.strictEqual(getRecommendedViewMode('landscape', 1280, 20), 'compact-grid');
    });

    test('recommends horizontal bracket tree for landscape screens with >= 768px width', () => {
      assert.strictEqual(getRecommendedViewMode('landscape', 844, 8), 'horizontal-tree');
      assert.strictEqual(getRecommendedViewMode('landscape', 1280, 4), 'horizontal-tree');
    });

    test('recommends vertical list view for portrait screens or mobile viewports', () => {
      assert.strictEqual(getRecommendedViewMode('portrait', 390, 8), 'vertical');
      assert.strictEqual(getRecommendedViewMode('landscape', 600, 4), 'vertical');
    });
  });
});
