import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { StoryCard } from '../src/components/community/StoryCard';
import { mockStories } from '../src/data/stories';

it('uses catalog sample metadata while keeping legacy samples and previews labeled', () => {
  for (const sample of [undefined, true]) {
    expect(renderToStaticMarkup(React.createElement(StoryCard, { story: { ...mockStories[0], sample } }))).toContain('Sample story');
  }
  const html = renderToStaticMarkup(React.createElement(StoryCard, { story: { ...mockStories[0], sample: false } }));
  expect(html).toContain('Community story');
  expect(html).not.toContain('>Sample story<');
});
