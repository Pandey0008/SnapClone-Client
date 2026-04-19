import { memo } from 'react';
import Button from './Button';

const EmptyState = memo(({
  icon,
  title,
  subtitle,
  onAction,
  actionLabel
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
      <div className="text-6xl mb-6 opacity-70">
        {icon || "👻"}
      </div>
      
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {subtitle && <p className="text-snap-white50 text-base mb-8 max-w-[240px]">{subtitle}</p>}
      
      {onAction && actionLabel && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
        />
      )}
    </div>
  );
});

export default EmptyState;