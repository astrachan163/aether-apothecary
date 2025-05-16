'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PersonalizedRecommendationInput, PersonalizedRecommendationOutput } from "@/ai/flows/personalized-recommendation"
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-recommendation"
import React from "react"
import { mockProducts } from "@/data/products"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  productName: z.string().min(1, "Please select or enter a product name."),
  userNeeds: z.string().min(10, "Please describe your needs in at least 10 characters.").max(500, "Description must be 500 characters or less."),
})

type RecommendationFormValues = z.infer<typeof formSchema>;

interface RecommendationFormProps {
  onRecommendationResult: (result: PersonalizedRecommendationOutput | null) => void;
  initialProductName?: string;
}

export function RecommendationForm({ onRecommendationResult, initialProductName }: RecommendationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: initialProductName || "",
      userNeeds: "",
    },
  });

  async function onSubmit(values: RecommendationFormValues) {
    setIsLoading(true);
    onRecommendationResult(null); // Clear previous results
    try {
      const input: PersonalizedRecommendationInput = {
        productName: values.productName,
        userNeeds: values.userNeeds,
      };
      const result = await getPersonalizedRecommendations(input);
      onRecommendationResult(result);
      toast({
        title: "Recommendations Generated!",
        description: "Scroll down to see your personalized suggestions.",
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      onRecommendationResult(null);
       toast({
        title: "Error",
        description: "Could not generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product of Interest</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product you are interested in" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockProducts.map(product => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                You can also type a product name if not listed, or if you don't have a specific one in mind, describe the type of product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="userNeeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Specific Needs & Preferences</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what you're looking for, e.g., 'help with anxiety and sleep', 'natural skin remedy for eczema', 'spiritual uplifting during stressful times'."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The more details you provide, the better the recommendations will be.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Get Personalized Recommendations"
          )}
        </Button>
      </form>
    </Form>
  )
}
