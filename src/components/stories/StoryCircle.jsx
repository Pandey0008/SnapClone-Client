import { memo } from 'react';
import Avatar from '../common/Avatar';

const StoryCircle = memo(({ user, hasStory, allViewed, onPress }) => {
  const ringColor = hasStory && !allViewed 
    ? 'border-snap-yellow' 
    : allViewed 
      ? 'border-snap-white50' 
      : 'border-transparent';

  return (
    <div
      onClick={onPress}
      className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
    >
      <div className={`relative p-1 rounded-full border-4 ${ringColor}`}>
        <Avatar 
          uri={user.avatarUrl} 
          name={user.displayName} 
          size={72} 
        />
      </div>
      <p className="text-xs text-white mt-2 text-center max-w-[72px] truncate">
        {user.displayName}
      </p>
    </div>
  );
});

export default StoryCircle;