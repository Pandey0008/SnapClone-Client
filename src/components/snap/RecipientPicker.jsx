import { useState, memo } from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const RecipientPicker = memo(({ friends, selected, onConfirm }) => {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState(selected || []);

  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    if (localSelected.includes(id)) {
      setLocalSelected(localSelected.filter(s => s !== id));
    } else {
      setLocalSelected([...localSelected, id]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-snap-dark">
      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-snap-darkMid border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-snap-yellow"
        />
      </div>

      {/* Friend List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredFriends.length === 0 ? (
          <p className="text-center text-snap-white50 py-10">No friends found</p>
        ) : (
          filteredFriends.map((friend) => {
            const isSelected = localSelected.includes(friend._id);
            return (
              <div
                key={friend._id}
                onClick={() => toggleSelect(friend._id)}
                className="flex items-center gap-4 py-4 px-2 hover:bg-white/5 rounded-2xl active:bg-white/10"
              >
                <Avatar uri={friend.avatarUrl} name={friend.displayName} size={52} />
                <div className="flex-1">
                  <p className="font-semibold">{friend.displayName}</p>
                  <p className="text-sm text-snap-white50">@{friend.username || 'user'}</p>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-snap-yellow border-snap-yellow' : 'border-white/40'}`}>
                  {isSelected && <span className="text-black text-xl">✓</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Button */}
      <div className="p-4 border-t border-white/10">
        <Button
          label={`Send to ${localSelected.length} ${localSelected.length === 1 ? 'friend' : 'friends'}`}
          onPress={() => onConfirm(localSelected)}
          variant="primary"
          disabled={localSelected.length === 0}
        />
      </div>
    </div>
  );
});

export default RecipientPicker;