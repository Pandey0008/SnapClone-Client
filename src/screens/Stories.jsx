import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { useDispatch } from 'react-redux';
import StoryCircle from '../components/stories/StoryCircle';
import StoryViewer from '../components/stories/StoryViewer';
import { fetchStoriesFeed } from '../redux/slices/storySlice';
import { viewStoryAPI } from '../services/storyService';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Camera } from 'lucide-react';

const Stories = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { storiesFeed, loading } = useAppSelector((state) => state.stories || { storiesFeed: [], loading: false });

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchStoriesFeed());
  }, [dispatch]);

  const groupedStories = Object.values(
    (storiesFeed || []).reduce((acc, story) => {
      const userId = story.user._id;
      if (!acc[userId]) {
        acc[userId] = { user: story.user, stories: [] };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {})
  );

  const openStoryViewer = (storyGroup) => {
    const formattedStories = storyGroup.stories.map((story) => ({
      ...story,
      mediaUrl: story.media.url,
      user: {
        displayName: storyGroup.user.displayName,
        avatarUrl: storyGroup.user.avatarUrl,
      },
    }));

    setSelectedUserStories(formattedStories);
    setStartIndex(0);
    setViewerOpen(true);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen pb-20 bg-snap-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-12 pb-5 bg-snap-dark/95 backdrop-blur-xl border-b border-snap-white06">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Stories
          </h1>

          <button
            onClick={() => navigate('/upload-story')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 bg-snap-yellow/12 border border-snap-yellow/30 shadow-glow-sm"
          >
            <Plus size={18} className="text-snap-yellow" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Story Circles */}
      {groupedStories.length === 0 && !loading ? (
        <EmptyState
          icon={<Camera size={32} className="text-snap-yellow" />}
          title="No stories yet"
          subtitle="Share a moment with your friends"
          onAction={() => navigate('/upload-story')}
          actionLabel="Create Story"
        />
      ) : (
        <div className="px-5 pt-6">
          {/* Section label */}
          <p className="pb-3 text-xs font-medium uppercase tracking-widest text-snap-white30">
            Active Stories
          </p>

          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Your Story */}
            <StoryCircle
              user={user || { displayName: 'You', avatarUrl: null }}
              hasStory={false}
              allViewed={false}
              isYourStory={true}
              onPress={() => navigate('/upload-story')}
            />

            {/* Friend Stories */}
            {groupedStories.map((storyGroup) => (
              <StoryCircle
                key={storyGroup.user._id}
                user={{
                  displayName: storyGroup.user.displayName,
                  avatarUrl: storyGroup.user.avatarUrl,
                }}
                hasStory={true}
                allViewed={
                  storyGroup.stories?.every((story) => story.viewers?.includes(user?._id)) || false
                }
                isYourStory={false}
                onPress={() => openStoryViewer(storyGroup)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {viewerOpen && selectedUserStories && (
        <StoryViewer
          stories={selectedUserStories}
          startIndex={startIndex}
          onStoryChange={(storyId) => {
            viewStoryAPI(storyId);
          }}
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