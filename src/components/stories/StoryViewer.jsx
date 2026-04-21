import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import ProgressBar from "./ProgressBar";
import Avatar from "../common/Avatar";


const StoryViewer = memo(
({
  stories,
  startIndex = 0,
  onClose,
  onStoryChange
}) => {

  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const currentStory = stories[currentIndex];


  const goNext = () => {

    if (currentIndex < stories.length - 1) {

      setCurrentIndex(currentIndex + 1);

    } else {

      onClose();

    }

  };


  const goPrev = () => {

    if (currentIndex > 0) {

      setCurrentIndex(currentIndex - 1);

    }

  };


  // TRACK STORY VIEW EVENT
  useEffect(() => {

    if (currentStory?._id && onStoryChange) {

      onStoryChange(currentStory._id);

    }

  }, [currentIndex]);


  // AUTO PLAY TIMER (15 SECONDS)
  useEffect(() => {

    const timer = setTimeout(() => {

      goNext();

    }, 15000);

    return () => clearTimeout(timer);

  }, [currentIndex]);


  return (

    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* HEADER */}

      <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-gradient-to-b from-black/80 to-transparent">

        <div className="flex items-center gap-3">

          <Avatar
            uri={currentStory?.user?.avatarUrl}
            name={currentStory?.user?.displayName}
            size={40}
          />

          <div>

            <p className="font-semibold">

              {currentStory?.user?.displayName}

            </p>

            <p className="text-xs text-snap-white50">

              {currentStory?.timestamp}

            </p>

          </div>

        </div>


        <button
          onClick={onClose}
          className="text-4xl leading-none text-white"
        >

          <X size={28} />

        </button>

      </div>


      {/* PROGRESS BARS */}

      <div className="flex px-4 gap-1">

        {stories.map((_, idx) => (

          <ProgressBar

            key={idx}

            active={idx === currentIndex}

            viewed={idx < currentIndex}

            duration={15000}

            onComplete={goNext}

          />

        ))}

      </div>


      {/* STORY IMAGE */}

      <div className="flex-1 relative flex items-center justify-center">

        <AnimatePresence mode="wait">

          <motion.img

            key={currentIndex}

            src={currentStory?.mediaUrl}

            alt="story"

            className="max-h-[85vh] max-w-full object-contain"

            initial={{ opacity: 0, scale: 0.95 }}

            animate={{ opacity: 1, scale: 1 }}

            exit={{ opacity: 0, scale: 1.05 }}

            transition={{ duration: 0.3 }}

          />

        </AnimatePresence>


        {/* TAP AREAS */}

        <div
          onClick={goPrev}
          className="absolute left-0 top-0 bottom-0 w-1/2 z-10"
        />

        <div
          onClick={goNext}
          className="absolute right-0 top-0 bottom-0 w-1/2 z-10"
        />

      </div>


      {/* CAPTION */}

      {currentStory?.caption && (

        <div className="absolute bottom-12 left-0 right-0 px-6 text-center">

          <p className="bg-black/60 text-white px-6 py-3 rounded-3xl inline-block text-lg">

            {currentStory.caption}

          </p>

        </div>

      )}

    </div>

  );

});


export default StoryViewer;