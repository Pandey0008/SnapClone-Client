import { memo } from 'react';

const LoadingSpinner = memo(({ size = "large", color = "#FFFC00" }) => {
  const sizeClass = size === "small" ? "w-5 h-5" : "w-8 h-8";

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClass} border-4 border-white/20 border-t-snap-yellow rounded-full animate-spin`}
        style={{ borderTopColor: color }}
      />
    </div>
  );
});

export default LoadingSpinner;