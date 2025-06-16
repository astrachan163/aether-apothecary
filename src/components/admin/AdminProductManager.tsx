
'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { ProductCard } from '@/components/products/ProductCard'; // Use existing ProductCard for display
import AddProductForm from './AddProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, PlusCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";


export default function AdminProductManager() {
  const { products, removeProduct: removeProductFromData, getProducts } = useData();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const { toast } = useToast();

  const currentProducts = getProducts();

  const handleRemoveProduct = (productId: string) => {
    removeProductFromData(productId);
     toast({
      title: "Product Removed",
      description: "The product has been removed by admin.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
            <CardTitle className="flex items-center text-2xl">
            <Package className="mr-3 h-7 w-7 text-accent" /> Manage Products
            </CardTitle>
            <CardDescription>Add, view, or remove products from the store.</CardDescription>
        </div>
        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details for the new product. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <AddProductForm onProductAdded={() => setIsAddFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {currentProducts.length === 0 ? (
          <p className="text-muted-foreground">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => handleRemoveProduct(product.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Remove product as admin"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
