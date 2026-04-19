import { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ProgressBar = memo(({ duration = 5000, active, viewed, onComplete }) => {
  const progressRef = useRef(null);

  useEffect(() => {
    if (!active || viewed) return;

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, viewed, duration, onComplete]);

  return (
    <div className="h-1 bg-white/30 rounded-full overflow-hidden flex-1 mx-1">
      <motion.div
        ref={progressRef}
        className="h-full bg-snap-yellow origin-left"
        initial={{ width: viewed ? '100%' : '0%' }}
        animate={{ width: active ? '100%' : viewed ? '100%' : '0%' }}
        transition={{ 
          duration: active && !viewed ? duration / 1000 : 0.1,
          ease: 'linear'
        }}
      />
    </div>
  );
});

export default ProgressBar;