import { memo } from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = memo(({ visible }) => {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-snap-white50 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-snap-white50 text-sm">typing...</span>
    </div>
  );
});

export default TypingIndicator;