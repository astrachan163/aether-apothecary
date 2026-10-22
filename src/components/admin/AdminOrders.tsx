'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminOrders() {
  const { isDemo } = useAuth();
  const { orders, ordersStatus } = useData();
  const ready = ordersStatus === 'ready';
  return <Card className="mt-8">
    <CardHeader>
      <CardTitle>{isDemo ? 'Sample orders' : 'Orders'}</CardTitle>
      <CardDescription>{isDemo ? 'No customer orders or charges. These samples belong to your demo session.' : 'Test orders from the connected store.'}</CardDescription>
    </CardHeader>
    <CardContent>
      {!ready ? <p>{ordersStatus === 'loading' ? 'Loading orders' : 'Orders unavailable. No customer orders are shown.'}</p>
        : orders.length === 0 ? <p>No orders in this store.</p>
        : <ul className="space-y-4">{orders.map(order => <li key={order.id} className="border-b pb-3">
          <p className="font-semibold">{isDemo || order.sample ? 'Sample order' : 'Test order'} · {order.id}</p>
          {order.name && <p>{order.name}</p>}
          {order.email && <p>{order.email}</p>}
          <p>{`$${(order.amountTotal / 100).toFixed(2)}`}</p>
        </li>)}</ul>}
    </CardContent>
  </Card>;
}
