import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { useDispatch } from "react-redux";

import StoryCircle from "../components/stories/StoryCircle";
import StoryViewer from "../components/stories/StoryViewer";

import { fetchStoriesFeed } from "../redux/slices/storySlice";
import { viewStoryAPI } from "../services/storyService";


const Stories = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { storiesFeed } = useAppSelector((state) => state.stories);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [startIndex, setStartIndex] = useState(0);


  // FETCH STORIES FROM BACKEND
  useEffect(() => {
    dispatch(fetchStoriesFeed());
  }, [dispatch]);


  // GROUP STORIES BY USER
  const groupedStories = Object.values(
    (storiesFeed || []).reduce((acc, story) => {

      const userId = story.user._id;

      if (!acc[userId]) {

        acc[userId] = {
          user: story.user,
          stories: []
        };

      }

      acc[userId].stories.push(story);

      return acc;

    }, {})
  );


  // OPEN STORY VIEWER
  const openStoryViewer = (storyGroup) => {

    const formattedStories = storyGroup.stories.map((story) => ({

      ...story,

      mediaUrl: story.media.url,

      user: {
        displayName: storyGroup.user.displayName,
        avatarUrl: storyGroup.user.avatarUrl
      }

    }));


    setSelectedUserStories(formattedStories);
    setStartIndex(0);
    setViewerOpen(true);

  };


  return (

    <div className="min-h-screen bg-snap-dark">

      {/* HEADER */}
      <div className="sticky top-0 bg-snap-dark border-b border-white/10 z-10 px-6 py-6">
        <h1 className="text-4xl font-bold">Stories</h1>
      </div>


      {/* STORY CIRCLES */}
      <div className="px-6 pt-6">

        <div className="flex gap-6 overflow-x-auto pb-6 hide-scroll">

          {/* YOUR STORY */}
          <StoryCircle
            user={user || { displayName: "You" }}
            hasStory={false}
            allViewed={false}
            onPress={() => navigate("/upload-story")}
          />


          {/* FRIEND STORIES */}
          {groupedStories.map((storyGroup) => (

            <StoryCircle

              key={storyGroup.user._id}

              user={{
                displayName: storyGroup.user.displayName,
                avatarUrl: storyGroup.user.avatarUrl
              }}

              hasStory={true}

              allViewed={
                storyGroup.stories?.every(
                  (story) =>
                    story.viewers?.includes(user?._id)
                ) || false
              }

              onPress={() => openStoryViewer(storyGroup)}

            />

          ))}

        </div>

      </div>


      {/* STORY VIEWER MODAL */}
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