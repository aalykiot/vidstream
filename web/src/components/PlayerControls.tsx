import { Link } from 'react-router-dom';
import { ReactComponent as LeftArrowIcon } from './icons/left-arrow-icon.svg';
import { ReactComponent as DownloadIcon } from './icons/download-icon.svg';
import { ReactComponent as PauseIcon } from './icons/pause-icon.svg';
import { ReactComponent as SoundIcon } from './icons/sound-icon.svg';
import { ReactComponent as ExpandIcon } from './icons/expand-icon.svg';
import timeUtils from '../utils/time';

type Props = { title: string; duration: number };

function PlayerControls({ title, duration }: Props) {
  return (
    <>
      <div className="flex absolute top-0 left-0 right-0 py-6 px-8 items-center justify-between">
        <Link to="/browse">
          <LeftArrowIcon className="text-white w-9 h-9 drop-shadow-md" />
        </Link>
        <DownloadIcon className="text-white w-9 h-9 drop-shadow-md" />
      </div>
      <div className="flex absolute bottom-0 left-0 right-0 py-6 px-8 flex-col">
        <div className="flex items-center">
          <div className="flex flex-1 cursor-pointer py-2">
            <div className="text-white bg-green-400 h-[2px] w-[50%]" />
            <div className="text-white bg-gray-100 h-[2px] flex-1" />
          </div>
          <div className="text-white text-xs ml-4 drop-shadow-md">
            {timeUtils.toMinuteSeconds(duration)}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between mt-4">
          <div className="flex items-center">
            <PauseIcon className="text-white w-9 h-9 cursor-pointer" />
            <SoundIcon className="text-white w-9 h-9 ml-6 cursor-pointer" />
            <div className="text-white drop-shadow-md ml-6">
              {String(title).toUpperCase()}
            </div>
          </div>
          <ExpandIcon className="text-white w-9 h-9 cursor-pointer" />
        </div>
      </div>
    </>
  );
}

export default PlayerControls;
