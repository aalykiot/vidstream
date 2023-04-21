import { Animate } from 'react-simple-animate';
import { Link } from 'react-router-dom';
import type { Status } from './Player';
import timeUtils from '../utils/time';
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
  progress: number;
  remaining: number;
  setPlayerStatus: Function;
  setMuted: Function;
};

function PlayerControls({
  title,
  status,
  muted,
  fullScreen,
  progress,
  remaining,
  setPlayerStatus,
  setMuted,
}: Props) {
  // Handle full-screen action.
  const toggleFullScreen = async () => {
    if (!fullScreen) {
      await document.body.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  };

  return (
    <Animate play start={{ opacity: 0 }} end={{ opacity: 1 }}>
      <div className="flex absolute top-0 left-0 right-0 py-6 px-8 items-center justify-between">
        <Link to="/browse">
          <LeftArrowIcon className="text-white w-9 h-9 drop-shadow-md" />
        </Link>
        <DownloadIcon className="text-white w-9 h-9 drop-shadow-md" />
      </div>
      <div className="flex absolute bottom-0 left-0 right-0 py-6 px-8 flex-col">
        <div className="flex items-center">
          <div className="flex flex-1 cursor-pointer py-2 items-center group">
            <div
              className="text-white bg-green-400 h-[2px]"
              style={{ width: `${progress}%` }}
            />
            <div className="text-white bg-gray-100 h-[2px] flex-1" />
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
      </div>
    </Animate>
  );
}

export default PlayerControls;
