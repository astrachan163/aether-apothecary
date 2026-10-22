'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import type { Product, CommunityStory, Ingredient } from '@/lib/types';
import { mockProducts as initialProducts } from '@/data/products';
import { mockStories as initialStories } from '@/data/stories';
import { ingredients as initialIngredients } from '@/data/ingredients';
import { useAuth } from '@/contexts/AuthContext';
import { getFirebase, protectedCallable } from '@/lib/firebase';
import { persistRemoval, watchStore, type StoreScope, type CatalogStatus, type StoreOrderSummary } from '@/lib/catalog-data';

interface DataContextType {
  products: Product[]; stories: CommunityStory[]; ingredients: Ingredient[]; orders: StoreOrderSummary[];
  catalogStatus: CatalogStatus; ordersStatus: CatalogStatus; canPersist: boolean;
  addProduct: (product: Product) => void; removeProduct: (id: string) => Promise<void>; updateProduct: (product: Product) => void;
  addStory: (story: CommunityStory) => void; removeStory: (id: string) => Promise<void>;
  getProducts: () => Product[]; getStories: () => CommunityStory[]; getIngredients: () => Ingredient[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { uid, isAdmin, isDemo, isLoading } = useAuth();
  const scope = useMemo<StoreScope>(() => isDemo && uid ? { kind: 'demo', uid } : isAdmin ? { kind: 'owner' } : { kind: 'public' }, [uid, isAdmin, isDemo]);
  const key = isLoading ? 'pending' : scope.kind === 'demo' ? `demo:${scope.uid}` : scope.kind === 'owner' ? `owner:${uid}` : 'public';
  const currentKey = useRef(key);
  currentKey.current = key;
  const [loadedKey, setLoadedKey] = useState(key);
  const [productsData, setProducts] = useState<Product[]>(initialProducts);
  const [storiesData, setStories] = useState<CommunityStory[]>(initialStories);
  const [draftStories, setDraftStories] = useState<CommunityStory[]>([]);
  const [ingredientsData, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [orderData, setOrders] = useState<StoreOrderSummary[]>([]);
  const [status, setStatus] = useState<CatalogStatus>(() => getFirebase() ? 'loading' : 'offline');
  const [orderStatus, setOrderStatus] = useState<CatalogStatus>('offline');

  useEffect(() => {
    setLoadedKey(key); setProducts(initialProducts); setStories(initialStories); setIngredients(initialIngredients); setOrders([]); setDraftStories([]);
    const clients = getFirebase();
    if (!clients) { setStatus('offline'); setOrderStatus('offline'); return; }
    setStatus('loading'); setOrderStatus(scope.kind === 'public' ? 'offline' : 'loading');
    if (isLoading) return;
    if (scope.kind === 'demo' && !/^demo_store-admin_[a-f0-9]{16}$/.test(scope.uid)) { setStatus('error'); setOrderStatus('error'); return; }
    return watchStore(scope, (request, next, error) => {
      const ref = collection(clients.db, request.path);
      const selection = request.publishedOnly ? query(ref, where('published', '==', true)) : ref;
      return onSnapshot(selection, snapshot => next(snapshot.docs.map(item => ({ id: item.id, data: item.data() }))), error);
    }, {
      products: setProducts, stories: setStories, ingredients: setIngredients,
      orders: items => { setOrders(items); setOrderStatus('ready'); }, ready: () => setStatus('ready'),
      error: () => { setProducts(initialProducts); setStories(initialStories); setIngredients(initialIngredients); setOrders([]); setStatus('error'); setOrderStatus('error'); },
      ordersError: () => { setOrders([]); setOrderStatus('error'); },
    });
  }, [key, scope, isLoading]);

  const sameScope = loadedKey === key;
  const products = sameScope ? productsData : initialProducts;
  const stories = useMemo(() => sameScope ? [...draftStories, ...storiesData.filter(story => !draftStories.some(draft => draft.id === story.id))] : initialStories, [sameScope, draftStories, storiesData]);
  const ingredients = sameScope ? ingredientsData : initialIngredients;
  const catalogStatus = sameScope ? status : getFirebase() ? 'loading' : 'offline';
  const orders = sameScope && scope.kind !== 'public' && !isLoading ? orderData : [];
  const ordersStatus = sameScope ? orderStatus : 'offline';
  const canPersist = catalogStatus === 'ready' && !isLoading && scope.kind !== 'public';

  const remove = useCallback(async (kind: 'products' | 'stories', id: string) => {
    if (kind === 'stories' && draftStories.some(story => story.id === id)) {
      setDraftStories(previous => previous.filter(story => story.id !== id));
      return;
    }
    if (!canPersist) throw new Error('The sample catalog is read-only while its connection is unavailable.');
    const item = kind === 'products' ? products.find(product => product.id === id) : stories.find(story => story.id === id);
    if (!item) throw new Error('That item is unavailable.');
    const clients = getFirebase();
    const save = protectedCallable<{ kind: string; id: string; data: Record<string, unknown> }, { ok: boolean }>('saveCatalogItem');
    if (!clients || !save) throw new Error('Catalog saving is unavailable.');
    await persistRemoval(scope, kind, item, { save, deleteDemo: path => deleteDoc(doc(clients.db, path)) });
    if (currentKey.current !== key) return;
    if (kind === 'products') setProducts(previous => previous.filter(product => product.id !== id));
    else { setStories(previous => previous.filter(story => story.id !== id)); setDraftStories(previous => previous.filter(story => story.id !== id)); }
  }, [canPersist, products, stories, draftStories, scope, key]);
  const removeProduct = useCallback((id: string) => remove('products', id), [remove]);
  const removeStory = useCallback((id: string) => remove('stories', id), [remove]);
  // Creation stays disabled. These mirrors do not claim a server write.
  const addProduct = useCallback((product: Product) => { if (!canPersist) throw new Error('Catalog is read-only.'); setProducts(previous => [...previous, product]); }, [canPersist]);
  const updateProduct = useCallback((product: Product) => { if (!canPersist) throw new Error('Catalog is read-only.'); setProducts(previous => previous.map(item => item.id === product.id ? product : item)); }, [canPersist]);
  const addStory = useCallback((story: CommunityStory) => setDraftStories(previous => [story, ...previous]), []);
  const getProducts = useCallback(() => products, [products]);
  const getStories = useCallback(() => stories, [stories]);
  const getIngredients = useCallback(() => ingredients, [ingredients]);
  return <DataContext.Provider value={{ products, stories, ingredients, orders, catalogStatus, ordersStatus, canPersist, addProduct, removeProduct, updateProduct, addStory, removeStory, getProducts, getStories, getIngredients }}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
