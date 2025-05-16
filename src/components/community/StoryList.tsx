import type { CommunityStory } from '@/lib/types';
import { StoryCard } from './StoryCard';

interface StoryListProps {
  stories: CommunityStory[];
}

export function StoryList({ stories }: StoryListProps) {
  if (stories.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No stories shared yet. Be the first!</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}
