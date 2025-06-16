
import type { CommunityStory } from '@/lib/types';
import { StoryCard } from './StoryCard';

interface StoryListProps {
  stories: CommunityStory[];
  // onRemoveStory is optional and typically only passed from admin views
  onRemoveStory?: (storyId: string) => void; 
}

export function StoryList({ stories, onRemoveStory }: StoryListProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">No stories found matching your criteria, or no stories shared yet.</p>
        <p className="text-md text-foreground">Be the first to share your journey!</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {stories.map((story) => (
        // Pass onRemoveStory if it exists (for admin scenarios)
        <StoryCard key={story.id} story={story} onRemove={onRemoveStory} />
      ))}
    </div>
  );
}
