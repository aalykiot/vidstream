import { useState, useRef, MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Status } from './Player';
import timeUtils from '../utils/time';
import { getTrickPlay } from '../store/features/player';
import { ReactComponent as LeftArrowIcon } from './icons/left-arrow-icon.svg';
import { ReactComponent as DownloadIcon } from './icons/download-icon.svg';
import { ReactComponent as PlayIcon } from './icons/play-icon.svg';
import { ReactComponent as PauseIcon } from './icons/pause-icon.svg';
import { ReactComponent as SoundIcon } from './icons/sound-icon.svg';
import { ReactComponent as MutedIcon } from './icons/muted-icon.svg';
import { ReactComponent as ExpandIcon } from './icons/expand-icon.svg';
import { ReactComponent as MinimizeIcon } from './icons/minimize-icon.svg';
import { ReactComponent as ReloadIcon } from './icons/reload-icon.svg';

type Props = {
  title: string;
  status: Status;
  muted: boolean;
  fullScreen: boolean;
  duration: number;
  progress: number;
  remaining: number;
  show: boolean;
  setTimestamp: Function;
  setPlayerStatus: Function;
  setMuted: Function;
  step: number;
};

function PlayerControls({
  title,
  status,
  muted,
  fullScreen,
  duration,
  progress,
  remaining,
  show,
  setPlayerStatus,
  setMuted,
  step,
  setTimestamp,
}: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [trickIndex, setTrickIndex] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseTimestamp, setMouseTimestamp] = useState(0);
  const previews = useSelector(getTrickPlay);
  const progressRef = useRef<HTMLDivElement>(null);

  // Handle full-screen action.
  const toggleFullScreen = async () => {
    if (!fullScreen) {
      await document.body.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  };

  const onMouseMove = (event: MouseEvent) => {
    const { current } = progressRef;
    const { width, x } = current?.getBoundingClientRect() as DOMRect;
    const timestamp = Math.max(0, ((event.clientX - x) / width) * duration);
    const index = Math.max(0, Math.floor(timestamp / step));

    setMouseX(event.clientX);
    setMouseTimestamp(timestamp);
    setTrickIndex(index);
  };

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex absolute top-0 left-0 right-0 py-6 px-8 items-center justify-between"
          >
            <Link to="/browse">
              <LeftArrowIcon className="text-white w-9 h-9 drop-shadow-md" />
            </Link>
            <DownloadIcon className="text-white w-9 h-9 drop-shadow-md" />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex absolute bottom-0 left-0 right-0 py-6 px-8 flex-col"
          >
            <div className="flex items-center">
              <div
                className="flex flex-1 cursor-pointer py-2 items-center group"
                ref={progressRef}
                onMouseEnter={() => setShowPreview(true)}
                onMouseLeave={() => setShowPreview(false)}
                onMouseMove={onMouseMove}
                onClick={() => setTimestamp(mouseTimestamp)}
                aria-hidden="true"
              >
                <div
                  className="text-white bg-green-400 h-[2px]"
                  style={{ width: `${progress}%` }}
                />
                <div className="text-white bg-gray-100 h-[2px] flex-1" />
                {previews && showPreview && (
                  <div
                    className="flex flex-col items-center absolute -top-[110px]"
                    style={{ left: mouseX - 75 < 0 ? 0 : mouseX - 75 }}
                  >
                    <img
                      src={previews[trickIndex]}
                      alt="A video preview based on cursor position"
                      className="w-[150px] h-[95px] object-cover border-2 border-white rounded drop-shadow-md"
                    />
                    <div className="text-white text-xs drop-shadow-md mt-4 min-w-[35px]">
                      {timeUtils.toMinuteSeconds(mouseTimestamp)}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-white text-xs ml-4 drop-shadow-md min-w-[35px]">
                {timeUtils.toMinuteSeconds(remaining)}
              </div>
            </div>
            <div className="flex flex-1 items-center justify-between mt-4">
              <div className="flex items-center">
                {status === 'PLAYING' && (
                  <PauseIcon
                    className="text-white w-9 h-9 cursor-pointer"
                    onClick={() => setPlayerStatus('PAUSED')}
                  />
                )}
                {status === 'PAUSED' && (
                  <PlayIcon
                    className="text-white w-9 h-9 cursor-pointer"
                    onClick={() => setPlayerStatus('PLAYING')}
                  />
                )}
                {status === 'DONE' && (
                  <ReloadIcon
                    className="text-white w-9 h-9 cursor-pointer"
                    onClick={() => setPlayerStatus('PLAYING')}
                  />
                )}
                {muted && (
                  <MutedIcon
                    className="text-white w-9 h-9 ml-6 cursor-pointer"
                    onClick={() => setMuted(false)}
                  />
                )}
                {!muted && (
                  <SoundIcon
                    className="text-white w-9 h-9 ml-6 cursor-pointer"
                    onClick={() => setMuted(true)}
                  />
                )}
                <div className="text-white drop-shadow-md ml-6">
                  {String(title).toUpperCase()}
                </div>
              </div>
              {fullScreen && (
                <MinimizeIcon
                  className="text-white w-9 h-9 cursor-pointer"
                  onClick={toggleFullScreen}
                />
              )}
              {!fullScreen && (
                <ExpandIcon
                  className="text-white w-9 h-9 cursor-pointer"
                  onClick={toggleFullScreen}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PlayerControls;
