'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminStoryManager from '@/components/admin/AdminStoryManager';
import AdminProductManager from '@/components/admin/AdminProductManager';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export default function AdminDashboardPage() {
  const { isAdmin, logout, isLoading } = useAuth();
  const { getProducts } = useData();
  const router = useRouter();
  
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    setProductCount(getProducts().length);
  }, [getProducts]);

  if (isLoading || !isAdmin) {
    return <div className="flex justify-center items-center h-screen"><p>Loading or redirecting...</p></div>;
  }

  return (
    <div className="container mx-auto py-8">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="h-10 w-10 text-accent" />
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="p-6 bg-card rounded-xl shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Total Products</h3>
            <p className="text-3xl font-bold">{productCount}</p>
        </div>
        {/* Add more stat cards here later */}
       </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="products">Manage Products</TabsTrigger>
          <TabsTrigger value="stories">Manage Stories</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <AdminProductManager />
        </TabsContent>
        <TabsContent value="stories" className="mt-6">
          <AdminStoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
