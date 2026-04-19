import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import StoryCircle from '../components/stories/StoryCircle';
import StoryViewer from '../components/stories/StoryViewer';
import EmptyState from '../components/common/EmptyState';
import { useState } from 'react';

const Stories = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Mock story data (replace with RTK Query later)
  const storiesData = [
    {
      userId: '1',
      user: { displayName: 'Rahul', avatarUrl: '' },
      hasStory: true,
      allViewed: false,
      stories: [
        { id: 's1', mediaUrl: 'https://picsum.photos/id/1015/720/1280', caption: 'Weekend vibes 🔥', timestamp: '2h' },
        { id: 's2', mediaUrl: 'https://picsum.photos/id/201/720/1280', caption: 'Coffee time ☕', timestamp: '2h' },
      ]
    },
    {
      userId: '2',
      user: { displayName: 'Priya', avatarUrl: '' },
      hasStory: true,
      allViewed: true,
      stories: [
        { id: 's3', mediaUrl: 'https://picsum.photos/id/301/720/1280', caption: 'Beach day 🌊', timestamp: '5h' },
      ]
    },
  ];

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const openStoryViewer = (userStories) => {
    setSelectedUserStories(userStories.stories);
    setStartIndex(0);
    setViewerOpen(true);
  };

  return (
    <div className="min-h-screen bg-snap-dark">
      {/* Header */}
      <div className="sticky top-0 bg-snap-dark border-b border-white/10 z-10 px-6 py-6">
        <h1 className="text-4xl font-bold">Stories</h1>
      </div>

      {/* Story Feed */}
      <div className="px-6 pt-6">
        <div className="flex gap-6 overflow-x-auto pb-6 hide-scroll">
          {/* Your own story circle */}
          <StoryCircle
            user={user || { displayName: 'You' }}
            hasStory={true}
            allViewed={false}
            onPress={() => alert("Your story upload coming soon")}
          />

          {storiesData.map((storyGroup) => (
            <StoryCircle
              key={storyGroup.userId}
              user={storyGroup.user}
              hasStory={storyGroup.hasStory}
              allViewed={storyGroup.allViewed}
              onPress={() => openStoryViewer(storyGroup)}
            />
          ))}
        </div>
      </div>

      {/* Recent Stories List (optional feed) */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4">Recent</h2>
        {/* You can expand this later with full feed */}
      </div>

      {/* Story Viewer Modal */}
      {viewerOpen && selectedUserStories && (
        <StoryViewer
          stories={selectedUserStories}
          startIndex={startIndex}
          onClose={() => {
            setViewerOpen(false);
            setSelectedUserStories(null);
          }}
        />
      )}
    </div>
  );
};

export default Stories;