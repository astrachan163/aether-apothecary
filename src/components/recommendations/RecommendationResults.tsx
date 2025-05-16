import type { PersonalizedRecommendationOutput } from "@/ai/flows/personalized-recommendation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Sparkles } from "lucide-react";

interface RecommendationResultsProps {
  result: PersonalizedRecommendationOutput | null;
}

export function RecommendationResults({ result }: RecommendationResultsProps) {
  if (!result) {
    return null;
  }

  return (
    <Card className="mt-10 shadow-lg border-accent">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center text-accent">
          <CheckCircle className="mr-2 h-6 w-6" /> Your Personalized Recommendations
        </CardTitle>
        <CardDescription>
          Based on your input, here are some suggestions for your holistic healing journey:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Package className="mr-2 h-5 w-5 text-muted-foreground" /> Recommended Products
          </h3>
          {result.recommendedProducts && result.recommendedProducts.length > 0 ? (
            <ul className="list-disc list-inside pl-5 space-y-1 text-foreground/90">
              {result.recommendedProducts.map((product, index) => (
                <li key={index}>{product}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific product recommendations at this time.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-muted-foreground" /> Spiritual Service Suggestions
          </h3>
          {result.spiritualServiceSuggestions && result.spiritualServiceSuggestions.length > 0 ? (
            <ul className="list-disc list-inside pl-5 space-y-1 text-foreground/90">
              {result.spiritualServiceSuggestions.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific spiritual service suggestions at this time.</p>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Reasoning</h3>
          <p className="text-foreground/80 leading-relaxed p-4 bg-secondary/50 rounded-md">
            {result.reasoning}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
