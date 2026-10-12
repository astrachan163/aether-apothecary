'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Button } from '@/components/ui/button';
import { readCart } from '@/lib/cart';
import { getFirebase } from '@/lib/firebase';
import { CHECKOUT_OFF_LABEL, checkoutEnabled } from '@/lib/stripe-client';
import { TEST_MODE_NOTICE } from '../../../shared/notices';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { isDemo } = useAuth();
  const [items] = useState(readCart);
  const enabled = checkoutEnabled() && !isDemo;
  const [message, setMessage] = useState('');

  async function onCheckout() {
    const clients = getFirebase();
    if (!enabled || !clients) {
      setMessage(CHECKOUT_OFF_LABEL);
      return;
    }
    const create = httpsCallable<{ items: { id: string; qty: number }[] }, { url: string }>(clients.functions, 'createCheckoutSession');
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
      <p>{TEST_MODE_NOTICE}</p>
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
