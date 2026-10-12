'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Button } from '@/components/ui/button';
import { getFirebase } from '@/lib/firebase';
import { CHECKOUT_OFF_LABEL, checkoutEnabled } from '@/lib/stripe-client';
import { TEST_MODE_NOTICE } from '../../../shared/notices';
import { addToCart, readCart } from '@/lib/cart';
import { useAuth } from '@/contexts/AuthContext';

export function CheckoutActions({ productId, name }: { productId: string; name: string }) {
  const { isDemo } = useAuth();
  const enabled = checkoutEnabled() && !isDemo;
  const [message, setMessage] = useState('');

  async function onCheckout() {
    const clients = getFirebase();
    if (!enabled || !clients) {
      setMessage(CHECKOUT_OFF_LABEL);
      return;
    }
    const items = readCart();
    if (!items.some((item) => item.id === productId)) addToCart({ id: productId, name, qty: 1 });
    const create = httpsCallable<{ items: { id: string; qty: number }[] }, { url: string }>(clients.functions, 'createCheckoutSession');
    try {
      const result = await create({ items: readCart() });
      if (result.data.url) window.location.assign(result.data.url);
    } catch {
      setMessage(CHECKOUT_OFF_LABEL);
    }
  }

  return (
    <div className="space-y-3">
      <p>{TEST_MODE_NOTICE}</p>
      <Button type="button" className="min-h-11 w-full" onClick={() => { addToCart({ id: productId, name, qty: 1 }); setMessage(`${name} is in the cart.`); }}>
        Add to cart
      </Button>
      <Button type="button" className="min-h-11 w-full bg-accent text-accent-foreground" disabled={!enabled} onClick={onCheckout}>
        {enabled ? 'Buy Now' : CHECKOUT_OFF_LABEL}
      </Button>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
