import { memo } from 'react';

const Avatar = memo(({ uri, name, size = 40 }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = `hsl(${name.length * 30 % 360}, 70%, 50%)`;

  return (
    <div
      className="relative flex-shrink-0 rounded-full overflow-hidden border-2 border-snap-yellow"
      style={{ width: size, height: size }}
    >
      {uri ? (
        <img
          src={uri}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: bgColor, fontSize: size / 2.2 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
});

export default Avatar;