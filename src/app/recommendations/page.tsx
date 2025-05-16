'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RecommendationForm } from '@/components/recommendations/RecommendationForm';
import { RecommendationResults } from '@/components/recommendations/RecommendationResults';
import type { PersonalizedRecommendationOutput } from '@/ai/flows/personalized-recommendation';
import { Wand2 } from 'lucide-react';

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const initialProductName = searchParams.get('product') || undefined;
  
  const [recommendationResult, setRecommendationResult] = useState<PersonalizedRecommendationOutput | null>(null);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
      <header className="mb-10 text-center">
        <Wand2 className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Personalized Healing Path</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Tell us about your needs, and let our AI assistant suggest complementary products and spiritual services for your holistic well-being.
        </p>
      </header>

      <RecommendationForm 
        onRecommendationResult={setRecommendationResult} 
        initialProductName={initialProductName} 
      />
      
      {recommendationResult && (
        <div className="mt-12">
          <RecommendationResults result={recommendationResult} />
        </div>
      )}
    </div>
  );
}


export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div>Loading recommendations tool...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}
