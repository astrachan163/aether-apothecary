import { build } from 'esbuild';
import { webkit } from 'playwright';
import { expect, it } from 'vitest';

it('removes an in-memory preview through the real DataProvider without saving a catalog record', async () => {
  const bundle = await build({
    stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
      import React, { useEffect } from 'react';
      import { createRoot } from 'react-dom/client';
      import { DataProvider, useData } from './src/contexts/DataContext';
      window.catalogSaves = 0;
      function Consumer() {
        const data = useData();
        useEffect(() => { window.store = data; }, [data]);
        return <output>{data.catalogStatus}|{data.stories.map(story => story.id).join(',')}</output>;
      }
      createRoot(document.getElementById('root')).render(<DataProvider><Consumer /></DataProvider>);
    ` },
    bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"test"' },
    plugins: [{ name: 'cloud-boundaries', setup(builder) {
      builder.onResolve({ filter: /^(@\/lib\/firebase|@\/contexts\/AuthContext|firebase\/firestore)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: args.path === '@/lib/firebase'
        ? 'export const getFirebase = () => ({db:{}}); export const protectedCallable = () => async () => { window.catalogSaves++; return {data:{ok:true}}; };'
        : args.path === '@/contexts/AuthContext'
        ? 'export const useAuth = () => ({uid:"owner",isAdmin:true,isDemo:false,isLoading:false});'
        : 'export const collection = (_db,path) => path; export const query = path => path; export const where = () => null; export const doc = (_db,path) => path; export const deleteDoc = async () => { throw Error("Unexpected delete"); }; export const onSnapshot = (_ref,next) => { next({docs:[]}); return () => {}; };' }));
    } }],
  });
  const browser = await webkit.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.waitForFunction(() => (window as any).store?.catalogStatus === 'ready');
    await page.evaluate(() => (window as any).store.addStory({ id: 'preview-local', userName: 'Preview', story: 'Local draft', date: '2026-10-22', sample: true }));
    await page.waitForFunction(() => (window as any).store.stories.some((story: any) => story.id === 'preview-local'));
    await page.evaluate(() => (window as any).store.removeStory('preview-local'));
    await page.waitForFunction(() => !(window as any).store.stories.some((story: any) => story.id === 'preview-local'));
    expect(await page.evaluate(() => (window as any).catalogSaves)).toBe(0);
  } finally { await browser.close(); }
});
