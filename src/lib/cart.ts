export type CartItem = { id: string; name: string; qty: number };

const KEY = 'vhe.cart.v1';

export function readCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) as CartItem[] : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): CartItem[] {
  const items = readCart();
  const existing = items.find((entry) => entry.id === item.id);
  const next = existing
    ? items.map((entry) => entry.id === item.id ? { ...entry, qty: entry.qty + item.qty } : entry)
    : [...items, item];
  writeCart(next);
  return next;
}
