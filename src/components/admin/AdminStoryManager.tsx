
'use client';

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { StoryCard } from '@/components/community/StoryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

export default function AdminStoryManager() {
  const { stories, removeStory, getStories } = useData();
  const { toast } = useToast();
  const currentStories = getStories();

  const handleRemoveStory = (storyId: string) => {
    removeStory(storyId);
    toast({
      title: "Story Removed",
      description: "The story has been removed by admin.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Users className="mr-3 h-7 w-7 text-accent" /> Manage Community Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentStories.length === 0 ? (
          <p className="text-muted-foreground">No stories submitted yet.</p>
        ) : (
          <div className="space-y-6">
            {currentStories.map(story => (
              <div key={story.id} className="border p-4 rounded-lg shadow-sm bg-card flex justify-between items-start">
                <div className="flex-grow">
                   <StoryCard story={story} onRemove={undefined} />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveStory(story.id)}
                  className="ml-4 text-destructive hover:bg-destructive/10"
                  aria-label="Remove story as admin"
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
