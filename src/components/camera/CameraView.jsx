import { forwardRef } from 'react';
import Webcam from 'react-webcam';

const CameraView = forwardRef(({ onCapture, filterKey }, ref) => {
  const handleCapture = () => {
    const screenshot = ref.current?.getScreenshot();
    if (screenshot) {
      onCapture(screenshot, 'photo');
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <Webcam
        ref={ref}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "environment",
          width: 1280,
          height: 720,
        }}
        className="w-full h-full object-cover"
      />

      {/* Filter Overlay Placeholder */}
      {filterKey && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/40" />
      )}
    </div>
  );
});

export default CameraView;