import { memo } from 'react';

const Badge = memo(({ count, color = "snap-yellow" }) => {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count;

  return (
    <div
      className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold text-black border border-snap-dark`}
      style={{ backgroundColor: color === "snap-yellow" ? "#FFFC00" : color }}
    >
      {displayCount}
    </div>
  );
});

export default Badge;