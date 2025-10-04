
import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import type { CartItem } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

// This function handles the POST request to create a Stripe Checkout session.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cartItems = body.cartItems as CartItem[];

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    // The base URL is required for constructing the success and cancel URLs.
    const baseUrl = req.nextUrl.origin;

    // Create an array of line items for the Stripe Checkout session.
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.imageUrl.startsWith('http') ? [item.imageUrl] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Price in cents
      },
      quantity: item.quantity,
    }));

    // Create the Stripe Checkout session.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        // You can add any metadata here, like user ID, etc.
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
