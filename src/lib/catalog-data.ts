import type { CommunityStory, Ingredient, Product } from './types';

export type StoreScope = { kind: 'public' } | { kind: 'owner' } | { kind: 'demo'; uid: string };
export type CatalogStatus = 'offline' | 'loading' | 'ready' | 'error';
export type CatalogDocument = { id: string; data: Record<string, unknown> };
export type StoreOrderSummary = { id: string; name: string; email: string; amountTotal: number; sample: boolean };
export type CatalogRead = { kind: 'products' | 'ingredients' | 'stories' | 'orders'; path: string; publishedOnly: boolean };
export type CatalogReader = (request: CatalogRead, next: (docs: CatalogDocument[]) => void, error: () => void) => () => void;

function text(data: Record<string, unknown>, key: string): string {
  if (typeof data[key] !== 'string') throw new Error('Invalid catalog text.');
  return data[key] as string;
}
function list(data: Record<string, unknown>, key: string): string[] {
  const value = data[key];
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new Error('Invalid catalog list.');
  return value;
}
function amount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('Invalid catalog amount.');
  return value;
}

export function projectProduct({ id, data }: CatalogDocument): Product {
  const uses = list(data, 'uses');
  if (uses.some(value => !['spiritual', 'emotional', 'physical', 'mental'].includes(value))
    || !Number.isInteger(data.inventory) || Number(data.inventory) < 0 || typeof data.active !== 'boolean') throw new Error('Invalid product.');
  return {
    id, name: text(data, 'name'), shortDescription: text(data, 'shortDescription'), description: text(data, 'description'),
    price: amount(data.price), imageUrl: text(data, 'imageUrl'), category: text(data, 'category'),
    inventory: data.inventory as number, active: data.active, ingredients: list(data, 'ingredients'), uses: uses as Product['uses'],
    ...(typeof data.sku === 'string' ? { sku: data.sku } : {}),
    ...(typeof data.dataAiHint === 'string' ? { dataAiHint: data.dataAiHint } : {}),
  };
}

export function projectStory({ id, data }: CatalogDocument): CommunityStory {
  if (typeof data.sample !== 'boolean') throw new Error('Invalid story label.');
  return {
    id, userName: text(data, 'userName'), story: text(data, 'story'), date: text(data, 'date'), sample: data.sample,
    ...(typeof data.productId === 'string' ? { productId: data.productId } : {}),
    ...(typeof data.productName === 'string' ? { productName: data.productName } : {}),
    ...(typeof data.userAvatarUrl === 'string' ? { userAvatarUrl: data.userAvatarUrl } : {}),
  };
}

function projectIngredient({ id, data }: CatalogDocument): Ingredient {
  return {
    id, slug: text(data, 'slug'), name: text(data, 'name'), description: text(data, 'description'),
    traditionalUses: text(data, 'traditionalUses'), spiritualBenefits: text(data, 'spiritualBenefits'), physicalBenefits: text(data, 'physicalBenefits'),
    ...(typeof data.imageUrl === 'string' ? { imageUrl: data.imageUrl } : {}),
  };
}

export function projectOrder({ id, data }: CatalogDocument): StoreOrderSummary {
  const total = amount(data.amountTotal);
  if (!Number.isInteger(total)) throw new Error('Invalid order total.');
  return { id, name: typeof data.name === 'string' ? data.name : '', email: typeof data.email === 'string' ? data.email : '', amountTotal: total, sample: data.sample === true };
}

export function catalogRoot(scope: StoreScope): string {
  if (scope.kind !== 'demo') return 'catalog';
  if (!/^demo_store-admin_[a-f0-9]{16}$/.test(scope.uid)) throw new Error('Invalid Herbal demo session.');
  return `sandboxes/${scope.uid}/catalog`;
}

export function watchStore(scope: StoreScope, read: CatalogReader, events: {
  products: (items: Product[]) => void; stories: (items: CommunityStory[]) => void; ingredients: (items: Ingredient[]) => void;
  orders: (items: StoreOrderSummary[]) => void; ready: () => void; error: () => void; ordersError: () => void;
}): () => void {
  const root = catalogRoot(scope);
  let active = true;
  const stops: (() => void)[] = [];
  const pending = new Set(['products', 'stories', 'ingredients']);
  const stop = () => { if (!active) return; active = false; stops.forEach(unsubscribe => unsubscribe()); };
  const failed = () => { if (active) { stop(); events.error(); } };
  for (const kind of ['products', 'stories', 'ingredients'] as const) {
    if (!active) break;
    const unsubscribe = read({ kind, path: `${root}/${kind}/items`, publishedOnly: true }, docs => {
      if (!active) return;
      try {
        if (kind === 'products') events.products(docs.map(projectProduct));
        if (kind === 'stories') events.stories(docs.map(projectStory));
        if (kind === 'ingredients') events.ingredients(docs.map(projectIngredient));
        pending.delete(kind);
        if (pending.size === 0) events.ready();
      } catch { failed(); }
    }, failed);
    if (active) stops.push(unsubscribe); else unsubscribe();
  }
  if (active && scope.kind !== 'public') {
    stops.push(read({ kind: 'orders', path: scope.kind === 'demo' ? `sandboxes/${scope.uid}/orders` : 'orders', publishedOnly: false }, docs => {
      if (!active) return;
      try { events.orders(docs.map(projectOrder)); } catch { events.ordersError(); }
    }, () => { if (active) events.ordersError(); }));
  }
  return stop;
}

export async function persistRemoval(scope: StoreScope, kind: 'products' | 'stories', item: Product | CommunityStory, transport: {
  save: (request: { kind: string; id: string; data: Record<string, unknown> }) => Promise<{ data: { ok: boolean } }>;
  deleteDemo: (path: string) => Promise<void>;
}): Promise<void> {
  if (scope.kind === 'public') throw new Error('The catalog is read-only.');
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(item.id)) throw new Error('Invalid catalog item.');
  if (scope.kind === 'demo') {
    await transport.deleteDemo(`${catalogRoot(scope)}/${kind}/items/${item.id}`);
    return;
  }
  const result = await transport.save({ kind, id: item.id, data: { ...item, ...(kind === 'stories' ? { sample: (item as CommunityStory).sample } : {}), published: false } });
  if (result?.data?.ok !== true) throw new Error('The catalog change was not saved.');
}
