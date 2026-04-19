import { memo } from 'react';

const filters = [
  { key: 'none', label: 'None', emoji: '✨' },
  { key: 'dog', label: 'Dog', emoji: '🐶' },
  { key: 'glasses', label: 'Glasses', emoji: '🥽' },
  { key: 'hat', label: 'Hat', emoji: '🎩' },
  { key: 'hearts', label: 'Hearts', emoji: '💖' },
];

const FilterCarousel = memo(({ selected, onSelect }) => {
  return (
    <div className="absolute bottom-28 left-0 right-0 z-20 overflow-x-auto hide-scroll">
      <div className="flex gap-4 px-6 pb-4">
        {filters.map((filter) => (
          <div
            key={filter.key}
            onClick={() => onSelect(filter.key)}
            className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
              selected === filter.key
                ? 'border-snap-yellow scale-110'
                : 'border-white/30'
            }`}
          >
            <div className="text-4xl mb-1">{filter.emoji}</div>
            <span className="text-xs text-white">{filter.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default FilterCarousel;