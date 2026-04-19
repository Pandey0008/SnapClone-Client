import { memo, useEffect, useState } from 'react';

const ErrorBanner = memo(({ 
  message, 
  onRetry, 
  autoDismiss = false 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss]);

  if (!visible || !message) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-call-red text-white px-4 py-3 flex items-center justify-between z-50 shadow-lg">
      <div className="flex-1 pr-4">{message}</div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-semibold underline underline-offset-4 hover:no-underline"
        >
          Retry
        </button>
      )}
      
      <button
        onClick={() => setVisible(false)}
        className="ml-4 text-xl leading-none"
      >
        ×
      </button>
    </div>
  );
});

export default ErrorBanner;