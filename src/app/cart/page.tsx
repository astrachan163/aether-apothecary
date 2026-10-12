'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { readCart, type CartItem } from '@/lib/cart';
import { protectedCallable } from '@/lib/firebase';
import { CHECKOUT_OFF_LABEL, checkoutEnabled } from '@/lib/stripe-client';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { isDemo } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const enabled = checkoutEnabled() && !isDemo;
  const [message, setMessage] = useState('');

  useEffect(() => {
    setItems(readCart());
  }, []);

  async function onCheckout() {
    const create = protectedCallable<{ items: { id: string; qty: number }[] }, { url: string }>('createCheckoutSession');
    if (!enabled || !create) {
      setMessage(CHECKOUT_OFF_LABEL);
      return;
    }
    try {
      const result = await create({ items });
      if (result.data.url) window.location.assign(result.data.url);
    } catch {
      setMessage(CHECKOUT_OFF_LABEL);
    }
  }

  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">Cart</h1>
      {items.length === 0 ? <p>Your cart is empty.</p> : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>{item.name} × {item.qty}</li>
          ))}
        </ul>
      )}
      <Button type="button" className="min-h-11" disabled={!enabled} onClick={onCheckout}>
        {enabled ? 'Checkout' : CHECKOUT_OFF_LABEL}
      </Button>
      {message ? <p role="status">{message}</p> : null}
    </article>
  );
}
