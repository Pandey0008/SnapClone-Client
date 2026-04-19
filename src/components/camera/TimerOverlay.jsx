import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TimerOverlay = memo(({ active, duration = 10, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!active) {
      setTimeLeft(duration);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40">
      <div className="text-center">
        <motion.div
          className="text-8xl font-bold text-snap-yellow mb-4"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          {timeLeft}
        </motion.div>
        <div className="text-snap-white50 text-lg">Hold to record</div>
      </div>
    </div>
  );
});

export default TimerOverlay;