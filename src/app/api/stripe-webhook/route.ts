
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }
  }

  if (event!.type === 'checkout.session.completed') {
    const session = event!.data.object as Stripe.Checkout.Session;

    try {
      // Save order to Firestore
      await db.collection('orders').add({
        checkoutSessionId: session.id,
        amountTotal: session.amount_total,
        customerDetails: session.customer_details,
        paymentStatus: session.payment_status,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
      return NextResponse.json({ error: 'Error saving order' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
