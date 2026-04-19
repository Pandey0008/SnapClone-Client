import { memo } from 'react';

const CaptionInput = memo(({ value, onChange, maxLength = 150 }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a caption..."
        maxLength={maxLength}
        className="w-full bg-black/70 border border-snap-yellow/50 rounded-2xl px-5 py-4 text-white placeholder:text-snap-white50 focus:outline-none focus:border-snap-yellow text-lg"
      />
      <div className="absolute bottom-3 right-5 text-xs text-snap-white50">
        {value.length}/{maxLength}
      </div>
    </div>
  );
});

export default CaptionInput;