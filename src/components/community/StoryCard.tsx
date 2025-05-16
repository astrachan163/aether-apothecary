import Image from 'next/image';
import Link from 'next/link';
import type { CommunityStory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Package } from 'lucide-react'; // Using Package as a generic product icon

export function StoryCard({ story }: { story: CommunityStory }) {
  const userInitials = story.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <Card className="flex flex-col rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full bg-card">
      <CardHeader className="flex flex-row items-center space-x-4 pb-3">
        <Avatar className="h-12 w-12">
          {story.userAvatarUrl ? (
            <AvatarImage src={story.userAvatarUrl} alt={story.userName} data-ai-hint={story.dataAiHint || "person"} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <CardTitle className="text-lg">{story.userName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{new Date(story.date).toLocaleDateString()}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <Quote className="h-5 w-5 text-accent mb-2 transform -scale-x-100" />
        <p className="text-sm text-foreground/90 leading-relaxed italic mb-3">
          {story.story}
        </p>
      </CardContent>
      {story.productId && story.productName && (
        <CardFooter className="pt-0 border-t mt-auto p-4 bg-secondary/30">
          <Link href={`/products/${story.productId}`} className="text-xs text-accent hover:underline flex items-center">
            <Package className="mr-1.5 h-3 w-3" /> Related to: {story.productName}
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
