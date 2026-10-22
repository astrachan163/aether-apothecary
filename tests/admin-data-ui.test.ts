import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import AdminProductManager from '../src/components/admin/AdminProductManager';
import AdminStoryManager from '../src/components/admin/AdminStoryManager';
import { SiteNotices } from '../src/components/layout/SiteNotices';
import { mockProducts } from '../src/data/products';
import { mockStories } from '../src/data/stories';

vi.mock('../src/contexts/DataContext', () => ({ useData: () => ({
  canPersist: false, catalogStatus: 'error', getProducts: () => [mockProducts[0]], getStories: () => [mockStories[0]],
  removeProduct: async () => {}, removeStory: async () => {},
}) }));

describe('disconnected store consumers', () => {
  it('labels sample fallback read-only and disables actual removal controls', () => {
    expect(renderToStaticMarkup(React.createElement(SiteNotices))).toContain('Sample catalog is read-only');
    for (const Component of [AdminProductManager, AdminStoryManager]) {
      const html = renderToStaticMarkup(React.createElement(Component));
      const remove = html.match(/<button[^>]*aria-label="Remove (?:product|story) as admin"[^>]*>/)?.[0];
      expect(remove).toBeDefined();
      expect(remove).toMatch(/\bdisabled=""/);
    }
  });
});
